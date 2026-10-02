import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { BUSINESS } from "../core/business";
import { roleLabels, User } from "../core/models";
import { Page } from "../core/page";
import { BusinessValueComponent } from "./legal/legal-shared";

@Component({
  imports: [FormsModule, RouterLink, BusinessValueComponent],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">TU CUENTA</p>
        <h1>Mi perfil</h1>
      </div>
    </div>

    @if (busy && !profile) {
      <p role="status">Cargando perfil…</p>
    }

    @if (profile; as currentUser) {
      <div class="split">
        <section class="panel stack">
          <div>
            <p class="eyebrow">DATOS PERSONALES</p>
            <h2>Información de la cuenta</h2>
          </div>
          <form class="stack" #profileForm="ngForm" (ngSubmit)="saveProfile()">
            <label
              >Nombre
              <input
                name="name"
                [(ngModel)]="name"
                required
                maxlength="80"
                autocomplete="name"
              />
            </label>
            <label
              >Correo electrónico
              <input [value]="currentUser.email" disabled />
              <small
                >El correo identifica tu cuenta y no se puede cambiar desde
                aquí.</small
              >
            </label>
            <label
              >Tipo de cuenta
              <input [value]="roleLabels[currentUser.role]" disabled />
            </label>
            <button [disabled]="profileForm.invalid || busy || !name.trim()">
              {{ busy ? "Guardando…" : "Guardar nombre" }}
            </button>
          </form>
        </section>

        <section class="panel stack">
          <div>
            <p class="eyebrow">SEGURIDAD</p>
            <h2>Cambiar contraseña</h2>
          </div>
          <form
            class="stack"
            #passwordForm="ngForm"
            (ngSubmit)="changePassword()"
          >
            <label
              >Contraseña actual
              <input
                type="password"
                name="currentPassword"
                [(ngModel)]="currentPassword"
                required
                maxlength="72"
                autocomplete="current-password"
              />
            </label>
            <label
              >Nueva contraseña
              <input
                type="password"
                name="newPassword"
                [(ngModel)]="newPassword"
                required
                minlength="10"
                maxlength="72"
                autocomplete="new-password"
              />
            </label>
            <label
              >Repetir nueva contraseña
              <input
                type="password"
                name="confirmation"
                [(ngModel)]="confirmation"
                required
                maxlength="72"
                autocomplete="new-password"
              />
            </label>
            <small
              >Usa entre 10 y 72 caracteres y evita reutilizar una contraseña de
              otra cuenta.</small
            >
            @if (confirmation && newPassword !== confirmation) {
              <p class="field-error" role="alert">
                Las contraseñas no coinciden.
              </p>
            }
            @if (passwordTooLong) {
              <p class="field-error" role="alert">
                La contraseña nueva ocupa más de 72 bytes. Prueba con menos
                caracteres.
              </p>
            }
            <button
              [disabled]="
                passwordForm.invalid ||
                busy ||
                newPassword !== confirmation ||
                passwordTooLong
              "
            >
              {{ busy ? "Actualizando…" : "Actualizar contraseña" }}
            </button>
          </form>
        </section>
      </div>

      <section class="panel stack profile-privacy" aria-labelledby="privacy-title">
        <div>
          <p class="eyebrow">PRIVACIDAD</p>
          <h2 id="privacy-title">Tus datos</h2>
        </div>
        <p>
          @if (currentUser.role === "CUSTOMER") {
            Puedes corregir tu nombre en este formulario y editar o borrar tus
            direcciones en <a routerLink="/addresses">Mis direcciones</a>.
          } @else {
            Puedes corregir tu nombre en este formulario.
          }
          Para pedir una copia de tus datos o eliminar tu cuenta, escribe a
          @if (business.email) {
            <a [href]="'mailto:' + business.email">{{ business.email }}</a>
          } @else {
            <app-business-value value="" />
          }
          desde el correo de esta cuenta.
        </p>
        <p>
          <a routerLink="/privacy">Lee la Política de privacidad</a>
        </p>
      </section>
    }
  `,
})
export class ProfileComponent extends Page implements OnInit {
  readonly roleLabels = roleLabels;
  readonly business = BUSINESS;
  profile: User | null = null;
  name = "";
  currentPassword = "";
  newPassword = "";
  confirmation = "";

  get passwordTooLong(): boolean {
    return new TextEncoder().encode(this.newPassword).length > 72;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    void this.execute(async () => {
      this.profile = await this.api.get<User>("/me");
      this.name = this.profile.name;
      this.session.user.set(this.profile);
    });
  }

  saveProfile(): void {
    const cleanName = this.name.trim();
    if (!cleanName) return;

    void this.execute(async () => {
      this.profile = await this.api.put<User>("/me", { name: cleanName });
      this.name = this.profile.name;
      this.session.user.set(this.profile);
      this.session.notify("Nombre actualizado.");
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmation || this.passwordTooLong) return;

    void this.execute(async () => {
      await this.api.put<void>("/me/password", {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      });
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmation = "";
      this.session.notify("Contraseña actualizada.");
    });
  }
}
