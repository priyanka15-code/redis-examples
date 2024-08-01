import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-dashboad',
  templateUrl: './dashboad.component.html',
  styleUrls: ['./dashboad.component.css']
})
export class DashboadComponent implements OnInit {
  users: any[] = [];
  business: any[] =[];
  filteredUsers: any[] = [];
  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  page: number = 1; 
  limit: number = 20; 
  totalPages: number = 1; 
  hasMore: boolean = true;

  searchBy: 'userId' | 'username' | 'email' | null = null; 
  searchTerm = {
    userId: '',
    username: '',
    email: ''
  };

  constructor(private api: LoginService) {}

  ngOnInit(): void {
   
      this.loadUsers();
      this.loadBusiness();
    
  }

  loadUsers(): void {
    this.api.getUsers().subscribe((users: any[]) => {
      this.users = users;
      this.filterUsers();
    });
  }
  filterUsersByBusiness(businessId: string): void {
    this.loading = true;
    this.api.filterByBusiness(businessId).subscribe(
      (filteredUsers: any[]) => {
        this.filteredUsers = filteredUsers;
        this.loading = false;
      },
      error => {
        console.error('Error filtering users by business:', error);
        this.showToastMessage('Error filtering users', 'error');
        this.loading = false;
      }
    );
  }

  async triggerRequests() {
    await this.api.processRequests();
  }

 loadBusiness(): void {
  this.api.getBusiness().subscribe((business: any[]) => {
    this.business = business;
  });
}
  toggleSearch(field: 'userId' | 'username' | 'email'): void {
    this.searchBy = this.searchBy === field ? null : field;
    this.filterUsers();
  }

  filterUsers(): void {
    if (!this.searchBy) {
      this.filteredUsers = [...this.users];
      return;
    }
  
    if (!(this.searchBy in this.searchTerm)) {
      this.filteredUsers = [...this.users];
      return;
    }
  
    this.filteredUsers = this.users.filter(user => {
      const term = this.searchTerm[this.searchBy as keyof typeof this.searchTerm];
      return term && (user[this.searchBy as keyof typeof user] as string)?.toLowerCase().includes(term.toLowerCase());
    });
  }
  

  onDelete(_id: string): void {
    this.loading = true;
    this.api.deleteUser(_id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user._id !== _id);
        this.filterUsers(); 
        this.showToastMessage('Delete Successful', 'success');
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  sendUserRequests(): void {
    this.api.sendUserRequests().subscribe(
      responses => {
        console.log('All user requests completed:', responses);
      },
      error => {
        console.error('Error in user requests:', error);
      }
    );
  }

  sendBusinessRequests(): void {
    this.api.sendBusinessRequests().subscribe(
      responses => {
        console.log('All business requests completed:', responses);
      },
      error => {
        console.error('Error in business requests:', error);
      }
    );
  }

 /*  loadUsers(): void {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.api.getUsersPaginated(this.page, this.limit).subscribe(
      response => {
        if (response.length < this.limit) {
          this.hasMore = false;
        }
        this.users = response;
        this.filterUsers(); 
        this.totalPages = Math.ceil(response.length / this.limit);
        this.loading = false;
      },
      error => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    );
  }
 */
  
  onPageChange(page: number): void {
    this.page = page;
    this.loadUsers(); 
  }
}
