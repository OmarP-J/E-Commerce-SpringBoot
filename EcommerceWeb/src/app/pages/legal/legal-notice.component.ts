import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BusinessCardComponent, LegalHeaderComponent } from "./legal-shared";

@Component({
  imports: [RouterLink, BusinessCardComponent, LegalHeaderComponent],
  template: `
    <article class="legal-page">
      <app-legal-header title="Aviso legal" />

      <section aria-labelledby="notice-owner">
        <h2 id="notice-owner">Datos del responsable</h2>
        <app-business-card />
      </section>

      <section aria-labelledby="notice-docs">
        <h2 id="notice-docs">Documentos que regulan el sitio</h2>
        <ul>
          <li>
            <a routerLink="/terms">Términos y condiciones</a>: uso del sitio,
            cuentas, pedidos y pagos.
          </li>
          <li>
            <a routerLink="/privacy">Política de privacidad</a>: qué datos
            recogemos, para qué y cómo ejercer tus derechos.
          </li>
          <li>
            <a routerLink="/cookies">Política de cookies</a>: qué guardamos en
            tu navegador.
          </li>
          <li>
            <a routerLink="/refunds">Política de reembolsos</a>: devoluciones,
            cambios, reembolsos y reclamos.
          </li>
        </ul>
      </section>

      <section aria-labelledby="notice-images">
        <h2 id="notice-images">Imágenes</h2>
        <p>
          Las imágenes de la página de inicio se generaron con herramientas de
          inteligencia artificial y son ilustrativas: no muestran productos
          reales en venta. Las imágenes de cada producto las sube el equipo de
          la tienda.
        </p>
      </section>
    </article>
  `,
})
export class LegalNoticeComponent {}
