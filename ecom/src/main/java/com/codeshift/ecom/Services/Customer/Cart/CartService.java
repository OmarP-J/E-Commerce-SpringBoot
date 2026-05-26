package com.codeshift.ecom.Services.Customer.Cart;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import com.codeshift.ecom.DTO.OrderDTO;
import org.springframework.http.ResponseEntity;

public interface CartService {
    ResponseEntity<?> addProductInCart(AddProductInCartDTO addProductInCartDTO);

    OrderDTO getCartByUserId(Long userId);

    OrderDTO applyCoupon(Long userId, String code);
}
