package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shop_orders", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "request_key" }))
@Getter
@Setter
public class ShopOrder {
    public enum Status {
        CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @Column(name = "request_key", nullable = false, length = 36)
    private String requestKey;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false, length = 300)
    private String address;
    @Column(nullable = false, length = 30)
    private String phone;
    @Column(nullable = false, length = 80)
    private String customerName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.CONFIRMED;
    @Column(nullable = false, length = 32)
    private String paymentStatus = "SIMULATED";
    @Column(precision = 16, scale = 2, nullable = false)
    private BigDecimal subtotal;
    @Column(precision = 16, scale = 2, nullable = false)
    private BigDecimal discount;
    @Column(precision = 16, scale = 2, nullable = false)
    private BigDecimal total;
    private String couponCode;
    @ElementCollection
    @CollectionTable(name = "order_lines", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "line_number")
    private List<OrderLine> lines = new ArrayList<>();
}
