import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessRequestsComponent } from './business-requests.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { path: '', component: BusinessRequestsComponent }
];

@NgModule({
  declarations: [BusinessRequestsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class BusinessModule {}
