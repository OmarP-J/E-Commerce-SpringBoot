package com.codeshift.ecom.service;

import com.codeshift.ecom.api.*;
import com.codeshift.ecom.model.User;
import com.codeshift.ecom.repository.UserRepository;
import com.codeshift.ecom.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final EmailAddressValidator emailAddresses;
    private final EmailVerificationService verification;

    public Views.SignupResult signup(Requests.Signup input) {
        validatePasswordBytes(input.password());
        String email = normalizeEmail(input.email());
        emailAddresses.validate(email);
        if (users.findByEmail(email).isPresent())
            throw ApiException.conflict("El correo ya está registrado.");
        User user = new User();
        user.setName(input.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwords.encode(input.password()));

        boolean needsCode = verification.isRequired();
        user.setEmailVerified(!needsCode);
        users.saveAndFlush(user);

        if (needsCode) {
            // Si el envío falla, la transacción se deshace y la cuenta no se
            // crea: mejor eso que dejar a alguien con una cuenta inaccesible.
            verification.startVerification(user);
            return new Views.SignupResult(true, email, null);
        }
        return new Views.SignupResult(false, email,
                new Views.Auth(tokens.create(email), Views.UserView.of(user)));
    }

    /**
     * Confirma el código y deja la sesión iniciada.
     *
     * noRollbackFor es deliberado: cuando el código no coincide, queremos que
     * el contador de intentos quede guardado antes de devolver el error. Sin
     * esto, el rollback lo borraría y se podrían probar códigos sin límite.
     */
    @Transactional(noRollbackFor = ApiException.class)
    public Views.Auth verifyCode(Requests.VerifyCode input) {
        User user = users.findByEmail(normalizeEmail(input.email())).orElse(null);
        // Una cuenta ya verificada NO puede canjear un token por aquí: este
        // endpoint es público, así que emitir sesión sin comprobar el código
        // sería entregar cualquier cuenta a quien sepa el correo. El mismo
        // mensaje para "no existe" y "ya verificada" evita además que sirva
        // para averiguar qué correos están registrados.
        if (user == null || user.isEmailVerified())
            throw ApiException.badRequest(
                    "Ese código no es válido. Si ya verificaste tu cuenta, inicia sesión.");
        verification.confirm(user, input.code());
        return new Views.Auth(tokens.create(user.getEmail()), Views.UserView.of(user));
    }

    public void resendCode(Requests.ResendCode input) {
        User user = users.findByEmail(normalizeEmail(input.email())).orElse(null);
        // Responde igual exista o no la cuenta, por el mismo motivo.
        if (user == null || user.isEmailVerified())
            return;
        verification.resend(user);
    }

    public Views.Auth login(Requests.Login input) {
        validatePasswordBytes(input.password());
        User user = users.findByEmail(normalizeEmail(input.email())).orElse(null);
        if (user == null || !passwords.matches(input.password(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos.");
        if (!user.isEmailVerified() && verification.isRequired())
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Tu correo todavía no está verificado. Escribe el código que te enviamos.");
        return new Views.Auth(tokens.create(user.getEmail()), Views.UserView.of(user));
    }

    public User current(String email) {
        return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
    }

    public Views.UserView profile(String email, Requests.Profile input) {
        User user = current(email);
        user.setName(input.name().trim());
        return Views.UserView.of(user);
    }

    public void changePassword(String email, Requests.Password input) {
        User user = current(email);
        if (!passwords.matches(input.currentPassword(), user.getPasswordHash()))
            throw ApiException.badRequest("La contraseña actual no es correcta.");
        validatePasswordBytes(input.newPassword());
        user.setPasswordHash(passwords.encode(input.newPassword()));
    }

    @Transactional(readOnly = true)
    public List<Views.UserView> users() {
        return users.findAllByOrderByNameAsc().stream().map(Views.UserView::of).toList();
    }

    public Views.UserView changeRole(String actorEmail, Long userId, User.Role role) {
        User actor = current(actorEmail);
        User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Usuario no encontrado."));
        if (actor.getId().equals(user.getId()))
            throw ApiException.conflict("No puedes cambiar el rol de tu propia sesión.");
        user.setRole(role);
        return Views.UserView.of(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validatePasswordBytes(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw ApiException.badRequest("La contraseña supera 72 bytes. Usa menos caracteres.");
    }
}
