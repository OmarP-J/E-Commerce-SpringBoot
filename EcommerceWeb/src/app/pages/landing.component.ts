import { CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { homeForRole, PageResult, Product, UserRole } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="landing-hero">
      <div class="landing-copy">
        <span class="kicker">COLECCIÓN PARA TODOS LOS DÍAS</span>
        <h1>Tu día merece cosas que <em>sí funcionan.</em></h1>
        <p>
          Encuentra objetos útiles, guarda tus favoritos y compra en pocos
          pasos.
        </p>
        <div class="hero-actions">
          <a class="button button-light" routerLink="/catalog"
            >Explorar productos <span aria-hidden="true">→</span></a
          >
          <a
            class="quiet-link"
            [routerLink]="
              session.user() ? roleHome(session.user()!.role) : '/login'
            "
            >{{ session.user() ? "Ir a mi espacio" : "Ya tengo una cuenta" }}</a
          >
        </div>
        <div class="hero-proof" aria-label="Ventajas">
          <span
            ><b>Compra clara</b><small>Totales antes de confirmar</small></span
          ><span
            ><b>Tu selección</b><small>Favoritos y carrito privado</small></span
          >
        </div>
      </div>
      <figure class="landing-visual">
        <img
          src="/hero-essentials.png"
          alt="Mochila, botella, audífonos y lámpara de la colección Esencial"
        />
        <figcaption>Esenciales para moverte, crear y descansar.</figcaption>
      </figure>
    </section>

    <section class="experience-section">
      <div class="experience-heading">
        <span class="kicker">COMPRAR AQUÍ SE SIENTE FÁCIL</span>
        <h2>Lo importante está siempre a la vista.</h2>
        <p>
          Diseñamos cada paso para que encuentres, decidas y completes tu compra
          sin perderte.
        </p>
      </div>
      <div class="experience-grid">
        <article class="experience-card">
          <div class="experience-media">
            <img
              src="/feature-explore.jpg"
              alt="Explora a tu ritmo"
              loading="lazy"
            />
            <span class="experience-step">01</span>
          </div>
          <div class="experience-content">
            <h3>Explora a tu ritmo</h3>
            <p>
              Busca por nombre, filtra por categoría y abre cada producto en su
              propia página.
            </p>
          </div>
        </article>
        <article class="experience-card">
          <div class="experience-media">
            <img
              src="/feature-favorites.jpg"
              alt="Guarda lo que te gusta"
              loading="lazy"
            />
            <span class="experience-step">02</span>
          </div>
          <div class="experience-content">
            <h3>Guarda lo que te gusta</h3>
            <p>
              Crea tu cuenta para mantener favoritos y carrito disponibles cuando
              regreses.
            </p>
          </div>
        </article>
        <article class="experience-card">
          <div class="experience-media">
            <img
              src="/feature-checkout.jpg"
              alt="Confirma con claridad"
              loading="lazy"
            />
            <span class="experience-step">03</span>
          </div>
          <div class="experience-content">
            <h3>Confirma con claridad</h3>
            <p>
              Revisa cantidades, descuentos y total antes de completar la compra
              simulada.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="landing-products">
      <div class="section-heading">
        <div>
          <span class="kicker">RECIÉN SELECCIONADOS</span>
          <h2>Empieza por aquí</h2>
        </div>
        <a routerLink="/catalog">Ver todo el catálogo →</a>
      </div>
      <div class="mini-product-grid">
        @for (product of featured; track product.id) {
          <a class="mini-product" [routerLink]="['/products', product.id]">
            <span class="mini-image">
              @if (product.imageUrl) {
                <img [src]="product.imageUrl" [alt]="product.name" />
              } @else {
                <b>{{ product.name.charAt(0) }}</b>
              }
            </span>
            <span
              ><small>{{ product.categoryName }}</small
              ><strong>{{ product.name }}</strong
              ><b>{{
                product.price | currency: "DOP" : "symbol-narrow"
              }}</b></span
            ><i aria-hidden="true">↗</i>
          </a>
        }
      </div>
    </section>

    <section class="landing-cta">
      <div>
        <span class="kicker">TU CUENTA TE ESPERA</span>
        <h2>
          {{
            session.user()
              ? "Continúa donde lo dejaste."
              : "Entra y guarda tus esenciales."
          }}
        </h2>
        <p>
          {{
            session.user()
              ? "Abre tu espacio para gestionar tu actividad."
              : "Después de iniciar sesión tendrás tus favoritos, carrito y pedidos en un solo lugar."
          }}
        </p>
      </div>
      <div class="hero-actions">
        @if (session.user(); as user) {
          <a class="button button-light" [routerLink]="roleHome(user.role)"
            >Abrir mi espacio →</a
          >
        } @else {
          <a class="button button-light" routerLink="/login">Iniciar sesión →</a
          ><a class="quiet-link" routerLink="/signup">Crear una cuenta</a>
        }
      </div>
    </section>
  `,
})
export class LandingComponent extends Page implements OnInit {
  featured: Product[] = [];
  readonly roleHome = (role: UserRole) => homeForRole(role);

  ngOnInit(): void {
    void this.execute(async () => {
      const result = await this.api.get<PageResult<Product>>(
        "/catalog/products?size=3",
      );
      this.featured = result.items;
    });
  }
}
