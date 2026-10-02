import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Page } from "../core/page";
import { Auth, homeForRole } from "../core/models";
import { IconComponent } from "../core/icon.component";

@Component({
  imports: [FormsModule, RouterLink, IconComponent],
  template: ` <section class="auth-layout">
    <div class="auth-story">
      <a routerLink="/catalog" class="back-link">← Volver al catálogo</a>
      <div>
        <p class="eyebrow">ÚLTIMO PASO</p>
        <h1>Revisa tu correo.</h1>
        <p>
          Te enviamos un código de 6 dígitos para confirmar que la dirección es
          tuya.
        </p>
      </div>
      <ul class="auth-benefits">
        <li><app-icon name="mail" />Abre el correo que te enviamos</li>
        <li><app-icon name="key" />Copia el código de 6 dígitos</li>
        <li><app-icon name="check" />Escríbelo aquí y listo</li>
      </ul>
    </div>

    <form class="auth-card stack" #form="ngForm" (ngSubmit)="submit()">
      <div class="form-heading">
        <span class="form-icon"><app-icon name="mail" /></span>
        <div>
          <small>VERIFICA TU CUENTA</small>
          <h2>Escribe el código</h2>
        </div>
      </div>

      @if (email) {
        <p class="muted">
          Lo enviamos a <strong>{{ email }}</strong>
        </p>
      } @else {
        <label
          >Tu correo<input
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            maxlength="254"
            autocomplete="email"
            placeholder="nombre@correo.com"
        /></label>
      }

      <label
        >Código<input
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

      <button class="login-submit" [disabled]="form.invalid || busy">
        {{ busy ? "Comprobando…" : "Confirmar mi cuenta" }}
      </button>

      <button
        type="button"
        class="text-button"
        [disabled]="busy || secondsLeft > 0"
        (click)="resend()"
      >
        {{
          secondsLeft > 0
            ? "Puedes pedir otro código en " + secondsLeft + "s"
            : "No me llegó, enviar otro código"
        }}
      </button>

      <p class="muted">
        ¿Te equivocaste de correo?
        <a routerLink="/signup">Regístrate de nuevo</a>
      </p>
    </form>
  </section>`,
})
export class VerifyComponent extends Page implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  email = "";
  code = "";
  secondsLeft = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get("email") ?? "";
    // Al llegar recién registrado ya se envió un código: arrancamos la espera
    // para que no lo pida otra vez de inmediato.
    this.startCooldown(60);
  }

  // Page ya implementa OnDestroy para limpiar sus temporizadores: hay que
  // marcarlo como override y encadenar la limpieza del padre.
  override ngOnDestroy(): void {
    this.stopCooldown();
    super.ngOnDestroy();
  }

  submit(): void {
    void this.execute(async () => {
      const auth = await this.api.post<Auth>("/auth/verify", {
        email: this.email.trim(),
        code: this.code.trim(),
      });
      this.session.signIn(auth);
      this.session.notify("Cuenta verificada. ¡Bienvenido!");
      await this.router.navigateByUrl(homeForRole(auth.user.role));
    });
  }

  resend(): void {
    if (!this.email.trim()) {
      this.session.notify("Escribe tu correo primero.", true);
      return;
    }
    void this.execute(async () => {
      await this.api.post<void>("/auth/verify/resend", {
        email: this.email.trim(),
      });
      this.session.notify("Te enviamos un código nuevo.");
      this.startCooldown(60);
    });
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
