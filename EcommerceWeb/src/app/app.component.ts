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

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
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
