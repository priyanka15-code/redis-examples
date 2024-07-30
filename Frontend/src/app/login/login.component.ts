import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Store } from '@ngrx/store';
import { AuthState } from '../store/auth/auth.reducer';
import * as AuthActions from '../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = 'abc';
  password: string = '1234';
  email: string = '@gmail.com';
  showLogin: boolean = true;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private api: LoginService, private store: Store<AuthState>) {}

  ngOnInit(): void {}

  toggleForm(showLogin: boolean): void {
    this.showLogin = showLogin;
  }

  login(): void {
    this.store.dispatch(AuthActions.login({username: this.username, password: this.password}));
    this.showToastMessage('Login Successful', 'success');
  }

  register(): void {
    this.store.dispatch(AuthActions.register({username: this.username, password: this.password, email: this.email}));
    this.showToastMessage('Registration Successful', 'success');
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000); 
  }
}
