import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';
import { PaginationComponent } from './pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { ModelComponent } from '../model/model.component';

@NgModule({
  declarations: [ToastComponent, PaginationComponent,ModelComponent],
  imports: [CommonModule,FormsModule],
  exports: [ToastComponent, PaginationComponent, ModelComponent] 
})
export class SharedModule {}
