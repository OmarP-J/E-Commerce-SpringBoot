package com.codeshift.ecom.api;

import com.codeshift.ecom.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final CatalogService catalog;
    private final OrderService orders;
    private final AccountService accounts;
    private final SettingsService settings;

    @GetMapping("/products")
    public Views.PageView<Views.ProductView> products(@RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) {
        return catalog.list(q, categoryId, page, size, true);
    }

    @PostMapping("/products")
    public Views.ProductView create(Principal principal, @Valid @RequestBody Requests.ProductInput input) {
        return catalog.save(principal.getName(), null, input);
    }

    @PutMapping("/products/{id}")
    public Views.ProductView update(Principal principal, @PathVariable Long id,
            @Valid @RequestBody Requests.ProductInput input) {
        return catalog.save(principal.getName(), id, input);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void archive(@PathVariable Long id) {
        catalog.archive(id);
    }

    @PostMapping("/products/{id}/image")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void image(@PathVariable Long id, @RequestParam MultipartFile file) throws IOException {
        catalog.image(id, file);
    }

    @PostMapping("/categories")
    public Views.CategoryView category(@Valid @RequestBody Requests.CategoryInput input) {
        return catalog.category(null, input);
    }

    @PutMapping("/categories/{id}")
    public Views.CategoryView category(@PathVariable Long id, @Valid @RequestBody Requests.CategoryInput input) {
        return catalog.category(id, input);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        catalog.deleteCategory(id);
    }

    @GetMapping("/coupons")
    public List<Views.CouponView> coupons() {
        return catalog.coupons();
    }

    @PostMapping("/coupons")
    public Views.CouponView coupon(@Valid @RequestBody Requests.CouponInput input) {
        return catalog.coupon(null, input);
    }

    @PutMapping("/coupons/{id}")
    public Views.CouponView coupon(@PathVariable Long id, @Valid @RequestBody Requests.CouponInput input) {
        return catalog.coupon(id, input);
    }

    @GetMapping("/orders")
    public List<Views.OrderView> orders() {
        return orders.all();
    }

    @PutMapping("/orders/{id}/status")
    public Views.OrderView status(Principal principal, @PathVariable Long id,
            @Valid @RequestBody Requests.OrderStatus input) {
        return orders.status(principal.getName(), id, input.status());
    }

    @GetMapping("/analytics")
    public Views.Analytics analytics() {
        return orders.analytics();
    }

    @GetMapping("/users")
    public List<Views.UserView> users() {
        return accounts.users();
    }

    @PutMapping("/users/{id}/role")
    public Views.UserView role(Principal principal, @PathVariable Long id,
            @Valid @RequestBody Requests.RoleUpdate input) {
        return accounts.changeRole(principal.getName(), id, input.role());
    }

    @GetMapping("/settings")
    public Views.SettingsView settings() {
        return settings.current();
    }

    @PutMapping("/settings")
    public Views.SettingsView settings(@Valid @RequestBody Requests.SettingsInput input) {
        return settings.save(input);
    }
}
