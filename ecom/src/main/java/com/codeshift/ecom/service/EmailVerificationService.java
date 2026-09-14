package com.codeshift.ecom.service;

import com.codeshift.ecom.api.ApiException;
import com.codeshift.ecom.config.MailProperties;
import com.codeshift.ecom.model.EmailVerification;
import com.codeshift.ecom.model.User;
import com.codeshift.ecom.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

/**
 * Ciclo de vida del código de verificación: se genera, se manda por correo y
 * se comprueba. El código se guarda cifrado, caduca, y tiene un número máximo
 * de intentos para que no se pueda adivinar a fuerza bruta (un millón de
 * combinaciones se acaban rápido si se dejan intentos ilimitados).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationRepository verifications;
    private final PasswordEncoder encoder;
    private final MailService mail;
    private final MailProperties config;
    private static final SecureRandom RANDOM = new SecureRandom();

    /** La verificación solo se exige si además hay forma de enviar el correo. */
    public boolean isRequired() {
        return config.getVerification().isEnabled() && mail.isEnabled();
    }

    /** Genera un código nuevo para el usuario y se lo envía. */
    public void startVerification(User user) {
        var existing = verifications.findByUserId(user.getId()).orElse(null);
        EmailVerification record = existing != null ? existing : new EmailVerification();
        record.setUser(user);

        String code = generateCode();
        record.setCodeHash(encoder.encode(code));
        record.setSentAt(Instant.now());
        record.setExpiresAt(Instant.now().plus(Duration.ofMinutes(config.getVerification().getExpiryMinutes())));
        record.setAttempts(0);
        verifications.saveAndFlush(record);

        mail.send(user.getEmail(), user.getName(), "Tu código de verificación",
                buildEmail(user.getName(), code, config.getVerification().getExpiryMinutes()));
    }

    /** Vuelve a enviar el código, respetando el tiempo de espera entre reenvíos. */
    public void resend(User user) {
        var existing = verifications.findByUserId(user.getId()).orElse(null);
        if (existing != null) {
            long waited = Duration.between(existing.getSentAt(), Instant.now()).toSeconds();
            long cooldown = config.getVerification().getResendCooldownSeconds();
            if (waited < cooldown)
                throw ApiException.conflict(
                        "Espera " + (cooldown - waited) + " segundos antes de pedir otro código.");
        }
        startVerification(user);
    }

    /**
     * Comprueba el código. Si acierta, la cuenta queda verificada y el registro
     * se borra: un código usado no sirve dos veces.
     */
    public void confirm(User user, String code) {
        EmailVerification record = verifications.findByUserId(user.getId())
                .orElseThrow(() -> ApiException.badRequest(
                        "No hay ningún código pendiente. Pide uno nuevo."));

        if (Instant.now().isAfter(record.getExpiresAt())) {
            verifications.delete(record);
            throw ApiException.badRequest("El código caducó. Pide uno nuevo.");
        }
        if (record.getAttempts() >= config.getVerification().getMaxAttempts()) {
            verifications.delete(record);
            throw ApiException.badRequest("Demasiados intentos fallidos. Pide un código nuevo.");
        }
        if (!encoder.matches(code.trim(), record.getCodeHash())) {
            record.setAttempts(record.getAttempts() + 1);
            int left = config.getVerification().getMaxAttempts() - record.getAttempts();
            throw ApiException.badRequest(left > 0
                    ? "El código no es correcto. Te quedan " + left + " intentos."
                    : "El código no es correcto. Pide uno nuevo.");
        }
        user.setEmailVerified(true);
        verifications.delete(record);
        log.info("Cuenta verificada: {}", MailService.maskEmail(user.getEmail()));
    }

    private static String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private static String buildEmail(String name, String code, int minutes) {
        return """
                <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#fffef9;padding:32px 16px">
                  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #d9e0da;border-radius:20px;padding:32px">
                    <p style="margin:0 0 4px;color:#175c3b;font-size:12px;font-weight:700;letter-spacing:.14em">ESENCIAL</p>
                    <h1 style="margin:0 0 16px;font-size:24px;color:#14221b">Confirma tu correo</h1>
                    <p style="margin:0 0 24px;color:#65726b;line-height:1.6">
                      Hola %s, usa este código para terminar de crear tu cuenta:
                    </p>
                    <p style="margin:0 0 24px;text-align:center;font-size:34px;font-weight:700;letter-spacing:.3em;color:#0d3d29;background:#e2ebdf;border-radius:14px;padding:18px">%s</p>
                    <p style="margin:0;color:#65726b;font-size:14px;line-height:1.6">
                      El código vence en %d minutos. Si no fuiste tú quien intentó registrarse, puedes ignorar este mensaje.
                    </p>
                  </div>
                </div>
                """.formatted(escape(name), code, minutes);
    }

    private static String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
