import { Component } from '@angular/core';
import { CustomerService } from '../../Services/customer.service';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";

@Component({
  selector: 'app-cart',
  imports: [BrowserAnimationsModule, DemoAngularMaterialModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  cartItems: any[] = [];
  order: any;

    constructor(
      private customerService: CustomerService,
      private snackBar: MatSnackBar,
      private fb: FormBuilder,
      public dialog: MatDialog
    ) {}

    ngOnInit(): void {
      this.getCart();
    }

    getCart(){
      this.cartItems = [];
      this.customerService.getCartByUserId(0).subscribe(res => {
        this.order = res;
        res.cartItems.forEach(element => {
          element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
          this.cartItems.push(element);
        });
    })
  }
}