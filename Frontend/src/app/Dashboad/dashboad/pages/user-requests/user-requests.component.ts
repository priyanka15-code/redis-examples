import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';
import { forkJoin } from 'rxjs';

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
  businessNameMap: { [id: string]: { name: string, id: string } } = {}; 
   isModalOpen = false;
  userData = {
    userId: '',
    username: '',
    password: '',
    email: '',
    businessId: ''
  };
  filteredUsers: any[] = [];

  constructor(private api: LoginService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin([this.api.getBusiness(),this.api.getback(), this.api.getMerge()]).subscribe({
      next: ([businessIds, merge]) => {
        this.businessIds = businessIds;
        this.merge = merge;
        this.createBusinessNameMap();
      },
      error: (err) => this.showError(err)
    });
  }
  handleFormSubmission(formData: any): void {
    this.userData.businessId = formData.businessId; 
    this.userData.userId = formData.userId;
    this.userData.password = formData.password;
    this.userData.email = formData.email;
    this.userData.username = formData.username;
    this.register(); 
  }
  register(): void {
    const registrationData = {
      userId: this.userData.userId,
      username: this.userData.username,
      password: this.userData.password,
      email: this.userData.email,
      business: this.userData.businessId 
    };
  
    this.api.registerback(registrationData).subscribe({
      next: () => {
        this.showToastMessage('Registration Successful', 'success');
        this.loadInitialData(); 
        this.closeModal();      
      },
      error: (err) => this.showError(err)
    });
  }
  

  triggerRequests(): void {
    this.api.processRequests().then(() => {
      this.showToastMessage('Request Sent', 'success');
      this.loadInitialData(); 
    }).catch(err => {
      this.showError(err);
    });
  }
  

  filterUsers(): void {
    if (this.selectedBusinessId) {
      this.api.filterByBusiness(this.selectedBusinessId).subscribe({
        next: (filteredUsers) => {
          this.merge = filteredUsers;
          
        },
        error: (err) => this.showError(err)
      });
    } else {
      this.loadInitialData();
    }
  }
  
 createBusinessNameMap(): void {
  this.businessNameMap = this.businessIds.reduce((map, business) => {
    map[business._id] = {
      name: business.businessname,
      id: business._id
    };
    return map;
  }, {});
}


getBusinessName(businessId: string): { name: string, id: string } {
  return this.businessNameMap[businessId] || { name: 'Unknown Business', id: 'Unknown ID' };
}

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  showError(err: any): void {
    console.error(err);
    this.showToastMessage('An error occurred', 'error');
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}



