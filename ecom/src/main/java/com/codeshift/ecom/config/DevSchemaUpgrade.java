package com.codeshift.ecom.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Keeps the reusable local H2 database compatible when a new application role
 * is added.
 */
@Component
@Profile("dev")
@Order(0)
@RequiredArgsConstructor
public class DevSchemaUpgrade implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        jdbc.execute("alter table shop_users alter column role varchar(32)");
        jdbc.execute("alter table shop_orders alter column payment_status varchar(32)");
    }
}
