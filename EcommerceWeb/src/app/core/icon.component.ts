import { Component, Input } from "@angular/core";

export type IconName =
  | "home"
  | "catalog"
  | "heart"
  | "package"
  | "pin"
  | "help"
  | "cart"
  | "admin"
  | "orders"
  | "inventory"
  | "support"
  | "user"
  | "logout"
  | "login"
  | "dashboard"
  | "eye"
  | "eye-off"
  | "user-plus"
  | "mail"
  | "key"
  | "lock"
  | "search"
  | "compass"
  | "receipt"
  | "tag"
  | "percent"
  | "users"
  | "star"
  | "truck"
  | "arrow-right"
  | "arrow-up-right"
  | "close"
  | "minus"
  | "plus"
  | "check";

/**
 * Iconos de línea dibujados a mano, sin librería.
 *
 * Unas decenas de iconos no justifican una dependencia entera: son pocos
 * kilobytes de SVG que heredan el color del texto y escalan sin perder
 * nitidez. Van marcados como decorativos porque el nombre accesible del
 * enlace lo pone siempre el aria-label de quien los usa.
 *
 * "login" dibuja la flecha entrando por la puerta y "logout" saliendo; antes
 * estaban intercambiados.
 */
@Component({
  selector: "app-icon",
  standalone: true,
  // Sin caja propia: el <svg> se coloca directamente en la rejilla o fila de
  // quien lo usa, así que los estilos de .icon mandan sobre su posición.
  styles: [":host { display: contents; }"],
  template: `
    <svg
      class="icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name) {
        @case ("home") {
          <path d="M3.5 10.6 12 3.8l8.5 6.8" />
          <path d="M5.8 9.6V20h12.4V9.6" />
          <path d="M10 20v-4.6h4V20" />
        }
        @case ("catalog") {
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
        }
        @case ("heart") {
          <path
            d="M12 20.2S4.8 15.8 4.8 11a3.9 3.9 0 0 1 7.2-2.1A3.9 3.9 0 0 1 19.2 11c0 4.8-7.2 9.2-7.2 9.2Z"
          />
        }
        @case ("package") {
          <path d="M12 3.2 20.4 7.6v8.8L12 20.8 3.6 16.4V7.6L12 3.2Z" />
          <path d="M3.6 7.6 12 12l8.4-4.4" />
          <path d="M12 12v8.8" />
        }
        @case ("pin") {
          <path
            d="M12 21s6.4-5.7 6.4-10.4a6.4 6.4 0 1 0-12.8 0C5.6 15.3 12 21 12 21Z"
          />
          <circle cx="12" cy="10.4" r="2.4" />
        }
        @case ("help") {
          <circle cx="12" cy="12" r="8.4" />
          <path d="M9.7 9.7a2.4 2.4 0 0 1 4.7.8c0 1.7-2.4 2-2.4 3.3" />
          <path d="M12 17.1h.01" />
        }
        @case ("cart") {
          <path
            d="M3 4.2h2.1l2 10.9a1.6 1.6 0 0 0 1.6 1.3h8a1.6 1.6 0 0 0 1.6-1.2L20.6 8H6.2"
          />
          <circle cx="9.6" cy="19.6" r="1.3" />
          <circle cx="17" cy="19.6" r="1.3" />
        }
        @case ("admin") {
          <path d="M4 7.2h9.4M18.4 7.2h1.6" />
          <path d="M4 12h3.4M11.4 12h8.6" />
          <path d="M4 16.8h8.4M17.4 16.8h2.6" />
          <circle cx="15.9" cy="7.2" r="2" />
          <circle cx="9.4" cy="12" r="2" />
          <circle cx="14.9" cy="16.8" r="2" />
        }
        @case ("orders") {
          <path
            d="M8.6 4.6H6.6A1.6 1.6 0 0 0 5 6.2v13.2a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V6.2a1.6 1.6 0 0 0-1.6-1.6h-2"
          />
          <rect x="8.6" y="2.8" width="6.8" height="3.6" rx="1.3" />
          <path d="M8.8 11.4h6.4M8.8 15.2h4.2" />
        }
        @case ("inventory") {
          <rect x="3.4" y="12.2" width="8" height="8" rx="1.2" />
          <rect x="12.6" y="12.2" width="8" height="8" rx="1.2" />
          <rect x="8" y="3.6" width="8" height="8" rx="1.2" />
          <path d="M6.4 15h2M15.6 15h2M11 6.4h2" />
        }
        @case ("support") {
          <path d="M4.6 13.4v-1.6a7.4 7.4 0 0 1 14.8 0v1.6" />
          <rect x="2.6" y="12.9" width="4.2" height="6.6" rx="1.8" />
          <rect x="17.2" y="12.9" width="4.2" height="6.6" rx="1.8" />
        }
        @case ("user") {
          <circle cx="12" cy="8.4" r="3.8" />
          <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
        }
        @case ("login") {
          <path
            d="M14.8 4.6h3.2A1.6 1.6 0 0 1 19.6 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6h-3.2"
          />
          <path d="m10.8 8.4 3.6 3.6-3.6 3.6" />
          <path d="M14.4 12H4.6" />
        }
        @case ("logout") {
          <path
            d="M9.2 4.6H6A1.6 1.6 0 0 0 4.4 6.2v11.6A1.6 1.6 0 0 0 6 19.4h3.2"
          />
          <path d="m15.6 8.4 3.6 3.6-3.6 3.6" />
          <path d="M19.2 12H9.2" />
        }
        @case ("dashboard") {
          <path d="M4 20h16" />
          <rect x="5.4" y="11" width="3.2" height="6.6" rx="0.9" />
          <rect x="10.4" y="5.6" width="3.2" height="12" rx="0.9" />
          <rect x="15.4" y="8.6" width="3.2" height="9" rx="0.9" />
        }
        @case ("eye") {
          <path d="M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12Z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ("eye-off") {
          <path d="M10.4 5.7A9.6 9.6 0 0 1 12 5.6c6 0 9.4 6.4 9.4 6.4a16.6 16.6 0 0 1-2.4 3.2" />
          <path d="M6.5 6.9C3.9 8.6 2.6 12 2.6 12S6 18.4 12 18.4a9 9 0 0 0 4.6-1.2" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="m3.6 3.6 16.8 16.8" />
        }
        @case ("user-plus") {
          <circle cx="10" cy="8.4" r="3.6" />
          <path d="M3.6 20.2a6.6 6.6 0 0 1 11.2-4.7" />
          <path d="M18.4 13.6v6.4M15.2 16.8h6.4" />
        }
        @case ("mail") {
          <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2" />
          <path d="m3.8 7 8.2 6 8.2-6" />
        }
        @case ("key") {
          <circle cx="8" cy="15.4" r="3.9" />
          <path d="m10.8 12.6 8.6-8.6" />
          <path d="m16.4 7 2.6 2.6M13.8 9.6l2 2" />
        }
        @case ("lock") {
          <rect x="4.8" y="10.4" width="14.4" height="10" rx="2" />
          <path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" />
          <path d="M12 14.4v2.4" />
        }
        @case ("search") {
          <circle cx="10.8" cy="10.8" r="6.4" />
          <path d="m20.2 20.2-4.8-4.8" />
        }
        @case ("compass") {
          <circle cx="12" cy="12" r="8.6" />
          <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" />
        }
        @case ("receipt") {
          <path d="M6 3.4h12v17.2l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3.4Z" />
          <path d="M9 8h6M9 11.6h6M9 15.2h3.6" />
        }
        @case ("tag") {
          <path
            d="M3.6 12.4V4.6a1 1 0 0 1 1-1h7.8l8 8a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0l-8-8Z"
          />
          <circle cx="8.2" cy="8.2" r="1.4" />
        }
        @case ("percent") {
          <path d="M18.4 5.6 5.6 18.4" />
          <circle cx="7.4" cy="7.4" r="2.2" />
          <circle cx="16.6" cy="16.6" r="2.2" />
        }
        @case ("users") {
          <circle cx="9" cy="8.4" r="3.4" />
          <path d="M2.8 19.8a6.2 6.2 0 0 1 12.4 0" />
          <path d="M15.8 5.2a3.4 3.4 0 0 1 0 6.4M18 14.2a6.2 6.2 0 0 1 3.2 5.6" />
        }
        @case ("star") {
          <path
            d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z"
          />
        }
        @case ("truck") {
          <path d="M2.8 6.4h10.8v10H2.8z" />
          <path d="M13.6 9.6h4l3.2 3.4v3.4h-7.2" />
          <circle cx="6.6" cy="17.6" r="1.8" />
          <circle cx="17.2" cy="17.6" r="1.8" />
        }
        @case ("arrow-right") {
          <path d="M4.8 12h14.4" />
          <path d="m13.2 6 6 6-6 6" />
        }
        @case ("arrow-up-right") {
          <path d="M7 17 17 7" />
          <path d="M8.4 7H17v8.6" />
        }
        @case ("close") {
          <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />
        }
        @case ("minus") {
          <path d="M5.6 12h12.8" />
        }
        @case ("plus") {
          <path d="M12 5.6v12.8M5.6 12h12.8" />
        }
        @case ("check") {
          <path d="m5 12.6 4.4 4.4 9.6-9.8" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
}
