import { CurrencyPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Cart, Product } from "../core/models";
import { Page } from "../core/page";
import { StarsComponent } from "../core/stars.component";
import { IconComponent } from "../core/icon.component";
import { ProductReviewsComponent } from "./product-reviews.component";

@Component({
  imports: [
    CurrencyPipe,
    RouterLink,
    StarsComponent,
    ProductReviewsComponent,
    IconComponent,
  ],
  template: `
    @if (busy && !product) {
      <div class="page-loader" role="status">
        <span></span>
        <p>Preparando el producto…</p>
      </div>
    }
    @if (product; as item) {
      <nav class="breadcrumbs" aria-label="Ruta">
        <a routerLink="/">Inicio</a><span aria-hidden="true">/</span
        ><a routerLink="/catalog">Catálogo</a><span aria-hidden="true">/</span
        ><span aria-current="page">{{ item.name }}</span>
      </nav>
      <section class="product-detail-page">
        <div class="detail-image">
          @if (item.imageUrl) {
            <img [src]="item.imageUrl" [alt]="item.name" />
          } @else {
            <span aria-hidden="true">{{ item.name.charAt(0) }}</span>
          }
        </div>
        <div class="detail-content">
          <span class="kicker">{{ item.categoryName }}</span>
          <h1>{{ item.name }}</h1>
          @if (item.rating && item.reviewCount) {
            <a class="detail-rating" href="#opiniones" (click)="toReviews($event)"
              ><app-stars [value]="item.rating" /><span
                >{{ item.reviewCount }}
                {{ item.reviewCount === 1 ? "opinión" : "opiniones" }}</span
              ></a
            >
          }
          <p class="detail-description">{{ item.description }}</p>
          <strong class="detail-price">{{
            item.price | currency: "DOP" : "symbol"
          }}</strong>
          <p class="stock-note" [class.out]="!item.active || item.stock === 0">
            <span aria-hidden="true"></span
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
                Añadir al carrito <app-icon name="arrow-right" /></button
              ><button
                class="secondary"
                [disabled]="busy"
                (click)="favorite(item)"
              >
                <app-icon name="heart" /> Guardar en favoritos
              </button>
            </div>
          }
          <!-- Solo afirmaciones que el sitio cumple de verdad. -->
          <div class="detail-benefits">
            <span
              ><app-icon name="lock" /><b>Carrito privado</b
              ><small>Solo lo ves tú, con tu cuenta</small></span
            ><span
              ><app-icon name="receipt" /><b>Total antes de pagar</b
              ><small>Con descuentos aplicados, antes de confirmar</small></span
            >
          </div>
        </div>
      </section>
      <app-product-reviews
        [productId]="item.id"
        (summaryChange)="item.rating = $event.average; item.reviewCount = $event.count"
      />
    }
    @if (!busy && !product) {
      <section class="empty-state">
        <span aria-hidden="true"><app-icon name="search" /></span>
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
  private readonly title = inject(Title);
  product: Product | null = null;
  /** Con <base href="/">, "#opiniones" apuntaría a la portada: se salta a mano. */
  toReviews(event: Event): void {
    event.preventDefault();
    document.getElementById("opiniones")?.scrollIntoView({ behavior: "smooth" });
  }
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!Number.isInteger(id) || id < 1) return;
    void this.execute(async () => {
      this.product = await this.api.get<Product>("/catalog/products/" + id);
      this.title.setTitle(this.product.name + " · Esencial");
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
