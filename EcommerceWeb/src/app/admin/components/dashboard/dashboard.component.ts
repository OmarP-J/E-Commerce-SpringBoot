import { Component } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { AdminRoutingModule } from "../../admin-routing.module";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  imports: [BrowserAnimationsModule, DemoAngularMaterialModule, AdminRoutingModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  products: any[] = [];
  searchProductForm!: FormGroup;

  constructor(private adminService: AdminService, 
    private fb: FormBuilder, 
    private snackbar: MatSnackBar,) {}

  ngOnInit() {
    this.getAllProducts();
    this.searchProductForm = this.fb.group({
      title: [null, Validators.required]
    })
  }

  getAllProducts() {
    this.products = [];
    this.adminService.getAllProducts().subscribe(res => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.img;
        this.products.push(element);
      });
    })
  }

  subimtForm(){
    this.products = [];
    const title = this.searchProductForm.get('title')?.value;
    this.adminService.getAllProductsByName(title).subscribe(res => {
      res.forEach((element: any) => {
        element.processedImg = 'data:image/jpeg;base64,' + element.img;
        this.products.push(element);
      });
      console.log(this.products);
    })
  }

  deleteProduct(productId: any){
    this.adminService.deleteProduct(productId).subscribe(res => {
      if(res.body == null){
        this.snackbar.open('Product deleted successfully', 'Close', {
          duration: 5000
        });
        this.getAllProducts();
      }else{
        this.snackbar.open(res.message, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    })
  }
}

