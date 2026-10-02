import { inject } from "@angular/core";
import { CanActivateFn, Router, Routes } from "@angular/router";
import { SessionService } from "./core/session.service";
import { UserRole } from "./core/models";

const signedIn: CanActivateFn = (_route, state) =>
  inject(SessionService).user()
    ? true
    : inject(Router).createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
const hasRole =
  (...roles: UserRole[]): CanActivateFn =>
  (_route, state) => {
    const user = inject(SessionService).user();
    if (!user)
      return inject(Router).createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
    return roles.includes(user.role)
      ? true
      : inject(Router).createUrlTree(["/"]);
  };
const customer = hasRole("CUSTOMER");
const admin = hasRole("ADMIN");
const inventory = hasRole("ADMIN", "INVENTORY_MANAGER");
const support = hasRole("ADMIN", "CUSTOMER_SUPPORT");

/** Cada página lleva su propio título: es lo primero que anuncia un lector de pantalla. */
const title = (page: string) => `${page} · Esencial`;

export const routes: Routes = [
  {
    path: "",
    title: "Esencial · Tu tienda",
    loadComponent: () =>
      import("./pages/landing.component").then((m) => m.LandingComponent),
  },
  {
    path: "catalog",
    title: title("Catálogo"),
    loadComponent: () =>
      import("./pages/catalog.component").then((m) => m.CatalogComponent),
  },
  {
    path: "products/:id",
    title: title("Producto"),
    loadComponent: () =>
      import("./pages/product-detail.component").then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: "login",
    title: title("Iniciar sesión"),
    loadComponent: () =>
      import("./pages/auth.component").then((m) => m.AuthComponent),
  },
  {
    path: "signup",
    title: title("Crear cuenta"),
    loadComponent: () =>
      import("./pages/auth.component").then((m) => m.AuthComponent),
    data: { signup: true },
  },
  {
    path: "verify",
    title: title("Verificar correo"),
    loadComponent: () =>
      import("./pages/verify.component").then((m) => m.VerifyComponent),
  },
  {
    path: "cart",
    title: title("Carrito"),
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/cart.component").then((m) => m.CartComponent),
  },
  {
    path: "orders",
    title: title("Mis pedidos"),
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/orders.component").then((m) => m.OrdersComponent),
  },
  {
    path: "addresses",
    title: title("Mis direcciones"),
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/addresses.component").then((m) => m.AddressesComponent),
  },
  {
    path: "support-requests",
    title: title("Ayuda"),
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/customer-support.component").then(
        (m) => m.CustomerSupportComponent,
      ),
  },
  {
    path: "wishlist",
    title: title("Favoritos"),
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/catalog.component").then((m) => m.CatalogComponent),
    data: { wishlist: true },
  },
  {
    path: "profile",
    title: title("Mi cuenta"),
    canActivate: [signedIn],
    loadComponent: () =>
      import("./pages/profile.component").then((m) => m.ProfileComponent),
  },
  {
    path: "admin",
    title: title("Administración"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "dashboard" },
  },
  {
    path: "admin/products",
    title: title("Productos"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "products" },
  },
  {
    path: "admin/categories",
    title: title("Categorías"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "categories" },
  },
  {
    path: "admin/coupons",
    title: title("Cupones"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "coupons" },
  },
  {
    path: "admin/users",
    title: title("Usuarios y permisos"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "users" },
  },
  {
    path: "admin/settings",
    title: title("Configuración"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "settings" },
  },
  {
    path: "admin/orders",
    title: title("Pedidos de clientes"),
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/orders.component").then((m) => m.OrdersComponent),
    data: { admin: true },
  },
  {
    path: "inventory",
    title: title("Inventario"),
    canActivate: [inventory],
    loadComponent: () =>
      import("./pages/inventory.component").then((m) => m.InventoryComponent),
  },
  {
    path: "support",
    title: title("Centro de soporte"),
    canActivate: [support],
    loadComponent: () =>
      import("./pages/support.component").then((m) => m.SupportComponent),
  },
  {
    path: "legal",
    title: title("Aviso legal"),
    loadComponent: () =>
      import("./pages/legal/legal-notice.component").then(
        (m) => m.LegalNoticeComponent,
      ),
  },
  {
    path: "terms",
    title: title("Términos y condiciones"),
    loadComponent: () =>
      import("./pages/legal/terms.component").then((m) => m.TermsComponent),
  },
  {
    path: "privacy",
    title: title("Política de privacidad"),
    loadComponent: () =>
      import("./pages/legal/privacy.component").then((m) => m.PrivacyComponent),
  },
  {
    path: "cookies",
    title: title("Política de cookies"),
    loadComponent: () =>
      import("./pages/legal/cookies.component").then((m) => m.CookiesComponent),
  },
  {
    path: "refunds",
    title: title("Política de reembolsos"),
    loadComponent: () =>
      import("./pages/legal/refunds.component").then((m) => m.RefundsComponent),
  },
  {
    path: "**",
    title: title("Página no encontrada"),
    loadComponent: () =>
      import("./pages/not-found.component").then((m) => m.NotFoundComponent),
  },
];
