package com.codeshift.ecom.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Envío de correo y verificación de cuentas.
 *
 * El envío va por API HTTP y no por SMTP a propósito: el plan gratuito de
 * Render bloquea los puertos 25, 465 y 587 desde 2025, así que cualquier
 * intento por SMTP se quedaría colgado hasta agotar el tiempo de espera.
 */
@Component
@ConfigurationProperties(prefix = "app.mail")
@Getter
@Setter
public class MailProperties {

    /** Sin esto, el registro sigue funcionando como antes: sin código y sin correo. */
    private boolean enabled = false;

    /** Nombre y dirección que ve quien recibe el correo. Debe estar verificada en Brevo. */
    private String fromEmail = "";
    private String fromName = "Esencial";

    /** Clave de API de Brevo (Brevo > SMTP & API > API Keys). */
    private String brevoApiKey = "";
    private String brevoApiBase = "https://api.brevo.com";

    private final Verification verification = new Verification();

    public boolean isConfigured() {
        return enabled && !brevoApiKey.isBlank() && !fromEmail.isBlank();
    }

    @Getter
    @Setter
    public static class Verification {
        /** Exigir código al registrarse. Solo aplica si el correo está configurado. */
        private boolean enabled = true;
        /** Minutos que dura el código antes de caducar. */
        private int expiryMinutes = 15;
        /** Intentos fallidos permitidos antes de invalidar el código. */
        private int maxAttempts = 5;
        /** Segundos que hay que esperar entre reenvíos. */
        private int resendCooldownSeconds = 60;
        /** Comprobar que el dominio del correo pueda recibir mensajes (registros MX). */
        private boolean checkMx = true;
    }
}
