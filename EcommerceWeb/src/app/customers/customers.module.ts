import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DemoAngularMaterialModule } from '../DemoAngularMaterialModule';
import { DashboardComponent } from './components/dashboard/dashboard.component';


@NgModule({
  declarations: [
    CustomersComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DemoAngularMaterialModule
  ]
})
export class CustomersModule { }
