import { Component, Input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

/** Menú de las secciones de administración, compartido por todas sus páginas. */
@Component({
  selector: "app-admin-nav",
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="admin-subnav"
      [class.admin-subnav-top]="top"
      aria-label="Secciones de administración"
    >
      <a
        routerLink="/admin"
        routerLinkActive="active"
        ariaCurrentWhenActive="page"
        [routerLinkActiveOptions]="{ exact: true }"
        >Resumen</a
      >
      <a routerLink="/admin/products" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Productos</a
      >
      <a routerLink="/admin/categories" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Categorías</a
      >
      <a routerLink="/admin/coupons" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Cupones</a
      >
      <a routerLink="/admin/orders" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Pedidos</a
      >
      <a routerLink="/admin/reviews" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Reseñas</a
      >
      <a routerLink="/admin/users" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Usuarios</a
      >
      <a routerLink="/admin/settings" routerLinkActive="active" ariaCurrentWhenActive="page"
        >Configuración</a
      >
    </nav>
  `,
})
export class AdminNavComponent {
  /** Arriba del título (Pedidos, Reseñas) en vez de debajo (resto del panel). */
  @Input() top = false;
}
