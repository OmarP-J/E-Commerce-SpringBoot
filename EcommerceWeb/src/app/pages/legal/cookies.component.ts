import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LegalHeaderComponent } from "./legal-shared";

@Component({
  imports: [RouterLink, LegalHeaderComponent],
  template: `
    <article class="legal-page">
      <app-legal-header title="Política de cookies" />

      <section aria-labelledby="cookies-summary">
        <h2 id="cookies-summary">1. En resumen</h2>
        <p>
          <strong>Este sitio no instala cookies propias</strong> y no usa
          herramientas de analítica, publicidad ni redes sociales. Solo guarda
          en tu navegador lo imprescindible para que puedas iniciar sesión y
          pagar. Por eso no te mostramos un aviso para aceptar cookies.
        </p>
      </section>

      <section aria-labelledby="cookies-storage">
        <h2 id="cookies-storage">2. Qué guardamos en tu navegador</h2>
        <p>
          Usamos el almacenamiento de sesión del navegador
          (<em>sessionStorage</em>), que funciona como una cookie técnica: se
          borra solo al cerrar la pestaña y no se envía a terceros.
        </p>
        <!-- En pantallas estrechas la tabla se desplaza: con tabindex se puede
             recorrer también con el teclado. -->
        <div
          class="table-scroll"
          role="region"
          aria-label="Tabla de elementos guardados en el navegador"
          tabindex="0"
        >
          <table class="legal-table">
            <caption class="sr-only">
              Elementos que el sitio guarda en el navegador
            </caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Para qué sirve</th>
                <th scope="col">Cuánto dura</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row"><code>ecommerce-token</code></th>
                <td>Mantener tu sesión iniciada mientras navegas.</td>
                <td>Hasta cerrar sesión o la pestaña. Caduca a la hora.</td>
              </tr>
              <tr>
                <th scope="row"><code>esencial-checkout-delivery</code></th>
                <td>
                  Recordar la dirección y el teléfono del pedido mientras vas y
                  vuelves de la página de pago con tarjeta.
                </td>
                <td>Se borra al regresar de esa página o al cerrar la pestaña.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Ambos son estrictamente necesarios: sin ellos no podrías iniciar
          sesión ni completar un pago con tarjeta.
        </p>
      </section>

      <section aria-labelledby="cookies-third">
        <h2 id="cookies-third">3. Servicios de terceros</h2>
        <ul>
          <li>
            <strong>PayPal</strong>: si en el carrito eliges pagar con PayPal,
            se carga el botón de PayPal, que puede usar sus propias cookies para
            procesar el pago y prevenir fraudes. Si no eliges PayPal, ese
            contenido no se carga.
          </li>
          <li>
            <strong>Stripe</strong>: si eliges pagar con tarjeta, te llevamos a
            una página de Stripe. Las cookies que use Stripe allí dependen de su
            propia política.
          </li>
        </ul>
        <p>
          Las tipografías del sitio se sirven desde nuestro propio servidor, sin
          conectar con servicios externos.
        </p>
      </section>

      <section aria-labelledby="cookies-control">
        <h2 id="cookies-control">4. Cómo borrarlas o bloquearlas</h2>
        <p>
          Puedes borrar el almacenamiento del sitio desde la configuración de
          privacidad de tu navegador. Si lo bloqueas, no podrás iniciar sesión.
        </p>
      </section>

      <section aria-labelledby="cookies-changes">
        <h2 id="cookies-changes">5. Si esto cambia</h2>
        <p>
          Si algún día añadimos herramientas que no sean imprescindibles, como
          analítica o publicidad, te pediremos permiso antes de activarlas y
          actualizaremos esta página. Más información sobre tus datos en la
          <a routerLink="/privacy">Política de privacidad</a>.
        </p>
      </section>
    </article>
  `,
})
export class CookiesComponent {}
