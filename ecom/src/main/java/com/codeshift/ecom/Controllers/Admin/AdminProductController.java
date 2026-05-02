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
    public ResponseEntity<ProductDTO> addProduct(@ModelAttribute ProductDTO productDTO){
        ProductDTO productDTO1 = adminProductServiceImpl.addProduct((productDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(productDTO1);
    }

    @GetMapping("/products")
    public ResponseEntity<ProductDTO>  getAllProduct(){
        List<ProductDTO> productDtos = adminProductServiceImpl.getAllProducts();
        return new ResponseEntity.ok(productDtos);
    }
}
