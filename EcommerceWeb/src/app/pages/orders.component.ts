import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Order, OrderStatus, statusLabels } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, FormsModule],
  template: `
    @if (adminView) {
      <nav
        class="admin-subnav admin-subnav-top"
        aria-label="Secciones de administración"
      >
        <a routerLink="/admin">Resumen</a
        ><a routerLink="/admin/products">Productos</a
        ><a routerLink="/admin/categories">Categorías</a
        ><a routerLink="/admin/coupons">Cupones</a
        ><a class="active" routerLink="/admin/orders">Pedidos</a
        ><a routerLink="/admin/users">Usuarios</a
        ><a routerLink="/admin/settings">Configuración</a>
      </nav>
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

          <div class="split">
            <div>
              <h3>Productos</h3>
              <ul class="order-lines">
                @for (line of order.lines; track line.productId) {
                  <li>
                    <span>{{ line.quantity }} × {{ line.productName }}</span>
                    <strong>{{
                      line.unitPrice * line.quantity
                        | currency: "DOP" : "symbol-narrow"
                    }}</strong>
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
                    {{ order.subtotal | currency: "DOP" : "symbol-narrow" }}
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
                      −{{ order.discount | currency: "DOP" : "symbol-narrow" }}
                    </dd>
                  </div>
                }
                <div class="grand">
                  <dt>Total</dt>
                  <dd>{{ order.total | currency: "DOP" : "symbol-narrow" }}</dd>
                </div>
              </dl>
            </div>
          </div>

          @if (adminView && nextStatuses(order.status).length > 0) {
            <div class="order-actions">
              <label
                >Actualizar estado
                <select #nextStatus [disabled]="busy">
                  <option value="">Selecciona un estado</option>
                  @for (status of nextStatuses(order.status); track status) {
                    <option [value]="status">{{ labels[status] }}</option>
                  }
                </select>
              </label>
              <button
                type="button"
                [disabled]="busy || !nextStatus.value"
                (click)="changeStatus(order, nextStatus.value)"
              >
                Guardar estado
              </button>
            </div>
          }
        </article>
      } @empty {
        @if (!busy) {
          <section class="empty panel">
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
