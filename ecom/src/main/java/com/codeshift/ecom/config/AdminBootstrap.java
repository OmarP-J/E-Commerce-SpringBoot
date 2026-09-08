package com.codeshift.ecom.config;

import com.codeshift.ecom.model.User;
import com.codeshift.ecom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Creates the first production administrator when the optional environment
 * variables are set.
 * Existing accounts are never promoted and existing passwords are never
 * overwritten.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    @Value("${app.bootstrap-admin.email}")
    private String email;
    @Value("${app.bootstrap-admin.password}")
    private String password;
    @Value("${app.bootstrap-admin.name}")
    private String name;

    @Override
    @Transactional
    public void run(String... args) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPassword = password != null && !password.isBlank();
        if (!hasEmail && !hasPassword)
            return;
        if (!hasEmail || !hasPassword)
            throw new IllegalStateException("APP_ADMIN_EMAIL y APP_ADMIN_PASSWORD deben configurarse juntos.");
        if (password.length() < 12 || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalStateException("APP_ADMIN_PASSWORD debe tener entre 12 caracteres y 72 bytes.");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        users.findByEmail(normalizedEmail).ifPresentOrElse(existing -> {
            if (existing.getRole() != User.Role.ADMIN)
                throw new IllegalStateException("APP_ADMIN_EMAIL ya pertenece a una cuenta cliente; usa otro correo.");
        }, () -> {
            User admin = new User();
            admin.setEmail(normalizedEmail);
            admin.setName(name.trim());
            admin.setPasswordHash(passwords.encode(password));
            admin.setRole(User.Role.ADMIN);
            users.save(admin);
        });
    }
}
