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
        @for (item of cases; track item.id) {
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
              <h2>Aún no has enviado solicitudes.</h2>
              <p>Cuando necesites ayuda podrás seguir la respuesta aquí.</p>
            </section>
          }
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
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    void this.execute(async () => {
      [this.orders, this.cases] = await Promise.all([
        this.api.get<Order[]>("/customer/orders"),
        this.api.get<SupportCase[]>("/customer/support-cases"),
      ]);
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
