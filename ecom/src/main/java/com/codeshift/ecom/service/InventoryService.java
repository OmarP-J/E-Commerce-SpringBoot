package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {
    private final ProductRepository products;
    private final InventoryMovementRepository movements;
    private final UserRepository users;
    private final SettingsService settings;

    @Transactional(readOnly = true)
    public Views.PageView<Views.ProductView> products(String search, int page, int size) {
        if (page < 0 || size < 1 || size > 100 || (search != null && search.length() > 120))
            throw ApiException.badRequest("Filtros inválidos.");
        var result = products.search(normalize(search), null, true,
                PageRequest.of(page, size, Sort.by("stock").ascending().and(Sort.by("name"))));
        return new Views.PageView<>(result.map(Views.ProductView::of).getContent(), result.getTotalElements(), page,
                result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<Views.ProductView> lowStock() {
        int threshold = settings.current().lowStockThreshold();
        return products.findByActiveTrueAndStockLessThanEqualOrderByStockAscNameAsc(threshold).stream()
                .map(Views.ProductView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Views.InventoryMovementView> movements() {
        return movements.findTop100ByOrderByCreatedAtDesc().stream().map(Views.InventoryMovementView::of).toList();
    }

    public Views.InventoryMovementView adjust(String email, Long productId, Requests.InventoryAdjustment input) {
        User actor = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
        Product product = products.lockById(productId)
                .orElseThrow(() -> ApiException.notFound("Producto no encontrado."));
        int previous = product.getStock();
        int next = switch (input.type()) {
            case ENTRY -> Math.addExact(previous, input.quantity());
            case EXIT -> previous - input.quantity();
            case ADJUSTMENT -> input.quantity();
        };
        if (next < 0)
            throw ApiException.conflict("La salida supera las existencias disponibles.");
        if (next > 1_000_000)
            throw ApiException.badRequest("Las existencias no pueden superar 1,000,000.");
        product.setStock(next);
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setPerformedBy(actor);
        movement.setType(input.type());
        movement.setQuantityDelta(next - previous);
        movement.setPreviousStock(previous);
        movement.setNewStock(next);
        movement.setNote(input.note().trim());
        return Views.InventoryMovementView.of(movements.saveAndFlush(movement));
    }

    private String normalize(String value) {
        return java.text.Normalizer.normalize(value == null ? "" : value.trim(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").toLowerCase(java.util.Locale.ROOT);
    }
}
