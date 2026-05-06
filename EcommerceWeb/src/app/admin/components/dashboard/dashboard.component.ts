import { Component } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { AdminRoutingModule } from "../../admin-routing.module";

@Component({
  selector: 'app-dashboard',
  imports: [BrowserAnimationsModule, DemoAngularMaterialModule, AdminRoutingModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  products: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.getAllProducts();
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
}
