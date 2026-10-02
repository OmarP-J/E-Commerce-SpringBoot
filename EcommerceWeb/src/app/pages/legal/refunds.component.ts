import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BUSINESS } from "../../core/business";
import { BusinessValueComponent, LegalHeaderComponent } from "./legal-shared";

@Component({
  imports: [RouterLink, BusinessValueComponent, LegalHeaderComponent],
  template: `
    <article class="legal-page">
      <app-legal-header title="Política de reembolsos" />

      <section aria-labelledby="refunds-demo">
        <h2 id="refunds-demo">1. Antes de nada</h2>
        <p>
          Como {{ business.tradeName }} es una tienda de demostración,
          <strong>no se cobra dinero real</strong>. Por eso los reembolsos
          tampoco mueven dinero: quedan registrados en tu pedido para mostrar
          cómo funcionaría el proceso.
        </p>
      </section>

      <section aria-labelledby="refunds-request">
        <h2 id="refunds-request">2. Cómo pedir una devolución, cambio o reembolso</h2>
        <ol>
          <li>Inicia sesión y entra en <a routerLink="/support-requests">Ayuda</a>.</li>
          <li>Elige el pedido al que se refiere tu solicitud.</li>
          <li>
            Indica el tipo: devolución, cambio de producto, reembolso o
            reclamo.
          </li>
          <li>Cuéntanos qué ocurrió y envía la solicitud.</li>
        </ol>
        <p>
          Puedes seguir el estado de cada solicitud (abierta, en revisión,
          aprobada, rechazada o resuelta) y leer la respuesta del equipo en esa
          misma página.
        </p>
      </section>

      <section aria-labelledby="refunds-rules">
        <h2 id="refunds-rules">3. Cómo se resuelven</h2>
        <ul>
          <li>
            Un reembolso puede ser total o parcial. La suma de los reembolsos
            de un pedido nunca supera su total.
          </li>
          <li>
            Cuando el equipo aprueba, rechaza o resuelve una solicitud, siempre
            deja una respuesta escrita.
          </li>
          <li>
            Un pedido puede cancelarse mientras no se haya enviado. Al
            cancelarse, su pago de prueba queda anulado. Para pedirlo, abre una
            solicitud de reembolso indicando que quieres cancelar.
          </li>
        </ul>
      </section>

      <section aria-labelledby="refunds-rights">
        <h2 id="refunds-rights">4. Tus derechos como consumidor</h2>
        <p>
          Esta política no limita los derechos que te reconoce la Ley
          n.º 358-05 General de Protección de los Derechos del Consumidor o
          Usuario. Si no quedas conforme con nuestra respuesta, puedes
          presentar tu reclamación ante Pro Consumidor.
        </p>
      </section>

      <section aria-labelledby="refunds-contact">
        <h2 id="refunds-contact">5. Contacto</h2>
        <p>
          Si no puedes usar la página de Ayuda, escribe a
          @if (business.email) {
            <a [href]="'mailto:' + business.email">{{ business.email }}</a>
          } @else {
            <app-business-value value="" />
          }
          indicando el número de pedido.
        </p>
      </section>
    </article>
  `,
})
export class RefundsComponent {
  readonly business = BUSINESS;
}
