package com.codeshift.ecom.api;

import com.codeshift.ecom.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService catalog;

    @GetMapping("/products")
    public Views.PageView<Views.ProductView> products(@RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) {
        return catalog.list(q, categoryId, page, size, false);
    }

    @GetMapping("/products/{id}")
    public Views.ProductView detail(@PathVariable Long id) {
        return catalog.detail(id);
    }

    @GetMapping("/categories")
    public List<Views.CategoryView> categories() {
        return catalog.categories();
    }

    @GetMapping("/products/{id}/image")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> image(@PathVariable Long id) {
        var p = catalog.find(id);
        if (p.getImage() == null)
            throw ApiException.notFound("Imagen no encontrada.");
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(p.getImageType()))
                .header("X-Content-Type-Options", "nosniff").body(p.getImage());
    }
}
