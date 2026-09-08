import { CurrencyPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Cart, Product } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [CurrencyPipe, RouterLink],
  template: `
    @if (busy && !product) {
      <div class="page-loader" role="status">
        <span></span>
        <p>Preparando el producto…</p>
      </div>
    }
    @if (product; as item) {
      <nav class="breadcrumbs" aria-label="Ruta">
        <a routerLink="/">Inicio</a><span>/</span
        ><a routerLink="/catalog">Catálogo</a><span>/</span
        ><span>{{ item.name }}</span>
      </nav>
      <section class="product-detail-page">
        <div class="detail-image">
          @if (item.imageUrl) {
            <img [src]="item.imageUrl" [alt]="item.name" />
          } @else {
            <span>{{ item.name.charAt(0) }}</span>
          }
        </div>
        <div class="detail-content">
          <span class="kicker">{{ item.categoryName }}</span>
          <h1>{{ item.name }}</h1>
          <p class="detail-description">{{ item.description }}</p>
          <strong class="detail-price">{{
            item.price | currency: "DOP" : "symbol-narrow"
          }}</strong>
          <p class="stock-note" [class.out]="!item.active || item.stock === 0">
            <span></span
            >{{
              item.active && item.stock > 0
                ? item.stock + " unidades disponibles"
                : "Agotado temporalmente"
            }}
          </p>
          @if (!session.user() || session.user()?.role === "CUSTOMER") {
            <div class="detail-actions">
              <button
                [disabled]="busy || !item.active || item.stock === 0"
                (click)="add(item)"
              >
                Añadir al carrito →</button
              ><button
                class="secondary"
                [disabled]="busy"
                (click)="favorite(item)"
              >
                ♡ Guardar
              </button>
            </div>
          }
          <div class="detail-benefits">
            <span><b>Compra segura</b><small>Tu carrito es privado</small></span
            ><span><b>Precio claro</b><small>Sin cargos ocultos</small></span>
          </div>
        </div>
      </section>
    }
    @if (!busy && !product) {
      <section class="empty-state">
        <span>?</span>
        <h1>Producto no encontrado</h1>
        <p>Puede que ya no esté disponible.</p>
        <a class="button" routerLink="/catalog">Volver al catálogo</a>
      </section>
    }
  `,
})
export class ProductDetailComponent extends Page implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  product: Product | null = null;
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!Number.isInteger(id) || id < 1) return;
    void this.execute(async () => {
      this.product = await this.api.get<Product>("/catalog/products/" + id);
    });
  }
  add(product: Product): void {
    if (!this.session.user()) {
      void this.router.navigate(["/login"], {
        queryParams: { returnUrl: "/products/" + product.id },
      });
      return;
    }
    void this.execute(async () => {
      const cart = await this.api.get<Cart>("/customer/cart");
      const quantity =
        (cart.items.find((line) => line.product.id === product.id)?.quantity ??
          0) + 1;
      await this.api.put("/customer/cart/items/" + product.id, { quantity });
      this.session.notify("Producto añadido al carrito.");
      await this.router.navigateByUrl("/cart");
    });
  }
  favorite(product: Product): void {
    if (!this.session.user()) {
      void this.router.navigate(["/login"], {
        queryParams: { returnUrl: "/products/" + product.id },
      });
      return;
    }
    void this.execute(async () => {
      await this.api.put("/customer/wishlist/" + product.id, {});
      this.session.notify("Producto guardado en favoritos.");
    });
  }
}
