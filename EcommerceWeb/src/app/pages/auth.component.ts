import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Page } from "../core/page";
import { Auth, SignupResult, homeForRole } from "../core/models";

@Component({
  imports: [FormsModule, RouterLink],
  template: ` <section class="auth-layout">
    <div class="auth-story">
      <a routerLink="/catalog" class="back-link">← Volver al catálogo</a>
      <div>
        <p class="eyebrow">TU ESPACIO, TUS ESENCIALES</p>
        <h1>{{ signup ? "Una cuenta. Todo a mano." : "Qué bueno verte." }}</h1>
        <p>
          Guarda favoritos, prepara tu carrito y consulta cada pedido desde
          cualquier dispositivo.
        </p>
      </div>
      <div class="auth-benefits">
        <span><b>01</b> Compra sin perder tu carrito</span
        ><span><b>02</b> Sigue tus pedidos</span
        ><span><b>03</b> Guarda lo que te gusta</span>
      </div>
    </div>
    <form class="auth-card stack" #form="ngForm" (ngSubmit)="submit()">
      <div class="form-heading">
        <span class="form-icon" aria-hidden="true">{{
          signup ? "+" : "↗"
        }}</span>
        <div>
          <small>{{ signup ? "EMPIEZA AQUÍ" : "ACCESO A TU CUENTA" }}</small>
          <h2>{{ signup ? "Crear una cuenta" : "Iniciar sesión" }}</h2>
        </div>
      </div>
      @if (signup) {
        <label
          >Nombre<input
            name="name"
            [(ngModel)]="name"
            required
            maxlength="80"
            autocomplete="name"
            placeholder="¿Cómo te llamas?"
        /></label>
      }
      <label
        >Correo electrónico<input
          type="email"
          name="email"
          [(ngModel)]="email"
          required
          email
          maxlength="254"
          autocomplete="email"
          placeholder="nombre@correo.com"
      /></label>
      <!-- El botón de mostrar va fuera del <label>: dentro, su texto pasaba a
           formar parte del nombre del campo ("Contraseña Ver"). -->
      <div class="field">
        <label for="auth-password">Contraseña</label>
        <span class="password-field"
          ><input
            id="auth-password"
            [type]="showPassword ? 'text' : 'password'"
            name="password"
            [(ngModel)]="password"
            required
            [minlength]="signup ? 10 : 1"
            maxlength="72"
            [autocomplete]="signup ? 'new-password' : 'current-password'"
            [attr.aria-describedby]="signup ? 'password-hint' : null"
            placeholder="{{
              signup ? 'Mínimo 10 caracteres' : 'Tu contraseña'
            }}"
          /><button
            type="button"
            class="reveal-button"
            aria-controls="auth-password"
            (click)="showPassword = !showPassword"
          >
            {{ showPassword ? "Ocultar" : "Ver"
            }}<span class="sr-only"> contraseña</span>
          </button></span
        >
      </div>
      @if (signup) {
        <label
          >Repetir contraseña<input
            [type]="showPassword ? 'text' : 'password'"
            name="confirm"
            [(ngModel)]="confirmation"
            required
            maxlength="72"
            autocomplete="new-password"
            placeholder="Escríbela otra vez" /></label
        ><small id="password-hint"
          >Mínimo 10 caracteres. Usa una contraseña distinta a las de otras
          cuentas.</small
        >
      }
      @if (signup && confirmation && password !== confirmation) {
        <p class="field-error" role="alert">Las contraseñas no coinciden.</p>
      }
      @if (signup) {
        <label class="check-row"
          ><input
            type="checkbox"
            name="acceptTerms"
            [(ngModel)]="acceptTerms"
            required
          /><span
            >Tengo 18 años o más y acepto los
            <a routerLink="/terms" target="_blank"
              >Términos y condiciones<span class="sr-only">
                (se abre en otra pestaña)</span
              ></a
            >
            y la
            <a routerLink="/privacy" target="_blank"
              >Política de privacidad<span class="sr-only">
                (se abre en otra pestaña)</span
              ></a
            >.</span
          ></label
        >
        <p class="form-privacy-note">
          Usamos tu nombre y tu correo solo para gestionar tu cuenta y enviarte
          el código de verificación. No los compartimos para publicidad.
        </p>
      }
      <button
        class="login-submit"
        [disabled]="
          form.invalid ||
          busy ||
          (signup && (password !== confirmation || !acceptTerms))
        "
      >
        {{
          busy
            ? "Procesando…"
            : signup
              ? "Crear mi cuenta"
              : "Entrar a mi cuenta"
        }}
        <span aria-hidden="true">→</span>
      </button>
      @if (signup) {
        <p class="form-foot">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
        </p>
      } @else {
        <p class="form-foot">
          ¿Primera visita? <a routerLink="/signup">Crea tu cuenta</a>
        </p>
      }
    </form>
  </section>`,
})
export class AuthComponent extends Page {
  private readonly route = inject(ActivatedRoute);
  readonly signup = !!this.route.snapshot.data["signup"];
  private readonly router = inject(Router);
  name = "";
  email = "";
  password = "";
  confirmation = "";
  showPassword = false;
  acceptTerms = false;
  submit(): void {
    void this.execute(async () => {
      const credentials = {
        name: this.name,
        email: this.email,
        password: this.password,
      };
      if (this.signup) {
        const result = await this.api.post<SignupResult>("/auth/signup", {
          ...credentials,
          acceptTerms: this.acceptTerms,
        });
        if (result.verificationRequired) {
          this.session.notify("Te enviamos un código a tu correo.");
          await this.goToVerification(result.email);
          return;
        }
        if (result.session) await this.enter(result.session);
        return;
      }
      try {
        await this.enter(await this.api.post<Auth>("/auth/login", credentials));
      } catch (error) {
        // 403 en el login significa cuenta sin verificar: en vez de dejarlo
        // atascado, lo mandamos a escribir el código.
        if (error instanceof HttpErrorResponse && error.status === 403) {
          await this.goToVerification(this.email.trim());
          return;
        }
        throw error;
      }
    });
  }

  private async enter(auth: Auth): Promise<void> {
    this.session.signIn(auth);
    const requested = this.route.snapshot.queryParamMap.get("returnUrl");
    const safeReturn =
      requested?.startsWith("/") && !requested.startsWith("//")
        ? requested
        : null;
    await this.router.navigateByUrl(safeReturn ?? homeForRole(auth.user.role));
  }

  private goToVerification(email: string): Promise<boolean> {
    return this.router.navigate(["/verify"], { queryParams: { email } });
  }
}
