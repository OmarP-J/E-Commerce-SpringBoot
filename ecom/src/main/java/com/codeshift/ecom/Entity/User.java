package com.codeshift.ecom.Entity;

import com.codeshift.ecom.Enum.UserRole;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String email;

    private String password;

    private String name;

    private UserRole role;

    @Lob
    @Column(name = "image")
    private byte[] image;
}
