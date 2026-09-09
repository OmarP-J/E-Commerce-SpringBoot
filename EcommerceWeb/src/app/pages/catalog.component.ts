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
  private rawWishlist: Product[] = [];
  readonly pageSize = 12;
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

  filtersChanged(delay = 300): void {
    if (this.wishlist) {
      this.debounce("catalog-wishlist-filters", () => this.applyWishlistFilter(true), delay);
    } else {
      this.debounce("catalog-filters", () => this.load(true), delay);
    }
  }

  load(reset = false): void {
    if (reset) this.page = 0;
    void this.execute(async () => {
      this.categories = await this.api.get<Category[]>("/catalog/categories");
      if (this.wishlist) {
        this.rawWishlist = await this.api.get<Product[]>("/customer/wishlist");
        this.applyWishlistFilter(reset);
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

  private applyWishlistFilter(reset = false): void {
    if (reset) this.page = 0;
    const query = this.q.trim();
    const filtered = query
      ? this.rawWishlist.filter((p) =>
          this.matchesSearch(query, p.name, p.categoryName, p.description),
        )
      : this.rawWishlist;
    this.total = filtered.length;
    this.totalPages = this.pageCount(this.total, this.pageSize);
    if (this.page >= this.totalPages && this.totalPages > 0) {
      this.page = this.totalPages - 1;
    }
    this.products = this.paginate(filtered, this.page, this.pageSize);
  }

  turn(direction: number): void {
    this.goToPage(this.page + direction);
  }
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) return;
    this.page = page;
    if (this.wishlist) {
      this.applyWishlistFilter();
    } else {
      this.load();
    }
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
        this.rawWishlist = this.rawWishlist.filter((p) => p.id !== product.id);
        this.applyWishlistFilter();
      } else {
        await this.api.put("/customer/wishlist/" + product.id, {});
        this.session.notify("Guardado en favoritos.");
      }
    });
  }
}
