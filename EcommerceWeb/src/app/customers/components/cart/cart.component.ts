import { Component } from '@angular/core';
import { CustomerService } from '../../Services/customer.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";

@Component({
  selector: 'app-cart',
  imports: [DemoAngularMaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  cartItems: any[] = [];
  order: any;

  couponForm!: FormGroup;

    constructor(
      private customerService: CustomerService,
      private snackBar: MatSnackBar,
      private fb: FormBuilder,
      public dialog: MatDialog
    ) {}

    ngOnInit(): void {
      this.couponForm = this.fb.group({
        code: [null, [Validators.required]]
      });
      this.getCart();
    }

    applyCoupon(){
      this.customerService.applyCoupon(this.couponForm.get(['code'])!.value).subscribe(res => {
        this.snackBar.open('Coupon applied successfully!', 'Close', {
          duration: 5000
        });
        this.getCart();
      }, error => {
        this.snackBar.open(error.error, 'Close', {
          duration: 5000
        });
      })
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