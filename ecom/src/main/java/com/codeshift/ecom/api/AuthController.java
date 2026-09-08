package com.codeshift.ecom.api;

import com.codeshift.ecom.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AccountService accounts;

    @PostMapping("/api/auth/signup")
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public Views.Auth signup(@Valid @RequestBody Requests.Signup input) {
        return accounts.signup(input);
    }

    @PostMapping("/api/auth/login")
    public Views.Auth login(@Valid @RequestBody Requests.Login input) {
        return accounts.login(input);
    }

    @GetMapping("/api/me")
    public Views.UserView me(Principal principal) {
        return Views.UserView.of(accounts.current(principal.getName()));
    }

    @PutMapping("/api/me")
    public Views.UserView profile(Principal principal, @Valid @RequestBody Requests.Profile input) {
        return accounts.profile(principal.getName(), input);
    }

    @PutMapping("/api/me/password")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void password(Principal principal, @Valid @RequestBody Requests.Password input) {
        accounts.changePassword(principal.getName(), input);
    }
}
