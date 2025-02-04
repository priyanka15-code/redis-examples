import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = 'abcwx';
  password: string = '1234';
  email: string = 'abc@gmail.com';
  showLogin: boolean = true;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

  toggleForm(showLogin: boolean): void {
    this.showLogin = showLogin;
  }

  login(): void {
    this.loginService.login(this.username, this.password).subscribe({
      next: () => {
        this.showToastMessage('Login Successful', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.showToastMessage('Login Failed', 'error');
        console.error(err);
      }
    });
  }

  register(): void {
    this.loginService.register(this.username, this.password, this.email).subscribe({
      next: () => {
        this.showToastMessage('Registration Successful', 'success');
      },
      error: (err) => {
        this.showToastMessage('Registration Failed. <button (click)="undo()">Undo</button>', 'error', this.undo.bind(this));
        console.error(err);
      }
    });
  }

  undo(): void {
    this.showLogin = false;
  }

  showToastMessage(message: string, type: 'success' | 'error', undoCallback?: () => void): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
  
    if (undoCallback) {
      this.toastMessage ;
    }
  
    setTimeout(() => this.showToast = false, 5000);
  }
  
}
