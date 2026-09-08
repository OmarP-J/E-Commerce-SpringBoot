package com.codeshift.ecom.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

@Service
public class TokenService {
    private final Key key;

    public TokenService(@Value("${app.jwt.secret}") String secret, Environment environment) {
        if (secret.isBlank()) {
            if (!environment.matchesProfiles("dev", "test"))
                throw new IllegalStateException("JWT_SECRET es obligatorio fuera del entorno local.");
            key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        }
    }

    public String create(String email) {
        Instant now = Instant.now();
        return Jwts.builder().setSubject(email).setIssuer("ecommerce")
                .setIssuedAt(Date.from(now)).setExpiration(Date.from(now.plusSeconds(3600)))
                .signWith(key).compact();
    }

    public String email(String token) {
        return Jwts.parserBuilder().setSigningKey(key).requireIssuer("ecommerce").build()
                .parseClaimsJws(token).getBody().getSubject();
    }
}
