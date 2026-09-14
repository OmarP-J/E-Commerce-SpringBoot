# Pagos en modo de prueba (PayPal + Stripe + simulado)

El checkout acepta tres formas de pago y **ninguna mueve dinero real** mientras
`PAYMENTS_MODE=TEST`:

| Forma | Qué hace | Para quién |
|---|---|---|
| Pago simulado | Confirma el pedido sin pasarela | Cualquier visitante de la demo |
| PayPal | Flujo real contra el sandbox de PayPal | Quien quiera ver la integración funcionando |
| Stripe | Stripe Checkout con llaves de prueba | Igual, con tarjeta |

## El candado que impide cobrar

Al arrancar, la aplicación revisa las llaves:

- Si `PAYMENTS_MODE=TEST` y las llaves de Stripe **no** empiezan por `sk_test_`
  y `pk_test_`, Stripe queda **desactivado** y se escribe un error en el log.
- Si `PAYMENTS_MODE=TEST` y la URL de PayPal no apunta al sandbox, PayPal queda
  **desactivado**.

O sea: para cobrar de verdad no basta con equivocarse de llave, hay que cambiar
`PAYMENTS_MODE` a `LIVE` a propósito.

## 1. Credenciales de PayPal (sandbox)

1. Entra a [developer.paypal.com](https://developer.paypal.com) con tu cuenta
   normal de PayPal.
2. **Apps & Credentials → Sandbox → Create App**. Copia el **Client ID** y el
   **Secret**.
3. En **Testing Tools → Sandbox Accounts** ya tienes dos cuentas falsas: una
   *Business* (el vendedor) y una *Personal* (el comprador). Anota el correo y
   la contraseña de la personal: es con la que se paga en la demo.

Variables:

```
PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```

## 2. Llaves de Stripe (prueba)

1. Crea la cuenta en [dashboard.stripe.com](https://dashboard.stripe.com). No
   hace falta activarla ni dar datos bancarios: Stripe te deja en un sandbox
   desde el primer momento.
2. **Developers → API keys**: copia la *Publishable key* (`pk_test_...`) y la
   *Secret key* (`sk_test_...`).

```
STRIPE_ENABLED=true
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Tarjeta de prueba: **4242 4242 4242 4242**, cualquier fecha futura, cualquier
CVC.

> Stripe no opera en República Dominicana. Si no logras abrir la cuenta, deja
> `STRIPE_ENABLED=false`: la opción simplemente no aparece en el checkout y
> PayPal y el pago simulado siguen funcionando igual.

## 3. Variables comunes

```
PAYMENTS_MODE=TEST
PAYMENTS_CURRENCY=USD
PAYMENTS_SIMULATED=true
PAYMENTS_RETURN_URL=https://esencial-tienda.vercel.app
```

`PAYMENTS_RETURN_URL` es a dónde vuelve el comprador después de pagar en
Stripe; tiene que ser la URL pública del frontend, sin barra final.

Sobre la moneda: ni PayPal ni Stripe manejan pesos dominicanos, así que el
monto se envía en la moneda de `PAYMENTS_CURRENCY` (USD por defecto). En modo
de prueba da igual, pero tenlo en cuenta el día que cobres de verdad.

## Cómo queda protegido el monto

El navegador nunca dice cuánto hay que cobrar. El backend calcula el total del
carrito por su cuenta para crear la orden en la pasarela, y al volver
**vuelve a preguntarle a la pasarela cuánto se cobró**; si ese monto no coincide
con el total del pedido, no crea el pedido. Un cliente manipulado no puede
pagar menos de lo que cuesta el carrito.

Además, si el comprador recarga la página de retorno, no se crea un segundo
pedido: la referencia del pago se usa como clave de idempotencia.

## Qué falta antes de cobrar de verdad

1. **Webhooks.** Hoy el pedido se confirma cuando el navegador vuelve. Si el
   comprador cierra la pestaña justo después de pagar en Stripe, el cobro queda
   hecho y el pedido no se crea. En sandbox es inofensivo; en producción hay que
   escuchar `checkout.session.completed` y `PAYMENT.CAPTURE.COMPLETED`.
2. **Reembolsos reales.** El panel de soporte marca el reembolso en la base,
   pero no lo pide a la pasarela.
3. **Moneda.** Decidir si se cobra en USD o se usa una pasarela local (Azul,
   CardNet) que sí maneje DOP.
