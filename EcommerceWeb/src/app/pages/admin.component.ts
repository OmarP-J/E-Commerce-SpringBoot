import { CurrencyPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import {
  Analytics,
  Category,
  Coupon,
  PageResult,
  Product,
  roleLabels,
  StoreSettings,
  User,
  UserRole,
} from "../core/models";
import { Page } from "../core/page";

interface ProductDraft {
  id: number | null;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  categoryId: number | null;
  active: boolean;
  version: number;
}

interface CategoryDraft {
  id: number | null;
  name: string;
  description: string;
}

interface CouponDraft {
  id: number | null;
  code: string;
  discountPercent: number;
  expiresOn: string;
  active: boolean;
}

@Component({
  imports: [CurrencyPipe, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <div class="section-heading admin-heading">
      <div>
        <p class="eyebrow">PANEL DE CONTROL</p>
        <h1>{{ pageTitle }}</h1>
        <p class="page-lead">{{ pageDescription }}</p>
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

    <nav class="admin-subnav" aria-label="Secciones de administración">
      <a
        routerLink="/admin"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        >Resumen</a
      >
      <a routerLink="/admin/products" routerLinkActive="active">Productos</a>
      <a routerLink="/admin/categories" routerLinkActive="active">Categorías</a>
      <a routerLink="/admin/coupons" routerLinkActive="active">Cupones</a>
      <a routerLink="/admin/orders" routerLinkActive="active">Pedidos</a>
      <a routerLink="/admin/users" routerLinkActive="active">Usuarios</a>
      <a routerLink="/admin/settings" routerLinkActive="active"
        >Configuración</a
      >
    </nav>

    @if (section === "dashboard" && analytics; as data) {
      <section class="metrics" aria-label="Resumen de la tienda">
        <article class="metric">
          <small>Ventas simuladas</small
          ><strong>{{
            data.simulatedSales | currency: "DOP" : "symbol-narrow"
          }}</strong>
        </article>
        <article class="metric">
          <small>Ganancia estimada</small
          ><strong>{{
            data.simulatedProfit | currency: "DOP" : "symbol-narrow"
          }}</strong
          ><span>Ventas menos costos y reembolsos</span>
        </article>
        <article class="metric">
          <small>Pedidos</small><strong>{{ data.orders }}</strong
          ><span>{{ data.cancelledOrders }} cancelados</span>
        </article>
        <article class="metric">
          <small>Clientes</small><strong>{{ data.customers }}</strong>
        </article>
        <article class="metric">
          <small>Productos</small><strong>{{ data.products }}</strong
          ><span>{{ data.lowStockProducts }} con pocas existencias</span>
        </article>
        <article class="metric">
          <small>Pedido promedio</small
          ><strong>{{
            data.averageOrderValue | currency: "DOP" : "symbol-narrow"
          }}</strong
          ><span>{{ data.openSupportCases }} casos de soporte abiertos</span>
        </article>
      </section>
      <section class="admin-shortcuts" aria-label="Accesos rápidos">
        <a routerLink="/admin/products"
          ><span>01</span>
          <div>
            <strong>Gestionar productos</strong
            ><small>Precios, existencias e imágenes</small>
          </div>
          <b>→</b></a
        >
        <a routerLink="/admin/categories"
          ><span>02</span>
          <div>
            <strong>Organizar categorías</strong
            ><small>Agrupa el catálogo con claridad</small>
          </div>
          <b>→</b></a
        >
        <a routerLink="/admin/coupons"
          ><span>03</span>
          <div>
            <strong>Preparar cupones</strong
            ><small>Promociones y fechas de vigencia</small>
          </div>
          <b>→</b></a
        >
        <a routerLink="/admin/orders"
          ><span>04</span>
          <div>
            <strong>Revisar pedidos</strong
            ><small>Consulta y actualiza su estado</small>
          </div>
          <b>→</b></a
        >
        <a routerLink="/admin/users"
          ><span>05</span>
          <div>
            <strong>Asignar permisos</strong
            ><small>Roles para el equipo y los clientes</small>
          </div>
          <b>→</b></a
        >
        <a routerLink="/admin/settings"
          ><span>06</span>
          <div>
            <strong>Configurar la tienda</strong
            ><small>Nombre, soporte y alerta de inventario</small>
          </div>
          <b>→</b></a
        >
      </section>
    }

    <section
      class="admin-section"
      [class.hidden-section]="section !== 'products'"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">CATÁLOGO</p>
          <h2>Productos</h2>
        </div>
        <span class="muted">{{ totalProducts }} registros</span>
      </div>

      <form class="filters" (ngSubmit)="loadProducts(true)">
        <label class="grow"
          >Buscar
          <input
            name="productSearch"
            [(ngModel)]="search"
            (ngModelChange)="productFiltersChanged()"
            maxlength="120"
            placeholder="Nombre del producto"
          />
        </label>
        <label
          >Categoría
          <select
            name="productCategory"
            [(ngModel)]="categoryFilter"
            (ngModelChange)="productFiltersChanged(0)"
          >
            <option value="">Todas</option>
            @for (category of categories; track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </label>
        <button [disabled]="busy">Actualizar ahora</button>
      </form>

      <div class="split">
        <form
          class="panel stack"
          #productEditor="ngForm"
          (ngSubmit)="saveProduct()"
        >
          <div class="section-heading">
            <h3>
              {{
                productDraft.id === null ? "Nuevo producto" : "Editar producto"
              }}
            </h3>
            @if (productDraft.id !== null) {
              <button
                type="button"
                class="text-button"
                (click)="resetProduct()"
              >
                Cancelar
              </button>
            }
          </div>
          <label
            >Nombre<input
              name="productName"
              [(ngModel)]="productDraft.name"
              required
              maxlength="120"
          /></label>
          <label
            >Descripción<textarea
              name="productDescription"
              [(ngModel)]="productDraft.description"
              required
              maxlength="2000"
              rows="4"
            ></textarea>
          </label>
          <div class="form-row">
            <label
              >Precio
              <input
                type="number"
                name="productPrice"
                [(ngModel)]="productDraft.price"
                required
                min="0.01"
                max="999999999.99"
                step="0.01"
              />
            </label>
            <label
              >Costo
              <input
                type="number"
                name="productCost"
                [(ngModel)]="productDraft.cost"
                required
                min="0"
                max="999999999.99"
                step="0.01"
              />
            </label>
          </div>
          <div class="form-row">
            <label
              >Existencias
              <input
                type="number"
                name="productStock"
                [(ngModel)]="productDraft.stock"
                required
                min="0"
                max="1000000"
                step="1"
              />
            </label>
          </div>
          <label
            >Categoría
            <select
              name="productCategoryId"
              [(ngModel)]="productDraft.categoryId"
              required
            >
              <option [ngValue]="null">Selecciona una categoría</option>
              @for (category of categories; track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>
          <label class="check-row"
            ><input
              type="checkbox"
              name="productActive"
              [(ngModel)]="productDraft.active"
            /><span>Producto visible y disponible</span></label
          >
          <button
            [disabled]="
              productEditor.invalid || busy || productDraft.categoryId === null
            "
          >
            {{
              busy
                ? "Guardando…"
                : productDraft.id === null
                  ? "Crear producto"
                  : "Guardar cambios"
            }}
          </button>
        </form>

        <div class="table-wrap panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio / costo</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                    <strong>{{
                      product.price | currency: "DOP" : "symbol-narrow"
                    }}</strong
                    ><small
                      >Costo:
                      {{
                        product.cost ?? 0 | currency: "DOP" : "symbol-narrow"
                      }}</small
                    >
                  </td>
                  <td>
                    <span [class.field-error]="product.stock < 5">{{
                      product.stock
                    }}</span>
                  </td>
                  <td>
                    <span class="status">{{
                      product.active ? "Activo" : "Inactivo"
                    }}</span>
                  </td>
                  <td>
                    <div class="actions compact-actions">
                      <button
                        type="button"
                        class="secondary"
                        [disabled]="busy"
                        (click)="editProduct(product)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="secondary"
                        [disabled]="busy"
                        (click)="changeProductAvailability(product)"
                      >
                        {{ product.active ? "Desactivar" : "Activar" }}
                      </button>
                      <label class="button secondary file-button">
                        Imagen<input
                          type="file"
                          accept="image/png,image/jpeg"
                          [disabled]="busy"
                          (change)="uploadImage(product, $event)"
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">No hay productos para estos filtros.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (productTotalPages > 1) {
        <nav class="pagination" aria-label="Páginas de productos">
          <button
            type="button"
            class="secondary"
            [disabled]="busy || productPage === 0"
            (click)="turnProducts(-1)"
          >
            Anterior
          </button>
          <div class="page-numbers">
            @for (pageNumber of pageNumbers(productPage, productTotalPages); track pageNumber) {
              <button
                type="button"
                class="page-number"
                [class.active]="pageNumber === productPage"
                [attr.aria-current]="pageNumber === productPage ? 'page' : null"
                [disabled]="busy"
                (click)="goToProductPage(pageNumber)"
              >{{ pageNumber + 1 }}</button>
            }
          </div>
          <span class="page-summary">Página {{ productPage + 1 }} de {{ productTotalPages }}</span>
          <button
            type="button"
            class="secondary"
            [disabled]="busy || productPage + 1 >= productTotalPages"
            (click)="turnProducts(1)"
          >
            Siguiente
          </button>
        </nav>
      }
    </section>

    <section
      class="admin-section"
      [class.hidden-section]="section !== 'categories'"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">ORGANIZACIÓN</p>
          <h2>Categorías</h2>
        </div>
        <span class="muted">{{ categories.length }} categorías</span>
      </div>
      <div class="split">
        <form
          class="panel stack"
          #categoryEditor="ngForm"
          (ngSubmit)="saveCategory()"
        >
          <div class="section-heading">
            <h3>
              {{
                categoryDraft.id === null
                  ? "Nueva categoría"
                  : "Editar categoría"
              }}
            </h3>
            @if (categoryDraft.id !== null) {
              <button
                type="button"
                class="text-button"
                (click)="resetCategory()"
              >
                Cancelar
              </button>
            }
          </div>
          <label
            >Nombre<input
              name="categoryName"
              [(ngModel)]="categoryDraft.name"
              required
              maxlength="80"
          /></label>
          <label
            >Descripción<textarea
              name="categoryDescription"
              [(ngModel)]="categoryDraft.description"
              maxlength="500"
              rows="3"
            ></textarea>
          </label>
          <button
            [disabled]="
              categoryEditor.invalid || busy || !categoryDraft.name.trim()
            "
          >
            {{
              categoryDraft.id === null
                ? "Crear categoría"
                : "Guardar categoría"
            }}
          </button>
        </form>

        <div class="panel table-wrap">
          <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
            <label class="grow"
              >Buscar categoría
              <input
                name="categorySearch"
                [(ngModel)]="categorySearch"
                (ngModelChange)="categorySearchChanged()"
                maxlength="80"
                placeholder="Nombre o descripción"
              />
            </label>
            <small class="live-search-hint">Filtro en vivo mientras escribes.</small>
          </form>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (category of pagedCategories; track category.id) {
                <tr>
                  <td>
                    <strong>{{ category.name }}</strong>
                  </td>
                  <td>{{ category.description || "Sin descripción" }}</td>
                  <td>
                    <div class="actions compact-actions">
                      <button
                        type="button"
                        class="secondary"
                        [disabled]="busy"
                        (click)="editCategory(category)"
                      >
                        Editar</button
                      ><button
                        type="button"
                        class="text-button"
                        [disabled]="busy"
                        (click)="deleteCategory(category)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3">{{ categorySearch.trim() ? "No hay categorías para esta búsqueda." : "Aún no hay categorías." }}</td>
                </tr>
              }
            </tbody>
          </table>
          @if (categoryTotalPages > 1) {
            <nav class="pagination compact-pagination" aria-label="Páginas de categorías">
              <button
                type="button"
                class="secondary"
                [disabled]="busy || categoryPage === 0"
                (click)="turnCategories(-1)"
              >Anterior</button>
              <div class="page-numbers">
                @for (pageNumber of pageNumbers(categoryPage, categoryTotalPages); track pageNumber) {
                  <button
                    type="button"
                    class="page-number"
                    [class.active]="pageNumber === categoryPage"
                    [attr.aria-current]="pageNumber === categoryPage ? 'page' : null"
                    [disabled]="busy"
                    (click)="goToCategoryPage(pageNumber)"
                  >{{ pageNumber + 1 }}</button>
                }
              </div>
              <span class="page-summary">Página {{ categoryPage + 1 }} de {{ categoryTotalPages }}</span>
              <button
                type="button"
                class="secondary"
                [disabled]="busy || categoryPage + 1 >= categoryTotalPages"
                (click)="turnCategories(1)"
              >Siguiente</button>
            </nav>
          }
        </div>
      </div>
    </section>

    <section
      class="admin-section"
      [class.hidden-section]="section !== 'coupons'"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">PROMOCIONES</p>
          <h2>Cupones</h2>
        </div>
        <span class="muted">{{ coupons.length }} cupones</span>
      </div>
      <div class="split">
        <form
          class="panel stack"
          #couponEditor="ngForm"
          (ngSubmit)="saveCoupon()"
        >
          <div class="section-heading">
            <h3>
              {{ couponDraft.id === null ? "Nuevo cupón" : "Editar cupón" }}
            </h3>
            @if (couponDraft.id !== null) {
              <button type="button" class="text-button" (click)="resetCoupon()">
                Cancelar
              </button>
            }
          </div>
          <label
            >Código<input
              name="couponCode"
              [(ngModel)]="couponDraft.code"
              required
              minlength="3"
              maxlength="30"
              pattern="[A-Za-z0-9_-]+"
              autocomplete="off"
              placeholder="VERANO10"
          /></label>
          <div class="form-row">
            <label
              >Descuento (%)<input
                type="number"
                name="couponDiscount"
                [(ngModel)]="couponDraft.discountPercent"
                required
                min="1"
                max="100"
                step="1"
            /></label>
            <label
              >Válido hasta<input
                type="date"
                name="couponExpiry"
                [(ngModel)]="couponDraft.expiresOn"
                required
                [min]="couponDraft.active ? today : ''"
            /></label>
          </div>
          <label class="check-row"
            ><input
              type="checkbox"
              name="couponActive"
              [(ngModel)]="couponDraft.active"
            /><span>Cupón activo</span></label
          >
          <button [disabled]="couponEditor.invalid || busy">
            {{ couponDraft.id === null ? "Crear cupón" : "Guardar cupón" }}
          </button>
        </form>

        <div class="panel table-wrap">
          <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
            <label class="grow"
              >Buscar cupón
              <input
                name="couponSearch"
                [(ngModel)]="couponSearch"
                (ngModelChange)="couponSearchChanged()"
                maxlength="30"
                placeholder="Código, descuento o estado"
              />
            </label>
            <small class="live-search-hint">Filtro en vivo mientras escribes.</small>
          </form>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Vence</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (coupon of pagedCoupons; track coupon.id) {
                <tr>
                  <td>
                    <strong>{{ coupon.code }}</strong>
                  </td>
                  <td>{{ coupon.discountPercent }}%</td>
                  <td>{{ coupon.expiresOn }}</td>
                  <td>
                    <span class="status">{{
                      coupon.active ? "Activo" : "Inactivo"
                    }}</span>
                  </td>
                  <td>
                    <div class="actions compact-actions">
                      <button
                        type="button"
                        class="secondary"
                        [disabled]="busy"
                        (click)="editCoupon(coupon)"
                      >
                        Editar</button
                      ><button
                        type="button"
                        class="secondary"
                        [disabled]="busy"
                        (click)="changeCouponAvailability(coupon)"
                      >
                        {{ coupon.active ? "Desactivar" : "Activar" }}
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">{{ couponSearch.trim() ? "No hay cupones para esta búsqueda." : "Aún no hay cupones." }}</td>
                </tr>
              }
            </tbody>
          </table>
          @if (couponTotalPages > 1) {
            <nav class="pagination compact-pagination" aria-label="Páginas de cupones">
              <button
                type="button"
                class="secondary"
                [disabled]="busy || couponPage === 0"
                (click)="turnCoupons(-1)"
              >Anterior</button>
              <div class="page-numbers">
                @for (pageNumber of pageNumbers(couponPage, couponTotalPages); track pageNumber) {
                  <button
                    type="button"
                    class="page-number"
                    [class.active]="pageNumber === couponPage"
                    [attr.aria-current]="pageNumber === couponPage ? 'page' : null"
                    [disabled]="busy"
                    (click)="goToCouponPage(pageNumber)"
                  >{{ pageNumber + 1 }}</button>
                }
              </div>
              <span class="page-summary">Página {{ couponPage + 1 }} de {{ couponTotalPages }}</span>
              <button
                type="button"
                class="secondary"
                [disabled]="busy || couponPage + 1 >= couponTotalPages"
                (click)="turnCoupons(1)"
              >Siguiente</button>
            </nav>
          }
        </div>
      </div>
    </section>

    <section class="admin-section" [class.hidden-section]="section !== 'users'">
      <div class="section-heading">
        <div>
          <p class="eyebrow">EQUIPO Y ACCESO</p>
          <h2>Usuarios y permisos</h2>
        </div>
        <span class="muted">{{ users.length }} usuarios</span>
      </div>
      <div class="panel table-wrap">
        <form class="filters compact-filters" (ngSubmit)="$event.preventDefault()">
          <label class="grow"
            >Buscar usuario
            <input
              name="userSearch"
              [(ngModel)]="userSearch"
              (ngModelChange)="userFiltersChanged()"
              maxlength="120"
              placeholder="Nombre o correo del usuario"
            />
          </label>
          <label
            >Filtrar por rol
            <select
              name="userRoleFilter"
              [(ngModel)]="userRoleFilter"
              (ngModelChange)="userFiltersChanged()"
            >
              <option value="">Todos los roles</option>
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
              <option value="INVENTORY_MANAGER">Gestor de inventario</option>
              <option value="CUSTOMER_SUPPORT">Soporte al cliente</option>
            </select>
          </label>
          <small class="live-search-hint">Filtro en vivo mientras escribes.</small>
        </form>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Correo</th>
              <th>Rol actual</th>
              <th>Asignar rol</th>
            </tr>
          </thead>
          <tbody>
            @for (user of pagedUsers; track user.id) {
              <tr>
                <td>
                  <strong>{{ user.name }}</strong>
                  @if (user.id === session.user()?.id) {
                    <small>Tu sesión</small>
                  }
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="status">{{ roleLabels[user.role] }}</span>
                </td>
                <td>
                  <select
                    #role
                    [value]="user.role"
                    [disabled]="busy || user.id === session.user()?.id"
                    (change)="changeRole(user, role.value)"
                  >
                    <option value="CUSTOMER">Cliente</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="INVENTORY_MANAGER">
                      Gestor de inventario
                    </option>
                    <option value="CUSTOMER_SUPPORT">Soporte al cliente</option>
                  </select>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4">{{ userSearch.trim() || userRoleFilter ? "No hay usuarios para este filtro." : "Aún no hay usuarios." }}</td>
              </tr>
            }
          </tbody>
        </table>
        @if (userTotalPages > 1) {
          <nav class="pagination compact-pagination" aria-label="Páginas de usuarios">
            <button
              type="button"
              class="secondary"
              [disabled]="busy || userPage === 0"
              (click)="turnUsers(-1)"
            >Anterior</button>
            <div class="page-numbers">
              @for (pageNumber of pageNumbers(userPage, userTotalPages); track pageNumber) {
                <button
                  type="button"
                  class="page-number"
                  [class.active]="pageNumber === userPage"
                  [attr.aria-current]="pageNumber === userPage ? 'page' : null"
                  [disabled]="busy"
                  (click)="goToUserPage(pageNumber)"
                >{{ pageNumber + 1 }}</button>
              }
            </div>
            <span class="page-summary">Página {{ userPage + 1 }} de {{ userTotalPages }}</span>
            <button
              type="button"
              class="secondary"
              [disabled]="busy || userPage + 1 >= userTotalPages"
              (click)="turnUsers(1)"
            >Siguiente</button>
          </nav>
        }
      </div>
    </section>

    <section
      class="admin-section"
      [class.hidden-section]="section !== 'settings'"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">CONFIGURACIÓN GENERAL</p>
          <h2>Datos de la tienda</h2>
        </div>
      </div>
      @if (settings) {
        <form
          class="panel stack settings-form"
          #settingsForm="ngForm"
          (ngSubmit)="saveSettings()"
        >
          <label
            >Nombre de la tienda<input
              name="storeName"
              [(ngModel)]="settings.storeName"
              required
              maxlength="80"
          /></label>
          <label
            >Correo de soporte<input
              type="email"
              name="supportEmail"
              [(ngModel)]="settings.supportEmail"
              required
              email
              maxlength="254"
          /></label>
          <label
            >Alerta de pocas existencias
            <input
              type="number"
              name="lowStockThreshold"
              [(ngModel)]="settings.lowStockThreshold"
              required
              min="0"
              max="1000"
              step="1"
            />
            <small
              >Un producto aparece como alerta cuando su stock es igual o menor
              a esta cantidad.</small
            >
          </label>
          <button [disabled]="settingsForm.invalid || busy">
            Guardar configuración
          </button>
        </form>
      }
    </section>
  `,
})
export class AdminComponent extends Page implements OnInit {
  readonly section = inject(ActivatedRoute).snapshot.data["section"] as
    | "dashboard"
    | "products"
    | "categories"
    | "coupons"
    | "users"
    | "settings";
  readonly today = new Date().toISOString().slice(0, 10);
  readonly roleLabels = roleLabels;

  get pageTitle(): string {
    return {
      dashboard: "Administración",
      products: "Productos",
      categories: "Categorías",
      coupons: "Cupones",
      users: "Usuarios y permisos",
      settings: "Configuración",
    }[this.section];
  }

  get pageDescription(): string {
    return {
      dashboard: "Una vista rápida de la actividad de tu tienda.",
      products: "Crea, edita y organiza los artículos del catálogo.",
      categories: "Mantén la colección ordenada y fácil de explorar.",
      coupons: "Configura descuentos para tus próximas campañas.",
      users: "Asigna el acceso correcto a cada integrante del equipo.",
      settings:
        "Define los datos generales y el nivel de alerta de inventario.",
    }[this.section];
  }

  analytics: Analytics | null = null;
  products: Product[] = [];
  categories: Category[] = [];
  coupons: Coupon[] = [];
  users: User[] = [];
  settings: StoreSettings | null = null;
  search = "";
  categoryFilter = "";
  productPage = 0;
  productTotalPages = 0;
  totalProducts = 0;

  categorySearch = "";
  categoryPage = 0;
  readonly categoryPageSize = 8;

  couponSearch = "";
  couponPage = 0;
  readonly couponPageSize = 8;

  userSearch = "";
  userRoleFilter = "";
  userPage = 0;
  readonly userPageSize = 8;

  productDraft: ProductDraft = this.emptyProduct();
  categoryDraft: CategoryDraft = this.emptyCategory();
  couponDraft: CouponDraft = this.emptyCoupon();

  get filteredCategories(): Category[] {
    const query = this.categorySearch.trim();
    if (!query) return this.categories;
    return this.categories.filter((cat) =>
      this.matchesSearch(query, cat.name, cat.description)
    );
  }

  get pagedCategories(): Category[] {
    return this.paginate(this.filteredCategories, this.categoryPage, this.categoryPageSize);
  }

  get categoryTotalPages(): number {
    return this.pageCount(this.filteredCategories.length, this.categoryPageSize);
  }

  categorySearchChanged(): void {
    this.categoryPage = 0;
  }

  goToCategoryPage(page: number): void {
    if (page < 0 || page >= this.categoryTotalPages || page === this.categoryPage) return;
    this.categoryPage = page;
  }

  turnCategories(direction: number): void {
    this.goToCategoryPage(this.categoryPage + direction);
  }

  get filteredCoupons(): Coupon[] {
    const query = this.couponSearch.trim();
    if (!query) return this.coupons;
    return this.coupons.filter((c) =>
      this.matchesSearch(query, c.code, c.discountPercent, c.expiresOn, c.active ? "activo" : "inactivo")
    );
  }

  get pagedCoupons(): Coupon[] {
    return this.paginate(this.filteredCoupons, this.couponPage, this.couponPageSize);
  }

  get couponTotalPages(): number {
    return this.pageCount(this.filteredCoupons.length, this.couponPageSize);
  }

  couponSearchChanged(): void {
    this.couponPage = 0;
  }

  goToCouponPage(page: number): void {
    if (page < 0 || page >= this.couponTotalPages || page === this.couponPage) return;
    this.couponPage = page;
  }

  turnCoupons(direction: number): void {
    this.goToCouponPage(this.couponPage + direction);
  }

  get filteredUsers(): User[] {
    const query = this.userSearch.trim();
    return this.users.filter((u) => {
      const matchRole = !this.userRoleFilter || u.role === this.userRoleFilter;
      const matchText = !query || this.matchesSearch(query, u.name, u.email, this.roleLabels[u.role]);
      return matchRole && matchText;
    });
  }

  get pagedUsers(): User[] {
    return this.paginate(this.filteredUsers, this.userPage, this.userPageSize);
  }

  get userTotalPages(): number {
    return this.pageCount(this.filteredUsers.length, this.userPageSize);
  }

  userFiltersChanged(): void {
    this.userPage = 0;
  }

  goToUserPage(page: number): void {
    if (page < 0 || page >= this.userTotalPages || page === this.userPage) return;
    this.userPage = page;
  }

  turnUsers(direction: number): void {
    this.goToUserPage(this.userPage + direction);
  }

  productFiltersChanged(delay = 300): void {
    this.debounce("admin-products", () => this.loadProducts(true), delay);
  }

  goToProductPage(page: number): void {
    if (page < 0 || page >= this.productTotalPages || page === this.productPage) return;
    this.productPage = page;
    this.loadProducts();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    void this.execute(async () => {
      const query = this.productQuery();
      const [products, categories, coupons, analytics, users, settings] =
        await Promise.all([
          this.api.get<PageResult<Product>>("/admin/products?" + query),
          this.api.get<Category[]>("/catalog/categories"),
          this.api.get<Coupon[]>("/admin/coupons"),
          this.api.get<Analytics>("/admin/analytics"),
          this.api.get<User[]>("/admin/users"),
          this.api.get<StoreSettings>("/admin/settings"),
        ]);
      this.setProducts(products);
      this.categories = categories;
      this.coupons = coupons;
      this.analytics = analytics;
      this.users = users;
      this.settings = settings;
    });
  }

  loadProducts(resetPage = false): void {
    if (resetPage) this.productPage = 0;
    void this.execute(async () => {
      this.setProducts(
        await this.api.get<PageResult<Product>>(
          "/admin/products?" + this.productQuery(),
        ),
      );
    });
  }

  turnProducts(direction: number): void {
    this.goToProductPage(this.productPage + direction);
  }

  editProduct(product: Product): void {
    this.productDraft = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost ?? 0,
      stock: product.stock,
      categoryId: product.categoryId,
      active: product.active,
      version: product.version,
    };
  }

  resetProduct(): void {
    this.productDraft = this.emptyProduct();
  }

  saveProduct(): void {
    if (this.productDraft.categoryId === null) return;

    void this.execute(async () => {
      const payload = {
        name: this.productDraft.name.trim(),
        description: this.productDraft.description.trim(),
        price: this.productDraft.price,
        cost: this.productDraft.cost,
        stock: this.productDraft.stock,
        categoryId: this.productDraft.categoryId,
        active: this.productDraft.active,
        version: this.productDraft.version,
      };
      const editing = this.productDraft.id !== null;
      const path = editing
        ? "/admin/products/" + this.productDraft.id
        : "/admin/products";
      if (editing) await this.api.put<Product>(path, payload);
      else await this.api.post<Product>(path, payload);
      this.resetProduct();
      await this.refreshProductsAndAnalytics();
      this.session.notify(
        editing ? "Producto actualizado." : "Producto creado.",
      );
    });
  }

  changeProductAvailability(product: Product): void {
    void this.execute(async () => {
      if (product.active) {
        await this.api.delete<void>("/admin/products/" + product.id);
      } else {
        await this.api.put<Product>("/admin/products/" + product.id, {
          name: product.name,
          description: product.description,
          price: product.price,
          cost: product.cost ?? 0,
          stock: product.stock,
          categoryId: product.categoryId,
          active: true,
          version: product.version,
        });
      }
      await this.refreshProductsAndAnalytics();
      this.session.notify(
        product.active ? "Producto desactivado." : "Producto activado.",
      );
    });
  }

  uploadImage(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validType = file.type === "image/png" || file.type === "image/jpeg";
    if (!validType || file.size > 2 * 1024 * 1024) {
      this.session.notify(
        "Selecciona una imagen PNG o JPEG de hasta 2 MB.",
        true,
      );
      input.value = "";
      return;
    }

    void this.execute(async () => {
      const body = new FormData();
      body.append("file", file);
      await this.api.post<void>(
        "/admin/products/" + product.id + "/image",
        body,
      );
      await this.refreshProductsAndAnalytics();
      input.value = "";
      this.session.notify("Imagen actualizada.");
    });
  }

  editCategory(category: Category): void {
    this.categoryDraft = {
      id: category.id,
      name: category.name,
      description: category.description,
    };
  }

  resetCategory(): void {
    this.categoryDraft = this.emptyCategory();
  }

  saveCategory(): void {
    const name = this.categoryDraft.name.trim();
    if (!name) return;

    void this.execute(async () => {
      const editing = this.categoryDraft.id !== null;
      const path = editing
        ? "/admin/categories/" + this.categoryDraft.id
        : "/admin/categories";
      const payload = {
        name,
        description: this.categoryDraft.description.trim(),
      };
      if (editing) await this.api.put<Category>(path, payload);
      else await this.api.post<Category>(path, payload);
      this.resetCategory();
      await this.refreshReferenceData();
      this.session.notify(
        editing ? "Categoría actualizada." : "Categoría creada.",
      );
    });
  }

  deleteCategory(category: Category): void {
    void this.execute(async () => {
      await this.api.delete<void>("/admin/categories/" + category.id);
      if (this.categoryDraft.id === category.id) this.resetCategory();
      await this.refreshReferenceData();
      this.session.notify("Categoría eliminada.");
    });
  }

  editCoupon(coupon: Coupon): void {
    this.couponDraft = {
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      expiresOn: coupon.expiresOn,
      active: coupon.active,
    };
  }

  resetCoupon(): void {
    this.couponDraft = this.emptyCoupon();
  }

  saveCoupon(): void {
    void this.execute(async () => {
      const editing = this.couponDraft.id !== null;
      const path = editing
        ? "/admin/coupons/" + this.couponDraft.id
        : "/admin/coupons";
      const payload = {
        code: this.couponDraft.code.trim().toUpperCase(),
        discountPercent: this.couponDraft.discountPercent,
        expiresOn: this.couponDraft.expiresOn,
        active: this.couponDraft.active,
      };
      if (editing) await this.api.put<Coupon>(path, payload);
      else await this.api.post<Coupon>(path, payload);
      this.resetCoupon();
      this.coupons = await this.api.get<Coupon[]>("/admin/coupons");
      this.session.notify(editing ? "Cupón actualizado." : "Cupón creado.");
    });
  }

  changeCouponAvailability(coupon: Coupon): void {
    void this.execute(async () => {
      await this.api.put<Coupon>("/admin/coupons/" + coupon.id, {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        expiresOn: coupon.expiresOn,
        active: !coupon.active,
      });
      this.coupons = await this.api.get<Coupon[]>("/admin/coupons");
      this.session.notify(
        coupon.active ? "Cupón desactivado." : "Cupón activado.",
      );
    });
  }

  changeRole(user: User, value: string): void {
    if (!this.isRole(value) || value === user.role) return;
    void this.execute(async () => {
      const updated = await this.api.put<User>(
        "/admin/users/" + user.id + "/role",
        { role: value },
      );
      this.users = this.users.map((item) =>
        item.id === updated.id ? updated : item,
      );
      this.session.notify(
        `${updated.name} ahora tiene el rol “${this.roleLabels[updated.role]}”.`,
      );
    });
  }

  saveSettings(): void {
    if (!this.settings) return;
    void this.execute(async () => {
      this.settings = await this.api.put<StoreSettings>(
        "/admin/settings",
        this.settings,
      );
      this.analytics = await this.api.get<Analytics>("/admin/analytics");
      this.session.notify("Configuración guardada.");
    });
  }

  private async refreshProductsAndAnalytics(): Promise<void> {
    const [products, analytics] = await Promise.all([
      this.api.get<PageResult<Product>>(
        "/admin/products?" + this.productQuery(),
      ),
      this.api.get<Analytics>("/admin/analytics"),
    ]);
    this.setProducts(products);
    this.analytics = analytics;
  }

  private async refreshReferenceData(): Promise<void> {
    const [categories, products, analytics] = await Promise.all([
      this.api.get<Category[]>("/catalog/categories"),
      this.api.get<PageResult<Product>>(
        "/admin/products?" + this.productQuery(),
      ),
      this.api.get<Analytics>("/admin/analytics"),
    ]);
    this.categories = categories;
    this.setProducts(products);
    this.analytics = analytics;
  }

  private productQuery(): string {
    const query = new URLSearchParams({
      q: this.search,
      page: String(this.productPage),
    });
    if (this.categoryFilter) query.set("categoryId", this.categoryFilter);
    return query.toString();
  }

  private setProducts(result: PageResult<Product>): void {
    this.products = result.items;
    this.totalProducts = result.total;
    this.productPage = result.page;
    this.productTotalPages = result.totalPages;
  }

  private emptyProduct(): ProductDraft {
    return {
      id: null,
      name: "",
      description: "",
      price: 0.01,
      cost: 0,
      stock: 0,
      categoryId: null,
      active: true,
      version: 0,
    };
  }

  private emptyCategory(): CategoryDraft {
    return { id: null, name: "", description: "" };
  }

  private emptyCoupon(): CouponDraft {
    return {
      id: null,
      code: "",
      discountPercent: 10,
      expiresOn: this.today,
      active: true,
    };
  }

  private isRole(value: string): value is UserRole {
    return (
      value === "CUSTOMER" ||
      value === "ADMIN" ||
      value === "INVENTORY_MANAGER" ||
      value === "CUSTOMER_SUPPORT"
    );
  }
}
