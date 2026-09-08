package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "support_cases")
@Getter
@Setter
public class SupportCase {
    public enum Type {
        RETURN, EXCHANGE, REFUND, COMPLAINT
    }

    public enum Status {
        OPEN, IN_REVIEW, APPROVED, REJECTED, RESOLVED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private ShopOrder order;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User customer;
    @ManyToOne(fetch = FetchType.LAZY)
    private User handledBy;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.OPEN;
    @Column(nullable = false, length = 1000)
    private String reason;
    @Column(length = 1000)
    private String resolution;
    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
