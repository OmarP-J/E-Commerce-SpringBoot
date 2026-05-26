package com.codeshift.ecom.Controllers.Customer;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import com.codeshift.ecom.DTO.OrderDTO;
import com.codeshift.ecom.Exceptions.ValidationExceptions;
import com.codeshift.ecom.Services.Customer.Cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/cart")
    public ResponseEntity<?> addProductInCart(@RequestBody AddProductInCartDTO addProductInCartDTO) {
        return cartService.addProductInCart(addProductInCartDTO);
    }

    @GetMapping("/cart/{userId}")
    public ResponseEntity<?> getCartUserById(@PathVariable Long userId) {
        OrderDTO orderDTO = cartService.getCartByUserId(userId);
        return ResponseEntity.status(HttpStatus.OK).body(orderDTO);
    }

    @GetMapping("/coupon/{userId}/{code}")
    public ResponseEntity<?> applyCoupon(@PathVariable Long userId, @PathVariable String code) {
        try {
            OrderDTO orderDTO = cartService.applyCoupon(userId, code);
            return ResponseEntity.ok(orderDTO);
        } catch (ValidationExceptions ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}
