package com.codeshift.ecom.Services.Customer;

import com.codeshift.ecom.DTO.ProductDTO;
import java.util.List;

public interface CustomerProductService {

    // Retrieve all products
    List<ProductDTO> getAllProducts();

    // Search products by title
    List<ProductDTO> searchProductByTitle(String title);

}
