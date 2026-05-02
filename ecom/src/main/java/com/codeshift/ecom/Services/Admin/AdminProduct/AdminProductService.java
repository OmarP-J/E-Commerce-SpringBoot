package com.codeshift.ecom.Services.Admin.AdminProduct;

import com.codeshift.ecom.DTO.ProductDTO;

import java.io.IOException;
import java.util.List;

public interface AdminProductService {

    ProductDTO addProduct(ProductDTO productDto) throws IOException;

    List<ProductDTO> getAllProducts();
}
