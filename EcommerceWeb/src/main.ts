import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { inject, provideAppInitializer, LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import spanish from "@angular/common/locales/es-DO";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { ApiService } from "./app/core/api.service";
import { SessionService } from "./app/core/session.service";
import { User } from "./app/core/models";

registerLocaleData(spanish);
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
        anchorScrolling: "enabled",
      }),
    ),
    { provide: LOCALE_ID, useValue: "es-DO" },
    provideAppInitializer(async () => {
      const api = inject(ApiService);
      const session = inject(SessionService);
      if (session.token) {
        try {
          session.user.set(await api.get<User>("/me"));
        } catch {
          session.clear();
        }
      }
    }),
  ],
}).catch(console.error);
