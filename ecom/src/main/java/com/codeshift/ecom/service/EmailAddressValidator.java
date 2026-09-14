package com.codeshift.ecom.service;

import com.codeshift.ecom.api.ApiException;
import com.codeshift.ecom.config.MailProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Set;

/**
 * Comprobaciones baratas sobre la dirección antes de gastar un envío.
 *
 * Nadie puede saber con certeza si un buzón existe sin escribirle: la prueba
 * real de que el correo existe es que la persona reciba el código y lo escriba.
 * Lo que sí se puede hacer barato es descartar dominios que no reciben correo
 * (erratas tipo "gmial.com") y direcciones desechables.
 *
 * Usa el DNS del JDK: no añade ninguna dependencia.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailAddressValidator {

    private final MailProperties config;

    /** Dominios de correo temporal más comunes. */
    private static final Set<String> DISPOSABLE = Set.of(
            "mailinator.com", "yopmail.com", "guerrillamail.com", "sharklasers.com",
            "10minutemail.com", "tempmail.com", "temp-mail.org", "throwawaymail.com",
            "trashmail.com", "getnada.com", "maildrop.cc", "dispostable.com",
            "fakeinbox.com", "mailnesia.com", "mohmal.com", "emailondeck.com");

    public void validate(String email) {
        String domain = domainOf(email);
        if (domain.isEmpty())
            throw ApiException.badRequest("El correo no tiene un formato válido.");
        if (DISPOSABLE.contains(domain))
            throw ApiException.badRequest("No aceptamos correos temporales. Usa una dirección permanente.");
        if (config.getVerification().isCheckMx() && !domainAcceptsMail(domain))
            throw ApiException.badRequest(
                    "El dominio \"" + domain + "\" no puede recibir correos. Revisa que esté bien escrito.");
    }

    private static String domainOf(String email) {
        int at = email.lastIndexOf('@');
        return at < 0 || at == email.length() - 1 ? "" : email.substring(at + 1).toLowerCase();
    }

    /**
     * Devuelve false solo cuando el DNS responde con certeza que el dominio no
     * tiene ni MX ni A. Ante cualquier error de red o de resolución deja pasar:
     * más vale aceptar una dirección dudosa que rechazar una buena porque el
     * DNS tuvo un mal momento.
     */
    private boolean domainAcceptsMail(String domain) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
        env.put("com.sun.jndi.dns.timeout.initial", "2000");
        env.put("com.sun.jndi.dns.timeout.retries", "1");
        InitialDirContext context = null;
        try {
            context = new InitialDirContext(env);
            Attributes records = context.getAttributes(domain, new String[] { "MX", "A" });
            Attribute mx = records.get("MX");
            if (mx != null && mx.size() > 0)
                return true;
            Attribute a = records.get("A");
            return a != null && a.size() > 0;
        } catch (NamingException e) {
            // NameNotFoundException significa que el dominio no existe.
            if (e instanceof javax.naming.NameNotFoundException)
                return false;
            log.debug("No se pudo consultar el DNS de {}: {}", domain, e.getMessage());
            return true;
        } catch (RuntimeException e) {
            log.debug("Fallo inesperado consultando el DNS de {}", domain, e);
            return true;
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException ignored) {
                    // cerrar el contexto es best-effort
                }
            }
        }
    }
}
