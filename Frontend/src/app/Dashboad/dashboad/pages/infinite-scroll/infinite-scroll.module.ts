import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollComponent } from './infinite-scroll.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '' ,component:InfiniteScrollComponent}
]


@NgModule({
  declarations: [InfiniteScrollComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class InfiniteScrollModule { }
