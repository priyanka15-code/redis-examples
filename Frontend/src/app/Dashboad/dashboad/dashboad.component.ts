import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-dashboad',
  templateUrl: './dashboad.component.html',
  styleUrls: ['./dashboad.component.css']
})
export class DashboadComponent implements OnInit {
  users: any[] = [];
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
    this.api.getusers().subscribe(users => {
      this.users = users;
      this.filteredUsers = [...this.users];
      this.loadUsers();
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

  sendMultipleRequests(): void {
    this.loading = true;
    this.api.sendMultipleRequests().subscribe({
      next: (response) => {
        console.log('All requests completed:', response);
        this.loading = false;
        this.api.getusers().subscribe(users => {
          this.users = users;
          this.filterUsers(); 
          this.showToastMessage('Multi ', 'success');
        });
      },
      error: (err) => {
        console.error('Error in requests:', err);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
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

  onPageChange(page: number): void {
    this.page = page;
    this.loadUsers(); 
  }
}
