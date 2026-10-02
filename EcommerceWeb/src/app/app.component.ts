import { Component, inject } from "@angular/core";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { SessionService } from "./core/session.service";
import { IconComponent } from "./core/icon.component";
import { BUSINESS } from "./core/business";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <a class="skip-link" href="#main" (click)="skipToContent($event)"
      >Saltar al contenido</a
    >
    <aside class="demo-bar" aria-label="Aviso de tienda de demostración">
      <span>TIENDA DEMO</span><span>No se cobra dinero real</span>
    </aside>
    <header class="site-header">
      <a
        routerLink="/"
        class="brand"
        (click)="closeMenu()"
        aria-label="Esencial, ir al inicio"
        >esencial</a
      >
      <button
        class="menu-toggle"
        type="button"
        (click)="menuOpen = !menuOpen"
        [attr.aria-expanded]="menuOpen"
        aria-controls="main-navigation"
        [attr.aria-label]="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
      >
        <span aria-hidden="true"></span><span aria-hidden="true"></span
        ><span aria-hidden="true"></span>
      </button>
      <nav
        id="main-navigation"
        [class.open]="menuOpen"
        aria-label="Navegación principal"
        (keydown.escape)="closeMenu(true)"
      >
        <a
          routerLink="/"
          routerLinkActive="selected"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMenu()"
          aria-label="Inicio"
          title="Inicio"
          ><app-icon name="home" /><span class="nav-label">Inicio</span></a
        >
        <a
          routerLink="/catalog"
          routerLinkActive="selected"
          (click)="closeMenu()"
          aria-label="Catálogo"
          title="Catálogo"
          ><app-icon name="catalog" /><span class="nav-label">Catálogo</span></a
        >
        @if (session.user()?.role === "CUSTOMER") {
          <a
            routerLink="/wishlist"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Favoritos"
            title="Favoritos"
            ><app-icon name="heart" /><span class="nav-label"
              >Favoritos</span
            ></a
          >
          <a
            routerLink="/orders"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Pedidos"
            title="Pedidos"
            ><app-icon name="package" /><span class="nav-label"
              >Pedidos</span
            ></a
          >
          <a
            routerLink="/addresses"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Direcciones"
            title="Direcciones"
            ><app-icon name="pin" /><span class="nav-label"
              >Direcciones</span
            ></a
          >
          <a
            routerLink="/support-requests"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Ayuda"
            title="Ayuda"
            ><app-icon name="help" /><span class="nav-label">Ayuda</span></a
          >
          <a
            routerLink="/cart"
            routerLinkActive="selected"
            (click)="closeMenu()"
            class="nav-pill"
            aria-label="Carrito"
            title="Carrito"
            ><app-icon name="cart" /><span class="nav-label">Carrito</span></a
          >
        }
        @if (session.user()?.role === "ADMIN") {
          <a
            routerLink="/admin"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Administración"
            title="Administración"
            ><app-icon name="admin" /><span class="nav-label"
              >Administración</span
            ></a
          >
          <a
            routerLink="/admin/orders"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Pedidos"
            title="Pedidos"
            ><app-icon name="orders" /><span class="nav-label">Pedidos</span></a
          >
          <a
            routerLink="/inventory"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Inventario"
            title="Inventario"
            ><app-icon name="inventory" /><span class="nav-label"
              >Inventario</span
            ></a
          >
          <a
            routerLink="/support"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Soporte"
            title="Soporte"
            ><app-icon name="support" /><span class="nav-label"
              >Soporte</span
            ></a
          >
        }
        @if (session.user()?.role === "INVENTORY_MANAGER") {
          <a
            routerLink="/inventory"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Inventario"
            title="Inventario"
            ><app-icon name="inventory" /><span class="nav-label"
              >Inventario</span
            ></a
          >
        }
        @if (session.user()?.role === "CUSTOMER_SUPPORT") {
          <a
            routerLink="/support"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Atención al cliente"
            title="Atención al cliente"
            ><app-icon name="support" /><span class="nav-label"
              >Atención al cliente</span
            ></a
          >
        }
        @if (session.user()) {
          <a
            routerLink="/profile"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Mi cuenta"
            title="Mi cuenta"
            ><app-icon name="user" /><span class="nav-label">Mi cuenta</span></a
          ><button
            class="text-button logout-button"
            (click)="logout()"
            aria-label="Salir"
            title="Salir"
          >
            <app-icon name="logout" /><span class="nav-label">Salir</span>
          </button>
        } @else {
          <a
            routerLink="/login"
            routerLinkActive="selected"
            (click)="closeMenu()"
            aria-label="Ingresar"
            title="Ingresar"
            ><app-icon name="login" /><span class="nav-label">Ingresar</span></a
          >
          <a routerLink="/signup" class="button small" (click)="closeMenu()"
            >Crear cuenta</a
          >
        }
      </nav>
    </header>
    <!-- La región existe siempre: un lector de pantalla solo anuncia los
         cambios dentro de una región viva que ya estaba en la página. -->
    <div
      class="notice-region"
      [attr.aria-live]="session.isError() ? 'assertive' : 'polite'"
      aria-atomic="true"
    >
      @if (session.message()) {
        <div class="notice" [class.error]="session.isError()">
          {{ session.message()
          }}<button
            type="button"
            aria-label="Cerrar mensaje"
            (click)="session.message.set('')"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      }
    </div>
    <main id="main" tabindex="-1"><router-outlet /></main>
    <footer class="site-footer">
      <div>
        <a routerLink="/" class="brand footer-brand">esencial</a>
        <p>Objetos útiles para días reales.</p>
      </div>
      <nav class="footer-links" aria-label="Enlaces del pie de página">
        <a routerLink="/catalog">Catálogo</a>
        @if (!session.user()) {
          <a routerLink="/login">Ingresar</a>
        }
        <a routerLink="/">Inicio</a>
      </nav>
      <p class="footer-note">
        Proyecto demostrativo · Moneda DOP<br />Sin cobros reales
      </p>
      <nav class="footer-legal" aria-label="Información legal">
        <a routerLink="/legal">Aviso legal</a>
        <a routerLink="/terms">Términos y condiciones</a>
        <a routerLink="/privacy">Política de privacidad</a>
        <a routerLink="/cookies">Política de cookies</a>
        <a routerLink="/refunds">Política de reembolsos</a>
      </nav>
      <p class="footer-business">
        © {{ year }} {{ business.legalName || business.tradeName }}
        @if (business.taxId) {
          · RNC/Cédula {{ business.taxId }}
        }
        @if (business.address) {
          · {{ business.address }}
        }
        @if (business.email) {
          · <a [href]="'mailto:' + business.email">{{ business.email }}</a>
        }
      </p>
    </footer>
  `,
})
export class AppComponent {
  readonly session = inject(SessionService);
  readonly business = BUSINESS;
  readonly year = new Date().getFullYear();
  private readonly router = inject(Router);
  menuOpen = false;
  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.closeMenu();
    });
  }
  /**
   * Con <base href="/">, un href="#main" apunta a "/#main": el navegador
   * saltaba a la portada en vez de al contenido de la página actual.
   */
  skipToContent(event: Event): void {
    event.preventDefault();
    document.getElementById("main")?.focus();
  }
  closeMenu(returnFocus = false): void {
    if (returnFocus && this.menuOpen)
      document.querySelector<HTMLElement>(".menu-toggle")?.focus();
    this.menuOpen = false;
  }
  logout(): void {
    this.session.clear();
    this.closeMenu();
    this.session.notify("Has cerrado sesión.");
    void this.router.navigateByUrl("/");
  }
}
