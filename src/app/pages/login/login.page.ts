import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonCheckbox
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, mailOutline, lockClosedOutline, logInOutline, closeCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonCheckbox
  ],
  template: `
    <ion-content class="login-content" [fullscreen]="true">
      <div class="login-container">
        <!-- Logo ve Başlık -->
        <div class="logo-section">
          <div class="logo-icon">
            <ion-icon name="wallet-outline"></ion-icon>
          </div>
          <h1>CüzdanApp</h1>
          <p class="subtitle">Kişisel Finans Takipçiniz</p>
        </div>

        <!-- Saved Account Selection -->
        <div class="saved-account-section" *ngIf="!showLoginForm && savedAccount">
          <div class="account-card" (click)="quickLogin()">
            <div class="account-avatar">{{ savedAccount.initial }}</div>
            <div class="account-details">
              <h3>{{ savedAccount.displayName || 'Kayıtlı Kullanıcı' }}</h3>
              <p>{{ savedAccount.email }}</p>
            </div>
            <div class="remove-account" (click)="removeSavedAccount($event)">
              <ion-icon name="close-circle-outline"></ion-icon>
            </div>
          </div>
          
          <div class="other-account" (click)="showLoginForm = true">
            <p>Başka bir hesapla giriş yap</p>
          </div>
          
          <!-- Yükleniyor / Hata -->
          <div *ngIf="isLoading" style="text-align: center; margin-top: 20px;">
            <ion-spinner name="crescent" color="light"></ion-spinner>
          </div>
          <ion-text color="danger" *ngIf="errorMessage && !isLoading" class="error-text" style="margin-top: 16px;">
            <p>{{ errorMessage }}</p>
          </ion-text>
        </div>

        <!-- Login Formu -->
        <div class="form-section" *ngIf="showLoginForm">
          <div class="input-group">
            <ion-icon name="mail-outline" class="input-icon"></ion-icon>
            <ion-input
              id="login-email"
              type="email"
              [(ngModel)]="email"
              placeholder="E-posta adresiniz"
              fill="outline"
              class="custom-input"
            ></ion-input>
          </div>

          <div class="input-group">
            <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
            <ion-input
              id="login-password"
              type="password"
              [(ngModel)]="password"
              placeholder="Şifreniz"
              fill="outline"
              class="custom-input"
            ></ion-input>
          </div>

          <!-- Beni Hatırla -->
          <div class="remember-me-section">
            <ion-checkbox [(ngModel)]="rememberMe" labelPlacement="end">Beni Hatırla</ion-checkbox>
          </div>

          <!-- Hata Mesajı -->
          <ion-text color="danger" *ngIf="errorMessage" class="error-text">
            <p>{{ errorMessage }}</p>
          </ion-text>

          <!-- Giriş Butonu -->
          <ion-button
            id="login-button"
            expand="block"
            (click)="login()"
            [disabled]="isLoading"
            class="login-button"
          >
            <ion-spinner *ngIf="isLoading" name="crescent" slot="start"></ion-spinner>
            <ion-icon *ngIf="!isLoading" name="log-in-outline" slot="start"></ion-icon>
            {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </ion-button>

          <!-- Kayıt Linki -->
          <div class="register-link">
            <p>Hesabınız yok mu?
              <a [routerLink]="['/register']">Kayıt Olun</a>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content {
      --background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    }

    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 24px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 48px;
      animation: fadeInDown 0.8s ease-out;
    }

    .logo-icon {
      width: 90px;
      height: 90px;
      border-radius: 24px;
      background: linear-gradient(135deg, #6C63FF, #a78bfa);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 30px rgba(108, 99, 255, 0.4);
    }

    .logo-icon ion-icon {
      font-size: 42px;
      color: #fff;
    }

    h1 {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 15px;
      margin: 0;
    }

    .form-section {
      width: 100%;
      max-width: 400px;
      animation: fadeInUp 0.8s ease-out;
    }

    .input-group {
      position: relative;
      margin-bottom: 16px;
    }

    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.5);
      font-size: 20px;
      z-index: 10;
    }

    .custom-input {
      --background: rgba(255,255,255,0.08);
      --color: #fff;
      --placeholder-color: rgba(255,255,255,0.4);
      --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px;
      --padding-start: 48px;
      --highlight-color-focused: #6C63FF;
      font-size: 15px;
    }

    .saved-account-section {
      width: 100%;
      max-width: 400px;
      animation: fadeInUp 0.5s ease-out;
    }
    
    .account-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .account-card:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    
    .account-avatar {
      width: 50px;
      height: 50px;
      border-radius: 25px;
      background: linear-gradient(135deg, #6C63FF, #a78bfa);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      margin-right: 16px;
    }
    
    .account-details h3 {
      margin: 0 0 4px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
    
    .account-details p {
      margin: 0;
      color: rgba(255,255,255,0.6);
      font-size: 13px;
    }
    
    .remove-account {
      position: absolute;
      right: 16px;
      color: rgba(255,255,255,0.4);
      font-size: 24px;
      padding: 4px;
      display: flex;
    }
    
    .remove-account:hover {
      color: #ff453a;
    }
    
    .other-account {
      text-align: center;
      margin-top: 20px;
      cursor: pointer;
    }
    
    .other-account p {
      color: #a78bfa;
      font-weight: 600;
      font-size: 14px;
      margin: 0;
    }

    .remember-me-section {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      padding-left: 4px;
    }

    ion-checkbox {
      --size: 20px;
      --checkbox-background-checked: #6C63FF;
      --border-color: rgba(255,255,255,0.4);
      --border-color-checked: #6C63FF;
      font-size: 14px;
      color: rgba(255,255,255,0.8);
    }

    .error-text {
      display: block;
      text-align: center;
      margin-bottom: 12px;
    }

    .error-text p {
      font-size: 13px;
      margin: 0;
      padding: 8px 16px;
      background: rgba(255, 69, 58, 0.15);
      border-radius: 10px;
      border: 1px solid rgba(255, 69, 58, 0.3);
    }

    .login-button {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --border-radius: 14px;
      --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.4);
      font-weight: 600;
      font-size: 16px;
      height: 52px;
      margin-top: 8px;
      --padding-start: 24px;
      --padding-end: 24px;
    }

    .login-button:hover {
      --box-shadow: 0 12px 32px rgba(108, 99, 255, 0.6);
    }

    .register-link {
      text-align: center;
      margin-top: 24px;
    }

    .register-link p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
    }

    .register-link a {
      color: #a78bfa;
      text-decoration: none;
      font-weight: 600;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = true;
  isLoading = false;
  errorMessage = '';
  
  savedAccount: any = null;
  showLoginForm = true;

  constructor() {
    addIcons({ walletOutline, mailOutline, lockClosedOutline, logInOutline, closeCircleOutline });
  }

  ngOnInit() {
    const savedStr = localStorage.getItem('savedAccount');
    if (savedStr) {
      try {
        this.savedAccount = JSON.parse(savedStr);
        this.showLoginForm = false;
        this.email = this.savedAccount.email; // Fallback için doldur
      } catch (e) {
        this.showLoginForm = true;
      }
    } else {
      // Eski savedEmail mantığı için geriye dönük uyumluluk
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        this.email = savedEmail;
        this.rememberMe = true;
      }
    }
  }

  removeSavedAccount(event: Event) {
    event.stopPropagation();
    localStorage.removeItem('savedAccount');
    this.savedAccount = null;
    this.showLoginForm = true;
  }

  async quickLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signIn(this.savedAccount.email, this.savedAccount.password, true);
      this.router.navigate(['/tabs/dashboard']);
    } catch (error: any) {
      console.error('Hızlı giriş hatası:', error);
      this.errorMessage = 'Oturum açılamadı, şifre değişmiş olabilir. Lütfen normal giriş yapın.';
      // 2 saniye sonra formu göster
      setTimeout(() => {
        this.showLoginForm = true;
        this.errorMessage = '';
      }, 2000);
    } finally {
      this.isLoading = false;
    }
  }

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Lütfen e-posta ve şifrenizi giriniz.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signIn(this.email, this.password, this.rememberMe);
      
      if (this.rememberMe) {
        // Hızlı giriş için hesap bilgilerini kaydet
        const user = this.authService.getCurrentUser();
        const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : this.email.charAt(0).toUpperCase();
        
        const accountData = {
          email: this.email,
          password: this.password, // LocalStorage'da şifre saklamak production için önerilmez, final projesi simülasyonu için kullanılıyor
          displayName: user?.displayName || '',
          initial: initial
        };
        localStorage.setItem('savedAccount', JSON.stringify(accountData));
      } else {
        localStorage.removeItem('savedAccount');
        localStorage.removeItem('savedEmail');
      }
      
      this.router.navigate(['/tabs/dashboard']);
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        this.errorMessage = 'E-posta veya şifre hatalı.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.';
      } else {
        this.errorMessage = 'Giriş yapılırken bir hata oluştu.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
