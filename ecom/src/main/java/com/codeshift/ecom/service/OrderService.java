package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;
    private final CartRepository cart;
    private final CartService carts;
    private final SupportCaseRepository supportCases;
    private final SettingsService settings;
    private final InventoryMovementRepository movements;

    public Views.OrderView checkout(String email, Requests.Checkout input) {
        User user = carts.lockCustomer(email);
        var previous = orders.findByUserIdAndRequestKey(user.getId(), input.requestId().toString());
        if (previous.isPresent())
            return Views.OrderView.of(previous.get());

        var items = cart.findByUserIdOrderByProductIdAsc(user.getId());
        if (items.isEmpty())
            throw ApiException.badRequest("El carrito está vacío.");
        ShopOrder order = new ShopOrder();
        order.setUser(user);
        order.setCustomerName(user.getName());
        order.setAddress(input.address().trim());
        order.setPhone(input.phone().trim());
        order.setRequestKey(input.requestId().toString());
        BigDecimal subtotal = new BigDecimal("0.00");
        List<StockChange> stockChanges = new ArrayList<>();

        // Always lock products in ascending ID order to avoid competing purchases
        // deadlocking.
        for (CartItem item : items) {
            Product p = products.lockById(item.getProduct().getId())
                    .orElseThrow(() -> ApiException.conflict("Producto no disponible."));
            if (!p.isActive() || p.getStock() < item.getQuantity())
                throw ApiException.conflict("Existencias insuficientes: " + p.getName());
            int previousStock = p.getStock();
            p.setStock(previousStock - item.getQuantity());
            stockChanges.add(new StockChange(p, previousStock, p.getStock()));
            OrderLine line = new OrderLine();
            line.setProductId(p.getId());
            line.setProductName(p.getName());
            line.setUnitPrice(p.getPrice());
            line.setUnitCost(p.getCost() == null ? BigDecimal.ZERO : p.getCost());
            line.setQuantity(item.getQuantity());
            order.getLines().add(line);
            subtotal = subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        BigDecimal discount = new BigDecimal("0.00");
        if (user.getCartCoupon() != null) {
            carts.requireValid(user.getCartCoupon());
            discount = CartService.discount(subtotal, user.getCartCoupon().getDiscountPercent());
            order.setCouponCode(user.getCartCoupon().getCode());
        }
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setTotal(subtotal.subtract(discount));
        orders.saveAndFlush(order);
        for (StockChange change : stockChanges)
            recordMovement(change.product(), user, InventoryMovement.Type.EXIT,
                    change.previousStock(), change.newStock(), "Salida por pedido #" + order.getId());
        cart.deleteAll(items);
        user.setCartCoupon(null);
        return Views.OrderView.of(order);
    }

    @Transactional(readOnly = true)
    public List<Views.OrderView> customerOrders(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
        return orders.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(Views.OrderView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Views.OrderView> all() {
        return orders.findAllByOrderByCreatedAtDesc().stream().map(Views.OrderView::of).toList();
    }

    public Views.OrderView status(String actorEmail, Long id, ShopOrder.Status next) {
        ShopOrder order = orders.lockById(id).orElseThrow(() -> ApiException.notFound("Pedido no encontrado."));
        ShopOrder.Status current = order.getStatus();
        if (current == next)
            return Views.OrderView.of(order);
        boolean allowed = switch (current) {
            case CONFIRMED -> next == ShopOrder.Status.PROCESSING || next == ShopOrder.Status.CANCELLED;
            case PROCESSING -> next == ShopOrder.Status.SHIPPED || next == ShopOrder.Status.CANCELLED;
            case SHIPPED -> next == ShopOrder.Status.DELIVERED;
            default -> false;
        };
        if (!allowed)
            throw ApiException.conflict("Ese cambio de estado no está permitido.");
        if (next == ShopOrder.Status.CANCELLED) {
            User actor = users.findByEmail(actorEmail)
                    .orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
            for (OrderLine line : order.getLines().stream().sorted(Comparator.comparing(OrderLine::getProductId))
                    .toList()) {
                Product p = products.lockById(line.getProductId()).orElseThrow();
                int previousStock = p.getStock();
                p.setStock(p.getStock() + line.getQuantity());
                recordMovement(p, actor, InventoryMovement.Type.ENTRY, previousStock, p.getStock(),
                        "Reposición por cancelación del pedido #" + order.getId());
            }
            order.setPaymentStatus("SIMULATED_CANCELLED");
        }
        order.setStatus(next);
        return Views.OrderView.of(order);
    }

    @Transactional(readOnly = true)
    public Views.Analytics analytics() {
        var allOrders = orders.findAll();
        var catalog = products.findAll();
        long cancelled = allOrders.stream().filter(o -> o.getStatus() == ShopOrder.Status.CANCELLED).count();
        BigDecimal sales = allOrders.stream().filter(o -> o.getStatus() != ShopOrder.Status.CANCELLED)
                .map(ShopOrder::getTotal).reduce(new BigDecimal("0.00"), BigDecimal::add);
        BigDecimal costs = allOrders.stream().filter(o -> o.getStatus() != ShopOrder.Status.CANCELLED)
                .flatMap(o -> o.getLines().stream())
                .map(line -> (line.getUnitCost() == null ? BigDecimal.ZERO : line.getUnitCost())
                        .multiply(BigDecimal.valueOf(line.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal refunded = supportCases.findAll().stream()
                .filter(c -> c.getStatus() == SupportCase.Status.APPROVED
                        || c.getStatus() == SupportCase.Status.RESOLVED)
                .map(SupportCase::getRefundAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        long completedOrders = allOrders.size() - cancelled;
        BigDecimal average = completedOrders == 0 ? BigDecimal.ZERO
                : sales.divide(BigDecimal.valueOf(completedOrders), 2, java.math.RoundingMode.HALF_UP);
        long openCases = supportCases.findAll().stream()
                .filter(c -> c.getStatus() == SupportCase.Status.OPEN || c.getStatus() == SupportCase.Status.IN_REVIEW)
                .count();
        long customers = users.findAll().stream().filter(u -> u.getRole() == User.Role.CUSTOMER).count();
        return new Views.Analytics(allOrders.size(), cancelled, customers, catalog.size(),
                catalog.stream().filter(p -> p.isActive() && p.getStock() <= settings.current().lowStockThreshold())
                        .count(),
                sales, sales.subtract(costs).subtract(refunded), average, openCases, refunded);
    }

    private void recordMovement(Product product, User actor, InventoryMovement.Type type, int previousStock,
            int newStock, String note) {
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setPerformedBy(actor);
        movement.setType(type);
        movement.setQuantityDelta(newStock - previousStock);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(newStock);
        movement.setNote(note);
        movements.save(movement);
    }

    private record StockChange(Product product, int previousStock, int newStock) {
    }
}
