import { CurrencyPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Address, Cart, CartLine, Order } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [CurrencyPipe, FormsModule, RouterLink],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">TU COMPRA</p>
        <h1>Carrito</h1>
      </div>
      @if (cart) {
        <span class="muted">{{ itemCount }} artículos</span>
      }
    </div>

    @if (busy && !cart) {
      <p role="status">Cargando carrito…</p>
    }

    @if (cart; as currentCart) {
      @if (currentCart.items.length === 0) {
        <section class="empty panel">
          <h2>Tu carrito está vacío.</h2>
          <p>Explora el catálogo y añade los productos que quieras comprar.</p>
          <a class="button" routerLink="/catalog">Ver productos</a>
        </section>
      } @else {
        <div class="split">
          <section class="stack" aria-label="Productos del carrito">
            @for (line of currentCart.items; track line.product.id) {
              <article class="panel line-item">
                @if (line.product.imageUrl) {
                  <img
                    [src]="line.product.imageUrl"
                    [alt]="line.product.name"
                  />
                } @else {
                  <span class="line-thumb" aria-hidden="true">{{
                    line.product.name.charAt(0)
                  }}</span>
                }
                <div>
                  <p class="eyebrow">{{ line.product.categoryName }}</p>
                  <h2>{{ line.product.name }}</h2>
                  <p class="muted">
                    {{
                      line.product.price | currency: "DOP" : "symbol-narrow"
                    }}
                    por unidad
                  </p>
                  <div class="quantity" aria-label="Cantidad">
                    <button
                      type="button"
                      class="secondary"
                      [disabled]="busy"
                      (click)="setQuantity(line, line.quantity - 1)"
                      aria-label="Quitar una unidad"
                    >
                      −
                    </button>
                    <strong>{{ line.quantity }}</strong>
                    <button
                      type="button"
                      class="secondary"
                      [disabled]="busy || line.quantity >= line.product.stock"
                      (click)="setQuantity(line, line.quantity + 1)"
                      aria-label="Añadir una unidad"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div class="cart-line-total">
                  <strong>{{
                    line.lineTotal | currency: "DOP" : "symbol-narrow"
                  }}</strong>
                  <button
                    type="button"
                    class="text-button"
                    [disabled]="busy"
                    (click)="setQuantity(line, 0)"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            }
          </section>

          <aside class="panel stack summary">
            <div>
              <p class="eyebrow">RESUMEN</p>
              <h2>Total del pedido</h2>
            </div>

            @if (!currentCart.couponCode) {
              <form
                class="stack"
                #couponForm="ngForm"
                (ngSubmit)="applyCoupon()"
              >
                <label
                  >Código de cupón
                  <input
                    name="coupon"
                    [(ngModel)]="couponCode"
                    required
                    minlength="3"
                    maxlength="30"
                    pattern="[A-Za-z0-9_-]+"
                    autocomplete="off"
                    placeholder="Ej.: BIENVENIDA10"
                  />
                </label>
                <button
                  class="secondary"
                  [disabled]="couponForm.invalid || busy"
                >
                  Aplicar cupón
                </button>
              </form>
            } @else {
              <div class="coupon-row">
                <span
                  ><small>Cupón aplicado</small
                  ><strong>{{ currentCart.couponCode }}</strong></span
                >
                <button
                  type="button"
                  class="text-button"
                  [disabled]="busy"
                  (click)="removeCoupon()"
                >
                  Quitar
                </button>
              </div>
            }

            @if (currentCart.couponWarning) {
              <p class="field-error" role="alert">
                {{ currentCart.couponWarning }}
              </p>
            }

            <dl class="totals">
              <div>
                <dt>Subtotal</dt>
                <dd>
                  {{ currentCart.subtotal | currency: "DOP" : "symbol-narrow" }}
                </dd>
              </div>
              @if (currentCart.discount > 0) {
                <div>
                  <dt>Descuento</dt>
                  <dd>
                    −{{
                      currentCart.discount | currency: "DOP" : "symbol-narrow"
                    }}
                  </dd>
                </div>
              }
              <div class="grand">
                <dt>Total</dt>
                <dd>
                  {{ currentCart.total | currency: "DOP" : "symbol-narrow" }}
                </dd>
              </div>
            </dl>

            <form class="stack" #checkoutForm="ngForm" (ngSubmit)="checkout()">
              <h3>Datos de entrega</h3>
              @if (addresses.length > 0) {
                <label
                  >Usar una dirección guardada
                  <select
                    name="savedAddress"
                    [(ngModel)]="selectedAddressId"
                    (ngModelChange)="useAddress($event)"
                  >
                    <option [ngValue]="null">Escribir otra dirección</option>
                    @for (saved of addresses; track saved.id) {
                      <option [ngValue]="saved.id">
                        {{ saved.label }} — {{ saved.city }}
                      </option>
                    }
                  </select>
                </label>
              }
              <label
                >Dirección
                <textarea
                  name="address"
                  [(ngModel)]="address"
                  required
                  maxlength="300"
                  rows="3"
                  autocomplete="street-address"
                  placeholder="Calle, número, sector y ciudad"
                ></textarea>
              </label>
              <label
                >Teléfono
                <input
                  type="tel"
                  name="phone"
                  [(ngModel)]="phone"
                  required
                  minlength="7"
                  maxlength="30"
                  pattern="[+0-9() .-]+"
                  autocomplete="tel"
                  placeholder="809-555-0100"
                />
              </label>
              <label class="check-row">
                <input
                  type="checkbox"
                  name="simulatedPayment"
                  [(ngModel)]="acceptSimulatedPayment"
                  required
                />
                <span
                  >Entiendo que este es un pago simulado y no se realizará
                  ningún cobro.</span
                >
              </label>
              <button
                [disabled]="
                  checkoutForm.invalid || busy || !!currentCart.couponWarning
                "
              >
                {{ busy ? "Procesando…" : "Confirmar compra simulada" }}
              </button>
            </form>
          </aside>
        </div>
      }
    }
  `,
})
export class CartComponent extends Page implements OnInit {
  private readonly router = inject(Router);

  cart: Cart | null = null;
  couponCode = "";
  address = "";
  phone = "";
  acceptSimulatedPayment = false;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  private checkoutRequestId = crypto.randomUUID();

  get itemCount(): number {
    return (
      this.cart?.items.reduce((total, line) => total + line.quantity, 0) ?? 0
    );
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    void this.execute(async () => {
      [this.cart, this.addresses] = await Promise.all([
        this.api.get<Cart>("/customer/cart"),
        this.api.get<Address[]>("/customer/addresses"),
      ]);
      this.couponCode = this.cart.couponCode ?? "";
      const preferred = this.addresses.find((saved) => saved.defaultAddress);
      if (preferred && !this.address) this.useAddress(preferred.id);
    });
  }

  setQuantity(line: CartLine, quantity: number): void {
    const safeQuantity = Math.max(
      0,
      Math.min(quantity, line.product.stock, 99),
    );
    void this.execute(async () => {
      this.cart = await this.api.put<Cart>(
        "/customer/cart/items/" + line.product.id,
        { quantity: safeQuantity },
      );
      if (safeQuantity === 0)
        this.session.notify("Producto eliminado del carrito.");
    });
  }

  applyCoupon(): void {
    const code = this.couponCode.trim().toUpperCase();
    if (!code) return;

    void this.execute(async () => {
      this.cart = await this.api.put<Cart>("/customer/cart/coupon", { code });
      this.couponCode = this.cart.couponCode ?? "";
      this.session.notify("Cupón aplicado.");
    });
  }

  removeCoupon(): void {
    void this.execute(async () => {
      this.cart = await this.api.delete<Cart>("/customer/cart/coupon");
      this.couponCode = "";
      this.session.notify("Cupón retirado.");
    });
  }

  useAddress(id: number | null): void {
    this.selectedAddressId = id;
    const saved = this.addresses.find((address) => address.id === id);
    if (!saved) return;
    this.address = `${saved.addressLine}, ${saved.city}`;
    this.phone = saved.phone;
  }

  checkout(): void {
    if (!this.cart?.items.length || !this.acceptSimulatedPayment) return;

    void this.execute(async () => {
      const order = await this.api.post<Order>("/customer/checkout", {
        requestId: this.checkoutRequestId,
        address: this.address.trim(),
        phone: this.phone.trim(),
        acceptSimulatedPayment: true,
      });

      this.checkoutRequestId = crypto.randomUUID();
      this.session.notify(
        `Pedido #${order.id} confirmado. El pago fue simulado.`,
      );
      await this.router.navigateByUrl("/orders");
    });
  }
}
