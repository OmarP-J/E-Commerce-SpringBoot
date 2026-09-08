package com.codeshift.ecom.api;

import com.codeshift.ecom.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CartService carts;
    private final OrderService orders;
    private final AddressService addresses;
    private final SupportService support;

    @GetMapping("/cart")
    public Views.CartView cart(Principal p) {
        return carts.get(p.getName());
    }

    @PutMapping("/cart/items/{productId}")
    public Views.CartView quantity(Principal p, @PathVariable Long productId,
            @Valid @RequestBody Requests.Quantity input) {
        return carts.quantity(p.getName(), productId, input.quantity());
    }

    @PutMapping("/cart/coupon")
    public Views.CartView coupon(Principal p, @Valid @RequestBody Requests.CouponCode input) {
        return carts.coupon(p.getName(), input.code());
    }

    @DeleteMapping("/cart/coupon")
    public Views.CartView removeCoupon(Principal p) {
        return carts.coupon(p.getName(), null);
    }

    @PostMapping("/checkout")
    public Views.OrderView checkout(Principal p, @Valid @RequestBody Requests.Checkout input) {
        return orders.checkout(p.getName(), input);
    }

    @GetMapping("/orders")
    public List<Views.OrderView> orders(Principal p) {
        return orders.customerOrders(p.getName());
    }

    @GetMapping("/wishlist")
    public List<Views.ProductView> wishlist(Principal p) {
        return carts.wishlist(p.getName());
    }

    @PutMapping("/wishlist/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void favorite(Principal p, @PathVariable Long id) {
        carts.favorite(p.getName(), id, true);
    }

    @DeleteMapping("/wishlist/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void unfavorite(Principal p, @PathVariable Long id) {
        carts.favorite(p.getName(), id, false);
    }

    @GetMapping("/addresses")
    public List<Views.AddressView> addresses(Principal p) {
        return addresses.list(p.getName());
    }

    @PostMapping("/addresses")
    public Views.AddressView address(Principal p, @Valid @RequestBody Requests.AddressInput input) {
        return addresses.save(p.getName(), null, input);
    }

    @PutMapping("/addresses/{id}")
    public Views.AddressView address(Principal p, @PathVariable Long id,
            @Valid @RequestBody Requests.AddressInput input) {
        return addresses.save(p.getName(), id, input);
    }

    @DeleteMapping("/addresses/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteAddress(Principal p, @PathVariable Long id) {
        addresses.delete(p.getName(), id);
    }

    @GetMapping("/support-cases")
    public List<Views.SupportCaseView> cases(Principal p) {
        return support.customerCases(p.getName());
    }

    @PostMapping("/support-cases")
    public Views.SupportCaseView supportCase(Principal p, @Valid @RequestBody Requests.SupportCaseCreate input) {
        return support.create(p.getName(), input);
    }
}
