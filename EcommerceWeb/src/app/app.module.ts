import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { DemoAngularMaterialModule } from "./DemoAngularMaterialModule";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { RouterModule, RouterOutlet } from "@angular/router";

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        DemoAngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: []
})
export class AppModule { }