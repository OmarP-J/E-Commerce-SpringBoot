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
export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/landing.component").then((m) => m.LandingComponent),
  },
  {
    path: "catalog",
    loadComponent: () =>
      import("./pages/catalog.component").then((m) => m.CatalogComponent),
  },
  {
    path: "products/:id",
    loadComponent: () =>
      import("./pages/product-detail.component").then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/auth.component").then((m) => m.AuthComponent),
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./pages/auth.component").then((m) => m.AuthComponent),
    data: { signup: true },
  },
  {
    path: "cart",
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/cart.component").then((m) => m.CartComponent),
  },
  {
    path: "orders",
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/orders.component").then((m) => m.OrdersComponent),
  },
  {
    path: "addresses",
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/addresses.component").then((m) => m.AddressesComponent),
  },
  {
    path: "support-requests",
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/customer-support.component").then(
        (m) => m.CustomerSupportComponent,
      ),
  },
  {
    path: "wishlist",
    canActivate: [customer],
    loadComponent: () =>
      import("./pages/catalog.component").then((m) => m.CatalogComponent),
    data: { wishlist: true },
  },
  {
    path: "profile",
    canActivate: [signedIn],
    loadComponent: () =>
      import("./pages/profile.component").then((m) => m.ProfileComponent),
  },
  {
    path: "admin",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "dashboard" },
  },
  {
    path: "admin/products",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "products" },
  },
  {
    path: "admin/categories",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "categories" },
  },
  {
    path: "admin/coupons",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "coupons" },
  },
  {
    path: "admin/users",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "users" },
  },
  {
    path: "admin/settings",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/admin.component").then((m) => m.AdminComponent),
    data: { section: "settings" },
  },
  {
    path: "admin/orders",
    canActivate: [admin],
    loadComponent: () =>
      import("./pages/orders.component").then((m) => m.OrdersComponent),
    data: { admin: true },
  },
  {
    path: "inventory",
    canActivate: [inventory],
    loadComponent: () =>
      import("./pages/inventory.component").then((m) => m.InventoryComponent),
  },
  {
    path: "support",
    canActivate: [support],
    loadComponent: () =>
      import("./pages/support.component").then((m) => m.SupportComponent),
  },
  {
    path: "**",
    loadComponent: () =>
      import("./pages/not-found.component").then((m) => m.NotFoundComponent),
  },
];
