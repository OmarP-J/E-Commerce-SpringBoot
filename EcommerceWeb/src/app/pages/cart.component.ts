import { CurrencyPipe } from "@angular/common";
import { Component, NgZone, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import {
  Address,
  Cart,
  CartLine,
  Order,
  PaymentMethods,
  PaymentProvider,
} from "../core/models";
import { Page } from "../core/page";

/** Trozo mínimo del SDK de PayPal que usamos. */
interface PaypalSdk {
  Buttons(options: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError: (error: unknown) => void;
  }): { render(container: HTMLElement): void };
}

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
        <div class="split cart-split">
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
              <h3>Forma de pago</h3>
              @if (methods?.testMode) {
                <p class="payment-note">
                  Todas las formas de pago están en modo de prueba: no se
                  realiza ningún cobro real.
                </p>
              }

              <div class="payment-options">
                @if (simulatedAvailable) {
                  <label class="payment-option">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="SIMULATED"
                      [(ngModel)]="selectedProvider"
                      (ngModelChange)="providerChanged()"
                    />
                    <span>Pago simulado</span>
                  </label>
                }
                @if (methods?.paypal?.enabled) {
                  <label class="payment-option">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="PAYPAL"
                      [(ngModel)]="selectedProvider"
                      (ngModelChange)="providerChanged()"
                    />
                    <span>PayPal</span>
                  </label>
                }
                @if (methods?.stripe?.enabled) {
                  <label class="payment-option">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="STRIPE"
                      [(ngModel)]="selectedProvider"
                      (ngModelChange)="providerChanged()"
                    />
                    <span>Tarjeta (Stripe)</span>
                  </label>
                }
              </div>

              @if (selectedProvider === "SIMULATED") {
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
              } @else if (selectedProvider === "PAYPAL") {
                @if (!deliveryReady) {
                  <p class="payment-note">
                    Completa la dirección y el teléfono para habilitar el pago.
                  </p>
                }
                <div id="paypal-buttons" class="paypal-buttons"></div>
              } @else if (selectedProvider === "STRIPE") {
                <button
                  type="button"
                  [disabled]="!deliveryReady || busy || !!currentCart.couponWarning"
                  (click)="payWithStripe()"
                >
                  {{ busy ? "Redirigiendo…" : "Pagar con tarjeta" }}
                </button>
              }
            </form>
          </aside>
        </div>
      }
    }
  `,
})
export class CartComponent extends Page implements OnInit {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  cart: Cart | null = null;
  couponCode = "";
  address = "";
  phone = "";
  acceptSimulatedPayment = false;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  methods: PaymentMethods | null = null;
  selectedProvider: PaymentProvider = "SIMULATED";
  private checkoutRequestId = crypto.randomUUID();
  private static readonly DELIVERY_KEY = "esencial-checkout-delivery";

  get itemCount(): number {
    return (
      this.cart?.items.reduce((total, line) => total + line.quantity, 0) ?? 0
    );
  }

  ngOnInit(): void {
    // El regreso de Stripe crea un pedido, así que espera a que load() suelte
    // el candado de execute; si arranca en el mismo ciclo, se descarta solo.
    void this.load().then(() => this.handleStripeReturn());
    void this.loadPaymentMethods();
  }

  /**
   * Si la consulta de formas de pago falla (backend viejo sin ese endpoint, o
   * un error pasajero), el pago simulado sigue disponible. Sin esto el carrito
   * se quedaría sin ninguna opción y nadie podría terminar la compra.
   */
  get simulatedAvailable(): boolean {
    return this.methods?.simulated ?? true;
  }

  /** Dirección y teléfono son obligatorios para cualquier forma de pago. */
  get deliveryReady(): boolean {
    return this.address.trim().length > 0 && this.phone.trim().length >= 7;
  }

  private loadPaymentMethods(): Promise<void> {
    return this.executeQuiet(async () => {
      this.methods = await this.api.get<PaymentMethods>(
        "/customer/payments/methods",
      );
      if (!this.methods.simulated) {
        if (this.methods.paypal.enabled) this.selectedProvider = "PAYPAL";
        else if (this.methods.stripe.enabled) this.selectedProvider = "STRIPE";
      }
    });
  }

  providerChanged(): void {
    if (this.selectedProvider === "PAYPAL") void this.renderPaypalButtons();
  }

  // ---------------------------------------------------------------- PayPal

  private async renderPaypalButtons(): Promise<void> {
    const config = this.methods?.paypal;
    if (!config?.enabled) return;
    try {
      await this.loadPaypalSdk(config.publicKey);
    } catch {
      this.session.notify("No se pudo cargar PayPal.", true);
      return;
    }
    // El @if de la plantilla acaba de crear el contenedor: esperamos al
    // siguiente ciclo para que exista en el DOM.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const container = document.getElementById("paypal-buttons");
    const paypal = (window as unknown as { paypal?: PaypalSdk }).paypal;
    if (!container || !paypal) return;
    container.innerHTML = "";
    paypal
      .Buttons({
        createOrder: async () => {
          if (!this.deliveryReady)
            throw new Error("Faltan los datos de entrega.");
          const order = await this.api.post<{ id: string }>(
            "/customer/payments/paypal/orders",
            {},
          );
          return order.id;
        },
        onApprove: (data: { orderID: string }) =>
          this.zone.run(() => this.finishOrder("PAYPAL", data.orderID)),
        onError: () => {
          this.zone.run(() =>
            this.session.notify(
              "No se pudo completar el pago con PayPal.",
              true,
            ),
          );
        },
      })
      .render(container);
  }

  private loadPaypalSdk(clientId: string): Promise<void> {
    if ((window as unknown as { paypal?: unknown }).paypal)
      return Promise.resolve();
    const currency = this.methods?.currency ?? "USD";
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=" +
        encodeURIComponent(clientId) +
        "&currency=" +
        encodeURIComponent(currency);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("PayPal no cargó."));
      document.head.appendChild(script);
    });
  }

  // ---------------------------------------------------------------- Stripe

  payWithStripe(): void {
    if (!this.deliveryReady) {
      this.session.notify("Completa la dirección y el teléfono.", true);
      return;
    }
    void this.execute(async () => {
      // El navegador se va a Stripe y vuelve con el componente recreado:
      // guardamos los datos de entrega para no perderlos.
      sessionStorage.setItem(
        CartComponent.DELIVERY_KEY,
        JSON.stringify({ address: this.address, phone: this.phone }),
      );
      const session = await this.api.post<{ id: string; url: string }>(
        "/customer/payments/stripe/sessions",
        {},
      );
      window.location.href = session.url;
    });
  }

  private handleStripeReturn(): void {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session");
    const cancelled = params.get("stripe_cancel");
    if (!sessionId && !cancelled) return;
    history.replaceState({}, "", "/cart");
    if (cancelled) {
      this.session.notify("Pago cancelado. Tu carrito sigue intacto.");
      return;
    }
    const saved = sessionStorage.getItem(CartComponent.DELIVERY_KEY);
    if (saved) {
      try {
        const delivery = JSON.parse(saved) as {
          address?: string;
          phone?: string;
        };
        this.address = delivery.address ?? this.address;
        this.phone = delivery.phone ?? this.phone;
      } catch {
        /* datos ilegibles: se piden de nuevo abajo */
      }
    }
    sessionStorage.removeItem(CartComponent.DELIVERY_KEY);
    if (!this.deliveryReady) {
      this.session.notify(
        "Se perdieron los datos de entrega. Vuelve a intentar la compra.",
        true,
      );
      return;
    }
    void this.execute(() => this.finishOrder("STRIPE", sessionId!));
  }

  // ------------------------------------------------------------- confirmar

  private async finishOrder(
    provider: PaymentProvider,
    reference: string,
  ): Promise<void> {
    const order = await this.api.post<Order>("/customer/checkout", {
      requestId: this.checkoutRequestId,
      address: this.address.trim(),
      phone: this.phone.trim(),
      acceptSimulatedPayment: provider === "SIMULATED",
      provider,
      paymentReference: reference,
    });
    this.checkoutRequestId = crypto.randomUUID();
    this.session.notify(
      `Pedido #${order.id} confirmado. El pago fue de prueba, no se cobró nada.`,
    );
    await this.router.navigateByUrl("/orders");
  }

  load(): Promise<void> {
    return this.execute(async () => {
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
    if (!this.cart?.items.length) return;
    if (this.selectedProvider !== "SIMULATED") return;
    if (!this.acceptSimulatedPayment) return;
    void this.execute(() => this.finishOrder("SIMULATED", ""));
  }
}
