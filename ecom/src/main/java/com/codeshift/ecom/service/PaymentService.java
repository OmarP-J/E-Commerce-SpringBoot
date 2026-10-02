package com.codeshift.ecom.service;

import com.codeshift.ecom.api.ApiException;
import com.codeshift.ecom.config.PaymentProperties;
import com.codeshift.ecom.model.PaymentProvider;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Integración con PayPal (Orders v2) y Stripe (Checkout Sessions) mediante
 * llamadas REST directas: no añade dependencias al proyecto.
 *
 * El backend siempre calcula el monto por su cuenta y lo vuelve a verificar
 * contra la pasarela antes de confirmar el pedido, así que un cliente
 * manipulado no puede pagar menos de lo que cuesta el carrito.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    /** Moneda en la que el catálogo muestra los precios y se calculan los totales. */
    static final String STORE_CURRENCY = "DOP";

    private final PaymentProperties config;
    private final RestClient.Builder clientBuilder = RestClient.builder();

    /** Resultado ya verificado contra la pasarela. */
    public record Settlement(PaymentProvider provider, String reference, BigDecimal amount, String currency) {
    }

    // ------------------------------------------------------------------
    // Candado anti-cobro
    // ------------------------------------------------------------------

    /**
     * En modo TEST desactiva cualquier pasarela cuyas llaves parezcan de
     * producción. Es el seguro que impide que una instalación de demostración
     * le cobre a alguien de verdad.
     */
    @PostConstruct
    void enforceTestMode() {
        if (config.getMode() == PaymentProperties.Mode.LIVE) {
            log.warn("PAGOS EN MODO LIVE: las transacciones mueven dinero real.");
            // Los totales se calculan y se muestran en pesos y viajan a la
            // pasarela sin convertir: con otra moneda, un pedido de RD$1,490
            // se cobraría como USD 1,490. Mejor sin pasarela que cobrar de más.
            if (!STORE_CURRENCY.equalsIgnoreCase(config.getCurrency())) {
                config.getPaypal().setEnabled(false);
                config.getStripe().setEnabled(false);
                log.error("PayPal y Stripe desactivados: la tienda calcula los precios en {} pero "
                        + "app.payments.currency es {} y no hay conversión de moneda.",
                        STORE_CURRENCY, config.getCurrency());
            }
            return;
        }
        if (config.getStripe().isEnabled() && !config.getStripe().isTestKeys()) {
            config.getStripe().setEnabled(false);
            log.error("Stripe desactivado: app.payments.mode=TEST pero las llaves no son de prueba "
                    + "(se esperan sk_test_ y pk_test_).");
        }
        if (config.getPaypal().isEnabled() && !config.getPaypal().isSandbox()) {
            config.getPaypal().setEnabled(false);
            log.error("PayPal desactivado: app.payments.mode=TEST pero apiBase no apunta al sandbox.");
        }
        log.info("Pagos en modo TEST — simulado: {}, PayPal: {}, Stripe: {}",
                config.isSimulatedEnabled(), config.getPaypal().isConfigured(), config.getStripe().isConfigured());
    }

    public boolean isTestMode() {
        return config.getMode() == PaymentProperties.Mode.TEST;
    }

    public boolean isAvailable(PaymentProvider provider) {
        return switch (provider) {
            case SIMULATED -> config.isSimulatedEnabled();
            case PAYPAL -> config.getPaypal().isConfigured();
            case STRIPE -> config.getStripe().isConfigured();
        };
    }

    public PaymentProperties settings() {
        return config;
    }

    // ------------------------------------------------------------------
    // PayPal
    // ------------------------------------------------------------------

    /** Crea la orden en PayPal y devuelve su identificador. */
    public String createPaypalOrder(BigDecimal total) {
        requireAvailable(PaymentProvider.PAYPAL);
        Map<String, Object> body = Map.of(
                "intent", "CAPTURE",
                "purchase_units", java.util.List.of(Map.of(
                        "amount", Map.of(
                                "currency_code", config.getCurrency(),
                                "value", amountString(total)))));
        JsonNode response;
        try {
            response = paypalClient().post()
                    .uri("/v2/checkout/orders")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + paypalToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("PayPal rechazó la creación de la orden", e);
            throw gatewayError("PayPal no pudo crear la orden." + detail(e));
        }
        String id = text(response, "id");
        if (id == null)
            throw gatewayError("PayPal no devolvió un identificador de orden.");
        return id;
    }

    /** Cobra la orden aprobada por el comprador y devuelve el monto realmente capturado. */
    public Settlement capturePaypalOrder(String orderId) {
        requireAvailable(PaymentProvider.PAYPAL);
        JsonNode response;
        try {
            response = paypalClient().post()
                    .uri("/v2/checkout/orders/{id}/capture", orderId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + paypalToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Fallo al capturar la orden {} de PayPal", orderId, e);
            throw gatewayError("PayPal no pudo completar el cobro. Intenta de nuevo.");
        }
        if (!"COMPLETED".equals(text(response, "status")))
            throw gatewayError("El pago de PayPal no quedó completado.");

        JsonNode capture = response.path("purchase_units").path(0)
                .path("payments").path("captures").path(0);
        BigDecimal amount = decimal(capture.path("amount"), "value");
        String currency = text(capture.path("amount"), "currency_code");
        if (amount == null)
            throw gatewayError("PayPal no informó el monto cobrado.");
        return new Settlement(PaymentProvider.PAYPAL, orderId, amount, currency);
    }

    private String paypalToken() {
        String basic = Base64.getEncoder().encodeToString(
                (config.getPaypal().getClientId() + ":" + config.getPaypal().getClientSecret())
                        .getBytes(StandardCharsets.UTF_8));
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        try {
            JsonNode response = paypalClient().post()
                    .uri("/v1/oauth2/token")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            String token = text(response, "access_token");
            if (token == null)
                throw gatewayError("PayPal no devolvió un token de acceso.");
            return token;
        } catch (RestClientException e) {
            log.warn("No se pudo autenticar contra PayPal", e);
            throw gatewayError("No se pudo conectar con PayPal. Revisa las credenciales." + detail(e));
        }
    }

    private RestClient paypalClient() {
        return clientBuilder.clone().baseUrl(config.getPaypal().getApiBase()).build();
    }

    // ------------------------------------------------------------------
    // Stripe
    // ------------------------------------------------------------------

    public record StripeSession(String id, String url) {
    }

    /** Crea la sesión de Stripe Checkout a la que hay que redirigir al comprador. */
    public StripeSession createStripeSession(BigDecimal total, String successUrl, String cancelUrl) {
        requireAvailable(PaymentProvider.STRIPE);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("mode", "payment");
        form.add("success_url", successUrl);
        form.add("cancel_url", cancelUrl);
        form.add("line_items[0][quantity]", "1");
        form.add("line_items[0][price_data][currency]", config.getCurrency().toLowerCase());
        form.add("line_items[0][price_data][unit_amount]", Long.toString(minorUnits(total)));
        form.add("line_items[0][price_data][product_data][name]", "Pedido Esencial");
        try {
            JsonNode response = stripeClient().post()
                    .uri("/v1/checkout/sessions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getStripe().getSecretKey())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            String id = text(response, "id");
            String url = text(response, "url");
            if (id == null || url == null)
                throw gatewayError("Stripe no devolvió la sesión de pago.");
            return new StripeSession(id, url);
        } catch (RestClientException e) {
            log.warn("No se pudo crear la sesión de Stripe", e);
            throw gatewayError("No se pudo conectar con Stripe. Revisa las credenciales." + detail(e));
        }
    }

    /** Relee la sesión en Stripe para confirmar que quedó pagada de verdad. */
    public Settlement verifyStripeSession(String sessionId) {
        requireAvailable(PaymentProvider.STRIPE);
        JsonNode response;
        try {
            response = stripeClient().get()
                    .uri("/v1/checkout/sessions/{id}", sessionId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + config.getStripe().getSecretKey())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("No se pudo leer la sesión {} de Stripe", sessionId, e);
            throw gatewayError("No se pudo verificar el pago con Stripe.");
        }
        if (!"paid".equals(text(response, "payment_status")))
            throw gatewayError("El pago de Stripe todavía no está confirmado.");
        long amount = response.path("amount_total").asLong(-1);
        if (amount < 0)
            throw gatewayError("Stripe no informó el monto cobrado.");
        return new Settlement(PaymentProvider.STRIPE, sessionId,
                BigDecimal.valueOf(amount, 2), text(response, "currency"));
    }

    private RestClient stripeClient() {
        return clientBuilder.clone().baseUrl(config.getStripe().getApiBase()).build();
    }

    // ------------------------------------------------------------------
    // Verificación común
    // ------------------------------------------------------------------

    /**
     * Confirma el pago contra la pasarela y comprueba que el monto coincida
     * con el total calculado por el servidor.
     */
    public Settlement settle(PaymentProvider provider, String reference, BigDecimal expectedTotal) {
        if (reference == null || reference.isBlank())
            throw ApiException.badRequest("Falta la referencia del pago.");
        Settlement settlement = switch (provider) {
            case PAYPAL -> capturePaypalOrder(reference);
            case STRIPE -> verifyStripeSession(reference);
            case SIMULATED -> throw ApiException.badRequest("El pago simulado no se verifica con una pasarela.");
        };
        BigDecimal paid = settlement.amount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal due = expectedTotal.setScale(2, RoundingMode.HALF_UP);
        if (paid.compareTo(due) != 0) {
            log.warn("Monto pagado ({}) distinto al total del pedido ({}) en {} {}",
                    paid, due, provider, reference);
            throw ApiException.conflict(
                    "El monto pagado no coincide con el total del pedido. No se creó el pedido.");
        }
        return settlement;
    }

    /** Etiqueta corta que se guarda en el pedido (columna de 32 caracteres). */
    public String paymentStatusLabel(PaymentProvider provider) {
        return switch (provider) {
            case SIMULATED -> "SIMULATED";
            case PAYPAL -> config.getPaypal().isSandbox() ? "PAYPAL_SANDBOX" : "PAYPAL_PAID";
            case STRIPE -> config.getStripe().isTestKeys() ? "STRIPE_TEST" : "STRIPE_PAID";
        };
    }

    private void requireAvailable(PaymentProvider provider) {
        if (!isAvailable(provider))
            throw ApiException.badRequest("Esa forma de pago no está disponible.");
    }

    /**
     * Lo que respondió la pasarela, no lo que supusimos. "Revisa las
     * credenciales" no dice cuál credencial ni por qué; el estado y el cuerpo
     * del error sí. Solo en modo de prueba: en LIVE no se exponen las tripas
     * de la pasarela al comprador.
     */
    private String detail(RestClientException e) {
        if (!isTestMode() || !(e instanceof RestClientResponseException http))
            return "";
        String body = http.getResponseBodyAsString();
        if (body.length() > 220)
            body = body.substring(0, 220);
        return " (" + http.getStatusCode().value() + (body.isBlank() ? "" : ": " + body) + ")";
    }

    private ApiException gatewayError(String message) {
        return new ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, message);
    }

    private static String amountString(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    /** Stripe pide el monto en la unidad mínima (centavos para monedas de 2 decimales). */
    private static long minorUnits(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }

    private static String text(JsonNode node, String field) {
        if (node == null)
            return null;
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static BigDecimal decimal(JsonNode node, String field) {
        String raw = text(node, field);
        if (raw == null || raw.isBlank())
            return null;
        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
