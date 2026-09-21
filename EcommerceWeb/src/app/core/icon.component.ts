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
  | "login";

/**
 * Iconos de línea dibujados a mano, sin librería.
 *
 * Catorce iconos no justifican una dependencia entera: son unos pocos
 * kilobytes de SVG que heredan el color del texto y escalan sin perder
 * nitidez. Van marcados como decorativos porque el nombre accesible del
 * enlace lo pone siempre el aria-label de quien los usa.
 */
@Component({
  selector: "app-icon",
  standalone: true,
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
          <path d="M12 3.2 20.6 7.5 12 11.8 3.4 7.5 12 3.2Z" />
          <path d="m3.4 12 8.6 4.3 8.6-4.3" />
          <path d="m3.4 16.5 8.6 4.3 8.6-4.3" />
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
        @case ("logout") {
          <path
            d="M14.8 4.6h3.2A1.6 1.6 0 0 1 19.6 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6h-3.2"
          />
          <path d="m10.8 8.4 3.6 3.6-3.6 3.6" />
          <path d="M14.4 12H4.6" />
        }
        @case ("login") {
          <path
            d="M9.2 4.6H6A1.6 1.6 0 0 0 4.4 6.2v11.6A1.6 1.6 0 0 0 6 19.4h3.2"
          />
          <path d="m13.6 8.4 3.6 3.6-3.6 3.6" />
          <path d="M17.2 12H9.2" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
}
