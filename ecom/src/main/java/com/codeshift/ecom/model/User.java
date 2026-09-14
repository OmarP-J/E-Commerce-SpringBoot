package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "shop_users")
@Getter
@Setter
public class User {
    public enum Role {
        CUSTOMER, ADMIN, INVENTORY_MANAGER, CUSTOMER_SUPPORT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 254)
    private String email;
    @Column(nullable = false, length = 80)
    private String name;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role = Role.CUSTOMER;
    /**
     * Por defecto true: las cuentas que ya existían quedan verificadas y el
     * administrador inicial no se queda fuera. El registro lo pone en false a
     * propósito cuando la verificación por correo está activa.
     */
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = true;
    @ManyToOne(fetch = FetchType.LAZY)
    private Coupon cartCoupon;
    @ManyToMany
    @JoinTable(name = "wishlist", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
    private Set<Product> wishlist = new HashSet<>();
}
