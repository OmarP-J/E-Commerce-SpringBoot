package com.codeshift.ecom;

import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import com.codeshift.ecom.service.CartService;
import com.codeshift.ecom.service.MailService;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = { "spring.datasource.url=jdbc:h2:mem:shoptest;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        // Los correos de prueba usan dominios .local, que no tienen MX.
        "app.mail.verification.check-mx=false" })
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShopIntegrationTest {
    @Autowired
    MockMvc mvc;
    @Autowired
    ObjectMapper json;
    @Autowired
    UserRepository users;
    @Autowired
    ProductRepository products;
    @Autowired
    CategoryRepository categories;
    @Autowired
    CouponRepository coupons;
    @Autowired
    OrderRepository orders;
    @Autowired
    PasswordEncoder passwords;
    /*
     * Sustituye el envío real. Por defecto no puede entregar nada, igual que
     * una instalación sin Brevo; cada prueba de correo lo activa y lee aquí lo
     * que se habría enviado.
     */
    @MockitoBean
    MailService mail;
    String customerEmail;
    String customerToken;
    String adminToken;
    Long productId;
    Long categoryId;
    Long adminId;

    @BeforeEach
    void setup() throws Exception {
        String suffix = UUID.randomUUID().toString();
        customerEmail = "customer-" + suffix + "@test.local";
        customerToken = signup(customerEmail);
        User admin = new User();
        admin.setEmail("admin-" + suffix + "@test.local");
        admin.setName("Admin");
        admin.setPasswordHash(passwords.encode("LongPassword123!"));
        admin.setRole(User.Role.ADMIN);
        users.saveAndFlush(admin);
        adminId = admin.getId();
        adminToken = token(
                call("POST", "/api/auth/login", null, Map.of("email", admin.getEmail(), "password", "LongPassword123!"))
                        .andExpect(status().isOk()));
        Category category = new Category();
        category.setName("Category-" + suffix);
        categories.save(category);
        categoryId = category.getId();
        Product product = new Product();
        product.setName("Test product");
        product.setDescription("Test description");
        product.setPrice(new BigDecimal("19.99"));
        product.setStock(5);
        product.setCategory(category);
        products.save(product);
        productId = product.getId();
    }

    @Test
    void permissionsAreEnforcedOnTheServer() throws Exception {
        call("GET", "/api/catalog/products", null, null).andExpect(status().isOk());
        call("GET", "/api/customer/cart", null, null).andExpect(status().isUnauthorized());
        call("GET", "/api/admin/products", customerToken, null).andExpect(status().isForbidden());
        call("GET", "/api/admin/products", adminToken, null).andExpect(status().isOk());
        call("GET", "/api/customer/cart", "bad.token", null).andExpect(status().isUnauthorized());
        call("GET", "/api/me", customerToken, null).andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void signupRequiresAcceptingTheTerms() throws Exception {
        String email = "no-terms-" + UUID.randomUUID() + "@test.local";
        call("POST", "/api/auth/signup", null,
                Map.of("name", "Cliente", "email", email, "password", "LongPassword123!"))
                .andExpect(status().isBadRequest());
        call("POST", "/api/auth/signup", null,
                Map.of("name", "Cliente", "email", email, "password", "LongPassword123!", "acceptTerms", false))
                .andExpect(status().isBadRequest());
        assertThat(users.findByEmail(email)).isEmpty();
    }

    @Test
    void onlyCustomersWhoReceivedTheProductCanReviewIt() throws Exception {
        String review = "/api/customer/reviews/" + productId;
        quantity(customerToken, 1);
        long orderId = json
                .readTree(checkout(customerToken, UUID.randomUUID()).andReturn().getResponse().getContentAsString())
                .get("id").asLong();
        call("GET", review, customerToken, null).andExpect(jsonPath("$.eligible").value(false));
        call("PUT", review, customerToken, Map.of("rating", 4, "comment", "Muy útil.")).andExpect(status().isForbidden());

        for (String next : List.of("PROCESSING", "SHIPPED", "DELIVERED"))
            call("PUT", "/api/admin/orders/" + orderId + "/status", adminToken, Map.of("status", next))
                    .andExpect(status().isOk());
        call("GET", review, customerToken, null).andExpect(jsonPath("$.eligible").value(true))
                .andExpect(jsonPath("$.rating").doesNotExist());
        call("PUT", review, customerToken, Map.of("rating", 6, "comment", "")).andExpect(status().isBadRequest());
        call("PUT", review, customerToken, Map.of("rating", 4, "comment", "Muy útil.")).andExpect(status().isOk());
        // Volver a opinar actualiza la misma reseña en vez de sumar otra.
        call("PUT", review, customerToken, Map.of("rating", 5, "comment", "Mejor de lo que esperaba."))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rating").value(5));
        call("GET", "/api/catalog/products/" + productId + "/reviews", null, null)
                .andExpect(jsonPath("$.count").value(1)).andExpect(jsonPath("$.average").value(5.0))
                .andExpect(jsonPath("$.counts[4]").value(1))
                .andExpect(jsonPath("$.reviews[0].author").value("Cliente"))
                .andExpect(jsonPath("$.reviews[0].authorEmail").doesNotExist());
        call("GET", "/api/catalog/products/" + productId, null, null)
                .andExpect(jsonPath("$.rating").value(5.0)).andExpect(jsonPath("$.reviewCount").value(1));
        String stranger = signup(UUID.randomUUID() + "@test.local");
        call("PUT", review, stranger, Map.of("rating", 1, "comment", "Malo.")).andExpect(status().isForbidden());

        var all = json.readTree(call("GET", "/api/admin/reviews", adminToken, null).andReturn().getResponse()
                .getContentAsString());
        long reviewId = 0;
        for (var item : all)
            if (item.get("productId").asLong() == productId)
                reviewId = item.get("id").asLong();
        String visibility = "/api/admin/reviews/" + reviewId + "/visibility";
        call("PUT", visibility, adminToken, Map.of("hidden", true, "reason", "")).andExpect(status().isBadRequest());
        call("PUT", visibility, adminToken, Map.of("hidden", true, "reason", "Incluye datos personales."))
                .andExpect(status().isOk()).andExpect(jsonPath("$.hidden").value(true));
        call("GET", "/api/catalog/products/" + productId + "/reviews", null, null)
                .andExpect(jsonPath("$.count").value(0)).andExpect(jsonPath("$.reviews.length()").value(0));
        call("GET", "/api/catalog/products/" + productId, null, null)
                .andExpect(jsonPath("$.rating").doesNotExist()).andExpect(jsonPath("$.reviewCount").value(0));
        call("GET", review, customerToken, null).andExpect(jsonPath("$.hidden").value(true))
                .andExpect(jsonPath("$.hiddenReason").value("Incluye datos personales."));
        call("DELETE", review, customerToken, null).andExpect(status().isNoContent());
        call("GET", review, customerToken, null).andExpect(jsonPath("$.rating").doesNotExist());
    }

    @Test
    void orderTimelineRecordsEachStepAndEmailsTheCustomer() throws Exception {
        when(mail.canDeliver()).thenReturn(true);
        quantity(customerToken, 1);
        long orderId = json
                .readTree(checkout(customerToken, UUID.randomUUID()).andReturn().getResponse().getContentAsString())
                .get("id").asLong();
        call("PUT", "/api/admin/orders/" + orderId + "/status", adminToken, Map.of("status", "PROCESSING"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.processingAt").exists())
                .andExpect(jsonPath("$.shippedAt").doesNotExist());
        call("GET", "/api/customer/orders", customerToken, null).andExpect(jsonPath("$[0].processingAt").exists());

        verify(mail, timeout(5000)).send(eq(customerEmail), eq("Cliente"), eq("Recibimos tu pedido #" + orderId),
                anyString());
        verify(mail, timeout(5000)).send(eq(customerEmail), eq("Cliente"),
                eq("Estamos preparando tu pedido #" + orderId), anyString());
    }

    @Test
    void passwordCanBeResetWithTheEmailedCode() throws Exception {
        when(mail.canDeliver()).thenReturn(true);
        call("POST", "/api/auth/password-reset", null, Map.of("email", customerEmail))
                .andExpect(status().isNoContent());
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(mail).send(eq(customerEmail), anyString(), eq("Código para cambiar tu contraseña"), body.capture());
        var match = Pattern.compile(">(\\d{6})<").matcher(body.getValue());
        assertThat(match.find()).isTrue();
        String code = match.group(1);
        String wrong = code.equals("000000") ? "111111" : "000000";

        String confirm = "/api/auth/password-reset/confirm";
        call("POST", confirm, null, Map.of("email", customerEmail, "code", wrong, "newPassword", "NuevaClave2026!"))
                .andExpect(status().isBadRequest());
        call("POST", confirm, null, Map.of("email", customerEmail, "code", code, "newPassword", "NuevaClave2026!"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").exists());
        // El código ya se usó: no sirve dos veces.
        call("POST", confirm, null, Map.of("email", customerEmail, "code", code, "newPassword", "OtraClave2026!"))
                .andExpect(status().isBadRequest());
        call("POST", "/api/auth/login", null, Map.of("email", customerEmail, "password", "LongPassword123!"))
                .andExpect(status().isUnauthorized());
        call("POST", "/api/auth/login", null, Map.of("email", customerEmail, "password", "NuevaClave2026!"))
                .andExpect(status().isOk());
    }

    @Test
    void passwordResetDoesNotRevealWhichAccountsExist() throws Exception {
        call("POST", "/api/auth/password-reset", null, Map.of("email", customerEmail))
                .andExpect(status().isServiceUnavailable());
        when(mail.canDeliver()).thenReturn(true);
        call("POST", "/api/auth/password-reset", null, Map.of("email", "nadie-" + UUID.randomUUID() + "@test.local"))
                .andExpect(status().isNoContent());
        call("POST", "/api/auth/password-reset/confirm", null, Map.of("email",
                "nadie-" + UUID.randomUUID() + "@test.local", "code", "123456", "newPassword", "NuevaClave2026!"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No hay ningún código pendiente para ese correo. Pide uno nuevo."));
        verify(mail, never()).send(anyString(), anyString(), eq("Código para cambiar tu contraseña"), anyString());
    }

    @Test
    void healthCheckIsPublicAndIncludesTheDatabase() throws Exception {
        call("GET", "/actuator/health", null, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void corsAllowsOnlyTheConfiguredFrontend() throws Exception {
        mvc.perform(options("/api/catalog/categories")
                .header("Origin", "http://localhost:4200")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));

        mvc.perform(options("/api/catalog/categories")
                .header("Origin", "https://not-allowed.example")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void openApiDocumentationIsAvailable() throws Exception {
        call("GET", "/v3/api-docs", null, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists());
    }

    @Test
    void cartAndOrdersArePrivate() throws Exception {
        quantity(customerToken, 2).andExpect(status().isOk());
        String other = signup(UUID.randomUUID() + "@test.local");
        call("GET", "/api/customer/cart", other, null).andExpect(jsonPath("$.items.length()").value(0));
        checkout(customerToken, UUID.randomUUID()).andExpect(status().isOk());
        call("GET", "/api/customer/orders", other, null).andExpect(jsonPath("$.length()").value(0));
        call("GET", "/api/customer/orders", customerToken, null).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void checkoutCalculatesDiscountAndIsIdempotent() throws Exception {
        String code = coupon(10, LocalDate.now().plusDays(2));
        quantity(customerToken, 2).andExpect(status().isOk());
        call("PUT", "/api/customer/cart/coupon", customerToken, Map.of("code", code)).andExpect(status().isOk());
        UUID key = UUID.randomUUID();
        var result = checkout(customerToken, key).andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value(39.98)).andExpect(jsonPath("$.discount").value(4.00))
                .andExpect(jsonPath("$.total").value(35.98)).andExpect(jsonPath("$.paymentStatus").value("SIMULATED"));
        long id = json.readTree(result.andReturn().getResponse().getContentAsString()).get("id").asLong();
        checkout(customerToken, key).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        assertThat(products.findById(productId).orElseThrow().getStock()).isEqualTo(3);
        call("GET", "/api/customer/cart", customerToken, null).andExpect(jsonPath("$.items.length()").value(0));
        quantity(customerToken, 1).andExpect(status().isOk());
        checkout(customerToken, UUID.randomUUID()).andExpect(status().isOk());
        call("GET", "/api/customer/orders", customerToken, null).andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void couponRecalculatesAfterChangingQuantityAndCanBeRemoved() throws Exception {
        quantity(customerToken, 1);
        call("PUT", "/api/customer/cart/coupon", customerToken,
                Map.of("code", coupon(10, LocalDate.now().plusDays(1))));
        quantity(customerToken, 3).andExpect(jsonPath("$.subtotal").value(59.97))
                .andExpect(jsonPath("$.discount").value(6)).andExpect(jsonPath("$.total").value(53.97));
        call("DELETE", "/api/customer/cart/coupon", customerToken, null).andExpect(jsonPath("$.total").value(59.97));
        quantity(customerToken, 0).andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void invalidValuesAndExpiredCouponsAreRejected() throws Exception {
        quantity(customerToken, -1).andExpect(status().isBadRequest());
        quantity(customerToken, 6).andExpect(status().isConflict());
        call("PUT", "/api/customer/cart/coupon", customerToken,
                Map.of("code", coupon(10, LocalDate.now().minusDays(1)))).andExpect(status().isBadRequest());
        checkout(customerToken, UUID.randomUUID()).andExpect(status().isBadRequest());
        call("POST", "/api/admin/products", adminToken, Map.of("name", "Bad", "description", "x", "price", -1, "stock",
                1, "categoryId", categoryId, "active", true, "version", 0)).andExpect(status().isBadRequest());
        call("POST", "/api/customer/checkout", customerToken, Map.of("requestId", UUID.randomUUID(), "address",
                "Calle Test 123", "phone", "8095551234", "acceptSimulatedPayment", false))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cancellationRestoresStockOnlyOnceAndPreservesSnapshot() throws Exception {
        quantity(customerToken, 2);
        long id = json
                .readTree(checkout(customerToken, UUID.randomUUID()).andReturn().getResponse().getContentAsString())
                .get("id").asLong();
        Product product = products.findById(productId).orElseThrow();
        product.setName("Renamed");
        products.save(product);
        call("PUT", "/api/admin/orders/" + id + "/status", adminToken, Map.of("status", "CANCELLED"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lines[0].productName").value("Test product"));
        call("PUT", "/api/admin/orders/" + id + "/status", adminToken, Map.of("status", "CANCELLED"))
                .andExpect(status().isOk());
        assertThat(products.findById(productId).orElseThrow().getStock()).isEqualTo(5);
        call("PUT", "/api/admin/orders/" + id + "/status", adminToken, Map.of("status", "SHIPPED"))
                .andExpect(status().isConflict());
    }

    @Test
    void concurrentCustomersCannotOversell() throws Exception {
        Product product = products.findById(productId).orElseThrow();
        product.setStock(1);
        products.save(product);
        String other = signup(UUID.randomUUID() + "@test.local");
        quantity(customerToken, 1);
        quantity(other, 1);
        CountDownLatch start = new CountDownLatch(1);
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Future<Integer> a = executor.submit(() -> {
                start.await();
                return checkout(customerToken, UUID.randomUUID()).andReturn().getResponse().getStatus();
            });
            Future<Integer> b = executor.submit(() -> {
                start.await();
                return checkout(other, UUID.randomUUID()).andReturn().getResponse().getStatus();
            });
            start.countDown();
            assertThat(List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS))).containsExactlyInAnyOrder(200,
                    409);
        }
        assertThat(products.findById(productId).orElseThrow().getStock()).isZero();
    }

    @Test
    void wishlistProfileAndCatalogWork() throws Exception {
        call("PUT", "/api/customer/wishlist/" + productId, customerToken, Map.of()).andExpect(status().isNoContent());
        call("GET", "/api/customer/wishlist", customerToken, null).andExpect(jsonPath("$.length()").value(1));
        call("DELETE", "/api/customer/wishlist/" + productId, customerToken, null).andExpect(status().isNoContent());
        call("PUT", "/api/me", customerToken, Map.of("name", "Nombre actualizado"))
                .andExpect(jsonPath("$.name").value("Nombre actualizado"));
        call("GET", "/api/catalog/products/" + productId, null, null)
                .andExpect(jsonPath("$.categoryId").value(categoryId));
        call("DELETE", "/api/admin/products/" + productId, adminToken, null).andExpect(status().isNoContent());
        call("GET", "/api/catalog/products/" + productId, null, null).andExpect(status().isNotFound());
    }

    @Test
    void productSearchIgnoresAccentsAndLetterCase() throws Exception {
        Product product = products.findById(productId).orElseThrow();
        product.setName("Lámpara térmica");
        product.setDescription("Edición especial para escritorio");
        products.saveAndFlush(product);

        Category category = categories.findById(categoryId).orElseThrow();
        category.setName("Iluminación-" + productId);
        categories.saveAndFlush(category);

        mvc.perform(get("/api/catalog/products").param("q", "lampara"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(productId));
        mvc.perform(get("/api/catalog/products").param("q", "LÁMPARA"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(productId));
        mvc.perform(get("/api/catalog/products").param("q", "termica"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(productId));
        mvc.perform(get("/api/catalog/products").param("q", "edicion"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(productId));
        mvc.perform(get("/api/catalog/products").param("q", "iluminacion"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].id").value(productId));
    }

    @Test
    void specializedRolesHaveSeparatedServerPermissions() throws Exception {
        String inventoryToken = panelUser(User.Role.INVENTORY_MANAGER);
        String supportToken = panelUser(User.Role.CUSTOMER_SUPPORT);

        call("GET", "/api/inventory/products", inventoryToken, null).andExpect(status().isOk());
        call("GET", "/api/support/orders", inventoryToken, null).andExpect(status().isForbidden());
        call("GET", "/api/admin/users", inventoryToken, null).andExpect(status().isForbidden());
        call("GET", "/api/support/orders", supportToken, null).andExpect(status().isOk());
        call("GET", "/api/inventory/products", supportToken, null).andExpect(status().isForbidden());
        call("GET", "/api/customer/cart", supportToken, null).andExpect(status().isForbidden());
        call("GET", "/api/inventory/products", adminToken, null).andExpect(status().isOk());
        call("GET", "/api/support/orders", adminToken, null).andExpect(status().isOk());
    }

    @Test
    void administratorCanAssignRolesButCannotChangeOwnRole() throws Exception {
        User customer = users.findAll().stream().filter(u -> u.getRole() == User.Role.CUSTOMER).findFirst()
                .orElseThrow();
        call("PUT", "/api/admin/users/" + customer.getId() + "/role", adminToken, Map.of("role", "INVENTORY_MANAGER"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("INVENTORY_MANAGER"));
        call("PUT", "/api/admin/users/" + adminId + "/role", adminToken, Map.of("role", "CUSTOMER"))
                .andExpect(status().isConflict());
    }

    @Test
    void customerOwnsAddressesAndCanReuseTheirData() throws Exception {
        var created = call("POST", "/api/customer/addresses", customerToken, Map.of(
                "label", "Casa", "recipientName", "Cliente Test", "addressLine", "Calle Uno 10",
                "city", "Santo Domingo", "phone", "8095551234", "defaultAddress", true))
                .andExpect(status().isOk()).andExpect(jsonPath("$.defaultAddress").value(true));
        long id = json.readTree(created.andReturn().getResponse().getContentAsString()).get("id").asLong();
        String other = signup(UUID.randomUUID() + "@test.local");
        call("GET", "/api/customer/addresses", other, null).andExpect(jsonPath("$.length()").value(0));
        call("DELETE", "/api/customer/addresses/" + id, other, null).andExpect(status().isNotFound());
        call("DELETE", "/api/customer/addresses/" + id, customerToken, null).andExpect(status().isNoContent());
    }

    @Test
    void inventoryMovementsChangeStockAndKeepAuditHistory() throws Exception {
        String inventoryToken = panelUser(User.Role.INVENTORY_MANAGER);
        call("POST", "/api/inventory/products/" + productId + "/stock", inventoryToken,
                Map.of("type", "ENTRY", "quantity", 7, "note", "Recepción proveedor 104"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.previousStock").value(5))
                .andExpect(jsonPath("$.newStock").value(12));
        call("POST", "/api/inventory/products/" + productId + "/stock", inventoryToken,
                Map.of("type", "EXIT", "quantity", 3, "note", "Producto dañado"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.quantityDelta").value(-3));
        call("GET", "/api/inventory/movements", inventoryToken, null)
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].newStock").value(9))
                .andExpect(jsonPath("$[1].previousStock").value(5));
        assertThat(products.findById(productId).orElseThrow().getStock()).isEqualTo(9);
    }

    @Test
    void supportProcessesCustomerCaseAndSimulatedRefund() throws Exception {
        quantity(customerToken, 1);
        long orderId = json
                .readTree(checkout(customerToken, UUID.randomUUID()).andReturn().getResponse().getContentAsString())
                .get("id").asLong();
        var created = call("POST", "/api/customer/support-cases", customerToken,
                Map.of("orderId", orderId, "type", "REFUND", "reason", "El producto llegó con una pieza rota."))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("OPEN"));
        long caseId = json.readTree(created.andReturn().getResponse().getContentAsString()).get("id").asLong();
        String supportToken = panelUser(User.Role.CUSTOMER_SUPPORT);
        call("PUT", "/api/support/cases/" + caseId, supportToken,
                Map.of("status", "APPROVED", "resolution", "Reembolso aprobado después de validar el pedido.",
                        "refundAmount", 19.99))
                .andExpect(status().isOk()).andExpect(jsonPath("$.refundAmount").value(19.99));
        call("GET", "/api/support/orders", supportToken, null)
                .andExpect(jsonPath("$[0].paymentStatus").value("SIMULATED_REFUNDED"));
        call("GET", "/api/customer/support-cases", customerToken, null)
                .andExpect(jsonPath("$[0].handledBy").exists());
    }

    @Test
    void decimalRoundingIsPredictable() {
        assertThat(CartService.discount(new BigDecimal("19.99"), 10)).isEqualByComparingTo("2.00");
    }

    private ResultActions quantity(String token, int quantity) throws Exception {
        return call("PUT", "/api/customer/cart/items/" + productId, token, Map.of("quantity", quantity));
    }

    private ResultActions checkout(String token, UUID key) throws Exception {
        return call("POST", "/api/customer/checkout", token, Map.of("requestId", key, "address", "Calle Test 123",
                "phone", "8095551234", "acceptSimulatedPayment", true));
    }

    private String signup(String email) throws Exception {
        // Sin correo configurado el registro devuelve la sesión directamente,
        // dentro de "session"; con verificación activa vendría vacío.
        var response = call("POST", "/api/auth/signup", null,
                Map.of("name", "Cliente", "email", email, "password", "LongPassword123!", "acceptTerms", true))
                .andExpect(status().isCreated());
        return json.readTree(response.andReturn().getResponse().getContentAsString())
                .get("session").get("token").asText();
    }

    private String panelUser(User.Role role) throws Exception {
        User user = new User();
        user.setEmail(role.name().toLowerCase() + "-" + UUID.randomUUID() + "@test.local");
        user.setName(role.name());
        user.setPasswordHash(passwords.encode("LongPassword123!"));
        user.setRole(role);
        users.saveAndFlush(user);
        return token(
                call("POST", "/api/auth/login", null, Map.of("email", user.getEmail(), "password", "LongPassword123!"))
                        .andExpect(status().isOk()));
    }

    private String token(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString()).get("token").asText();
    }

    private String coupon(int percentage, LocalDate expiry) {
        Coupon coupon = new Coupon();
        coupon.setCode(UUID.randomUUID().toString().substring(0, 20).toUpperCase());
        coupon.setDiscountPercent(percentage);
        coupon.setExpiresOn(expiry);
        coupons.save(coupon);
        return coupon.getCode();
    }

    private ResultActions call(String method, String path, String token, Object body) throws Exception {
        var request = request(org.springframework.http.HttpMethod.valueOf(method), path)
                .contentType(MediaType.APPLICATION_JSON);
        if (token != null)
            request.header("Authorization", "Bearer " + token);
        if (body != null)
            request.content(json.writeValueAsString(body));
        return mvc.perform(request);
    }
}
