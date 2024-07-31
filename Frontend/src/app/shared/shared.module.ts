import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';
import { PaginationComponent } from './pagination/pagination.component'; 

@NgModule({
  declarations: [ToastComponent, PaginationComponent],
  imports: [CommonModule],
  exports: [ToastComponent, PaginationComponent] 
})
export class SharedModule {}
