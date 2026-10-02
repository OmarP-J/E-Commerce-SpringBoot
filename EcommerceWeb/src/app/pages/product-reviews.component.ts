import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { MyReview, ReviewSummary } from "../core/models";
import { Page } from "../core/page";
import { StarsComponent } from "../core/stars.component";

/**
 * Opiniones de la ficha de producto. Solo opina quien recibió el producto:
 * lo comprueba el servidor, aquí solo se explica por qué el formulario no
 * aparece.
 */
@Component({
  selector: "app-product-reviews",
  imports: [DatePipe, FormsModule, RouterLink, StarsComponent],
  template: `
    <section class="reviews" id="opiniones" aria-labelledby="reviews-title">
      <div class="reviews-head">
        <div>
          <p class="eyebrow">OPINIONES VERIFICADAS</p>
          <h2 id="reviews-title">Lo que dicen quienes lo recibieron</h2>
        </div>
        <p class="muted">
          Solo pueden opinar clientes con un pedido entregado de este producto.
          No publicamos reseñas pagadas ni escritas por la tienda.
        </p>
      </div>

      <div class="reviews-layout">
        <div class="reviews-summary panel">
          @if (summary && summary.count > 0 && summary.average !== null) {
            <p class="reviews-average">
              {{ summary.average.toLocaleString("es-DO", { maximumFractionDigits: 1 }) }}
            </p>
            <app-stars [value]="summary.average" />
            <p class="muted">
              {{ summary.count }}
              {{ summary.count === 1 ? "opinión" : "opiniones" }}
            </p>
            <ul class="reviews-bars" aria-label="Opiniones por número de estrellas">
              @for (stars of [5, 4, 3, 2, 1]; track stars) {
                <li>
                  <span aria-hidden="true">{{ stars }} ★</span>
                  <span class="reviews-bar" aria-hidden="true"
                    ><span [style.width.%]="share(stars)"></span
                  ></span>
                  <span
                    ><span class="sr-only"
                      >{{ stars }}
                      {{ stars === 1 ? "estrella" : "estrellas" }}: </span
                    >{{ summary.counts[stars - 1] }}</span
                  >
                </li>
              }
            </ul>
          } @else if (summary) {
            <p class="reviews-empty-title">Aún no hay opiniones.</p>
            <p class="muted">
              Aparecerán aquí cuando un comprador reciba este producto y
              quiera contar qué le pareció.
            </p>
          }

          @if (!session.user()) {
            <p class="reviews-cta">
              ¿Recibiste este producto?
              <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl }"
                >Inicia sesión para opinar</a
              >
            </p>
          } @else if (mine && !mine.eligible && mine.rating === null) {
            <p class="reviews-cta muted">
              Podrás opinar cuando recibas este producto.
            </p>
          }
        </div>

        <div class="stack">
          @if (mine && (mine.eligible || mine.rating !== null)) {
            <form
              class="panel stack review-form"
              #reviewForm="ngForm"
              (ngSubmit)="save()"
            >
              <h3>{{ mine.rating === null ? "Escribe tu opinión" : "Tu opinión" }}</h3>
              @if (mine.hidden) {
                <div class="resolution">
                  <p class="field-error">
                    Tu reseña está oculta porque no cumple las normas.
                  </p>
                  <p>Motivo: {{ mine.hiddenReason }}</p>
                  <p class="muted">
                    Si la corriges, el equipo puede volver a publicarla.
                  </p>
                </div>
              }
              <fieldset class="star-input">
                <legend>Tu valoración</legend>
                @for (n of [1, 2, 3, 4, 5]; track n) {
                  <!-- Estrella llena o hueca: el estado no depende solo del color. -->
                  <label class="star-option" [class.on]="rating >= n"
                    ><input
                      class="sr-only"
                      type="radio"
                      name="rating"
                      [value]="n"
                      [(ngModel)]="rating"
                      required /><span aria-hidden="true">{{
                      rating >= n ? "★" : "☆"
                    }}</span
                    ><span class="sr-only"
                      >{{ n }} {{ n === 1 ? "estrella" : "estrellas" }}</span
                    ></label
                  >
                }
              </fieldset>
              <label
                >Comentario (opcional)<textarea
                  name="comment"
                  [(ngModel)]="comment"
                  maxlength="1000"
                  rows="4"
                  placeholder="¿Qué te gustó? ¿Qué mejorarías?"
                ></textarea>
              </label>
              <p class="form-privacy-note">
                Se publica con tu nombre y la inicial de tu apellido. No
                incluyas datos personales.
                <a routerLink="/terms" target="_blank"
                  >Normas de las reseñas<span class="sr-only">
                    (se abre en otra pestaña)</span
                  ></a
                >
              </p>
              <div class="actions compact-actions">
                <button [disabled]="busy || !rating">
                  {{ mine.rating === null ? "Publicar opinión" : "Guardar cambios" }}
                </button>
                @if (mine.rating !== null) {
                  <button
                    type="button"
                    class="secondary"
                    [disabled]="busy"
                    (click)="remove()"
                  >
                    Eliminar mi opinión
                  </button>
                }
              </div>
            </form>
          }

          @for (review of summary?.reviews ?? []; track review.id) {
            <article class="panel review-card">
              <div class="review-card-head">
                <app-stars [value]="review.rating" />
                <span class="muted">
                  {{ review.author }} ·
                  <time [attr.datetime]="review.createdAt">{{
                    review.createdAt | date: "d MMM y"
                  }}</time>
                  @if (review.updatedAt !== review.createdAt) {
                    · editada
                  }
                </span>
              </div>
              @if (review.comment) {
                <p>{{ review.comment }}</p>
              }
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ProductReviewsComponent extends Page implements OnInit {
  @Input({ required: true }) productId!: number;
  /** Avisa a la ficha para que la media de su cabecera no quede desfasada. */
  @Output() summaryChange = new EventEmitter<ReviewSummary>();
  private readonly route = inject(ActivatedRoute);
  summary: ReviewSummary | null = null;
  mine: MyReview | null = null;
  rating = 0;
  comment = "";

  get returnUrl(): string {
    return "/products/" + this.productId;
  }

  ngOnInit(): void {
    void this.load().then(() => {
      // Desde el enlace "Opinar" de Mis pedidos: el ancla llega antes de que
      // exista esta sección, así que el salto se hace al terminar de cargar.
      if (this.route.snapshot.fragment === "opiniones")
        setTimeout(() =>
          document.getElementById("opiniones")?.scrollIntoView(),
        );
    });
  }

  share(stars: number): number {
    const total = this.summary?.count ?? 0;
    return total ? (this.summary!.counts[stars - 1] / total) * 100 : 0;
  }

  save(): void {
    void this.execute(async () => {
      this.mine = await this.api.put<MyReview>(
        "/customer/reviews/" + this.productId,
        { rating: this.rating, comment: this.comment.trim() },
      );
      this.summary = await this.api.get<ReviewSummary>(
        `/catalog/products/${this.productId}/reviews`,
      );
      this.summaryChange.emit(this.summary);
      this.session.notify(
        this.mine.hidden
          ? "Cambios guardados. Tu reseña sigue oculta hasta que el equipo la revise."
          : "Gracias por tu opinión.",
      );
    });
  }

  remove(): void {
    void this.execute(async () => {
      await this.api.delete<void>("/customer/reviews/" + this.productId);
      this.rating = 0;
      this.comment = "";
      [this.mine, this.summary] = await Promise.all([
        this.api.get<MyReview>("/customer/reviews/" + this.productId),
        this.api.get<ReviewSummary>(`/catalog/products/${this.productId}/reviews`),
      ]);
      this.summaryChange.emit(this.summary);
      this.session.notify("Tu opinión se eliminó.");
    });
  }

  private load(): Promise<void> {
    return this.executeQuiet(async () => {
      const customer = this.session.user()?.role === "CUSTOMER";
      const [summary, mine] = await Promise.all([
        this.api.get<ReviewSummary>(`/catalog/products/${this.productId}/reviews`),
        customer
          ? this.api.get<MyReview>("/customer/reviews/" + this.productId)
          : Promise.resolve(null),
      ]);
      this.summary = summary;
      this.mine = mine;
      this.rating = mine?.rating ?? 0;
      this.comment = mine?.comment ?? "";
    });
  }
}
