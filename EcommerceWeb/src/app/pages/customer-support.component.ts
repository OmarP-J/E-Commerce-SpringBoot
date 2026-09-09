import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Order,
  SupportCase,
  SupportCaseStatus,
  SupportCaseType,
} from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [DatePipe, FormsModule],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">ATENCIÓN AL CLIENTE</p>
        <h1>Solicitudes de ayuda</h1>
        <p class="page-lead">
          Pide una devolución, un cambio, un reembolso o informa un problema con
          tu pedido.
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
    <div class="workspace-grid">
      <form class="panel stack" #caseForm="ngForm" (ngSubmit)="create()">
        <div>
          <p class="eyebrow">NUEVA SOLICITUD</p>
          <h2>¿Cómo podemos ayudarte?</h2>
        </div>
        <label
          >Pedido<select name="orderId" [(ngModel)]="orderId" required>
            <option [ngValue]="null">Selecciona un pedido</option>
            @for (order of orders; track order.id) {
              <option [ngValue]="order.id">
                Pedido #{{ order.id }} · {{ order.createdAt | date: "d/M/y" }}
              </option>
            }
          </select></label
        >
        <label
          >Tipo<select name="type" [(ngModel)]="type" required>
            <option value="RETURN">Devolución</option>
            <option value="EXCHANGE">Cambio de producto</option>
            <option value="REFUND">Reembolso</option>
            <option value="COMPLAINT">Reclamo</option>
          </select></label
        >
        <label
          >Cuéntanos qué ocurrió<textarea
            name="reason"
            [(ngModel)]="reason"
            required
            minlength="10"
            maxlength="1000"
            rows="5"
            placeholder="Incluye el producto y los detalles que debemos revisar."
          ></textarea>
        </label>
        <button [disabled]="caseForm.invalid || busy || orderId === null">
          Enviar solicitud
        </button>
        @if (orders.length === 0 && !busy) {
          <small>Necesitas al menos un pedido para crear una solicitud.</small>
        }
      </form>
      <section class="card-list">
        @if (cases.length > 0) {
          <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
            <label class="grow"
              >Buscar solicitud
              <input
                name="customerCaseSearch"
                [(ngModel)]="search"
                (ngModelChange)="searchChanged()"
                maxlength="80"
                placeholder="Motivo, caso # o pedido #"
              />
            </label>
            <small class="live-search-hint">Filtro en vivo mientras escribes.</small>
          </form>
        }
        @for (item of pagedCases; track item.id) {
          <article class="panel support-card">
            <div class="order-head">
              <div>
                <p class="eyebrow">
                  CASO #{{ item.id }} · PEDIDO #{{ item.orderId }}
                </p>
                <h2>{{ typeLabels[item.type] }}</h2>
              </div>
              <span class="badge">{{ statusLabels[item.status] }}</span>
            </div>
            <p>{{ item.reason }}</p>
            @if (item.resolution) {
              <div class="resolution">
                <small>Respuesta de soporte</small>
                <p>{{ item.resolution }}</p>
              </div>
            }
            @if (item.refundAmount > 0) {
              <p>
                <strong>Reembolso simulado: RD$ {{ item.refundAmount }}</strong>
              </p>
            }
            <small
              >Actualizado {{ item.updatedAt | date: "d MMM y, h:mm a" }}</small
            >
          </article>
        } @empty {
          @if (!busy) {
            <section class="empty panel">
              <h2>{{ search.trim() ? "No hay solicitudes para este filtro." : "Aún no has enviado solicitudes." }}</h2>
              <p>{{ search.trim() ? "Prueba con otros términos de búsqueda." : "Cuando necesites ayuda podrás seguir la respuesta aquí." }}</p>
            </section>
          }
        }
        @if (totalPages > 1) {
          <nav class="pagination compact-pagination" aria-label="Páginas de solicitudes del cliente">
            <button
              type="button"
              class="secondary"
              [disabled]="busy || page === 0"
              (click)="turn(-1)"
            >Anterior</button>
            <div class="page-numbers">
              @for (pageNumber of pageNumbers(page, totalPages); track pageNumber) {
                <button
                  type="button"
                  class="page-number"
                  [class.active]="pageNumber === page"
                  [attr.aria-current]="pageNumber === page ? 'page' : null"
                  [disabled]="busy"
                  (click)="goToPage(pageNumber)"
                >{{ pageNumber + 1 }}</button>
              }
            </div>
            <span class="page-summary">Página {{ page + 1 }} de {{ totalPages }}</span>
            <button
              type="button"
              class="secondary"
              [disabled]="busy || page + 1 >= totalPages"
              (click)="turn(1)"
            >Siguiente</button>
          </nav>
        }
      </section>
    </div>
  `,
})
export class CustomerSupportComponent extends Page implements OnInit {
  readonly typeLabels: Record<SupportCaseType, string> = {
    RETURN: "Devolución",
    EXCHANGE: "Cambio de producto",
    REFUND: "Reembolso",
    COMPLAINT: "Reclamo",
  };
  readonly statusLabels: Record<SupportCaseStatus, string> = {
    OPEN: "Abierto",
    IN_REVIEW: "En revisión",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    RESOLVED: "Resuelto",
  };
  orders: Order[] = [];
  cases: SupportCase[] = [];
  orderId: number | null = null;
  type: SupportCaseType = "COMPLAINT";
  reason = "";
  search = "";
  page = 0;
  readonly pageSize = 4;

  get filteredCases(): SupportCase[] {
    const query = this.search.trim();
    if (!query) return this.cases;
    return this.cases.filter((item) =>
      this.matchesSearch(
        query,
        item.id,
        item.orderId,
        item.reason,
        this.typeLabels[item.type],
        this.statusLabels[item.status],
      ),
    );
  }

  get pagedCases(): SupportCase[] {
    return this.paginate(this.filteredCases, this.page, this.pageSize);
  }

  get totalPages(): number {
    return this.pageCount(this.filteredCases.length, this.pageSize);
  }

  searchChanged(): void {
    this.page = 0;
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) return;
    this.page = page;
  }

  turn(direction: number): void {
    this.goToPage(this.page + direction);
  }

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    void this.execute(async () => {
      [this.orders, this.cases] = await Promise.all([
        this.api.get<Order[]>("/customer/orders"),
        this.api.get<SupportCase[]>("/customer/support-cases"),
      ]);
      if (this.page >= this.totalPages && this.totalPages > 0) {
        this.page = this.totalPages - 1;
      }
    });
  }
  create(): void {
    if (this.orderId === null) return;
    void this.execute(async () => {
      await this.api.post<SupportCase>("/customer/support-cases", {
        orderId: this.orderId,
        type: this.type,
        reason: this.reason.trim(),
      });
      this.orderId = null;
      this.type = "COMPLAINT";
      this.reason = "";
      this.cases = await this.api.get<SupportCase[]>("/customer/support-cases");
      this.session.notify(
        "Solicitud enviada. Puedes seguir su estado en esta página.",
      );
    });
  }
}
