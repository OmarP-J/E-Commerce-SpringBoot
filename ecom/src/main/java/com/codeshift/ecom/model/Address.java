package com.codeshift.ecom.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "delivery_addresses")
@Getter
@Setter
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;
    @Column(nullable = false, length = 60)
    private String label;
    @Column(nullable = false, length = 80)
    private String recipientName;
    @Column(nullable = false, length = 300)
    private String addressLine;
    @Column(nullable = false, length = 100)
    private String city;
    @Column(nullable = false, length = 30)
    private String phone;
    @Column(nullable = false)
    private boolean defaultAddress;
}
