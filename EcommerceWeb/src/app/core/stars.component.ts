import { Component, Input } from "@angular/core";

/**
 * Valoración de 0 a 5 estrellas. Las estrellas son decorativas; el lector de
 * pantalla oye la cifra ("4,5 de 5 estrellas"). La capa coloreada se recorta
 * con el ancho proporcional, así que las medias estrellas se ven bien.
 */
@Component({
  selector: "app-stars",
  template: `<span class="stars" role="img" [attr.aria-label]="label"
    ><span class="stars-empty" aria-hidden="true">★★★★★</span
    ><span class="stars-full" aria-hidden="true" [style.width.%]="percent"
      >★★★★★</span
    ></span
  >`,
})
export class StarsComponent {
  @Input({ required: true }) value = 0;

  get percent(): number {
    return Math.max(0, Math.min(5, this.value)) * 20;
  }

  get label(): string {
    const rounded = Math.round(this.value * 10) / 10;
    return `${rounded.toLocaleString("es-DO")} de 5 estrellas`;
  }
}
