import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-user-requests',
  templateUrl: './user-requests.component.html',
  styleUrls: ['./user-requests.component.css']
})
export class UserRequestsComponent implements OnInit {
  merge: any[] = [];
  businessIds: any[] = [];
  selectedBusinessId: string = '';
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  businessNameMap: { [id: string]: string } = {}; 
  isModalOpen = false;
username: string = 'abcd';
  password: string = '1234';
  email: string = 'abcd@gmail.com';
  userId: string = '02314';
  businessname: string = "";

  constructor(private api: LoginService) { }


  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  ngOnInit(): void {
   this.fetchAllData()
  }


  register(): void {
    this.api.registerbusiness(this.username, this.password, this.email, this.userId).subscribe({
      next: () => {
        this.showToastMessage('Registration Successful', 'success');
      },
      error: (err) => {
        this.showToastMessage('Registration Failed', 'error');
        console.error(err);
      }
    });
  }
  
  fetchAllData(){
    this.api.getMerge().subscribe((merge: any[]) => {
      this.merge = merge;
    });
    this.api.getBusiness().subscribe((businessIds: any[]) => {
      this.businessIds = businessIds;
      this.createBusinessNameMap();
    });
  }
  createBusinessNameMap() {
    this.businessNameMap = this.businessIds.reduce((map, business) => {
      map[business._id] = business.businessname;
      return map;
    }, {});
  }


  async triggerRequests() {
    await this.api.processRequests();
    this.showToastMessage('Send Request', 'success');
    this.fetchAllData();
  }

  getBusinessName(businessId: string): string {
    return this.businessNameMap[businessId] || 'Unknown Business';
  }
  filterUsers() {
    if (this.selectedBusinessId) {
      this.api.filterByBusiness(this.selectedBusinessId).subscribe((merge: any[]) => {
        this.merge = merge;
        
      });
    }
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
