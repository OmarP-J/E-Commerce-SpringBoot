# Correo y verificación de cuentas

El registro ahora manda un código de 6 dígitos al correo y no deja entrar hasta
que la persona lo escribe. Esa es, en la práctica, la única forma de comprobar
de verdad que un correo existe: que alguien reciba el mensaje.

## ⚠️ Primero la migración, después el despliegue

El backend arranca con `ddl-auto=validate`: si la base no tiene las columnas que
el código espera, **el servicio no levanta**. Antes de desplegar, ejecuta
[`database/migration-email-verification.sql`](../database/migration-email-verification.sql)
una sola vez en la base `ecommerce` de Azure SQL (Portal → Editor de consultas).

Añade dos cosas: la columna `email_verified` en `shop_users` (con valor 1 por
defecto, así ninguna cuenta existente se queda fuera) y la tabla
`email_verifications`.

## Cómo se comporta según la configuración

| `MAIL_ENABLED` | Qué pasa al registrarse |
|---|---|
| `false` (por defecto) | Igual que antes: la cuenta queda activa al instante, sin código |
| `true` | Se crea sin verificar, se envía el código y hay que escribirlo |

Esto es a propósito: puedes desplegar el código sin configurar nada y la tienda
sigue funcionando exactamente como hoy. La verificación se enciende cuando tú
quieras.

## Configurar Brevo (300 correos diarios gratis)

Se usa la **API HTTP**, no SMTP, porque el plan gratuito de Render bloquea los
puertos 25, 465 y 587 desde 2025. Por SMTP los envíos simplemente se quedarían
colgados.

1. Crea la cuenta en [brevo.com](https://www.brevo.com). El plan gratuito son
   300 correos al día, sin límite de tiempo y sin tarjeta.
2. **Verifica un remitente**: Senders, Domains & Dedicated IPs → Senders → Add a
   sender. Puedes usar tu propio correo personal; Brevo te manda un mensaje de
   confirmación. (Añadir un dominio propio más adelante mejora bastante que los
   correos no caigan en spam, pero no hace falta para empezar.)
3. **Crea la clave de API**: SMTP & API → API Keys → Generate a new API key.

Variables en Render:

```
MAIL_ENABLED=true
MAIL_FROM_EMAIL=el-correo-que-verificaste@ejemplo.com
MAIL_FROM_NAME=Esencial
BREVO_API_KEY=xkeysib-...
```

Opcionales, con estos valores por defecto:

```
VERIFICATION_ENABLED=true
VERIFICATION_EXPIRY_MINUTES=15
VERIFICATION_MAX_ATTEMPTS=5
VERIFICATION_RESEND_COOLDOWN=60
VERIFICATION_CHECK_MX=true
```

## Qué se valida y qué no

Antes de gastar un envío se hacen dos comprobaciones baratas:

- **El dominio puede recibir correo.** Se consultan sus registros MX (y A como
  respaldo) con el DNS del propio Java, sin servicios externos. Esto atrapa las
  erratas típicas: `gmial.com`, `hotmial.com`. Si el DNS falla por cualquier
  motivo de red, **deja pasar**: es preferible aceptar una dirección dudosa que
  rechazar una buena por un problema pasajero.
- **No es un correo desechable.** Hay una lista de los dominios temporales más
  comunes (mailinator, yopmail, 10minutemail y compañía).

Lo que ninguna de las dos hace es garantizar que el buzón exista. Eso lo prueba
el código: si llega y lo escriben, el correo es real y es suyo.

## Detalles de seguridad

- El código se guarda cifrado con BCrypt, nunca en claro.
- Caduca a los 15 minutos y admite 5 intentos; al sexto se invalida y hay que
  pedir uno nuevo.
- Hay 60 segundos de espera entre reenvíos.
- El contador de intentos se guarda aunque la petición termine en error
  (`noRollbackFor` en `AccountService.verifyCode`). Sin eso, el rollback lo
  borraría y se podrían probar códigos sin límite.
- Un código usado se borra: no sirve dos veces.

## Endpoints

| Método | Ruta | Para qué |
|---|---|---|
| POST | `/api/auth/signup` | `{name, email, password, acceptTerms: true}` → devuelve `{verificationRequired, email, session}`. Si hace falta verificar, `session` viene vacío. Sin `acceptTerms: true` responde 400 |
| POST | `/api/auth/verify` | `{email, code}` → devuelve la sesión iniciada |
| POST | `/api/auth/verify/resend` | `{email}` → manda otro código |

El login de una cuenta sin verificar responde 403 y el frontend lleva a la
pantalla del código.

## Lo que queda cerca

Con esta plumbing ya montada, **recuperar la contraseña** es el siguiente paso
natural y reutiliza casi todo: el mismo `MailService`, la misma idea de código
con expiración. Es el hueco más grave que le queda al proyecto para usuarios
reales.
