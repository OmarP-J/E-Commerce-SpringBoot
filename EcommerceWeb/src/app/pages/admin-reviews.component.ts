import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AdminReview } from "../core/models";
import { Page } from "../core/page";
import { IconComponent } from "../core/icon.component";
import { StarsComponent } from "../core/stars.component";
import { AdminNavComponent } from "./admin-nav.component";

/**
 * Moderación de reseñas. Ocultar exige un motivo y la reseña nunca se borra:
 * la decisión queda registrada y el cliente ve por qué no se publica.
 */
@Component({
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    StarsComponent,
    AdminNavComponent,
    IconComponent,
  ],
  template: `
    <app-admin-nav [top]="true" />
    <div class="section-heading">
      <div>
        <p class="eyebrow">CONFIANZA</p>
        <h1>Reseñas</h1>
        <p class="page-lead">
          Solo opinan clientes con el producto entregado. Oculta únicamente lo
          que incumpla las normas: insultos, datos personales, publicidad o
          contenido sin relación con el producto.
        </p>
      </div>
      <button
        type="button"
        class="secondary"
        [disabled]="busy"
        (click)="load()"
      >
        Actualizar
      </button>
    </div>

    <p class="legal-demo-note">
      <strong>No ocultes una reseña por ser negativa.</strong> Esconder las
      malas opiniones engaña a los compradores y en muchos países está
      prohibido. Las opiniones negativas bien atendidas también generan
      confianza.
    </p>

    <form class="filters" (ngSubmit)="$event.preventDefault()">
      <label class="grow"
        >Buscar reseña
        <input
          name="reviewSearch"
          [(ngModel)]="search"
          (ngModelChange)="page = 0"
          maxlength="120"
          placeholder="Producto, cliente o texto"
        />
      </label>
      <label
        >Mostrar
        <select
          name="reviewFilter"
          [(ngModel)]="filter"
          (ngModelChange)="page = 0"
        >
          <option value="">Todas</option>
          <option value="visible">Publicadas</option>
          <option value="hidden">Ocultas</option>
        </select>
      </label>
    </form>

    <div class="card-list">
      @for (review of pagedReviews; track review.id) {
        <article class="panel review-card">
          <div class="order-head">
            <div>
              <p class="eyebrow">{{ review.productName }}</p>
              <app-stars [value]="review.rating" />
              <p class="muted">
                {{ review.authorName }} · {{ review.authorEmail }} ·
                {{ review.createdAt | date: "d MMM y" }}
              </p>
            </div>
            <span class="badge">{{ review.hidden ? "Oculta" : "Publicada" }}</span>
          </div>
          <p>{{ review.comment || "Sin comentario." }}</p>
          @if (review.hidden) {
            <p class="muted">Motivo: {{ review.hiddenReason }}</p>
            <div class="actions compact-actions">
              <button
                type="button"
                class="secondary"
                [disabled]="busy"
                (click)="setHidden(review, false)"
              >
                Volver a publicar
              </button>
              <a [routerLink]="['/products', review.productId]">Ver producto</a>
            </div>
          } @else {
            <div class="order-actions">
              <label
                >Motivo para ocultarla
                <input
                  [name]="'reason-' + review.id"
                  [(ngModel)]="reasons[review.id]"
                  maxlength="300"
                  placeholder="Ej.: incluye un número de teléfono"
                />
              </label>
              <button
                type="button"
                class="secondary"
                [disabled]="busy || (reasons[review.id] ?? '').trim().length < 5"
                [attr.aria-label]="'Ocultar la reseña de ' + review.authorName"
                (click)="setHidden(review, true)"
              >
                Ocultar
              </button>
            </div>
          }
        </article>
      } @empty {
        @if (!busy) {
          <section class="empty panel">
            <span class="empty-icon" aria-hidden="true"><app-icon name="star" /></span>
            <h2>
              {{
                reviews.length === 0
                  ? "Todavía no hay reseñas."
                  : "No hay reseñas para este filtro."
              }}
            </h2>
            @if (reviews.length === 0) {
              <p>
                Aparecen cuando un cliente opina sobre un producto de un pedido
                entregado.
              </p>
            }
          </section>
        }
      }
    </div>

    @if (totalPages > 1) {
      <nav class="pagination" aria-label="Páginas de reseñas">
        <button
          type="button"
          class="secondary"
          [disabled]="busy || page === 0"
          (click)="goToPage(page - 1)"
        >
          Anterior
        </button>
        <span class="page-summary">Página {{ page + 1 }} de {{ totalPages }}</span>
        <button
          type="button"
          class="secondary"
          [disabled]="busy || page + 1 >= totalPages"
          (click)="goToPage(page + 1)"
        >
          Siguiente
        </button>
      </nav>
    }
  `,
})
export class AdminReviewsComponent extends Page implements OnInit {
  reviews: AdminReview[] = [];
  /** Motivo escrito para cada reseña, todavía sin aplicar. */
  reasons: Partial<Record<number, string>> = {};
  search = "";
  filter = "";
  page = 0;
  readonly pageSize = 10;

  get filteredReviews(): AdminReview[] {
    const query = this.search.trim();
    return this.reviews.filter(
      (review) =>
        (!this.filter || review.hidden === (this.filter === "hidden")) &&
        (!query ||
          this.matchesSearch(
            query,
            review.productName,
            review.authorName,
            review.authorEmail,
            review.comment,
          )),
    );
  }

  get pagedReviews(): AdminReview[] {
    return this.paginate(this.filteredReviews, this.page, this.pageSize);
  }

  get totalPages(): number {
    return this.pageCount(this.filteredReviews.length, this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    void this.execute(async () => {
      this.reviews = await this.api.get<AdminReview[]>("/admin/reviews");
      if (this.page >= this.totalPages && this.totalPages > 0)
        this.page = this.totalPages - 1;
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) this.page = page;
  }

  setHidden(review: AdminReview, hidden: boolean): void {
    const reason = (this.reasons[review.id] ?? "").trim();
    void this.execute(async () => {
      const updated = await this.api.put<AdminReview>(
        `/admin/reviews/${review.id}/visibility`,
        { hidden, reason: hidden ? reason : null },
      );
      this.reviews = this.reviews.map((item) =>
        item.id === updated.id ? updated : item,
      );
      delete this.reasons[review.id];
      this.session.notify(hidden ? "Reseña ocultada." : "Reseña publicada de nuevo.");
    });
  }
}
