package com.codeshift.ecom.Controllers.Customer;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import com.codeshift.ecom.Services.Customer.Cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/cart")
    public ResponseEntity<?> addProductInCart(@RequestBody AddProductInCartDTO addProductInCartDTO) {
        return cartService.addProductInCart(addProductInCartDTO);
    }
}
