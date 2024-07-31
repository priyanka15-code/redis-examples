import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboadComponent } from './dashboad.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { DashbordLayoutComponent } from './dashbord-layout/dashbord-layout.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboadComponent,
    DashbordLayoutComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    FormsModule
    
  ]
})
export class DashboardModule { }
