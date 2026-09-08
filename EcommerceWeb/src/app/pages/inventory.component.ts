import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  InventoryMovement,
  InventoryMovementType,
  PageResult,
  Product,
} from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [DatePipe, FormsModule],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">ALMACÉN</p>
        <h1>Control de inventario</h1>
        <p class="page-lead">
          Registra entradas, salidas y conteos físicos. Cada cambio queda
          guardado en el historial.
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
    <section class="metrics inventory-metrics">
      <article class="metric">
        <small>Productos</small><strong>{{ products.length }}</strong
        ><span>en esta vista</span>
      </article>
      <article class="metric">
        <small>Alertas de stock</small><strong>{{ lowStock.length }}</strong
        ><span>agotados o con pocas unidades</span>
      </article>
      <article class="metric">
        <small>Agotados</small><strong>{{ outOfStock }}</strong
        ><span>requieren reposición</span>
      </article>
    </section>
    <form class="filters" (ngSubmit)="searchProducts()">
      <label class="grow"
        >Buscar producto<input
          name="search"
          [(ngModel)]="search"
          maxlength="120"
          placeholder="Busca con o sin tildes" /></label
      ><button [disabled]="busy">Buscar</button>
    </form>
    <div class="workspace-grid inventory-workspace">
      <section class="panel table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Existencias</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products; track product.id) {
              <tr>
                <td>
                  <strong>{{ product.name }}</strong
                  ><small>{{ product.categoryName }}</small>
                </td>
                <td>
                  <strong [class.field-error]="product.stock <= 5">{{
                    product.stock
                  }}</strong>
                </td>
                <td>
                  <span class="status">{{
                    product.stock === 0
                      ? "Agotado"
                      : product.active
                        ? "Disponible"
                        : "Inactivo"
                  }}</span>
                </td>
                <td>
                  <button
                    type="button"
                    class="secondary"
                    (click)="select(product)"
                  >
                    Registrar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4">No hay productos para esta búsqueda.</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
      <form
        class="panel stack"
        #movementForm="ngForm"
        (ngSubmit)="saveMovement()"
      >
        <div>
          <p class="eyebrow">MOVIMIENTO</p>
          <h2>{{ selected?.name ?? "Selecciona un producto" }}</h2>
          @if (selected) {
            <p class="muted">
              Existencias actuales: <strong>{{ selected.stock }}</strong>
            </p>
          }
        </div>
        <label
          >Tipo<select name="movementType" [(ngModel)]="movementType" required>
            <option value="ENTRY">Entrada de mercancía</option>
            <option value="EXIT">Salida de mercancía</option>
            <option value="ADJUSTMENT">Conteo físico</option>
          </select></label
        >
        <label
          >{{ movementType === "ADJUSTMENT" ? "Cantidad contada" : "Cantidad"
          }}<input
            type="number"
            name="quantity"
            [(ngModel)]="quantity"
            required
            min="1"
            max="1000000"
            step="1"
        /></label>
        <label
          >Motivo o referencia<textarea
            name="note"
            [(ngModel)]="note"
            required
            minlength="3"
            maxlength="300"
            rows="3"
            placeholder="Ej.: Recepción del proveedor #104"
          ></textarea>
        </label>
        <button [disabled]="movementForm.invalid || busy || !selected">
          Guardar movimiento
        </button>
      </form>
    </div>
    <section class="admin-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">TRAZABILIDAD</p>
          <h2>Últimos movimientos</h2>
        </div>
        <span class="muted">Hasta 100 registros</span>
      </div>
      <div class="panel table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cambio</th>
              <th>Resultado</th>
              <th>Registrado por</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            @for (movement of movements; track movement.id) {
              <tr>
                <td>{{ movement.createdAt | date: "d/M/y, h:mm a" }}</td>
                <td>
                  <strong>{{ movement.productName }}</strong>
                </td>
                <td>{{ movementLabels[movement.type] }}</td>
                <td>
                  <strong
                    >{{ movement.quantityDelta > 0 ? "+" : ""
                    }}{{ movement.quantityDelta }}</strong
                  >
                </td>
                <td>{{ movement.previousStock }} → {{ movement.newStock }}</td>
                <td>{{ movement.performedBy }}</td>
                <td>{{ movement.note }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">
                  Aún no se han registrado movimientos manuales.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class InventoryComponent extends Page implements OnInit {
  readonly movementLabels: Record<InventoryMovementType, string> = {
    ENTRY: "Entrada",
    EXIT: "Salida",
    ADJUSTMENT: "Conteo físico",
  };
  products: Product[] = [];
  lowStock: Product[] = [];
  movements: InventoryMovement[] = [];
  selected: Product | null = null;
  search = "";
  movementType: InventoryMovementType = "ENTRY";
  quantity = 1;
  note = "";
  get outOfStock(): number {
    return this.lowStock.filter((product) => product.stock === 0).length;
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    void this.execute(async () => {
      const [page, alerts, history] = await Promise.all([
        this.api.get<PageResult<Product>>(
          "/inventory/products?size=100&q=" + encodeURIComponent(this.search),
        ),
        this.api.get<Product[]>("/inventory/low-stock"),
        this.api.get<InventoryMovement[]>("/inventory/movements"),
      ]);
      this.products = page.items;
      this.lowStock = alerts;
      this.movements = history;
      this.syncSelected();
    });
  }
  searchProducts(): void {
    this.load();
  }
  select(product: Product): void {
    this.selected = product;
    this.quantity = 1;
    this.note = "";
  }
  saveMovement(): void {
    if (!this.selected) return;
    void this.execute(async () => {
      await this.api.post<InventoryMovement>(
        "/inventory/products/" + this.selected!.id + "/stock",
        {
          type: this.movementType,
          quantity: this.quantity,
          note: this.note.trim(),
        },
      );
      this.note = "";
      this.quantity = 1;
      const [page, alerts, history] = await Promise.all([
        this.api.get<PageResult<Product>>(
          "/inventory/products?size=100&q=" + encodeURIComponent(this.search),
        ),
        this.api.get<Product[]>("/inventory/low-stock"),
        this.api.get<InventoryMovement[]>("/inventory/movements"),
      ]);
      this.products = page.items;
      this.lowStock = alerts;
      this.movements = history;
      this.syncSelected();
      this.session.notify("Movimiento de inventario registrado.");
    });
  }
  private syncSelected(): void {
    if (this.selected)
      this.selected =
        this.products.find((product) => product.id === this.selected!.id) ??
        null;
  }
}
