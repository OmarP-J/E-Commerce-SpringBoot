import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Order,
  SupportCase,
  SupportCaseStatus,
  SupportCaseType,
  statusLabels,
} from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">ATENCIÓN AL CLIENTE</p>
        <h1>Centro de soporte</h1>
        <p class="page-lead">
          Consulta pedidos y resuelve devoluciones, cambios, reembolsos y
          reclamos.
        </p>
      </div>
      <button
        type="button"
        class="secondary"
        [disabled]="busy"
        (click)="load()"
      >
        Actualizar datos
      </button>
    </div>
    <section class="metrics support-metrics">
      <article class="metric">
        <small>Solicitudes abiertas</small><strong>{{ openCases }}</strong
        ><span>pendientes de respuesta</span>
      </article>
      <article class="metric">
        <small>En revisión</small><strong>{{ reviewCases }}</strong>
      </article>
      <article class="metric">
        <small>Pedidos consultables</small><strong>{{ orders.length }}</strong>
      </article>
    </section>
    <div class="workspace-grid support-workspace">
      <section class="card-list">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">BANDEJA</p>
            <h2>Solicitudes</h2>
          </div>
          <span class="muted">{{ filteredCases.length }} casos</span>
        </div>
        <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
          <label class="grow"
            >Buscar solicitud
            <input
              name="caseSearch"
              [(ngModel)]="caseSearch"
              (ngModelChange)="caseFiltersChanged()"
              maxlength="100"
              placeholder="Caso #, pedido #, cliente o motivo"
            />
          </label>
          <label
            >Estado
            <select
              name="caseStatusFilter"
              [(ngModel)]="caseStatusFilter"
              (ngModelChange)="caseFiltersChanged()"
            >
              <option value="">Todos</option>
              <option value="OPEN">Abierto</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="RESOLVED">Resuelto</option>
            </select>
          </label>
          <small class="live-search-hint">Filtro en tiempo real mientras escribes.</small>
        </form>
        @for (item of pagedCases; track item.id) {
          <button
            type="button"
            class="panel case-button"
            [class.active]="selected?.id === item.id"
            (click)="select(item)"
          >
            <span
              ><small>CASO #{{ item.id }} · PEDIDO #{{ item.orderId }}</small
              ><strong>{{ typeLabels[item.type] }}</strong
              ><em>{{ item.customerName }}</em></span
            ><span class="badge">{{ caseStatusLabels[item.status] }}</span>
          </button>
        } @empty {
          @if (!busy) {
            <section class="empty panel">
              <h2>{{ caseSearch.trim() || caseStatusFilter ? "No hay solicitudes para este filtro." : "No hay solicitudes." }}</h2>
              <p>{{ caseSearch.trim() || caseStatusFilter ? "Prueba cambiando los términos de búsqueda." : "La bandeja está al día." }}</p>
            </section>
          }
        }
        @if (caseTotalPages > 1) {
          <nav class="pagination compact-pagination" aria-label="Páginas de solicitudes">
            <button
              type="button"
              class="secondary"
              [disabled]="busy || casePage === 0"
              (click)="turnCases(-1)"
            >Anterior</button>
            <div class="page-numbers">
              @for (pageNumber of pageNumbers(casePage, caseTotalPages); track pageNumber) {
                <button
                  type="button"
                  class="page-number"
                  [class.active]="pageNumber === casePage"
                  [attr.aria-current]="pageNumber === casePage ? 'page' : null"
                  [disabled]="busy"
                  (click)="goToCasePage(pageNumber)"
                >{{ pageNumber + 1 }}</button>
              }
            </div>
            <span class="page-summary">Página {{ casePage + 1 }} de {{ caseTotalPages }}</span>
            <button
              type="button"
              class="secondary"
              [disabled]="busy || casePage + 1 >= caseTotalPages"
              (click)="turnCases(1)"
            >Siguiente</button>
          </nav>
        }
      </section>
      <form
        class="panel stack support-editor"
        #caseEditor="ngForm"
        (ngSubmit)="save()"
      >
        @if (selected; as item) {
          <div>
            <p class="eyebrow">CASO #{{ item.id }}</p>
            <h2>{{ typeLabels[item.type] }}</h2>
            <p class="muted">
              {{ item.customerName }} · {{ item.customerEmail }} · Pedido #{{
                item.orderId
              }}
            </p>
          </div>
          <div class="resolution">
            <small>Solicitud del cliente</small>
            <p>{{ item.reason }}</p>
          </div>
          <label
            >Estado<select name="caseStatus" [(ngModel)]="status" required>
              <option value="OPEN">Abierto</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="RESOLVED">Resuelto</option>
            </select></label
          >
          <label
            >Respuesta<textarea
              name="resolution"
              [(ngModel)]="resolution"
              [required]="status !== 'OPEN'"
              [minlength]="status === 'OPEN' ? 0 : 5"
              maxlength="1000"
              rows="5"
              placeholder="Explica la decisión y los próximos pasos."
            ></textarea>
          </label>
          <label
            >Reembolso simulado<input
              type="number"
              name="refundAmount"
              [(ngModel)]="refundAmount"
              min="0"
              [max]="orderTotal(item.orderId)"
              step="0.01"
            /><small
              >Máximo:
              {{
                orderTotal(item.orderId) | currency: "DOP" : "symbol-narrow"
              }}</small
            ></label
          >
          <button [disabled]="caseEditor.invalid || busy">
            Guardar resolución
          </button>
        } @else {
          <div class="empty compact-empty">
            <h2>Selecciona una solicitud.</h2>
            <p>Aquí aparecerán los detalles y las acciones disponibles.</p>
          </div>
        }
      </form>
    </div>
    <section class="admin-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">CONSULTA</p>
          <h2>Todos los pedidos</h2>
        </div>
        <span class="muted">{{ filteredOrders.length }} pedidos</span>
      </div>
      <div class="panel table-wrap">
        <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
          <label class="grow"
            >Buscar pedido
            <input
              name="orderSearch"
              [(ngModel)]="orderSearch"
              (ngModelChange)="orderFiltersChanged()"
              maxlength="100"
              placeholder="Pedido #, cliente, teléfono, dirección o total"
            />
          </label>
          <label
            >Estado
            <select
              name="orderStatusFilter"
              [(ngModel)]="orderStatusFilter"
              (ngModelChange)="orderFiltersChanged()"
            >
              <option value="">Todos los estados</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PROCESSING">En preparación</option>
              <option value="SHIPPED">En camino</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </label>
          <small class="live-search-hint">Filtro en tiempo real mientras escribes.</small>
        </form>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Entrega</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            @for (order of pagedOrders; track order.id) {
              <tr>
                <td>
                  <strong>#{{ order.id }}</strong>
                </td>
                <td>
                  {{ order.customerName }}<small>{{ order.phone }}</small>
                </td>
                <td>{{ order.createdAt | date: "d/M/y, h:mm a" }}</td>
                <td>{{ order.address }}</td>
                <td>
                  <span class="badge">{{
                    orderStatusLabels[order.status]
                  }}</span>
                </td>
                <td>{{ order.total | currency: "DOP" : "symbol-narrow" }}</td>
                <td>{{ paymentLabel(order.paymentStatus) }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  {{ orderSearch.trim() || orderStatusFilter ? "No hay pedidos para este filtro." : "Aún no hay pedidos." }}
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (orderTotalPages > 1) {
          <nav class="pagination compact-pagination" aria-label="Páginas de pedidos en soporte">
            <button
              type="button"
              class="secondary"
              [disabled]="busy || orderPage === 0"
              (click)="turnOrders(-1)"
            >Anterior</button>
            <div class="page-numbers">
              @for (pageNumber of pageNumbers(orderPage, orderTotalPages); track pageNumber) {
                <button
                  type="button"
                  class="page-number"
                  [class.active]="pageNumber === orderPage"
                  [attr.aria-current]="pageNumber === orderPage ? 'page' : null"
                  [disabled]="busy"
                  (click)="goToOrderPage(pageNumber)"
                >{{ pageNumber + 1 }}</button>
              }
            </div>
            <span class="page-summary">Página {{ orderPage + 1 }} de {{ orderTotalPages }}</span>
            <button
              type="button"
              class="secondary"
              [disabled]="busy || orderPage + 1 >= orderTotalPages"
              (click)="turnOrders(1)"
            >Siguiente</button>
          </nav>
        }
      </div>
    </section>
  `,
})
export class SupportComponent extends Page implements OnInit {
  readonly typeLabels: Record<SupportCaseType, string> = {
    RETURN: "Devolución",
    EXCHANGE: "Cambio de producto",
    REFUND: "Reembolso",
    COMPLAINT: "Reclamo",
  };
  readonly caseStatusLabels: Record<SupportCaseStatus, string> = {
    OPEN: "Abierto",
    IN_REVIEW: "En revisión",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    RESOLVED: "Resuelto",
  };
  readonly orderStatusLabels = statusLabels;
  cases: SupportCase[] = [];
  orders: Order[] = [];
  selected: SupportCase | null = null;
  status: SupportCaseStatus = "OPEN";
  resolution = "";
  refundAmount = 0;

  caseSearch = "";
  caseStatusFilter = "";
  casePage = 0;
  readonly casePageSize = 5;

  orderSearch = "";
  orderStatusFilter = "";
  orderPage = 0;
  readonly orderPageSize = 8;

  get filteredCases(): SupportCase[] {
    const query = this.caseSearch.trim();
    return this.cases.filter((item) => {
      const matchStatus = !this.caseStatusFilter || item.status === this.caseStatusFilter;
      const matchQuery = !query || this.matchesSearch(
        query,
        item.id,
        item.orderId,
        item.customerName,
        item.customerEmail,
        item.reason,
        this.typeLabels[item.type],
        this.caseStatusLabels[item.status],
      );
      return matchStatus && matchQuery;
    });
  }

  get pagedCases(): SupportCase[] {
    return this.paginate(this.filteredCases, this.casePage, this.casePageSize);
  }

  get caseTotalPages(): number {
    return this.pageCount(this.filteredCases.length, this.casePageSize);
  }

  caseFiltersChanged(): void {
    this.casePage = 0;
  }

  goToCasePage(page: number): void {
    if (page < 0 || page >= this.caseTotalPages || page === this.casePage) return;
    this.casePage = page;
  }

  turnCases(direction: number): void {
    this.goToCasePage(this.casePage + direction);
  }

  get filteredOrders(): Order[] {
    const query = this.orderSearch.trim();
    return this.orders.filter((order) => {
      const matchStatus = !this.orderStatusFilter || order.status === this.orderStatusFilter;
      const matchQuery = !query || this.matchesSearch(
        query,
        order.id,
        order.customerName,
        order.phone,
        order.address,
        order.total,
        this.orderStatusLabels[order.status],
        this.paymentLabel(order.paymentStatus),
      );
      return matchStatus && matchQuery;
    });
  }

  get pagedOrders(): Order[] {
    return this.paginate(this.filteredOrders, this.orderPage, this.orderPageSize);
  }

  get orderTotalPages(): number {
    return this.pageCount(this.filteredOrders.length, this.orderPageSize);
  }

  orderFiltersChanged(): void {
    this.orderPage = 0;
  }

  goToOrderPage(page: number): void {
    if (page < 0 || page >= this.orderTotalPages || page === this.orderPage) return;
    this.orderPage = page;
  }

  turnOrders(direction: number): void {
    this.goToOrderPage(this.orderPage + direction);
  }

  get openCases(): number {
    return this.cases.filter((item) => item.status === "OPEN").length;
  }
  get reviewCases(): number {
    return this.cases.filter((item) => item.status === "IN_REVIEW").length;
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    void this.execute(async () => {
      [this.cases, this.orders] = await Promise.all([
        this.api.get<SupportCase[]>("/support/cases"),
        this.api.get<Order[]>("/support/orders"),
      ]);
      if (this.selected)
        this.select(
          this.cases.find((item) => item.id === this.selected!.id) ??
            this.cases[0] ??
            null,
        );
    });
  }
  select(item: SupportCase | null): void {
    this.selected = item;
    if (item) {
      this.status = item.status;
      this.resolution = item.resolution ?? "";
      this.refundAmount = item.refundAmount;
    }
  }
  orderTotal(orderId: number): number {
    return this.orders.find((order) => order.id === orderId)?.total ?? 0;
  }
  save(): void {
    if (!this.selected) return;
    void this.execute(async () => {
      const updated = await this.api.put<SupportCase>(
        "/support/cases/" + this.selected!.id,
        {
          status: this.status,
          resolution: this.resolution.trim() || null,
          refundAmount: this.refundAmount,
        },
      );
      this.cases = this.cases.map((item) =>
        item.id === updated.id ? updated : item,
      );
      this.select(updated);
      this.orders = await this.api.get<Order[]>("/support/orders");
      this.session.notify("Solicitud de soporte actualizada.");
    });
  }
  paymentLabel(value: string): string {
    return (
      {
        SIMULATED: "Aprobado",
        SIMULATED_CANCELLED: "Cancelado",
        SIMULATED_REFUNDED: "Reembolsado",
        SIMULATED_PARTIAL_REFUND: "Reembolso parcial",
      }[value] ?? value
    );
  }
}
