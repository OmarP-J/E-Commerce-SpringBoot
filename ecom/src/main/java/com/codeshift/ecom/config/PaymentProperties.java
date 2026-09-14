package com.codeshift.ecom.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuración de las pasarelas de pago.
 *
 * El modo por defecto es {@code test}: en ese modo la aplicación se niega a
 * usar llaves que parezcan de producción, de forma que una instalación de
 * demostración no pueda cobrarle a nadie por accidente.
 */
@Component
@ConfigurationProperties(prefix = "app.payments")
@Getter
@Setter
public class PaymentProperties {

    public enum Mode {
        TEST, LIVE
    }

    /** TEST bloquea cualquier llave de producción. LIVE hay que activarlo a propósito. */
    private Mode mode = Mode.TEST;

    /** Moneda ISO-4217 enviada a la pasarela. Ni PayPal ni Stripe aceptan DOP en todos los casos. */
    private String currency = "USD";

    /** Deja disponible el pago simulado (sin pasarela). Apágalo en una tienda real. */
    private boolean simulatedEnabled = true;

    /** Base pública del frontend, usada para las URLs de retorno de Stripe. */
    private String returnUrlBase = "";

    private final Paypal paypal = new Paypal();
    private final Stripe stripe = new Stripe();

    @Getter
    @Setter
    public static class Paypal {
        private boolean enabled = false;
        private String clientId = "";
        private String clientSecret = "";
        /** Sandbox por defecto. La URL de producción es https://api-m.paypal.com */
        private String apiBase = "https://api-m.sandbox.paypal.com";

        public boolean isConfigured() {
            return enabled && !clientId.isBlank() && !clientSecret.isBlank();
        }

        public boolean isSandbox() {
            return apiBase.contains("sandbox");
        }
    }

    @Getter
    @Setter
    public static class Stripe {
        private boolean enabled = false;
        private String publishableKey = "";
        private String secretKey = "";
        private String apiBase = "https://api.stripe.com";

        public boolean isConfigured() {
            return enabled && !publishableKey.isBlank() && !secretKey.isBlank();
        }

        /** Stripe marca sus llaves de prueba con el prefijo sk_test_ / pk_test_. */
        public boolean isTestKeys() {
            return secretKey.startsWith("sk_test_") && publishableKey.startsWith("pk_test_");
        }
    }
}
