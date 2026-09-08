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

    public Views.Auth signup(Requests.Signup input) {
        validatePasswordBytes(input.password());
        String email = normalizeEmail(input.email());
        if (users.findByEmail(email).isPresent())
            throw ApiException.conflict("El correo ya está registrado.");
        User user = new User();
        user.setName(input.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwords.encode(input.password()));
        users.saveAndFlush(user);
        return new Views.Auth(tokens.create(email), Views.UserView.of(user));
    }

    public Views.Auth login(Requests.Login input) {
        validatePasswordBytes(input.password());
        User user = users.findByEmail(normalizeEmail(input.email())).orElse(null);
        if (user == null || !passwords.matches(input.password(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos.");
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
