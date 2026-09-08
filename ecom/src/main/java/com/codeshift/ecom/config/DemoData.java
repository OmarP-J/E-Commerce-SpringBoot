package com.codeshift.ecom.config;

import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Local demo only. The production profile never creates these accounts. */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DemoData implements CommandLineRunner {
    private final UserRepository users;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final CouponRepository coupons;
    private final OrderRepository orders;
    private final PasswordEncoder passwords;

    @Override
    @Transactional
    public void run(String... args) {
        if (users.findByEmail("admin@demo.local").isEmpty()) {
            User admin = new User();
            admin.setName("Administración demo");
            admin.setEmail("admin@demo.local");
            admin.setPasswordHash(passwords.encode("AdminDemo2026!"));
            admin.setRole(User.Role.ADMIN);
            users.save(admin);
        }
        if (users.findByEmail("inventario@demo.local").isEmpty()) {
            User manager = new User();
            manager.setName("Almacén demo");
            manager.setEmail("inventario@demo.local");
            manager.setPasswordHash(passwords.encode("InventarioDemo2026!"));
            manager.setRole(User.Role.INVENTORY_MANAGER);
            users.save(manager);
        }
        if (users.findByEmail("soporte@demo.local").isEmpty()) {
            User support = new User();
            support.setName("Soporte demo");
            support.setEmail("soporte@demo.local");
            support.setPasswordHash(passwords.encode("SoporteDemo2026!"));
            support.setRole(User.Role.CUSTOMER_SUPPORT);
            users.save(support);
        }
        if (categories.count() == 0) {
            Category category = new Category();
            category.setName("Esenciales");
            category.setDescription("Productos para tu día a día");
            categories.save(category);
            String[] names = { "Mochila urbana", "Auriculares inalámbricos", "Botella térmica",
                    "Lámpara de escritorio" };
            String[] prices = { "1490.00", "2290.50", "790.00", "1890.00" };
            String[] costs = { "820.00", "1250.00", "410.00", "990.00" };
            for (int i = 0; i < names.length; i++) {
                Product p = new Product();
                p.setName(names[i]);
                p.setDescription("Producto de demostración. Edita su descripción e imagen desde Administración.");
                p.setPrice(new BigDecimal(prices[i]));
                p.setCost(new BigDecimal(costs[i]));
                p.setCategory(category);
                p.setStock(20);
                products.save(p);
            }
        }
        // Completa el costo en bases locales creadas antes de que este campo existiera.
        products.findAll().forEach(product -> {
            if (product.getCost() != null)
                return;
            BigDecimal demoCost = switch (product.getName()) {
                case "Mochila urbana" -> new BigDecimal("820.00");
                case "Auriculares inalámbricos" -> new BigDecimal("1250.00");
                case "Botella térmica" -> new BigDecimal("410.00");
                case "Lámpara de escritorio" -> new BigDecimal("990.00");
                default -> null;
            };
            if (demoCost != null) {
                product.setCost(demoCost);
                products.save(product);
            }
        });
        // Conserva una ganancia útil en pedidos de demostración creados por versiones
        // anteriores.
        orders.findAll().forEach(order -> {
            boolean updated = false;
            for (OrderLine line : order.getLines()) {
                if (line.getUnitCost() != null)
                    continue;
                Product product = products.findById(line.getProductId()).orElse(null);
                if (product != null && product.getCost() != null) {
                    line.setUnitCost(product.getCost());
                    updated = true;
                }
            }
            if (updated)
                orders.save(order);
        });
        if (coupons.count() == 0) {
            Coupon coupon = new Coupon();
            coupon.setCode("BIENVENIDA10");
            coupon.setDiscountPercent(10);
            coupon.setExpiresOn(LocalDate.now().plusYears(1));
            coupons.save(coupon);
        }
    }
}
