package com.codeshift.ecom.Services.Customer;

import com.codeshift.ecom.DTO.ProductDTO;

import java.util.List;

public interface CustomerProductService {

    List<ProductDTO> getAllProductsByTitle(String title);

    List<ProductDTO> getAllProducts(String category);
}
