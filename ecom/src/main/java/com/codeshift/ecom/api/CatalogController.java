package com.codeshift.ecom.api;

import com.codeshift.ecom.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.WebRequest;
import java.util.List;
import java.util.concurrent.TimeUnit;

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
    public ResponseEntity<byte[]> image(@PathVariable Long id, WebRequest request) {
        var p = catalog.find(id);
        if (p.getImage() == null)
            throw ApiException.notFound("Imagen no encontrada.");
        String etag = "\"" + id + "-" + p.getVersion() + "\"";
        // Same image bytes are re-requested on every catalog/admin page load; browsers had
        // no way to cache them before, so this let the client reuse cached bytes (or get a
        // cheap 304) instead of re-downloading every image on every visit.
        if (request.checkNotModified(etag))
            return null;
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(p.getImageType()))
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .eTag(etag)
                .body(p.getImage());
    }
}
