import { Component } from '@angular/core';
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { FormBuilder, FormGroup, FormsModule, Validators } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from 'express';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-post-coupon',
  imports: [DemoAngularMaterialModule, FormsModule, BrowserAnimationsModule],
  templateUrl: './post-coupon.component.html',
  styleUrl: './post-coupon.component.scss'
})
export class PostCouponComponent {

  couponForm!: FormGroup;

  constructor( private fb: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar,
    private adminService: AdminService){}

    ngOnInit(): void {
      this.couponForm = this.fb.group({
        name: [null, [Validators.required]],
        code: [null, [Validators.required]],
        discount: [null, [Validators.required]],
        expirationDate: [null, [Validators.required]]
      });
    }

    addCoupon(){
      if (this.couponForm.valid){
        this.adminService.addCoupon(this.couponForm.value).subscribe(res =>{
            if(res.id != null){
              this.snackbar.open('Coupon added successfully!', 'Close', {
                duration: 5000,
              });
              this.router.navigateByUrl('/admin/dashboard');
            }else {
              this.snackbar.open(res.message, 'Close', {
                duration: 5000,
                panelClass: 'error-Snackbar'
              });
            }
          })
        } else {
          this.couponForm.markAllAsTouched();
        }
      }
    }