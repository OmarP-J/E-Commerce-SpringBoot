package com.codeshift.ecom.service;

import com.codeshift.ecom.api.ApiException;
import com.codeshift.ecom.config.MailProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Envío de correo transaccional con la API HTTP de Brevo.
 *
 * No usa SMTP ni añade dependencias: basta con RestClient, que ya viene con
 * Spring. Si el correo no está configurado, no falla — escribe el mensaje en
 * el log, para poder probar el flujo completo en local sin credenciales.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final MailProperties config;

    /**
     * Con tiempos de espera explícitos a propósito: el envío ocurre dentro de
     * la transacción del registro, y el pool de conexiones a la base es de 5.
     * Sin límite, un Brevo lento dejaría transacciones abiertas hasta agotar
     * el pool y tumbar toda la API, no solo el registro.
     */
    private final RestClient.Builder clientBuilder = RestClient.builder()
            .requestFactory(timeBoundedRequests());

    private static SimpleClientHttpRequestFactory timeBoundedRequests() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));
        return factory;
    }

    public boolean isEnabled() {
        return config.isConfigured();
    }

    public void send(String toEmail, String toName, String subject, String htmlBody) {
        if (!config.isConfigured()) {
            log.warn("""
                    Correo NO configurado: el mensaje no se envió.
                      Para: {} <{}>
                      Asunto: {}
                    {}""", toName, toEmail, subject, htmlToText(htmlBody));
            return;
        }
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", config.getFromName(), "email", config.getFromEmail()),
                "to", List.of(Map.of("email", toEmail, "name", toName)),
                "subject", subject,
                "htmlContent", htmlBody);
        try {
            clientBuilder.clone()
                    .baseUrl(config.getBrevoApiBase())
                    .build()
                    .post()
                    .uri("/v3/smtp/email")
                    .header("api-key", config.getBrevoApiKey())
                    .header("accept", "application/json")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Correo enviado a {}", maskEmail(toEmail));
        } catch (org.springframework.web.client.RestClientResponseException e) {
            log.error("Error devuelto por Brevo (status {}): {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "No pudimos enviar el correo de verificación (Brevo: " + e.getResponseBodyAsString() + ").");
        } catch (RestClientException e) {
            log.error("No se pudo enviar el correo a {}", maskEmail(toEmail), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "No pudimos enviar el correo en este momento. Inténtalo de nuevo en un minuto.");
        }
    }

    /** Para el log local: deja el cuerpo legible sin etiquetas. */
    private static String htmlToText(String html) {
        return html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }

    /** Nunca escribimos la dirección completa en los logs. */
    static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1)
            return "***";
        return email.charAt(0) + "***" + email.substring(at);
    }
}
