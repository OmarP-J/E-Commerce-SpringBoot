package com.codeshift.ecom.api;

import com.codeshift.ecom.model.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

/** Responses never expose persistence entities or password hashes. */
public final class Views {
    private Views() {
    }

    public record UserView(Long id, String name, String email, User.Role role) {
        public static UserView of(User u) {
            return new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole());
        }
    }

    public record Auth(String token, UserView user) {
    }

    public record CategoryView(Long id, String name, String description) {
        public static CategoryView of(Category c) {
            return new CategoryView(c.getId(), c.getName(), c.getDescription());
        }
    }

    public record ProductView(Long id, String name, String description, BigDecimal price, BigDecimal cost, int stock,
            boolean active,
            Long categoryId, String categoryName, String imageUrl, long version) {
        public static ProductView of(Product p) {
            return new ProductView(p.getId(), p.getName(), p.getDescription(), p.getPrice(), null, p.getStock(),
                    p.isActive(),
                    p.getCategory().getId(), p.getCategory().getName(), p.getImageType() == null ? null
                            : "/api/catalog/products/" + p.getId() + "/image?v=" + p.getVersion(),
                    p.getVersion());
        }

        public static ProductView ofAdmin(Product p) {
            ProductView publicView = of(p);
            return new ProductView(publicView.id, publicView.name, publicView.description, publicView.price,
                    p.getCost() == null ? BigDecimal.ZERO : p.getCost(), publicView.stock, publicView.active,
                    publicView.categoryId, publicView.categoryName, publicView.imageUrl, publicView.version);
        }
    }

    public record PageView<T>(List<T> items, long total, int page, int totalPages) {
    }

    public record CouponView(Long id, String code, int discountPercent, LocalDate expiresOn, boolean active) {
        public static CouponView of(Coupon c) {
            return new CouponView(c.getId(), c.getCode(), c.getDiscountPercent(), c.getExpiresOn(), c.isActive());
        }
    }

    public record CartLine(ProductView product, int quantity, BigDecimal lineTotal) {
    }

    public record CartView(List<CartLine> items, BigDecimal subtotal, BigDecimal discount, BigDecimal total,
            String couponCode, String couponWarning) {
    }

    public record OrderLineView(Long productId, String productName, BigDecimal unitPrice, int quantity) {
    }

    public record OrderView(Long id, String customerName, Instant createdAt, String address, String phone,
            ShopOrder.Status status, String paymentStatus, BigDecimal subtotal, BigDecimal discount,
            BigDecimal total, String couponCode, List<OrderLineView> lines) {
        public static OrderView of(ShopOrder o) {
            return new OrderView(o.getId(), o.getCustomerName(), o.getCreatedAt(), o.getAddress(), o.getPhone(),
                    o.getStatus(),
                    o.getPaymentStatus(), o.getSubtotal(), o.getDiscount(), o.getTotal(), o.getCouponCode(),
                    o.getLines().stream()
                            .map(l -> new OrderLineView(l.getProductId(), l.getProductName(), l.getUnitPrice(),
                                    l.getQuantity()))
                            .toList());
        }
    }

    public record AddressView(Long id, String label, String recipientName, String addressLine, String city,
            String phone, boolean defaultAddress) {
        public static AddressView of(Address a) {
            return new AddressView(a.getId(), a.getLabel(), a.getRecipientName(),
                    a.getAddressLine(), a.getCity(), a.getPhone(), a.isDefaultAddress());
        }
    }

    public record InventoryMovementView(Long id, Long productId, String productName, String performedBy,
            InventoryMovement.Type type, int quantityDelta, int previousStock,
            int newStock, String note, Instant createdAt) {
        public static InventoryMovementView of(InventoryMovement movement) {
            return new InventoryMovementView(movement.getId(), movement.getProduct().getId(),
                    movement.getProduct().getName(),
                    movement.getPerformedBy().getName(), movement.getType(), movement.getQuantityDelta(),
                    movement.getPreviousStock(),
                    movement.getNewStock(), movement.getNote(), movement.getCreatedAt());
        }
    }

    public record SupportCaseView(Long id, Long orderId, String customerName, String customerEmail,
            SupportCase.Type type, SupportCase.Status status, String reason, String resolution,
            BigDecimal refundAmount, String handledBy, Instant createdAt, Instant updatedAt) {
        public static SupportCaseView of(SupportCase supportCase) {
            return new SupportCaseView(supportCase.getId(), supportCase.getOrder().getId(),
                    supportCase.getCustomer().getName(),
                    supportCase.getCustomer().getEmail(), supportCase.getType(), supportCase.getStatus(),
                    supportCase.getReason(),
                    supportCase.getResolution(), supportCase.getRefundAmount(),
                    supportCase.getHandledBy() == null ? null : supportCase.getHandledBy().getName(),
                    supportCase.getCreatedAt(), supportCase.getUpdatedAt());
        }
    }

    public record SettingsView(String storeName, int lowStockThreshold, String supportEmail) {
        public static SettingsView of(StoreSettings settings) {
            return new SettingsView(settings.getStoreName(), settings.getLowStockThreshold(),
                    settings.getSupportEmail());
        }
    }

    public record Analytics(long orders, long cancelledOrders, long customers, long products, long lowStockProducts,
            BigDecimal simulatedSales, BigDecimal simulatedProfit, BigDecimal averageOrderValue,
            long openSupportCases, BigDecimal refundedAmount) {
    }
}
