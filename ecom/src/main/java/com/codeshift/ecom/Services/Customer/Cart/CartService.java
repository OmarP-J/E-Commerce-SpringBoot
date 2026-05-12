package com.codeshift.ecom.Services.Customer.Cart;

import com.codeshift.ecom.DTO.AddProductInCartDTO;
import org.springframework.http.ResponseEntity;

public interface CartService {
    ResponseEntity<?> addProductInCart(AddProductInCartDTO addProductInCartDTO);
}
