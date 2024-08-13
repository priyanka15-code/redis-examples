import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-business-requests',
  templateUrl: './business-requests.component.html',
  styleUrls: ['./business-requests.component.css']
})
export class BusinessRequestsComponent implements OnInit{
  business : any[] =[];
  showToast: boolean = false;
toastMessage: string = '';
toastType: 'success' | 'error' = 'success';

page: number = 1; 
  limit: number = 20; 
  totalPages: number = 1; 
  hasMore: boolean = true;
 constructor(private api:LoginService){

 }
 ngOnInit(): void {
 this.loadbusiness();
  }

  loadbusiness(): void{
    this.api.getBusiness().subscribe((business: any[]) => {
      this.business = business;
     })
  }

  sendBusinessRequests(): void {
    this.api.sendBusinessRequests().subscribe(
      responses => {
        console.log('All business requests completed:', responses);
        this.showToastMessage('Send Business Request', 'success');
        this.loadbusiness();

      },
      error => {
        console.error('Error in business requests:', error);
      }
    );
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
  onPageChange(page: number): void {
    this.page = page;
     
  }
}
