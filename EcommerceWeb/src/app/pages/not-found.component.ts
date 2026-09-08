import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  imports: [RouterLink],
  template: `
    <section class="empty-state not-found">
      <span>404</span>
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
