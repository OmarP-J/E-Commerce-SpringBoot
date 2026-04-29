package com.codeshift.ecom.Services.Admin.Category;

import com.codeshift.ecom.DTO.CategoryDTO;
import com.codeshift.ecom.Entity.Category;
import com.codeshift.ecom.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());

        return categoryRepository.save(category);
    }
}
