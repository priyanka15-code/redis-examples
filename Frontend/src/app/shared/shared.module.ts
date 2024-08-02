import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';
import { PaginationComponent } from './pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ToastComponent, PaginationComponent],
  imports: [CommonModule,FormsModule],
  exports: [ToastComponent, PaginationComponent] 
})
export class SharedModule {}
