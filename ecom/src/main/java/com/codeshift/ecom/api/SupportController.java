package com.codeshift.ecom.api;

import com.codeshift.ecom.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {
    private final SupportService support;
    private final OrderService orders;

    @GetMapping("/orders")
    public List<Views.OrderView> orders() {
        return orders.all();
    }

    @GetMapping("/cases")
    public List<Views.SupportCaseView> cases() {
        return support.allCases();
    }

    @PutMapping("/cases/{id}")
    public Views.SupportCaseView update(Principal principal, @PathVariable Long id,
            @Valid @RequestBody Requests.SupportCaseUpdate input) {
        return support.update(principal.getName(), id, input);
    }
}
