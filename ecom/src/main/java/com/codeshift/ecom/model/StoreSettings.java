package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "store_settings")
@Getter
@Setter
public class StoreSettings {
    @Id
    private Long id = 1L;
    @Column(nullable = false, length = 80)
    private String storeName = "Esencial";
    @Column(nullable = false)
    private int lowStockThreshold = 5;
    @Column(nullable = false, length = 254)
    private String supportEmail = "soporte@demo.local";
}
