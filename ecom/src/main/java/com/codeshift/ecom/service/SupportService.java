package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.*;
import com.codeshift.ecom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportService {
    private static final List<SupportCase.Status> ACTIVE = List.of(SupportCase.Status.OPEN,
            SupportCase.Status.IN_REVIEW, SupportCase.Status.APPROVED);
    private final SupportCaseRepository cases;
    private final OrderRepository orders;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<Views.SupportCaseView> customerCases(String email) {
        User customer = user(email);
        return cases.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream().map(Views.SupportCaseView::of)
                .toList();
    }

    public Views.SupportCaseView create(String email, Requests.SupportCaseCreate input) {
        User customer = user(email);
        ShopOrder order = orders.findById(input.orderId())
                .orElseThrow(() -> ApiException.notFound("Pedido no encontrado."));
        if (!order.getUser().getId().equals(customer.getId()))
            throw ApiException.notFound("Pedido no encontrado.");
        if (cases.existsByOrderIdAndCustomerIdAndTypeAndStatusIn(order.getId(), customer.getId(), input.type(), ACTIVE))
            throw ApiException.conflict("Ese pedido ya tiene una solicitud abierta del mismo tipo.");
        SupportCase supportCase = new SupportCase();
        supportCase.setOrder(order);
        supportCase.setCustomer(customer);
        supportCase.setType(input.type());
        supportCase.setReason(input.reason().trim());
        return Views.SupportCaseView.of(cases.saveAndFlush(supportCase));
    }

    @Transactional(readOnly = true)
    public List<Views.SupportCaseView> allCases() {
        return cases.findAllByOrderByUpdatedAtDesc().stream().map(Views.SupportCaseView::of).toList();
    }

    public Views.SupportCaseView update(String email, Long id, Requests.SupportCaseUpdate input) {
        User actor = user(email);
        SupportCase supportCase = cases.findById(id)
                .orElseThrow(() -> ApiException.notFound("Solicitud no encontrada."));
        BigDecimal refund = input.refundAmount() == null ? BigDecimal.ZERO : input.refundAmount();
        boolean approved = input.status() == SupportCase.Status.APPROVED
                || input.status() == SupportCase.Status.RESOLVED;
        if (!approved && refund.signum() > 0)
            throw ApiException.badRequest("Solo una solicitud aprobada o resuelta puede tener reembolso.");
        BigDecimal otherRefunds = cases.findByOrderId(supportCase.getOrder().getId()).stream()
                .filter(item -> !item.getId().equals(supportCase.getId()))
                .filter(item -> item.getStatus() == SupportCase.Status.APPROVED
                        || item.getStatus() == SupportCase.Status.RESOLVED)
                .map(SupportCase::getRefundAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (otherRefunds.add(approved ? refund : BigDecimal.ZERO).compareTo(supportCase.getOrder().getTotal()) > 0)
            throw ApiException.badRequest("La suma de reembolsos no puede superar el total del pedido.");
        if (input.status() != SupportCase.Status.OPEN
                && (input.resolution() == null || input.resolution().trim().length() < 5))
            throw ApiException.badRequest("Escribe una resolución de al menos 5 caracteres.");
        supportCase.setStatus(input.status());
        supportCase.setResolution(input.resolution() == null ? null : input.resolution().trim());
        supportCase.setRefundAmount(refund);
        supportCase.setHandledBy(actor);
        supportCase.setUpdatedAt(Instant.now());
        BigDecimal totalRefunded = otherRefunds.add(approved ? refund : BigDecimal.ZERO);
        if (supportCase.getOrder().getStatus() == ShopOrder.Status.CANCELLED)
            supportCase.getOrder().setPaymentStatus("SIMULATED_CANCELLED");
        else if (totalRefunded.signum() == 0)
            supportCase.getOrder().setPaymentStatus("SIMULATED");
        else if (totalRefunded.compareTo(supportCase.getOrder().getTotal()) == 0)
            supportCase.getOrder().setPaymentStatus("SIMULATED_REFUNDED");
        else
            supportCase.getOrder().setPaymentStatus("SIMULATED_PARTIAL_REFUND");
        return Views.SupportCaseView.of(supportCase);
    }

    private User user(String email) {
        return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
    }
}
