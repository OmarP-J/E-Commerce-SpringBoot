import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "../core/icon.component";

@Component({
  imports: [RouterLink, IconComponent],
  template: `
    <section class="empty-state not-found">
      <span aria-hidden="true"><app-icon name="compass" /></span>
      <p class="eyebrow">ERROR 404</p>
      <h1>Esta página tomó otro camino.</h1>
      <p>No encontramos lo que buscabas, pero el catálogo sigue aquí.</p>
      <div class="hero-actions">
        <a class="button" routerLink="/">Volver al inicio</a
        ><a class="button secondary" routerLink="/catalog">Ir al catálogo</a>
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
