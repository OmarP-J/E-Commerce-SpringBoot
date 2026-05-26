import { Component } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coupons',
  imports: [DemoAngularMaterialModule, CommonModule],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent {

  coupons: any;

  constructor(private adminService: AdminService){}

  ngOnInit() {
    this.getCoupons();
  }

  getCoupons(){
    this.adminService.getCoupons().subscribe(res =>{
      this.coupons = res;
    })
  }

}
