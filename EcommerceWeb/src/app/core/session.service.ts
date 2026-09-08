import { Injectable, signal } from "@angular/core";
import { Auth, User } from "./models";

@Injectable({ providedIn: "root" })
export class SessionService {
  readonly user = signal<User | null>(null);
  readonly message = signal("");
  readonly isError = signal(false);
  get token(): string | null {
    return sessionStorage.getItem("ecommerce-token");
  }
  signIn(auth: Auth): void {
    sessionStorage.setItem("ecommerce-token", auth.token);
    this.user.set(auth.user);
  }
  clear(): void {
    sessionStorage.removeItem("ecommerce-token");
    this.user.set(null);
  }
  notify(message: string, isError = false): void {
    this.isError.set(isError);
    this.message.set(message);
  }
}
