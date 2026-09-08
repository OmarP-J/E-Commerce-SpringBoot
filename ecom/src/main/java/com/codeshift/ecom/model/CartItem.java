package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "product_id" }))
@Getter
@Setter
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;
    @Column(nullable = false)
    private int quantity;
}
