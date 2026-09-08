import { Component, inject } from "@angular/core";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { SessionService } from "./core/session.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <a class="skip-link" href="#main">Saltar al contenido</a>
    <div class="demo-bar">
      <span>TIENDA DEMO</span><span>Los pagos son simulados</span>
    </div>
    <header class="site-header">
      <a
        routerLink="/"
        class="brand"
        (click)="closeMenu()"
        aria-label="Esencial, ir al inicio"
        >esencial<span>®</span></a
      >
      <button
        class="menu-toggle"
        type="button"
        (click)="menuOpen = !menuOpen"
        [attr.aria-expanded]="menuOpen"
        aria-controls="main-navigation"
        aria-label="Abrir menú"
      >
        <span></span><span></span><span></span>
      </button>
      <nav
        id="main-navigation"
        [class.open]="menuOpen"
        aria-label="Navegación principal"
      >
        <a
          routerLink="/"
          routerLinkActive="selected"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMenu()"
          >Inicio</a
        >
        <a
          routerLink="/catalog"
          routerLinkActive="selected"
          (click)="closeMenu()"
          >Catálogo</a
        >
        @if (session.user()?.role === "CUSTOMER") {
          <a
            routerLink="/wishlist"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Favoritos</a
          >
          <a
            routerLink="/orders"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Pedidos</a
          >
          <a
            routerLink="/addresses"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Direcciones</a
          >
          <a
            routerLink="/support-requests"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Ayuda</a
          >
          <a
            routerLink="/cart"
            routerLinkActive="selected"
            (click)="closeMenu()"
            class="nav-pill"
            >Carrito</a
          >
        }
        @if (session.user()?.role === "ADMIN") {
          <a
            routerLink="/admin"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Administración</a
          >
          <a
            routerLink="/admin/orders"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Pedidos</a
          >
          <a
            routerLink="/inventory"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Inventario</a
          >
          <a
            routerLink="/support"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Soporte</a
          >
        }
        @if (session.user()?.role === "INVENTORY_MANAGER") {
          <a
            routerLink="/inventory"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Inventario</a
          >
        }
        @if (session.user()?.role === "CUSTOMER_SUPPORT") {
          <a
            routerLink="/support"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Atención al cliente</a
          >
        }
        @if (session.user()) {
          <a
            routerLink="/profile"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Mi cuenta</a
          ><button class="text-button logout-button" (click)="logout()">
            Salir
          </button>
        } @else {
          <a
            routerLink="/login"
            routerLinkActive="selected"
            (click)="closeMenu()"
            >Ingresar</a
          >
          <a routerLink="/signup" class="button small" (click)="closeMenu()"
            >Crear cuenta</a
          >
        }
      </nav>
    </header>
    @if (session.message()) {
      <div class="notice" [class.error]="session.isError()" role="status">
        {{ session.message()
        }}<button aria-label="Cerrar mensaje" (click)="session.message.set('')">
          ×
        </button>
      </div>
    }
    <main id="main"><router-outlet /></main>
    <footer class="site-footer">
      <div>
        <a routerLink="/" class="brand footer-brand">esencial<span>®</span></a>
        <p>Objetos útiles para días reales.</p>
      </div>
      <div class="footer-links">
        <a routerLink="/catalog">Catálogo</a>
        @if (!session.user()) {
          <a routerLink="/login">Ingresar</a>
        }
        <a routerLink="/">Inicio</a>
      </div>
      <p class="footer-note">
        Proyecto demostrativo · Moneda DOP<br />Sin cobros reales
      </p>
    </footer>
  `,
})
export class AppComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  menuOpen = false;
  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.closeMenu();
    });
  }
  closeMenu(): void {
    this.menuOpen = false;
  }
  logout(): void {
    this.session.clear();
    this.closeMenu();
    this.session.notify("Has cerrado sesión.");
    void this.router.navigateByUrl("/");
  }
}
