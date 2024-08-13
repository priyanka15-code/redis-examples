import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RouterModule, Routes } from '@angular/router';
import { ScrollingComponent } from './scrolling.component';

const routes: Routes = [
  {path: '' ,component:ScrollingComponent
  }
]

@NgModule({
  declarations: [ScrollingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule
  ]
})
export class ScrollingModule { }
