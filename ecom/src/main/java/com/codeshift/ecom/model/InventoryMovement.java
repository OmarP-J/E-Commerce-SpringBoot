package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
public class InventoryMovement {
    public enum Type {
        ENTRY, EXIT, ADJUSTMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User performedBy;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;
    @Column(nullable = false)
    private int quantityDelta;
    @Column(nullable = false)
    private int previousStock;
    @Column(nullable = false)
    private int newStock;
    @Column(nullable = false, length = 300)
    private String note;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
