# Revisión legal, de privacidad y de accesibilidad

Revisión hecha el 2 de octubre de 2026 sobre todo el código del frontend
(Angular) y del backend (Spring Boot).

> **Esto no es asesoría legal.** Los textos legales del sitio son una base
> sólida y describen fielmente cómo funciona la aplicación, pero un abogado
> dominicano debe revisarlos antes de operar como negocio real. Se asumió que
> la tienda opera desde la **República Dominicana** porque usa el idioma
> `es-DO` y precios en pesos (DOP).

## 1. Qué hay que hacer antes de publicar

1. **Completar los datos del responsable** en
   [`EcommerceWeb/src/app/core/business.ts`](../EcommerceWeb/src/app/core/business.ts):
   razón social o nombre, RNC o cédula, dirección y, sobre todo, el **correo**
   al que la gente puede pedir sus datos o la eliminación de su cuenta. Mientras
   falten, las páginas legales muestran "Pendiente de completar".
2. Revisar que la lista `DATA_PROCESSORS` de ese mismo archivo coincida con los
   proveedores que usas de verdad (hoy: Vercel, Render, Azure SQL, Brevo,
   PayPal y Stripe).
3. Hacer que un abogado revise los textos de `/terms`, `/privacy`, `/cookies`,
   `/refunds` y `/legal`.

## 2. Lo que se revisó y lo que se hizo

| Punto pedido | Resultado |
| --- | --- |
| Política de privacidad | Nueva en `/privacy`. Dice qué dato se pide, cuándo, para qué, quién lo ve, cuánto se guarda y cómo ejercer los derechos de acceso, rectificación, cancelación y oposición (Ley 172-13). |
| Términos y condiciones | Nuevos en `/terms`. Dejan claro que es una demostración: sin cobros reales y sin envíos. |
| Política de cookies | Nueva en `/cookies`, con cada elemento que se guarda en el navegador. |
| ¿Hace falta consentimiento de cookies? | **No, hoy no.** El sitio no instala cookies propias; solo guarda en `sessionStorage` la sesión y, durante el pago con tarjeta, la dirección del pedido. Ambos son estrictamente necesarios. No hay analítica, píxeles ni publicidad. Las tipografías se cargaban de Google Fonts (enviaba la IP de cada visitante a Google): ahora se sirven desde el propio sitio. Si algún día se añade analítica o publicidad, hay que pedir consentimiento **antes** de cargarla. |
| Política de reembolsos | Nueva en `/refunds`, basada en el flujo real de la página Ayuda: tipos de solicitud, estados, límite del reembolso y cancelación antes del envío. |
| Consentimiento en formularios | El registro exige marcar "Tengo 18 años o más y acepto los Términos y la Política de privacidad". **El servidor también lo exige** (`acceptTerms`), así que no se puede saltar llamando a la API. Carrito, direcciones y solicitudes de ayuda muestran para qué se usan esos datos. En el carrito se indica que confirmar implica aceptar Términos y Política de reembolsos. |
| Datos estrictamente necesarios | Cada campo de cada formulario está justificado en la política de privacidad. No se encontró ningún dato innecesario: no se pide fecha de nacimiento, documento ni datos de tarjeta. |
| Seguimiento y analítica | No hay ninguno. `/admin/analytics` son métricas internas de ventas calculadas desde la base de datos, no rastreo de visitantes. La telemetría de Angular CLI está desactivada. |
| Integraciones de terceros | Google Fonts eliminado. PayPal solo se carga si el cliente elige PayPal (se avisa de sus cookies). Stripe es una redirección a su página. Brevo envía el código de verificación. Todos figuran en la política de privacidad. |
| Accesibilidad | Ver sección 3. Tras las correcciones, axe-core no encuentra **ninguna violación** de WCAG 2.2 AA en las 26 rutas de la aplicación (probadas con anchos de 375, 659 y 1280 px). |
| Texto alternativo | Revisado imagen por imagen (ver sección 3). |
| Contraste | Corregido (ver sección 3). |
| Formularios con teclado | Corregidos varios fallos reales (ver sección 3). |
| Etiquetas de botones | Los botones repetidos ("Editar", "Eliminar", "Añadir al carrito", números de página…) ahora dicen sobre qué actúan. |
| Reseñas falsas | **No había ninguna.** Se buscaron reseñas, testimonios, estrellas, valoraciones y cifras de clientes. |
| Afirmaciones sin respaldo | Corregidas (ver sección 4). |
| Datos del negocio | Archivo único `business.ts`, mostrado en el pie de página, el Aviso legal y las políticas. **Pendiente de completar por ti.** |
| Derechos de autor de imágenes | Ver sección 5. Se retiró una imagen que mostraba la marca de otra tienda. |
| Leyes locales | Ver sección 6. |

## 3. Accesibilidad

### Contraste (WCAG 1.4.3 y 1.4.11)

| Elemento | Antes | Después |
| --- | --- | --- |
| Anillo de foco del teclado (lima sobre fondo claro) | 1.2:1 | 12:1 (verde oscuro; lima solo sobre fondos oscuros) |
| Texto secundario sobre verde claro | 4.1:1 | 4.9:1 |
| Texto de ejemplo dentro de los campos | 3.3:1 | 4.7:1 |
| Borde de los campos de formulario | 1.5:1 | 3.3:1 |
| Números de paso en coral sobre blanco | 2.7:1 | 5.3:1 |
| Botón lima al pasar el ratón (blanco sobre coral) | 2.7:1 | 4.6:1 |
| Etiquetas de las tarjetas del panel (al 72 % de opacidad) | 3.1:1 en el peor caso | 4.6:1 |

### Teclado y lectores de pantalla

- **"Saltar al contenido" llevaba a la portada.** Con `<base href="/">`, el
  enlace `#main` apuntaba a `/#main`. Ahora mueve el foco al contenido de la
  página actual.
- **Menú móvil:** los enlaces del menú cerrado seguían recibiendo el foco con
  Tab aunque no se veían. Ahora no; el botón dice "Abrir/Cerrar menú" y Escape
  lo cierra devolviendo el foco.
- **Cambio de rol de usuarios (riesgo de seguridad):** cada flecha del teclado
  sobre el selector de rol cambiaba el rol **en el servidor** al instante; se
  podía dar permisos de administrador sin querer. Ahora se elige y luego se
  pulsa "Guardar rol".
- **"Guardar estado" de los pedidos nunca se habilitaba** al elegir un estado
  (Angular no se enteraba del cambio del selector). Corregido y probado solo
  con teclado.
- El botón "Ver" contraseña estaba dentro de la etiqueta y el campo se
  anunciaba como "Contraseña Ver".
- Al pulsar "Editar" o "Registrar", el foco va al formulario correspondiente.
- Los avisos ("Producto añadido", errores) se anuncian a lectores de pantalla.
- Cada página tiene su propio título (antes todas se llamaban igual).
- El stock bajo se indicaba solo con color rojo; ahora dice "Pocas existencias".
- La tabla de la política de privacidad se puede desplazar con teclado en móvil.

### Texto alternativo

- Fotos de la portada que acompañan a un título que ya dice lo mismo:
  `alt=""` (decorativas), para no leer dos veces lo mismo.
- Imagen principal: describe lo que se ve y aclara que es una ilustración.
- Miniaturas de productos dentro de un enlace o junto al nombre: `alt=""`,
  porque el nombre ya está en el texto.
- Ficha de producto: el nombre del producto.
- Símbolos decorativos (♡, →, ○, números de paso): ocultos a lectores de
  pantalla.

## 4. Afirmaciones corregidas

| Antes | Problema | Ahora |
| --- | --- | --- |
| "esencial®" | El símbolo ® solo puede usarse con una marca registrada (ONAPI). No hay constancia de registro. | "esencial". Si registras la marca, puedes volver a ponerlo. |
| "Compra segura" | Garantía de seguridad no demostrable. | "Carrito privado — Solo lo ves tú, con tu cuenta". |
| "Precio claro — Sin cargos ocultos" | Promesa amplia. | "Total antes de pagar — Con descuentos aplicados, antes de confirmar". |
| "Tu día merece cosas que sí funcionan" | Afirma calidad de productos que no existen. | "Cosas útiles para tu día a día". |
| "RECIÉN SELECCIONADOS" | Los productos destacados son simplemente los tres primeros del catálogo. | "DEL CATÁLOGO". |
| "Diseñamos cada paso para que… sin perderte" | Promesa subjetiva. | "Busca, guarda lo que te gusta y revisa el total antes de confirmar". |
| "Así nadie puede crear una cuenta con tu correo" | No es exacto: si la verificación está apagada, no aplica. | Eliminado. |
| "Los pagos son simulados" | PayPal y Stripe están en modo de prueba, no simulados. | "No se cobra dinero real". |
| Precios "$1,890.00" | "$" se confunde con dólares. | "RD$1,890.00". |

## 5. Imágenes y derechos de autor

Las imágenes llevan credenciales de contenido **C2PA** que indican su origen:

| Archivo | Origen según C2PA | Decisión |
| --- | --- | --- |
| `hero-essentials.png` | Generada con IA (OpenAI, gpt-image) | Se mantiene. Sin marcas visibles. |
| `nuevofavicon.png` | Generada con IA (OpenAI, gpt-image) | Se mantiene. |
| `feature-explore.jpg` | Generada con IA (Google) | Se mantiene. Sin marcas visibles. |
| `feature-favorites.jpg` | Generada con IA (Google) | **Revisar.** La botella lleva un símbolo parecido al logotipo de la marca Chilly's y los audífonos recuerdan un modelo comercial conocido. Recomendable sustituirla. |
| `feature-checkout.jpg` | Generada con IA (Google) | **Eliminada.** Mostraba el nombre "NATURES", la web y el usuario de redes de otra tienda y el nombre de una clienta inventada. Se sustituyó por un icono. |
| `logo.png` | Sin metadatos | Confirma su origen. Si es de IA, revisa en ONAPI que no se parezca a una marca existente antes de registrarla. |

Sobre las imágenes de IA: los términos de OpenAI y Google te permiten usarlas,
pero en muchos países una imagen generada solo con IA no tiene derechos de
autor propios, así que no podrás impedir que otros la copien. Los textos
legales indican que las imágenes de la portada son ilustrativas y generadas con
IA. Las tipografías DM Sans y Manrope usan la licencia SIL Open Font License,
que permite servirlas desde el propio sitio.

## 6. Leyes revisadas

| Norma | Por qué aplica | Cómo se cubre |
| --- | --- | --- |
| Constitución (derecho a la intimidad y hábeas data) | Datos personales de clientes | Política de privacidad; vía de reclamo judicial indicada |
| Ley 172-13 de protección de datos personales | Se guardan nombres, correos, direcciones y teléfonos | Consentimiento al registrarse, finalidades, derechos de acceso, rectificación, cancelación y oposición |
| Ley 358-05 de protección al consumidor | Venta a consumidores | Precios en RD$, total antes de confirmar, política de reembolsos, mención a Pro Consumidor |
| Ley 126-02 de comercio electrónico | Aceptaciones electrónicas | Citada en los Términos |
| Ley 65-00 de derecho de autor y Ley 20-00 de propiedad industrial | Imágenes, logo y uso de ® | Sección 5; ® retirado |
| Ley 5-13 sobre discapacidad | Acceso en igualdad de condiciones | WCAG 2.2 AA como referencia |
| Ley 32-23 de facturación electrónica | Solo si se vende de verdad | Pendiente (ver riesgos) |

Si la tienda se dirige a personas de la Unión Europea, aplicarían además el
RGPD y la directiva de privacidad electrónica; el sitio ya cumple lo
fundamental (sin cookies no esenciales, fuentes locales, finalidades claras).

## 7. Otros riesgos detectados

### Antes de cobrar dinero real (importante)

- **Moneda:** los precios están en pesos pero PayPal y Stripe recibían el mismo
  número en dólares (RD$1,490 → USD 1,490). Se añadió un bloqueo: en modo
  `LIVE` las pasarelas se desactivan si la moneda no es `DOP`. Para cobrar en
  otra moneda hay que implementar la conversión.
- **Reembolsos y cancelaciones** solo se registran en la base de datos; no
  devuelven el dinero en PayPal ni en Stripe.
- **Sin webhooks:** si el cliente cierra la pestaña tras pagar en Stripe, el
  cobro queda hecho y el pedido no se crea.
- **Facturación:** no se emiten comprobantes fiscales (e-CF) ni se desglosa el
  ITBIS.
- **Envíos y devoluciones reales:** los textos actuales dicen que no hay
  envíos. Antes de vender habría que definir plazos, costos y condiciones.

### Privacidad

- **No existe un botón para eliminar la cuenta.** La política indica que se
  pide por correo; hay que atender esas solicitudes a mano.
- **Las cuentas que nunca verifican su correo no se borran nunca.**
  Recomendable una limpieza periódica.
- La aceptación de los términos se **exige**, pero no se guarda la fecha ni la
  versión aceptada. Para guardarla hace falta una columna nueva y una
  migración de la base de producción (que arranca con `ddl-auto=validate`).
- Las cuentas creadas antes de este cambio no aceptaron estos términos;
  conviene avisarles por correo.
- El historial de inventario muestra el nombre del cliente en cada compra. Está
  declarado en la política; podría mostrarse "Cliente" en su lugar.

### Técnico

- El umbral de "pocas existencias" del panel está fijo en 5 y no usa el valor
  configurable de la tienda.
- Las pantallas solo deshabilitan el botón de enviar cuando falta un dato, sin
  decir cuál. Funciona, pero mostrar el motivo ayudaría.
- Falta una prueba manual con lector de pantalla (NVDA o VoiceOver): axe-core
  detecta cerca de la mitad de los problemas posibles.

## 8. Cómo comprobarlo

```powershell
cd ecom
.\mvnw.cmd test
```

```powershell
cd EcommerceWeb
npm ci
npm run build
```
