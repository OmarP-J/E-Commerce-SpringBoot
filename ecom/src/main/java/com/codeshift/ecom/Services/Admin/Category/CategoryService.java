package com.codeshift.ecom.Services.Admin.Category;

import com.codeshift.ecom.DTO.CategoryDTO;
import com.codeshift.ecom.Entity.Category;

public interface CategoryService {

    Category createCategory(CategoryDTO categoryDTO);
}
