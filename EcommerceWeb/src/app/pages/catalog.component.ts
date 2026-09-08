import { Component, OnInit, inject } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Page } from "../core/page";
import { Cart, Category, PageResult, Product } from "../core/models";

@Component({
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: "./catalog.component.html",
})
export class CatalogComponent extends Page implements OnInit {
  readonly wishlist = !!inject(ActivatedRoute).snapshot.data["wishlist"];
  private readonly router = inject(Router);
  products: Product[] = [];
  categories: Category[] = [];
  q = "";
  categoryId = "";
  page = 0;
  totalPages = 0;
  total = 0;
  ngOnInit(): void {
    this.load();
  }
  load(reset = false): void {
    if (reset) this.page = 0;
    void this.execute(async () => {
      this.categories = await this.api.get<Category[]>("/catalog/categories");
      if (this.wishlist) {
        this.products = await this.api.get<Product[]>("/customer/wishlist");
        this.total = this.products.length;
      } else {
        const query = new URLSearchParams({
          q: this.q,
          page: String(this.page),
        });
        if (this.categoryId) query.set("categoryId", this.categoryId);
        const result = await this.api.get<PageResult<Product>>(
          "/catalog/products?" + query,
        );
        this.products = result.items;
        this.total = result.total;
        this.totalPages = result.totalPages;
      }
    });
  }
  turn(direction: number): void {
    this.page += direction;
    this.load();
  }
  add(product: Product): void {
    if (!this.session.user()) {
      void this.router.navigate(["/login"], {
        queryParams: { returnUrl: "/catalog" },
      });
      return;
    }
    void this.execute(async () => {
      const cart = await this.api.get<Cart>("/customer/cart");
      const quantity =
        (cart.items.find((item) => item.product.id === product.id)?.quantity ??
          0) + 1;
      await this.api.put("/customer/cart/items/" + product.id, { quantity });
      this.session.notify("Producto añadido al carrito.");
    });
  }
  favorite(product: Product): void {
    if (!this.session.user()) {
      void this.router.navigate(["/login"], {
        queryParams: { returnUrl: "/catalog" },
      });
      return;
    }
    void this.execute(async () => {
      if (this.wishlist) {
        await this.api.delete("/customer/wishlist/" + product.id);
        this.products = this.products.filter((p) => p.id !== product.id);
        this.total = this.products.length;
      } else {
        await this.api.put("/customer/wishlist/" + product.id, {});
        this.session.notify("Guardado en favoritos.");
      }
    });
  }
}
