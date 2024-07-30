import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboadComponent } from './dashboad.component';
import { DashbordLayoutComponent } from './dashbord-layout/dashbord-layout.component';
import { NavbarComponent } from '../navbar/navbar.component';

const routes: Routes = [
  {
    path: '',
    component: DashbordLayoutComponent,
    children: [
      { path: '', component: DashboadComponent },
      { path: '', component:NavbarComponent}
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
