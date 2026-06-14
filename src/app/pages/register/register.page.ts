import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, personOutline, mailOutline, lockClosedOutline, personAddOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
    IonText
  ],
  template: `
    <ion-content class="register-content" [fullscreen]="true">
      <div class="register-container">
        <!-- Logo ve Başlık -->
        <div class="logo-section">
          <div class="logo-icon">
            <ion-icon name="wallet-outline"></ion-icon>
          </div>
          <h1>Kayıt Ol</h1>
          <p class="subtitle">Finanslarını takip etmeye başla</p>
        </div>

        <!-- Kayıt Formu -->
        <div class="form-section">
          <div class="input-group">
            <ion-icon name="person-outline" class="input-icon"></ion-icon>
            <ion-input
              id="register-name"
              type="text"
              [(ngModel)]="displayName"
              placeholder="Ad Soyad"
              fill="outline"
              class="custom-input"
            ></ion-input>
          </div>

          <div class="input-group">
            <ion-icon name="mail-outline" class="input-icon"></ion-icon>
            <ion-input
              id="register-email"
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
              id="register-password"
              type="password"
              [(ngModel)]="password"
              placeholder="Şifre (en az 6 karakter)"
              fill="outline"
              class="custom-input"
            ></ion-input>
          </div>

          <div class="input-group">
            <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
            <ion-input
              id="register-confirm-password"
              type="password"
              [(ngModel)]="confirmPassword"
              placeholder="Şifre tekrar"
              fill="outline"
              class="custom-input"
            ></ion-input>
          </div>

          <!-- Hata Mesajı -->
          <ion-text color="danger" *ngIf="errorMessage" class="error-text">
            <p>{{ errorMessage }}</p>
          </ion-text>

          <!-- Başarı Mesajı -->
          <ion-text color="success" *ngIf="successMessage" class="success-text">
            <p>{{ successMessage }}</p>
          </ion-text>

          <!-- Kayıt Butonu -->
          <ion-button
            id="register-button"
            expand="block"
            (click)="register()"
            [disabled]="isLoading"
            class="register-button"
          >
            <ion-spinner *ngIf="isLoading" name="crescent" slot="start"></ion-spinner>
            <ion-icon *ngIf="!isLoading" name="person-add-outline" slot="start"></ion-icon>
            {{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
          </ion-button>

          <!-- Giriş Linki -->
          <div class="login-link">
            <p>Zaten hesabınız var mı?
              <a [routerLink]="['/login']">Giriş Yapın</a>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-content {
      --background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    }

    .register-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 24px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 40px;
      animation: fadeInDown 0.8s ease-out;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      border-radius: 22px;
      background: linear-gradient(135deg, #6C63FF, #a78bfa);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 10px 30px rgba(108, 99, 255, 0.4);
    }

    .logo-icon ion-icon {
      font-size: 38px;
      color: #fff;
    }

    h1 {
      color: #fff;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 6px;
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
      margin-bottom: 14px;
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

    .error-text, .success-text {
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

    .success-text p {
      font-size: 13px;
      margin: 0;
      padding: 8px 16px;
      background: rgba(48, 209, 88, 0.15);
      border-radius: 10px;
      border: 1px solid rgba(48, 209, 88, 0.3);
    }

    .register-button {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --border-radius: 14px;
      --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.4);
      font-weight: 600;
      font-size: 16px;
      height: 52px;
      margin-top: 8px;
    }

    .login-link {
      text-align: center;
      margin-top: 24px;
    }

    .login-link p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
    }

    .login-link a {
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
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    addIcons({ walletOutline, personOutline, mailOutline, lockClosedOutline, personAddOutline });
  }

  async register() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validasyon
    if (!this.displayName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Lütfen tüm alanları doldurunuz.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor.';
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.signUp(this.email, this.password, this.displayName);
      this.successMessage = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
      setTimeout(() => {
        this.router.navigate(['/tabs/dashboard']);
      }, 1500);
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
      } else {
        this.errorMessage = 'Kayıt sırasında bir hata oluştu.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
