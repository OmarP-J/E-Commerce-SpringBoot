import { Component, Input } from "@angular/core";
import { IconComponent } from "./icon.component";

/**
 * Botón con un ojo para ver u ocultar la contraseña de un campo.
 *
 * Cambia el tipo del input directamente: el campo lleva type="password" fijo
 * en la plantilla, así que Angular no lo vuelve a tocar. El nombre accesible
 * no cambia y el estado lo da aria-pressed, que es como los lectores de
 * pantalla esperan un botón de alternar.
 */
@Component({
  selector: "app-password-toggle",
  imports: [IconComponent],
  template: `<button
    type="button"
    class="reveal-button"
    aria-label="Mostrar contraseña"
    [attr.aria-pressed]="shown"
    [attr.aria-controls]="input.id || null"
    [title]="shown ? 'Ocultar contraseña' : 'Mostrar contraseña'"
    (click)="toggle()"
  >
    <app-icon [name]="shown ? 'eye-off' : 'eye'" />
  </button>`,
})
export class PasswordToggleComponent {
  @Input({ required: true }) input!: HTMLInputElement;
  shown = false;

  toggle(): void {
    this.shown = !this.shown;
    this.input.type = this.shown ? "text" : "password";
  }
}
