import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../Services/customer.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  products: any[] = [];
  searchProductForm!: FormGroup;

  constructor(private customerService: CustomerService, 
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
    this.customerService.getAllProducts().subscribe(res => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.img;
        this.products.push(element);
      });
    })
  }

  subimtForm(){
    this.products = [];
    const title = this.searchProductForm.get('title')?.value;
    this.customerService.getAllProductsByName(title).subscribe(res => {
      res.forEach((element: any) => {
        element.processedImg = 'data:image/jpeg;base64,' + element.img;
        this.products.push(element);
      });
      console.log(this.products);
    })
  }

  addTocart(id: any){
  }
}
