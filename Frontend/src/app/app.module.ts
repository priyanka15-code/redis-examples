import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ToastComponent } from './toast/toast.component';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { CookieService } from 'ngx-cookie-service';
import { AppRoutingModule } from './app-routing.module';  

@NgModule({
  declarations: [AppComponent, LoginComponent,  ToastComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    StoreModule.forRoot({ auth: authReducer }),
    EffectsModule.forRoot([AuthEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    AppRoutingModule  
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
