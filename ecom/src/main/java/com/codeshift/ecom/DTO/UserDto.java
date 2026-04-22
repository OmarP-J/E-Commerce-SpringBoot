package com.codeshift.ecom.DTO;

import lombok.Data;

@Data
public class UserDto {
    private Long id;

    private String email;

    private String name;

    private String UserRole;
}
