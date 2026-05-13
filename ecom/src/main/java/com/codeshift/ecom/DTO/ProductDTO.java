package com.codeshift.ecom.DTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


@Data
public class ProductDTO {

    private Long id;

    private String name;

    private Long price;

    private String description;

    private byte[] byteImg;

    private Long categoryId;

    private String categoryName;

    private MultipartFile img;
}
