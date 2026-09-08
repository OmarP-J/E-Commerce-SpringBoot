package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    private final UserRepository users;
    private final ProductRepository products;
    private final CartRepository cart;
    private final CouponRepository coupons;

    /**
     * Serializes mutations for one customer, including checkout and repeated
     * requests.
     */
    public User lockCustomer(String email) {
        return users.lockByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
    }

    public Views.CartView get(String email) {
        return view(lockCustomer(email));
    }

    public Views.CartView quantity(String email, Long productId, int quantity) {
        User user = lockCustomer(email);
        var existing = cart.findByUserIdAndProductId(user.getId(), productId);
        if (quantity == 0) {
            existing.ifPresent(cart::delete);
        } else {
            Product p = products.findById(productId)
                    .orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
            if (!p.isActive() || p.getStock() < quantity)
                throw ApiException.conflict("No hay suficientes existencias de " + p.getName());
            if (existing.isEmpty() && cart.findByUserIdOrderByProductIdAsc(user.getId()).size() >= 50)
                throw ApiException.badRequest("El carrito admite hasta 50 productos diferentes.");
            CartItem item = existing.orElseGet(CartItem::new);
            item.setUser(user);
            item.setProduct(p);
            item.setQuantity(quantity);
            cart.save(item);
        }
        cart.flush();
        if (cart.findByUserIdOrderByProductIdAsc(user.getId()).isEmpty())
            user.setCartCoupon(null);
        return view(user);
    }

    public Views.CartView coupon(String email, String code) {
        User user = lockCustomer(email);
        if (code == null)
            user.setCartCoupon(null);
        else {
            Coupon coupon = coupons.findByCode(code.trim().toUpperCase(Locale.ROOT))
                    .orElseThrow(() -> ApiException.badRequest("Cupón no encontrado."));
            requireValid(coupon);
            user.setCartCoupon(coupon);
        }
        return view(user);
    }

    public Views.CartView view(User user) {
        List<Views.CartLine> lines = cart.findByUserIdOrderByProductIdAsc(user.getId()).stream()
                .map(item -> new Views.CartLine(Views.ProductView.of(item.getProduct()), item.getQuantity(),
                        item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .toList();
        BigDecimal subtotal = lines.stream().map(Views.CartLine::lineTotal).reduce(new BigDecimal("0.00"),
                BigDecimal::add);
        Coupon coupon = user.getCartCoupon();
        String warning = coupon != null && !valid(coupon)
                ? "El cupón venció o fue desactivado. Retíralo para continuar."
                : null;
        BigDecimal discount = coupon == null || warning != null ? new BigDecimal("0.00")
                : discount(subtotal, coupon.getDiscountPercent());
        return new Views.CartView(lines, subtotal, discount, subtotal.subtract(discount),
                coupon == null ? null : coupon.getCode(), warning);
    }

    public static BigDecimal discount(BigDecimal subtotal, int percentage) {
        return subtotal.multiply(BigDecimal.valueOf(percentage)).divide(BigDecimal.valueOf(100), 2,
                RoundingMode.HALF_UP);
    }

    public void requireValid(Coupon coupon) {
        if (!valid(coupon))
            throw ApiException.badRequest("El cupón venció o fue desactivado.");
    }

    private boolean valid(Coupon c) {
        return c.isActive() && !c.getExpiresOn().isBefore(LocalDate.now());
    }

    public List<Views.ProductView> wishlist(String email) {
        User user = lockCustomer(email);
        return user.getWishlist().stream().sorted(Comparator.comparing(Product::getId)).map(Views.ProductView::of)
                .toList();
    }

    public void favorite(String email, Long id, boolean add) {
        User user = lockCustomer(email);
        Product product = products.findById(id).orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        if (add) {
            if (!product.isActive())
                throw ApiException.badRequest("Producto no disponible.");
            user.getWishlist().add(product);
        } else
            user.getWishlist().remove(product);
    }
}
