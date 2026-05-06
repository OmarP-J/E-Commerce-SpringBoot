package com.codeshift.ecom.Controllers.Admin;

import com.codeshift.ecom.DTO.ProductDTO;
import com.codeshift.ecom.Services.Admin.AdminProduct.AdminProductServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductServiceImpl adminProductServiceImpl;

    @PostMapping("/product")
    public ResponseEntity<ProductDTO> addProduct(@ModelAttribute ProductDTO productDTO) throws java.io.IOException {
        ProductDTO productDTO1 = adminProductServiceImpl.addProduct((productDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(productDTO1);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>>  getAllProduct(){
        List<ProductDTO> productDtos = adminProductServiceImpl.getAllProducts();
        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<ProductDTO>>  getAllProductByName(@PathVariable String name){
        List<ProductDTO> productDtos = adminProductServiceImpl.getAllProductByName(name);
        return ResponseEntity.ok(productDtos);
    }
}
