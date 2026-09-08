import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Order, OrderStatus, statusLabels } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
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

    @if (busy && orders.length === 0) {
      <p role="status">Cargando pedidos…</p>
    }

    <div class="order-list">
      @for (order of orders; track order.id) {
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
                adminView
                  ? "Aún no hay pedidos."
                  : "Todavía no has realizado una compra."
              }}
            </h2>
            @if (!adminView) {
              <p>Cuando confirmes una compra podrás seguirla desde aquí.</p>
              <a class="button" routerLink="/catalog">Ir al catálogo</a>
            }
          </section>
        }
      }
    </div>
  `,
})
export class OrdersComponent extends Page implements OnInit {
  readonly adminView = !!inject(ActivatedRoute).snapshot.data["admin"];
  readonly labels = statusLabels;
  orders: Order[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    void this.execute(async () => {
      const path = this.adminView ? "/admin/orders" : "/customer/orders";
      this.orders = await this.api.get<Order[]>(path);
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
