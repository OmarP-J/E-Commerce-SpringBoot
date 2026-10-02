import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Order, OrderStatus, statusLabels } from "../core/models";
import { Page } from "../core/page";
import { IconComponent } from "../core/icon.component";
import { AdminNavComponent } from "./admin-nav.component";

interface TimelineStep {
  label: string;
  at: string | null;
  done: boolean;
  current: boolean;
  cancelled: boolean;
}

@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    FormsModule,
    AdminNavComponent,
    IconComponent,
  ],
  template: `
    @if (adminView) {
      <app-admin-nav [top]="true" />
    }
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ adminView ? "GESTIÓN" : "TU HISTORIAL" }}</p>
        <h1>{{ adminView ? "Pedidos de clientes" : "Mis pedidos" }}</h1>
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

    <form class="filters" (ngSubmit)="$event.preventDefault()">
      <label class="grow"
        >Buscar pedido
        <input
          name="orderSearch"
          [(ngModel)]="search"
          (ngModelChange)="filtersChanged()"
          maxlength="120"
          placeholder="Número de pedido, cliente, producto o dirección"
        />
      </label>
      <label
        >Estado
        <select
          name="orderStatusFilter"
          [(ngModel)]="statusFilter"
          (ngModelChange)="filtersChanged()"
        >
          <option value="">Todos los estados</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="PROCESSING">En preparación</option>
          <option value="SHIPPED">En camino</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </label>
    </form>

    @if (busy && orders.length === 0) {
      <p role="status">Cargando pedidos…</p>
    }

    <div class="order-list">
      @for (order of pagedOrders; track order.id) {
        <article class="panel order-card">
          <div class="order-head">
            <div>
              <p class="eyebrow">PEDIDO #{{ order.id }}</p>
              <h2>{{ order.createdAt | date: "d MMMM y, h:mm a" }}</h2>
              @if (adminView) {
                <p class="muted">Cliente: {{ order.customerName }}</p>
              }
            </div>
            <span class="badge" [attr.data-status]="order.status">{{
              labels[order.status]
            }}</span>
          </div>

          <ol
            class="order-timeline"
            [attr.aria-label]="'Seguimiento del pedido ' + order.id"
          >
            @for (step of timeline(order); track step.label) {
              <li
                [class.done]="step.done"
                [class.current]="step.current"
                [class.cancelled]="step.cancelled"
                [attr.aria-current]="step.current ? 'step' : null"
              >
                <span class="timeline-dot" aria-hidden="true"></span>
                <span class="timeline-label">{{ step.label }}</span>
                @if (step.at) {
                  <time [attr.datetime]="step.at">{{
                    step.at | date: "d MMM, h:mm a"
                  }}</time>
                } @else if (!step.done) {
                  <span class="sr-only">pendiente</span>
                }
              </li>
            }
          </ol>

          <div class="split">
            <div>
              <h3>Productos</h3>
              <ul class="order-lines">
                @for (line of order.lines; track line.productId) {
                  <li>
                    <span>{{ line.quantity }} × {{ line.productName }}</span>
                    <strong>{{
                      line.unitPrice * line.quantity
                        | currency: "DOP" : "symbol"
                    }}</strong>
                    @if (!adminView && order.status === "DELIVERED") {
                      <a
                        class="line-review-link"
                        [routerLink]="['/products', line.productId]"
                        fragment="opiniones"
                        >Opinar<span class="sr-only">
                          sobre {{ line.productName }}</span
                        ></a
                      >
                    }
                  </li>
                }
              </ul>
            </div>

            <div class="stack order-details">
              <div>
                <small>Entrega</small>
                <p>{{ order.address }}</p>
                <p>{{ order.phone }}</p>
              </div>
              <div>
                <small>Pago</small>
                <p>{{ paymentLabel(order.paymentStatus) }}</p>
              </div>
              <dl class="totals compact">
                <div>
                  <dt>Subtotal</dt>
                  <dd>
                    {{ order.subtotal | currency: "DOP" : "symbol" }}
                  </dd>
                </div>
                @if (order.discount > 0) {
                  <div>
                    <dt>
                      Descuento
                      @if (order.couponCode) {
                        ({{ order.couponCode }})
                      }
                    </dt>
                    <dd>
                      −{{ order.discount | currency: "DOP" : "symbol" }}
                    </dd>
                  </div>
                }
                <div class="grand">
                  <dt>Total</dt>
                  <dd>{{ order.total | currency: "DOP" : "symbol" }}</dd>
                </div>
              </dl>
            </div>
          </div>

          @if (adminView && nextStatuses(order.status).length > 0) {
            <div class="order-actions">
              <label
                >Actualizar estado
                <!-- El estado elegido se guarda en el componente: leerlo del
                     select sin un evento enlazado no disparaba la detección de
                     cambios y el botón seguía deshabilitado. -->
                <select
                  #nextStatus
                  [disabled]="busy"
                  (change)="chosenStatus[order.id] = nextStatus.value"
                >
                  <option value="">Selecciona un estado</option>
                  @for (status of nextStatuses(order.status); track status) {
                    <option [value]="status">{{ labels[status] }}</option>
                  }
                </select>
              </label>
              <button
                type="button"
                [disabled]="busy || !chosenStatus[order.id]"
                [attr.aria-label]="'Guardar estado del pedido ' + order.id"
                (click)="changeStatus(order, chosenStatus[order.id])"
              >
                Guardar estado
              </button>
            </div>
          }
        </article>
      } @empty {
        @if (!busy) {
          <section class="empty panel">
            <span class="empty-icon" aria-hidden="true"><app-icon name="package" /></span>
            <h2>
              {{
                search.trim() || statusFilter
                  ? "No hay pedidos para este filtro."
                  : adminView
                    ? "Aún no hay pedidos."
                    : "Todavía no has realizado una compra."
              }}
            </h2>
            @if (!adminView && !search.trim() && !statusFilter) {
              <p>Cuando confirmes una compra podrás seguirla desde aquí.</p>
              <a class="button" routerLink="/catalog">Ir al catálogo</a>
            }
          </section>
        }
      }
    </div>

    @if (totalPages > 1) {
      <nav class="pagination" aria-label="Páginas de pedidos">
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
              [attr.aria-label]="'Página ' + (pageNumber + 1)"
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
  `,
})
export class OrdersComponent extends Page implements OnInit {
  readonly adminView = !!inject(ActivatedRoute).snapshot.data["admin"];
  readonly labels = statusLabels;
  orders: Order[] = [];
  search = "";
  statusFilter = "";
  page = 0;
  readonly pageSize = 6;
  /** Estado elegido en el selector de cada pedido, todavía sin guardar. */
  chosenStatus: Record<number, string> = {};

  get filteredOrders(): Order[] {
    const query = this.search.trim();
    return this.orders.filter((order) => {
      const matchStatus = !this.statusFilter || order.status === this.statusFilter;
      const matchText = !query || this.matchesSearch(
        query,
        order.id,
        order.customerName,
        order.phone,
        order.address,
        order.couponCode,
        this.labels[order.status],
        order.lines?.map((l) => l.productName).join(" "),
      );
      return matchStatus && matchText;
    });
  }

  get pagedOrders(): Order[] {
    return this.paginate(this.filteredOrders, this.page, this.pageSize);
  }

  get totalPages(): number {
    return this.pageCount(this.filteredOrders.length, this.pageSize);
  }

  filtersChanged(): void {
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
      const path = this.adminView ? "/admin/orders" : "/customer/orders";
      this.orders = await this.api.get<Order[]>(path);
      if (this.page >= this.totalPages && this.totalPages > 0) {
        this.page = this.totalPages - 1;
      }
    });
  }

  /**
   * Pasos que ve el cliente. Un pedido cancelado muestra hasta dónde llegó y
   * después la cancelación; los pedidos anteriores a las fechas por estado
   * muestran los pasos cumplidos sin fecha.
   */
  timeline(order: Order): TimelineStep[] {
    const steps: { status: OrderStatus; at: string | null }[] = [
      { status: "CONFIRMED", at: order.createdAt },
      { status: "PROCESSING", at: order.processingAt },
      { status: "SHIPPED", at: order.shippedAt },
      { status: "DELIVERED", at: order.deliveredAt },
    ];
    if (order.status === "CANCELLED") {
      return [
        ...steps
          .filter((step) => step.status === "CONFIRMED" || step.at)
          .map((step) => this.step(step.status, step.at, true, false)),
        this.step("CANCELLED", order.cancelledAt, true, true),
      ];
    }
    const reached = steps.findIndex((step) => step.status === order.status);
    return steps.map((step, index) =>
      this.step(
        step.status,
        index <= reached ? step.at : null,
        index <= reached,
        index === reached,
      ),
    );
  }

  private step(
    status: OrderStatus,
    at: string | null,
    done: boolean,
    current: boolean,
  ): TimelineStep {
    return {
      label: this.labels[status],
      at,
      done,
      current,
      cancelled: status === "CANCELLED",
    };
  }

  nextStatuses(current: OrderStatus): OrderStatus[] {
    switch (current) {
      case "CONFIRMED":
        return ["PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["SHIPPED", "CANCELLED"];
      case "SHIPPED":
        return ["DELIVERED"];
      case "DELIVERED":
      case "CANCELLED":
        return [];
    }
  }

  changeStatus(order: Order, value: string): void {
    if (
      !this.isOrderStatus(value) ||
      !this.nextStatuses(order.status).includes(value)
    )
      return;

    void this.execute(async () => {
      const updated = await this.api.put<Order>(
        "/admin/orders/" + order.id + "/status",
        { status: value },
      );
      delete this.chosenStatus[order.id];
      this.orders = this.orders.map((item) =>
        item.id === updated.id ? updated : item,
      );
      this.session.notify(
        `Pedido #${order.id} actualizado a “${this.labels[updated.status]}”.`,
      );
    });
  }

  paymentLabel(paymentStatus: string): string {
    if (paymentStatus === "SIMULATED") return "Pago simulado aprobado";
    if (paymentStatus === "SIMULATED_CANCELLED")
      return "Pago simulado cancelado";
    return paymentStatus.replaceAll("_", " ").toLowerCase();
  }

  private isOrderStatus(value: string): value is OrderStatus {
    return value in this.labels;
  }
}
