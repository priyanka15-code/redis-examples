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

  constructor(private api: LoginService) { }

  ngOnInit(): void {
   this.fetchAllData()
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
