package com.codeshift.ecom.model;

/** Formas de pago que acepta el checkout. */
public enum PaymentProvider {
    /** Sin pasarela: confirma el pedido sin mover dinero. Para demostraciones. */
    SIMULATED,
    PAYPAL,
    STRIPE
}
