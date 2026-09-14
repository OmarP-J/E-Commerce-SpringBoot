package com.codeshift.ecom.api;

import com.codeshift.ecom.config.PaymentProperties;
import com.codeshift.ecom.model.PaymentProvider;
import com.codeshift.ecom.service.CartService;
import com.codeshift.ecom.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;

/**
 * Arranque del pago. El pedido NO se crea aquí: se crea en
 * {@code POST /api/customer/checkout}, y solo después de que el backend
 * verifique el cobro contra la pasarela.
 */
@RestController
@RequestMapping("/api/customer/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService payments;
    private final CartService carts;

    /** Lo que el frontend necesita para dibujar las opciones de pago. */
    public record MethodsView(boolean testMode, String currency, boolean simulated,
            GatewayView paypal, GatewayView stripe) {
    }

    public record GatewayView(boolean enabled, String publicKey) {
    }

    public record PaypalOrderView(String id) {
    }

    public record StripeSessionView(String id, String url) {
    }

    @GetMapping("/methods")
    public MethodsView methods() {
        PaymentProperties config = payments.settings();
        return new MethodsView(
                payments.isTestMode(),
                config.getCurrency(),
                payments.isAvailable(PaymentProvider.SIMULATED),
                new GatewayView(payments.isAvailable(PaymentProvider.PAYPAL), config.getPaypal().getClientId()),
                new GatewayView(payments.isAvailable(PaymentProvider.STRIPE),
                        config.getStripe().getPublishableKey()));
    }

    @PostMapping("/paypal/orders")
    public PaypalOrderView createPaypalOrder(Principal principal) {
        return new PaypalOrderView(payments.createPaypalOrder(cartTotal(principal)));
    }

    @PostMapping("/stripe/sessions")
    public StripeSessionView createStripeSession(Principal principal) {
        String base = payments.settings().getReturnUrlBase();
        if (base.isBlank())
            throw ApiException.badRequest("Falta configurar la URL de retorno para Stripe.");
        base = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        var session = payments.createStripeSession(cartTotal(principal),
                base + "/cart?stripe_session={CHECKOUT_SESSION_ID}",
                base + "/cart?stripe_cancel=1");
        return new StripeSessionView(session.id(), session.url());
    }

    /** El monto siempre sale del carrito guardado en el servidor, nunca del navegador. */
    private BigDecimal cartTotal(Principal principal) {
        var cart = carts.get(principal.getName());
        if (cart.items().isEmpty())
            throw ApiException.badRequest("El carrito está vacío.");
        if (cart.couponWarning() != null && !cart.couponWarning().isBlank())
            throw ApiException.conflict(cart.couponWarning());
        if (cart.total().signum() <= 0)
            throw ApiException.badRequest("El total del carrito no es válido para un cobro.");
        return cart.total();
    }
}
