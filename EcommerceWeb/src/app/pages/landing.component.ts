import { CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "../core/icon.component";
import { homeForRole, PageResult, Product, UserRole } from "../core/models";
import { Page } from "../core/page";

@Component({
  imports: [RouterLink, CurrencyPipe, IconComponent],
  template: `
    <section class="landing-hero">
      <div class="landing-copy">
        <span class="kicker">COLECCIÓN PARA TODOS LOS DÍAS</span>
        <h1>Cosas útiles para <em>tu día a día.</em></h1>
        <p>
          Encuentra objetos útiles, guarda tus favoritos y compra en pocos
          pasos.
        </p>
        <div class="hero-actions">
          <a class="button button-light" routerLink="/catalog"
            >Explorar productos <app-icon name="arrow-right" /></a
          >
          <a
            class="quiet-link"
            [routerLink]="
              session.user() ? roleHome(session.user()!.role) : '/login'
            "
            >{{ session.user() ? "Ir a mi espacio" : "Ya tengo una cuenta" }}</a
          >
        </div>
        <div class="hero-proof">
          <span
            ><app-icon name="receipt" /><b>Compra clara</b
            ><small>Totales antes de confirmar</small></span
          ><span
            ><app-icon name="heart" /><b>Tu selección</b
            ><small>Favoritos y carrito privado</small></span
          >
        </div>
      </div>
      <figure class="landing-visual">
        <!-- Imagen ilustrativa generada con IA (credenciales C2PA de OpenAI). -->
        <img
          src="/hero-essentials.png"
          alt="Ilustración: mochila verde, botella térmica, audífonos y lámpara de mesa sobre un pedestal"
        />
        <figcaption>Esenciales para moverte, crear y descansar.</figcaption>
      </figure>
    </section>

    <section class="experience-section">
      <div class="experience-heading">
        <span class="kicker">CÓMO FUNCIONA</span>
        <h2>Tu compra en tres pasos.</h2>
        <p>
          Busca, guarda lo que te gusta y revisa el total antes de confirmar.
        </p>
      </div>
      <!-- Las fotos acompañan a un título que ya dice lo mismo: son
           decorativas y llevan alt vacío para no repetirlo en voz alta. -->
      <div class="experience-grid">
        <article class="experience-card">
          <div class="experience-media">
            <img src="/feature-explore.jpg" alt="" loading="lazy" />
            <span class="experience-step" aria-hidden="true">01</span>
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
            <img src="/feature-favorites.jpg" alt="" loading="lazy" />
            <span class="experience-step" aria-hidden="true">02</span>
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
          <!-- Aquí había una foto generada con IA que mostraba la marca, la web
               y el perfil social de otra tienda y el nombre de una clienta
               inventada. No se puede usar marca ajena: la sustituye un icono. -->
          <div class="experience-media experience-illustration">
            <app-icon name="receipt" />
            <span class="experience-step" aria-hidden="true">03</span>
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
          <span class="kicker">DEL CATÁLOGO</span>
          <h2>Empieza por aquí</h2>
        </div>
        <a routerLink="/catalog"
          >Ver todo el catálogo <app-icon name="arrow-right" /></a
        >
      </div>
      <div class="mini-product-grid">
        @for (product of featured; track product.id) {
          <a class="mini-product" [routerLink]="['/products', product.id]">
            <!-- El nombre ya está en el texto del enlace: la imagen no lo repite. -->
            <span class="mini-image" aria-hidden="true">
              @if (product.imageUrl) {
                <img [src]="product.imageUrl" alt="" />
              } @else {
                <b>{{ product.name.charAt(0) }}</b>
              }
            </span>
            <span
              ><small>{{ product.categoryName }}</small
              ><strong>{{ product.name }}</strong
              ><b>{{
                product.price | currency: "DOP" : "symbol"
              }}</b></span
            ><i aria-hidden="true"><app-icon name="arrow-up-right" /></i>
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
            >Abrir mi espacio <app-icon name="arrow-right" /></a
          >
        } @else {
          <a class="button button-light" routerLink="/login"
            >Iniciar sesión <app-icon name="arrow-right" /></a
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
