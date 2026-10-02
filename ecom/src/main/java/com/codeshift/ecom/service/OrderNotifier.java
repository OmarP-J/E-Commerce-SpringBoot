package com.codeshift.ecom.service;

import com.codeshift.ecom.config.MailProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Locale;

/**
 * Correo al cliente cada vez que su pedido avanza.
 *
 * Se envía en segundo plano y solo después de confirmar la transacción: el
 * cliente no recibe avisos de cambios que luego se deshicieron, y un Brevo
 * lento o caído no bloquea la compra ni el panel de administración. Si el
 * envío falla, se anota en el log y el pedido sigue su curso.
 */
@Component
@Slf4j
public class OrderNotifier {
    private final MailService mail;
    private final MailProperties config;
    private final PaymentService payments;
    private final String storefront;

    public OrderNotifier(MailService mail, MailProperties config, PaymentService payments,
            @Value("${app.client-origin}") String clientOrigins) {
        this.mail = mail;
        this.config = config;
        this.payments = payments;
        // CLIENT_ORIGIN es la URL pública exacta del frontend; si hay varias,
        // la primera es la principal.
        this.storefront = clientOrigins.split(",")[0].trim().replaceAll("/+$", "");
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void orderChanged(OrderNotification notice) {
        if (!mail.canDeliver())
            return;
        try {
            mail.send(notice.email(), notice.customerName(), subject(notice), body(notice));
        } catch (RuntimeException e) {
            log.warn("No se pudo avisar por correo del pedido #{}", notice.orderId(), e);
        }
    }

    static String subject(OrderNotification n) {
        return switch (n.status()) {
            case CONFIRMED -> "Recibimos tu pedido #" + n.orderId();
            case PROCESSING -> "Estamos preparando tu pedido #" + n.orderId();
            case SHIPPED -> "Tu pedido #" + n.orderId() + " va en camino";
            case DELIVERED -> "Tu pedido #" + n.orderId() + " fue entregado";
            case CANCELLED -> "Tu pedido #" + n.orderId() + " fue cancelado";
        };
    }

    private String body(OrderNotification n) {
        String message = switch (n.status()) {
            case CONFIRMED -> "Tu pedido quedó confirmado. Te avisaremos cada vez que avance.";
            case PROCESSING -> "Ya estamos preparando tu pedido.";
            case SHIPPED -> "Tu pedido salió y va camino a la dirección de entrega.";
            case DELIVERED -> "Tu pedido fue entregado. Si quieres, cuéntanos qué te pareció cada producto.";
            case CANCELLED -> "Tu pedido fue cancelado. Si tienes dudas, abre una solicitud en Ayuda.";
        };
        StringBuilder html = new StringBuilder(EmailLayout.paragraph("Hola " + n.customerName() + ". " + message));
        html.append("<ul style=\"margin:0 0 16px;padding-left:20px;color:#14221b;line-height:1.6\">");
        n.lines().forEach(line -> html.append("<li>").append(EmailLayout.escape(line)).append("</li>"));
        html.append("</ul>");
        html.append(EmailLayout.paragraph("Total: RD$" + String.format(Locale.US, "%,.2f", n.total())));
        html.append(EmailLayout.button("Ver mis pedidos", storefront + "/orders"));
        String footnote = payments.isTestMode()
                ? "Tienda de demostración: no se cobró dinero real ni se envía ningún producto."
                : "Recibes este correo porque hiciste un pedido en nuestra tienda.";
        return EmailLayout.page(config.getFromName(), subject(n), html.toString(), footnote);
    }
}
