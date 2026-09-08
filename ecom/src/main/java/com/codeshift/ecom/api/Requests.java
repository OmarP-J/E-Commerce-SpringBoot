package com.codeshift.ecom.api;

import com.codeshift.ecom.model.ShopOrder;
import com.codeshift.ecom.model.InventoryMovement;
import com.codeshift.ecom.model.SupportCase;
import com.codeshift.ecom.model.User;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Only these fields can enter the application. Clients cannot choose a role or
 * a price at checkout.
 */
public final class Requests {
    private Requests() {
    }

    public record Signup(@NotBlank @Size(max = 80) String name, @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 10, max = 72) String password) {
    }

    public record Login(@NotBlank @Email String email, @NotBlank @Size(max = 72) String password) {
    }

    public record Profile(@NotBlank @Size(max = 80) String name) {
    }

    public record Password(@NotBlank @Size(max = 72) String currentPassword,
            @NotBlank @Size(min = 10, max = 72) String newPassword) {
    }

    public record CategoryInput(@NotBlank @Size(max = 80) String name, @NotNull @Size(max = 500) String description) {
    }

    public record ProductInput(@NotBlank @Size(max = 120) String name, @NotBlank @Size(max = 2000) String description,
            @NotNull @DecimalMin("0.01") @DecimalMax("999999999.99") @Digits(integer = 9, fraction = 2) BigDecimal price,
            @DecimalMin("0.00") @DecimalMax("999999999.99") @Digits(integer = 9, fraction = 2) BigDecimal cost,
            @Min(0) @Max(1000000) int stock, @NotNull Long categoryId, boolean active,
            @NotNull Long version) {
    }

    public record CouponInput(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{3,30}") String code,
            @Min(1) @Max(100) int discountPercent, @NotNull LocalDate expiresOn,
            boolean active) {
    }

    public record Quantity(@Min(0) @Max(99) int quantity) {
    }

    public record CouponCode(@NotBlank @Size(max = 30) String code) {
    }

    public record Checkout(@NotNull UUID requestId, @NotBlank @Size(max = 300) String address,
            @NotBlank @Pattern(regexp = "[+0-9() .-]{7,30}") String phone,
            @AssertTrue(message = "Debes aceptar que el pago es simulado") boolean acceptSimulatedPayment) {
    }

    public record OrderStatus(@NotNull ShopOrder.Status status) {
    }

    public record RoleUpdate(@NotNull User.Role role) {
    }

    public record AddressInput(@NotBlank @Size(max = 60) String label,
            @NotBlank @Size(max = 80) String recipientName,
            @NotBlank @Size(max = 300) String addressLine,
            @NotBlank @Size(max = 100) String city,
            @NotBlank @Pattern(regexp = "[+0-9() .-]{7,30}") String phone,
            boolean defaultAddress) {
    }

    public record InventoryAdjustment(@NotNull InventoryMovement.Type type,
            @Min(-1000000) @Max(1000000) int quantity,
            @NotBlank @Size(min = 3, max = 300) String note) {
        @AssertTrue(message = "La cantidad debe ser mayor que cero")
        public boolean isQuantityValid() {
            return quantity > 0;
        }
    }

    public record SupportCaseCreate(@NotNull Long orderId, @NotNull SupportCase.Type type,
            @NotBlank @Size(min = 10, max = 1000) String reason) {
    }

    public record SupportCaseUpdate(@NotNull SupportCase.Status status,
            @Size(max = 1000) String resolution,
            @DecimalMin("0.00") @Digits(integer = 14, fraction = 2) BigDecimal refundAmount) {
    }

    public record SettingsInput(@NotBlank @Size(max = 80) String storeName,
            @Min(0) @Max(1000) int lowStockThreshold,
            @NotBlank @Email @Size(max = 254) String supportEmail) {
    }
}
