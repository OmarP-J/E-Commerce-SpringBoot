package com.codeshift.ecom.service;

import com.codeshift.ecom.api.ApiException;
import com.codeshift.ecom.config.MailProperties;
import com.codeshift.ecom.model.PasswordReset;
import com.codeshift.ecom.model.User;
import com.codeshift.ecom.repository.PasswordResetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

/**
 * Ciclo de vida del código para recuperar la contraseña. Reutiliza los límites
 * de la verificación de correo: 6 dígitos, cifrado, caducidad, intentos máximos
 * y espera entre envíos.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordResetService {

    private final PasswordResetRepository resets;
    private final PasswordEncoder encoder;
    private final MailService mail;
    private final MailProperties config;
    private static final SecureRandom RANDOM = new SecureRandom();

    public boolean isAvailable() {
        return mail.canDeliver();
    }

    /**
     * Genera un código y lo envía. Si se pidió otro hace poco, no hace nada y
     * tampoco lo dice: responder distinto delataría qué correos tienen cuenta.
     */
    public void start(User user) {
        Instant now = Instant.now();
        PasswordReset record = resets.findByUserId(user.getId()).orElse(null);
        if (record != null && Duration.between(record.getSentAt(), now)
                .toSeconds() < config.getVerification().getResendCooldownSeconds())
            return;
        if (record == null) {
            record = new PasswordReset();
            record.setUser(user);
        }
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        int minutes = config.getVerification().getExpiryMinutes();
        record.setCodeHash(encoder.encode(code));
        record.setSentAt(now);
        record.setExpiresAt(now.plus(Duration.ofMinutes(minutes)));
        record.setAttempts(0);
        resets.saveAndFlush(record);

        String body = EmailLayout.paragraph("Hola " + user.getName()
                + ", alguien pidió cambiar la contraseña de tu cuenta. Usa este código:")
                + EmailLayout.code(code);
        // Un fallo de envío no se le cuenta a quien lo pidió, por el mismo
        // motivo: solo las cuentas que existen llegan hasta aquí.
        try {
            mail.send(user.getEmail(), user.getName(), "Código para cambiar tu contraseña",
                    EmailLayout.page(config.getFromName(), "Cambia tu contraseña", body,
                            "El código vence en " + minutes + " minutos. Si no lo pediste tú, ignora este "
                                    + "mensaje: tu contraseña no cambia."));
        } catch (ApiException e) {
            log.warn("No se pudo enviar el código de recuperación a {}", MailService.maskEmail(user.getEmail()));
        }
    }

    /**
     * Comprueba el código. noRollbackFor deja guardado el contador de intentos
     * aunque el código no coincida; sin eso se podría probar sin límite.
     */
    @Transactional(noRollbackFor = ApiException.class)
    public void confirm(User user, String code) {
        PasswordReset record = resets.findByUserId(user.getId())
                .orElseThrow(() -> ApiException.badRequest(NO_PENDING_CODE));
        if (Instant.now().isAfter(record.getExpiresAt()))
            throw ApiException.badRequest("El código caducó. Pide uno nuevo.");
        if (record.getAttempts() >= config.getVerification().getMaxAttempts())
            throw ApiException.badRequest("Demasiados intentos fallidos. Pide un código nuevo.");
        if (!encoder.matches(code.trim(), record.getCodeHash())) {
            record.setAttempts(record.getAttempts() + 1);
            int left = config.getVerification().getMaxAttempts() - record.getAttempts();
            throw ApiException.badRequest(left > 0
                    ? "El código no es correcto. Te quedan " + left + " intentos."
                    : "El código no es correcto. Pide uno nuevo.");
        }
        resets.delete(record);
    }

    /** Mismo texto para "no existe la cuenta" y "no pidió código": no delata cuentas. */
    static final String NO_PENDING_CODE = "No hay ningún código pendiente para ese correo. Pide uno nuevo.";
}
