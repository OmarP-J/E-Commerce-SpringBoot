package com.codeshift.ecom.Services.Admin.Category;

import com.codeshift.ecom.DTO.CategoryDTO;
import com.codeshift.ecom.Entity.Category;

import java.util.List;

public interface CategoryService {

    Category createCategory(CategoryDTO categoryDTO);

    List<Category> getAllCategories();
}
