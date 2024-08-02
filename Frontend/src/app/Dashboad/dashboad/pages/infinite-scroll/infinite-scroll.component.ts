// src/app/Dashboad/dashboad/pages/infinite-scroll/infinite-scroll.component.ts
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.css']
})
export class InfiniteScrollComponent implements OnInit {
  items: string[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private api: LoginService) {}

  ngOnInit(): void {
    this.loadData();
  }

  toggleLoading = () => this.isLoading = !this.isLoading;

  loadData = () => {
    this.toggleLoading();
    this.api.getItems(this.currentPage, this.itemsPerPage).subscribe({
      next: response => this.items = response,
      error: err => console.log(err),
      complete: () => this.toggleLoading()
    });
  }

  appendData = () => {
    this.toggleLoading();
    this.api.getItems(this.currentPage, this.itemsPerPage).subscribe({
      next: response => this.items = [...this.items, ...response],
      error: err => console.log(err),
      complete: () => this.toggleLoading()
    });
  }

  onScroll = () => {
    this.currentPage++;
    this.appendData();
  }
}
