package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/** Snapshot: editing or archiving a product must not change a past purchase. */
@Embeddable
@Getter
@Setter
public class OrderLine {
    @Column(nullable = false)
    private Long productId;
    @Column(nullable = false, length = 120)
    private String productName;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;
    @Column(precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;
    @Column(nullable = false)
    private int quantity;
}
