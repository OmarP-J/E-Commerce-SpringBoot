import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BUSINESS } from "../../core/business";
import {
  BusinessCardComponent,
  BusinessValueComponent,
  LegalHeaderComponent,
} from "./legal-shared";

@Component({
  imports: [
    RouterLink,
    BusinessCardComponent,
    BusinessValueComponent,
    LegalHeaderComponent,
  ],
  template: `
    <article class="legal-page">
      <app-legal-header title="Términos y condiciones" />

      <section aria-labelledby="terms-who">
        <h2 id="terms-who">1. Quiénes somos</h2>
        <p>Este sitio lo opera:</p>
        <app-business-card />
        <p>
          Al crear una cuenta o usar el sitio aceptas estos términos. Si no
          estás de acuerdo, no uses el sitio.
        </p>
      </section>

      <section aria-labelledby="terms-demo">
        <h2 id="terms-demo">2. Naturaleza del sitio</h2>
        <p>
          {{ business.tradeName }} es una <strong>tienda de demostración</strong>
          creada para mostrar cómo funciona una compra en línea. En concreto:
        </p>
        <ul>
          <li>
            Los pagos son <strong>simulados</strong> o se hacen con PayPal o
            Stripe en <strong>modo de prueba</strong>. No se cobra dinero real.
          </li>
          <li>
            Los pedidos <strong>no se preparan ni se envían</strong>. Su estado
            cambia solo para demostrar el proceso.
          </li>
          <li>
            Los productos, precios y existencias son de ejemplo y no constituyen
            una oferta de venta.
          </li>
          <li>
            Las imágenes de la página de inicio son ilustrativas y se generaron
            con herramientas de inteligencia artificial. No muestran productos
            reales en venta.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-account">
        <h2 id="terms-account">3. Tu cuenta</h2>
        <ul>
          <li>Debes tener al menos 18 años para crear una cuenta.</li>
          <li>
            Los datos que nos des deben ser verdaderos. Puedes corregir tu
            nombre en <a routerLink="/profile">Mi cuenta</a>.
          </li>
          <li>
            Eres responsable de mantener tu contraseña en secreto. Si crees que
            alguien la conoce, cámbiala de inmediato.
          </li>
          <li>
            Podemos suspender una cuenta que se use para fraude, para atacar el
            sitio o para molestar a otras personas.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-orders">
        <h2 id="terms-orders">4. Precios, pedidos y pagos</h2>
        <ul>
          <li>Los precios se muestran en pesos dominicanos (DOP).</li>
          <li>
            Antes de confirmar ves el subtotal, el descuento y el total del
            pedido. No se añade ningún cargo después.
          </li>
          <li>
            Un pedido solo se confirma si hay existencias suficientes en ese
            momento.
          </li>
          <li>
            Cada carrito admite un cupón. Los cupones tienen fecha de
            vencimiento, no se canjean por dinero y podemos desactivarlos en
            cualquier momento.
          </li>
          <li>
            Un pedido pasa por estos estados: confirmado, en preparación,
            enviado y entregado. Puede cancelarse mientras no se haya enviado.
            Te avisamos por correo de cada cambio y puedes seguirlo en
            <a routerLink="/orders">Mis pedidos</a>.
          </li>
        </ul>
        <p>
          Las devoluciones, cambios y reembolsos se rigen por la
          <a routerLink="/refunds">Política de reembolsos</a>.
        </p>
      </section>

      <section aria-labelledby="terms-reviews">
        <h2 id="terms-reviews">5. Reseñas</h2>
        <ul>
          <li>
            Solo puede opinar quien tiene un pedido entregado con ese
            producto. Cada cliente deja una opinión por producto y puede
            editarla o borrarla cuando quiera.
          </li>
          <li>
            Se publica con tu nombre y la inicial de tu apellido. No incluyas
            datos personales tuyos ni de otras personas.
          </li>
          <li>
            La tienda no escribe reseñas, no las paga y no da descuentos ni
            regalos a cambio de opinar.
          </li>
          <li>
            Solo ocultamos las reseñas que incumplen estas normas: insultos,
            datos personales, publicidad o contenido sin relación con el
            producto. <strong>Nunca ocultamos una opinión por ser negativa.</strong>
            Si ocultamos la tuya, verás el motivo en la página del producto.
          </li>
          <li>
            Al publicarla nos permites mostrarla en el sitio mientras no la
            borres.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-use">
        <h2 id="terms-use">6. Uso aceptable</h2>
        <p>No está permitido:</p>
        <ul>
          <li>
            Intentar acceder a cuentas o zonas del sitio que no te
            corresponden.
          </li>
          <li>
            Interferir con el funcionamiento del sitio o sobrecargarlo con
            solicitudes automatizadas.
          </li>
          <li>Crear cuentas con datos falsos o de otras personas.</li>
          <li>
            Enviar en las solicitudes de ayuda contenido ilegal, ofensivo o que
            no tenga relación con tu pedido.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-ip">
        <h2 id="terms-ip">7. Propiedad intelectual</h2>
        <p>
          Los textos, el diseño y el código del sitio pertenecen a su
          responsable. No puedes copiarlos para usarlos con fines comerciales
          sin permiso. Las tipografías DM Sans y Manrope se usan bajo la
          licencia SIL Open Font License.
        </p>
      </section>

      <section aria-labelledby="terms-liability">
        <h2 id="terms-liability">8. Responsabilidad</h2>
        <p>
          Al tratarse de una demostración, el sitio puede cambiar, dejar de
          estar disponible o reiniciar sus datos de prueba. Hacemos lo posible
          para que funcione bien, pero no garantizamos que esté siempre libre
          de errores.
        </p>
        <p>
          Nada de lo anterior limita los derechos que te reconoce la Ley
          n.º 358-05 General de Protección de los Derechos del Consumidor o
          Usuario.
        </p>
      </section>

      <section aria-labelledby="terms-law">
        <h2 id="terms-law">9. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República Dominicana. Las
          aceptaciones y comunicaciones electrónicas tienen validez conforme a
          la Ley n.º 126-02 sobre Comercio Electrónico, Documentos y Firmas
          Digitales. Cualquier controversia se someterá a los tribunales
          dominicanos competentes, sin perjuicio de tu derecho a acudir a
          Pro Consumidor.
        </p>
      </section>

      <section aria-labelledby="terms-changes">
        <h2 id="terms-changes">10. Cambios y contacto</h2>
        <p>
          Si cambiamos estos términos, actualizaremos la fecha de arriba y lo
          avisaremos en el sitio. Para cualquier duda escribe a
          @if (business.email) {
            <a [href]="'mailto:' + business.email">{{ business.email }}</a>.
          } @else {
            <app-business-value value="" />.
          }
        </p>
      </section>
    </article>
  `,
})
export class TermsComponent {
  readonly business = BUSINESS;
}
