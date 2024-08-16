import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-backno',
  templateUrl: './backno.component.html',
  styleUrls: ['./backno.component.css']
})
export class BacknoComponent implements OnInit{
  businessIds: any[] = [];
  selectedBusinessId: string = '';
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  businessNameMap: { [id: string]: { name: string, id: string } } = {}; 
  userData = {
    userId: '',
    username: '',
    password: '',
    email: '',
    businessId: ''
  };
   isModalOpen = false;

   constructor(private api: LoginService) {}

   ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin([this.api.getBusiness(), this.api.getMerge()]).subscribe({
      next: ([businessIds]) => {
        this.businessIds = businessIds;
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
        this.closeModal();      
      },
      error: (err) => this.showError(err)
    });
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
