package com.codeshift.ecom.service;

import com.codeshift.ecom.model.ShopOrder;
import java.math.BigDecimal;
import java.util.List;

/**
 * Aviso de que un pedido cambió de estado. Copia los datos al publicarse
 * porque el correo se envía después de confirmar la transacción, cuando la
 * entidad ya no se puede leer de forma perezosa.
 */
public record OrderNotification(String email, String customerName, Long orderId, ShopOrder.Status status,
        BigDecimal total, List<String> lines) {

    static OrderNotification of(ShopOrder order) {
        return new OrderNotification(order.getUser().getEmail(), order.getCustomerName(), order.getId(),
                order.getStatus(), order.getTotal(),
                order.getLines().stream().map(line -> line.getQuantity() + " × " + line.getProductName()).toList());
    }
}
