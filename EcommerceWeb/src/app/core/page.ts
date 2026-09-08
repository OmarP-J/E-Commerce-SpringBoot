import { inject } from "@angular/core";
import { ApiService } from "./api.service";
import { SessionService } from "./session.service";

/** Shared UI behavior only; business rules remain on the server. */
export abstract class Page {
  protected readonly api = inject(ApiService);
  readonly session = inject(SessionService);
  busy = false;
  async execute(action: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.session.message.set("");
    try {
      await action();
    } catch {
      /* ApiService already shows a useful error to the user. */
    } finally {
      this.busy = false;
    }
  }
}
