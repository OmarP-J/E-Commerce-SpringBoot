import { Injectable, inject } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { SessionService } from "./session.service";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }
  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }
  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const token = this.session.token;
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    try {
      return await firstValueFrom(
        this.http.request<T>(method, "/api" + path, { body, headers }),
      );
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && !path.startsWith("/auth/")) {
          this.session.clear();
          void this.router.navigateByUrl("/login");
        }
        this.session.notify(
          error.error?.message ||
            (error.status === 0
              ? "No se pudo conectar con el servidor."
              : "No se pudo completar la operación."),
          true,
        );
      } else this.session.notify("Ocurrió un error inesperado.", true);
      throw error;
    }
  }
}
