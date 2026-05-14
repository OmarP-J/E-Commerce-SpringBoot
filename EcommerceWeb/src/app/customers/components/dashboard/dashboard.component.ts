import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../Services/customer.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
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

  submitForm(){
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
    this.customerService.addToCart(id).subscribe(res => {
      this.snackbar.open('Product added to cart successfully', 'Close', {
        duration: 3000,
      })
    })
  }
}
