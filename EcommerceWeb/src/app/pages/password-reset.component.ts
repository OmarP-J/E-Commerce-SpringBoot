import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Auth, homeForRole } from "../core/models";
import { Page } from "../core/page";
import { IconComponent } from "../core/icon.component";
import { PasswordToggleComponent } from "../core/password-toggle.component";

/**
 * Recuperar la contraseña en dos pasos: pedir el código y escribirlo junto con
 * la contraseña nueva. La respuesta del primer paso es siempre la misma, exista
 * o no la cuenta, para no revelar qué correos están registrados.
 */
@Component({
  imports: [FormsModule, RouterLink, IconComponent, PasswordToggleComponent],
  template: ` <section class="auth-layout">
    <div class="auth-story">
      <a routerLink="/login" class="back-link">← Volver a iniciar sesión</a>
      <div>
        <p class="eyebrow">RECUPERA TU ACCESO</p>
        <h1>{{ step === "email" ? "¿Olvidaste tu contraseña?" : "Revisa tu correo." }}</h1>
        <p>
          Te enviamos un código de 6 dígitos al correo de tu cuenta. Con él
          eliges una contraseña nueva, sin llamar a nadie.
        </p>
      </div>
      <ul class="auth-benefits">
        <li><app-icon name="mail" />Escribe tu correo</li>
        <li><app-icon name="key" />Copia el código que te llega</li>
        <li><app-icon name="lock" />Elige una contraseña nueva</li>
      </ul>
    </div>

    @if (step === "email") {
      <form class="auth-card stack" #emailForm="ngForm" (ngSubmit)="request()">
        <div class="form-heading">
          <span class="form-icon"><app-icon name="key" /></span>
          <div>
            <small>PASO 1 DE 2</small>
            <h2>Pide tu código</h2>
          </div>
        </div>
        <label
          >Correo de tu cuenta<input
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            email
            maxlength="254"
            autocomplete="email"
            placeholder="nombre@correo.com"
        /></label>
        <button class="login-submit" [disabled]="emailForm.invalid || busy">
          {{ busy ? "Enviando…" : "Enviarme el código" }}
          <app-icon name="arrow-right" />
        </button>
        <p class="form-foot">
          ¿Ya la recordaste? <a routerLink="/login">Inicia sesión</a>
        </p>
      </form>
    } @else {
      <form class="auth-card stack" #resetForm="ngForm" (ngSubmit)="confirm()">
        <div class="form-heading">
          <span class="form-icon"><app-icon name="lock" /></span>
          <div>
            <small>PASO 2 DE 2</small>
            <h2>Elige una contraseña nueva</h2>
          </div>
        </div>
        <p class="muted" role="status">
          Si <strong>{{ email }}</strong> tiene una cuenta, ya te enviamos un
          código. Revisa también la carpeta de spam.
        </p>
        <label
          >Código<input
            id="reset-code"
            class="verify-code-input"
            name="code"
            [(ngModel)]="code"
            required
            pattern="[0-9]{6}"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="000000"
        /></label>
        <div class="field">
          <label for="reset-password">Contraseña nueva</label>
          <span class="password-field"
            ><input
              #newInput
              id="reset-password"
              type="password"
              name="newPassword"
              [(ngModel)]="password"
              required
              minlength="10"
              maxlength="72"
              autocomplete="new-password"
              aria-describedby="reset-password-hint" /><app-password-toggle
              [input]="newInput"
          /></span>
        </div>
        <div class="field">
          <label for="reset-confirmation">Repetir contraseña nueva</label>
          <span class="password-field"
            ><input
              #confirmInput
              id="reset-confirmation"
              type="password"
              name="confirmation"
              [(ngModel)]="confirmation"
              required
              maxlength="72"
              autocomplete="new-password" /><app-password-toggle
              [input]="confirmInput"
          /></span>
        </div>
        <small id="reset-password-hint"
          >Mínimo 10 caracteres. Usa una contraseña que no uses en otras
          cuentas.</small
        >
        @if (confirmation && password !== confirmation) {
          <p class="field-error" role="alert">Las contraseñas no coinciden.</p>
        }
        @if (passwordTooLong) {
          <p class="field-error" role="alert">
            La contraseña ocupa más de 72 bytes. Prueba con menos caracteres.
          </p>
        }
        <button
          class="login-submit"
          [disabled]="
            resetForm.invalid || busy || password !== confirmation || passwordTooLong
          "
        >
          {{ busy ? "Guardando…" : "Cambiar contraseña y entrar" }}
          <app-icon name="arrow-right" />
        </button>
        <button
          type="button"
          class="text-button"
          [disabled]="busy || secondsLeft > 0"
          (click)="request()"
        >
          {{
            secondsLeft > 0
              ? "Puedes pedir otro código en " + secondsLeft + "s"
              : "No me llegó, enviar otro código"
          }}
        </button>
        <button type="button" class="text-button" (click)="changeEmail()">
          Usar otro correo
        </button>
      </form>
    }
  </section>`,
})
export class PasswordResetComponent extends Page implements OnDestroy {
  private readonly router = inject(Router);
  step: "email" | "code" = "email";
  email = "";
  code = "";
  password = "";
  confirmation = "";
  secondsLeft = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  get passwordTooLong(): boolean {
    return new TextEncoder().encode(this.password).length > 72;
  }

  request(): void {
    void this.execute(async () => {
      await this.api.post<void>("/auth/password-reset", {
        email: this.email.trim(),
      });
      this.step = "code";
      this.startCooldown(60);
      this.focusField("reset-code");
    });
  }

  confirm(): void {
    void this.execute(async () => {
      try {
        const auth = await this.api.post<Auth>("/auth/password-reset/confirm", {
          email: this.email.trim(),
          code: this.code.trim(),
          newPassword: this.password,
        });
        this.session.signIn(auth);
        this.session.notify("Contraseña actualizada. Ya iniciaste sesión.");
        await this.router.navigateByUrl(homeForRole(auth.user.role));
      } catch (error) {
        // Con un código incorrecto se vacía el campo para escribirlo de nuevo;
        // la contraseña elegida se conserva.
        if (error instanceof HttpErrorResponse) this.code = "";
        throw error;
      }
    });
  }

  changeEmail(): void {
    this.step = "email";
    this.code = "";
    this.stopCooldown();
  }

  override ngOnDestroy(): void {
    this.stopCooldown();
    super.ngOnDestroy();
  }

  private startCooldown(seconds: number): void {
    this.stopCooldown();
    this.secondsLeft = seconds;
    this.timer = setInterval(() => {
      this.secondsLeft -= 1;
      if (this.secondsLeft <= 0) this.stopCooldown();
    }, 1000);
  }

  private stopCooldown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.secondsLeft = 0;
  }
}
