import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BUSINESS, DATA_PROCESSORS } from "../../core/business";
import {
  BusinessCardComponent,
  BusinessValueComponent,
  LegalHeaderComponent,
} from "./legal-shared";

@Component({
  imports: [
    RouterLink,
    BusinessCardComponent,
    BusinessValueComponent,
    LegalHeaderComponent,
  ],
  template: `
    <article class="legal-page">
      <app-legal-header title="Política de privacidad" />

      <section aria-labelledby="privacy-owner">
        <h2 id="privacy-owner">1. Quién es responsable de tus datos</h2>
        <p>
          El responsable del tratamiento de los datos que recoge este sitio es:
        </p>
        <app-business-card />
        <p>
          Aplicamos esta política conforme a la Ley n.º 172-13 de la República
          Dominicana sobre protección de datos de carácter personal.
        </p>
      </section>

      <section aria-labelledby="privacy-data">
        <h2 id="privacy-data">2. Qué datos recogemos y para qué</h2>
        <p>
          Solo pedimos los datos que necesita cada función. No pedimos fecha de
          nacimiento, documento de identidad ni datos sensibles, y no
          recogemos datos de tarjeta: si pagas con PayPal o con tarjeta, los
          escribes en las páginas de esas empresas, no en las nuestras.
        </p>
        <!-- En pantallas estrechas la tabla se desplaza: con tabindex se puede
             recorrer también con el teclado. -->
        <div
          class="table-scroll"
          role="region"
          aria-label="Tabla de datos que recogemos"
          tabindex="0"
        >
          <table class="legal-table">
            <caption class="sr-only">
              Datos que recoge el sitio, cuándo y para qué
            </caption>
            <thead>
              <tr>
                <th scope="col">Dato</th>
                <th scope="col">Cuándo lo recogemos</th>
                <th scope="col">Para qué lo usamos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Nombre y correo electrónico</th>
                <td>Al crear tu cuenta</td>
                <td>
                  Identificar tu cuenta, iniciar sesión, enviarte el código que
                  confirma que el correo es tuyo y avisarte por correo cuando tu
                  pedido se confirma o cambia de estado. Son avisos del
                  servicio, no publicidad.
                </td>
              </tr>
              <tr>
                <th scope="row">Código para recuperar la contraseña</th>
                <td>Si pides cambiar una contraseña olvidada</td>
                <td>
                  Comprobar que el correo es tuyo. Se guarda cifrado, vence a
                  los 15 minutos y se borra al usarlo.
                </td>
              </tr>
              <tr>
                <th scope="row">Contraseña</th>
                <td>Al crear tu cuenta o cambiarla</td>
                <td>
                  Iniciar sesión. Se guarda transformada con BCrypt, un cifrado
                  de un solo sentido: nadie del equipo puede leerla.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  Dirección, ciudad, teléfono y nombre de quien recibe
                </th>
                <td>Al guardar una dirección o confirmar un pedido</td>
                <td>Gestionar la entrega y contactarte sobre ese pedido.</td>
              </tr>
              <tr>
                <th scope="row">
                  Productos, cantidades, cupón, importes y forma de pago elegida
                </th>
                <td>Al usar el carrito y confirmar un pedido</td>
                <td>Registrar el pedido y mostrarte tu historial.</td>
              </tr>
              <tr>
                <th scope="row">Productos favoritos</th>
                <td>Al guardar un producto</td>
                <td>Mostrártelos cuando vuelvas.</td>
              </tr>
              <tr>
                <th scope="row">Mensajes de tus solicitudes de ayuda</th>
                <td>Al pedir una devolución, cambio, reembolso o reclamo</td>
                <td>Revisar y responder tu solicitud.</td>
              </tr>
              <tr>
                <th scope="row">Valoración y comentario de tus reseñas</th>
                <td>Al opinar sobre un producto que recibiste</td>
                <td>
                  Publicarla junto al producto con tu nombre y la inicial de tu
                  apellido. Tu correo nunca se publica.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  Datos técnicos: dirección IP, navegador, fecha y hora
                </th>
                <td>En cada visita</td>
                <td>
                  Los registran nuestros proveedores de alojamiento para que el
                  sitio funcione y sea seguro. No los usamos para crear perfiles
                  ni para publicidad.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Al registrarte también comprobamos que el dominio de tu correo (por
          ejemplo, <em>gmail.com</em>) pueda recibir mensajes. Esa consulta
          solo usa el dominio, no tu dirección completa.
        </p>
      </section>

      <section aria-labelledby="privacy-basis">
        <h2 id="privacy-basis">3. Por qué podemos tratarlos</h2>
        <ul>
          <li>
            <strong>Tu consentimiento</strong>, que das al crear la cuenta
            aceptando esta política. Puedes retirarlo cuando quieras pidiendo
            que eliminemos tu cuenta.
          </li>
          <li>
            <strong>La relación que tienes con la tienda</strong>: sin tu
            dirección y teléfono no podemos gestionar un pedido.
          </li>
          <li>
            <strong>La seguridad del sitio</strong>, por ejemplo para evitar
            accesos no autorizados.
          </li>
          <li><strong>Las obligaciones legales</strong> que nos apliquen.</li>
        </ul>
      </section>

      <section aria-labelledby="privacy-access">
        <h2 id="privacy-access">4. Quién puede ver tus datos</h2>
        <p>
          Dentro de la tienda, cada persona del equipo ve solo lo que necesita
          su función:
        </p>
        <ul>
          <li>
            <strong>Soporte</strong> ve tu nombre, tu correo, tus pedidos con
            sus datos de entrega y tus solicitudes de ayuda.
          </li>
          <li>
            <strong>Administración</strong> ve lo mismo que Soporte, la lista
            de cuentas para asignar permisos y, para moderarlas, el nombre y el
            correo de quien escribió cada reseña.
          </li>
          <li>
            <strong>Cualquier visitante</strong> ve tus reseñas publicadas, con
            tu nombre y la inicial de tu apellido.
          </li>
          <li>
            <strong>Inventario</strong> ve las existencias de productos. En el
            historial de existencias, cada compra aparece con el nombre de la
            cuenta que la hizo.
          </li>
        </ul>
        <p>
          Además, estos proveedores tratan datos por cuenta nuestra y solo para
          prestarnos su servicio:
        </p>
        <ul>
          @for (processor of processors; track processor.name) {
            <li>
              <strong>{{ processor.name }}</strong
              >: {{ processor.purpose }}
            </li>
          }
        </ul>
        <p>
          <strong>No vendemos, alquilamos ni cedemos tus datos</strong> a nadie
          para publicidad. Solo los entregaríamos a una autoridad cuando una ley
          o una orden judicial nos obligue.
        </p>
      </section>

      <section aria-labelledby="privacy-transfers">
        <h2 id="privacy-transfers">5. Datos fuera de la República Dominicana</h2>
        <p>
          Algunos de los proveedores anteriores guardan la información en
          servidores de Estados Unidos o de la Unión Europea. Solo trabajamos
          con proveedores que se comprometen a proteger los datos que
          procesan.
        </p>
      </section>

      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">6. Cuánto tiempo los guardamos</h2>
        <ul>
          <li>
            <strong
              >Cuenta, direcciones, favoritos, pedidos, solicitudes y
              reseñas</strong
            >: mientras tu cuenta exista o hasta que borres la reseña. Si pides
            eliminar la cuenta, los borramos o los anonimizamos, salvo lo que
            una ley nos obligue a conservar.
          </li>
          <li>
            <strong>Códigos de verificación y de recuperación</strong>: vencen
            a los 15 minutos y se borran en cuanto se usan.
          </li>
          <li>
            <strong>Sesión</strong>: dura una hora. Tu navegador la guarda solo
            mientras la pestaña está abierta y la borra al cerrar sesión.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-rights">
        <h2 id="privacy-rights">7. Tus derechos y cómo ejercerlos</h2>
        <p>Puedes pedirnos en cualquier momento:</p>
        <ul>
          <li><strong>Acceso</strong>: saber qué datos tuyos tenemos.</li>
          <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
          <li>
            <strong>Cancelación</strong>: eliminar tu cuenta y tus datos.
          </li>
          <li>
            <strong>Oposición</strong>: que dejemos de usarlos para un fin
            concreto.
          </li>
        </ul>
        <p>
          Puedes cambiar tu nombre en
          <a routerLink="/profile">Mi cuenta</a>, editar o borrar tus
          direcciones en <a routerLink="/addresses">Mis direcciones</a> y
          editar o borrar tus reseñas en la página de cada producto. Para todo
          lo demás, escribe a
          @if (business.email) {
            <a [href]="'mailto:' + business.email">{{ business.email }}</a>
          } @else {
            <app-business-value value="" />
          }
          desde el correo de tu cuenta, para que podamos comprobar que eres tú.
          Es gratis.
        </p>
        <p>
          Si no quedas conforme con nuestra respuesta, puedes ejercer la acción
          de hábeas data ante los tribunales dominicanos.
        </p>
      </section>

      <section aria-labelledby="privacy-security">
        <h2 id="privacy-security">8. Cómo protegemos tus datos</h2>
        <ul>
          <li>La conexión con el sitio viaja cifrada (HTTPS).</li>
          <li>
            Las contraseñas y los códigos de verificación se guardan con
            cifrado de un solo sentido.
          </li>
          <li>Cada función del equipo tiene permisos separados.</li>
          <li>Las sesiones caducan a la hora.</li>
        </ul>
        <p>
          Ningún sistema es infalible. Si ocurre un incidente que afecte tus
          datos, te avisaremos.
        </p>
      </section>

      <section aria-labelledby="privacy-minors">
        <h2 id="privacy-minors">9. Menores de edad</h2>
        <p>
          El sitio está dirigido a mayores de 18 años. Si descubrimos una cuenta
          de un menor, la eliminaremos.
        </p>
      </section>

      <section aria-labelledby="privacy-cookies">
        <h2 id="privacy-cookies">10. Cookies</h2>
        <p>
          No usamos cookies de analítica ni de publicidad. Los detalles están
          en la <a routerLink="/cookies">Política de cookies</a>.
        </p>
      </section>

      <section aria-labelledby="privacy-changes">
        <h2 id="privacy-changes">11. Cambios en esta política</h2>
        <p>
          Si cambiamos algo importante, actualizaremos la fecha de arriba y te
          lo avisaremos en el sitio antes de que el cambio se aplique.
        </p>
      </section>
    </article>
  `,
})
export class PrivacyComponent {
  readonly business = BUSINESS;
  readonly processors = DATA_PROCESSORS;
}
