package com.codeshift.ecom.api;

import com.codeshift.ecom.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventory;

    @GetMapping("/products")
    public Views.PageView<Views.ProductView> products(@RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return inventory.products(q, page, size);
    }

    @GetMapping("/low-stock")
    public List<Views.ProductView> lowStock() {
        return inventory.lowStock();
    }

    @GetMapping("/movements")
    public List<Views.InventoryMovementView> movements() {
        return inventory.movements();
    }

    @PostMapping("/products/{id}/stock")
    public Views.InventoryMovementView adjust(Principal principal, @PathVariable Long id,
            @Valid @RequestBody Requests.InventoryAdjustment input) {
        return inventory.adjust(principal.getName(), id, input);
    }
}
