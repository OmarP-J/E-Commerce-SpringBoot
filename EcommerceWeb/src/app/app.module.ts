import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DemoAngularMaterialModule } from "./DemoAngularMaterialModule";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        SignupComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        DemoAngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }