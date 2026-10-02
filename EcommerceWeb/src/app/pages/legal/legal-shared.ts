import { Component, Input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { BUSINESS, LEGAL_LAST_UPDATED, PENDING_LABEL } from "../../core/business";

/** Muestra un dato del negocio o, si falta, un aviso visible de que está pendiente. */
@Component({
  selector: "app-business-value",
  template: `@if (value) {
      {{ value }}
    } @else {
      <span class="pending-data">{{ pending }}</span>
    }`,
})
export class BusinessValueComponent {
  @Input() value = "";
  readonly pending = PENDING_LABEL;
}

/** Ficha con la identificación del responsable del sitio. */
@Component({
  selector: "app-business-card",
  imports: [BusinessValueComponent],
  template: `
    <dl class="business-card">
      <div>
        <dt>Nombre comercial</dt>
        <dd>{{ business.tradeName }}</dd>
      </div>
      <div>
        <dt>Responsable</dt>
        <dd><app-business-value [value]="business.legalName" /></dd>
      </div>
      <div>
        <dt>RNC o cédula</dt>
        <dd><app-business-value [value]="business.taxId" /></dd>
      </div>
      <div>
        <dt>Dirección</dt>
        <dd><app-business-value [value]="business.address" /></dd>
      </div>
      <div>
        <dt>Correo de contacto</dt>
        <dd>
          @if (business.email) {
            <a [href]="'mailto:' + business.email">{{ business.email }}</a>
          } @else {
            <app-business-value value="" />
          }
        </dd>
      </div>
      @if (business.phone) {
        <div>
          <dt>Teléfono</dt>
          <dd>{{ business.phone }}</dd>
        </div>
      }
      <div>
        <dt>País</dt>
        <dd>{{ business.country }}</dd>
      </div>
    </dl>
  `,
})
export class BusinessCardComponent {
  readonly business = BUSINESS;
}

/** Cabecera y navegación común a todos los documentos legales. */
@Component({
  selector: "app-legal-header",
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="legal-nav" aria-label="Documentos legales">
      <a routerLink="/legal" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Aviso legal</a
      >
      <a routerLink="/terms" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Términos</a
      >
      <a routerLink="/privacy" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Privacidad</a
      >
      <a routerLink="/cookies" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Cookies</a
      >
      <a routerLink="/refunds" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Reembolsos</a
      >
    </nav>
    <header class="legal-heading">
      <p class="eyebrow">INFORMACIÓN LEGAL</p>
      <h1>{{ title }}</h1>
      <p class="muted">Última actualización: {{ updated }}</p>
    </header>
    <aside class="legal-demo-note" aria-label="Aviso sobre la tienda de demostración">
      <strong>Este sitio es una tienda de demostración.</strong> Los pagos son
      simulados o se hacen en modo de prueba, no se cobra dinero real y los
      pedidos no se envían. Estos textos describen cómo funciona el sitio hoy.
    </aside>
  `,
})
export class LegalHeaderComponent {
  @Input({ required: true }) title!: string;
  readonly updated = LEGAL_LAST_UPDATED;
}
