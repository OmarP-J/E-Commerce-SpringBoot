import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Address } from "../core/models";
import { Page } from "../core/page";

interface AddressDraft {
  id: number | null;
  label: string;
  recipientName: string;
  addressLine: string;
  city: string;
  phone: string;
  defaultAddress: boolean;
}

@Component({
  imports: [FormsModule],
  template: `
    <div class="section-heading">
      <div>
        <p class="eyebrow">ENTREGAS</p>
        <h1>Mis direcciones</h1>
        <p class="page-lead">
          Guarda los lugares que usas con frecuencia y completa tu compra más
          rápido.
        </p>
      </div>
      <button
        type="button"
        class="secondary"
        [disabled]="busy"
        (click)="load()"
      >
        Actualizar
      </button>
    </div>
    <div class="workspace-grid">
      <form class="panel stack" #addressForm="ngForm" (ngSubmit)="save()">
        <div class="section-heading compact-heading">
          <h2>
            {{ draft.id === null ? "Nueva dirección" : "Editar dirección" }}
          </h2>
          @if (draft.id !== null) {
            <button type="button" class="text-button" (click)="reset()">
              Cancelar
            </button>
          }
        </div>
        <label
          >Nombre corto<input
            name="label"
            [(ngModel)]="draft.label"
            required
            maxlength="60"
            placeholder="Casa, oficina…"
        /></label>
        <label
          >Persona que recibe<input
            name="recipientName"
            [(ngModel)]="draft.recipientName"
            required
            maxlength="80"
            autocomplete="name"
        /></label>
        <label
          >Dirección<textarea
            name="addressLine"
            [(ngModel)]="draft.addressLine"
            required
            maxlength="300"
            rows="3"
            autocomplete="street-address"
            placeholder="Calle, número y sector"
          ></textarea>
        </label>
        <div class="form-row">
          <label
            >Ciudad<input
              name="city"
              [(ngModel)]="draft.city"
              required
              maxlength="100"
              autocomplete="address-level2" /></label
          ><label
            >Teléfono<input
              type="tel"
              name="phone"
              [(ngModel)]="draft.phone"
              required
              minlength="7"
              maxlength="30"
              pattern="[+0-9() .-]+"
              autocomplete="tel"
          /></label>
        </div>
        <label class="check-row"
          ><input
            type="checkbox"
            name="defaultAddress"
            [(ngModel)]="draft.defaultAddress"
          /><span>Usar como dirección principal</span></label
        >
        <button [disabled]="addressForm.invalid || busy">
          {{
            busy
              ? "Guardando…"
              : draft.id === null
                ? "Guardar dirección"
                : "Guardar cambios"
          }}
        </button>
      </form>

      <section class="card-list" aria-label="Direcciones guardadas">
        @for (address of addresses; track address.id) {
          <article class="panel address-card">
            <div>
              <span class="badge">{{
                address.defaultAddress ? "Principal" : "Guardada"
              }}</span>
              <h2>{{ address.label }}</h2>
            </div>
            <p>
              <strong>{{ address.recipientName }}</strong
              ><br />{{ address.addressLine }}<br />{{ address.city }} ·
              {{ address.phone }}
            </p>
            <div class="actions compact-actions">
              <button
                type="button"
                class="secondary"
                [disabled]="busy"
                (click)="edit(address)"
              >
                Editar</button
              ><button
                type="button"
                class="text-button"
                [disabled]="busy"
                (click)="remove(address)"
              >
                Eliminar
              </button>
            </div>
          </article>
        } @empty {
          @if (!busy) {
            <section class="empty panel">
              <h2>No tienes direcciones guardadas.</h2>
              <p>Crea la primera con el formulario.</p>
            </section>
          }
        }
      </section>
    </div>
  `,
})
export class AddressesComponent extends Page implements OnInit {
  addresses: Address[] = [];
  draft: AddressDraft = this.empty();
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    void this.execute(async () => {
      this.addresses = await this.api.get<Address[]>("/customer/addresses");
    });
  }
  edit(address: Address): void {
    this.draft = { ...address };
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  reset(): void {
    this.draft = this.empty();
  }
  save(): void {
    void this.execute(async () => {
      const payload = {
        ...this.draft,
        label: this.draft.label.trim(),
        recipientName: this.draft.recipientName.trim(),
        addressLine: this.draft.addressLine.trim(),
        city: this.draft.city.trim(),
        phone: this.draft.phone.trim(),
      };
      const editing = this.draft.id !== null;
      if (editing)
        await this.api.put<Address>(
          "/customer/addresses/" + this.draft.id,
          payload,
        );
      else await this.api.post<Address>("/customer/addresses", payload);
      this.reset();
      this.addresses = await this.api.get<Address[]>("/customer/addresses");
      this.session.notify(
        editing ? "Dirección actualizada." : "Dirección guardada.",
      );
    });
  }
  remove(address: Address): void {
    void this.execute(async () => {
      await this.api.delete<void>("/customer/addresses/" + address.id);
      if (this.draft.id === address.id) this.reset();
      this.addresses = await this.api.get<Address[]>("/customer/addresses");
      this.session.notify("Dirección eliminada.");
    });
  }
  private empty(): AddressDraft {
    return {
      id: null,
      label: "",
      recipientName: this.session.user()?.name ?? "",
      addressLine: "",
      city: "",
      phone: "",
      defaultAddress: false,
    };
  }
}
