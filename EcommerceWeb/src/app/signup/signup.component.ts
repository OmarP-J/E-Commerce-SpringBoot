import { Component } from '@angular/core';
import { DemoAngularMaterialModule } from "../DemoAngularMaterialModule";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@Component({
  selector: 'app-signup',
  imports: [DemoAngularMaterialModule, BrowserAnimationsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

}
