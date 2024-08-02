import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit{
constructor (private api: LoginService) {}
users: any[] = [];
showToast: boolean = false;
toastMessage: string = '';
toastType: 'success' | 'error' = 'success';

ngOnInit(): void {
  
    this.api.getUsers().subscribe((users: any[]) => {
      this.users = users;
      
    });
  
}

sendUserRequests(): void {
  this.api.sendUserRequests().subscribe(
    responses => {
      console.log('All user requests completed:', responses);
      this.showToastMessage('Send User Request', 'success');
    },
    error => {
      console.error('Error in user requests:', error);
    }
  );
}
onDelete(_id: string): void {
  this.api.deleteUser(_id).subscribe({
    next: () => {
      this.users = this.users.filter(user => user._id !== _id);
      this.showToastMessage('Delete Successful', 'success');
    },
    error: (err) => {
      console.error(err);
    }
  });
}
showToastMessage(message: string, type: 'success' | 'error'): void {
  this.toastMessage = message;
  this.toastType = type;
  this.showToast = true;
  setTimeout(() => this.showToast = false, 3000);
}




}
