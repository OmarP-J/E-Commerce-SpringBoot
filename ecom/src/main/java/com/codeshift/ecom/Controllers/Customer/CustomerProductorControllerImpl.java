package com.codeshift.ecom.Controllers.Customer;

import com.codeshift.ecom.DTO.ProductDTO;
import com.codeshift.ecom.Services.Customer.CustomerProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerProductorControllerImpl {

    private final CustomerProductService customerProductService;

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProduct(){
    List<ProductDTO> productDtos = customerProductService.getAllProducts();
    return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<ProductDTO>>  getAllProductByName(@PathVariable String name){
        List<ProductDTO> productDtos = customerProductService.searchProductByTitle(name);
        return ResponseEntity.ok(productDtos);
    }


}
