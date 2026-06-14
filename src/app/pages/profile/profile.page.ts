import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  mailOutline,
  calendarOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  walletOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="profile-toolbar">
        <ion-title>
          <div class="page-title">
            <ion-icon name="person-circle-outline"></ion-icon>
            Profil
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="profile-content" [fullscreen]="true">
      <div class="profile-wrapper">
        <!-- Profil Kartı -->
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar">
              <span>{{ getInitials() }}</span>
            </div>
            <h2>{{ userName }}</h2>
            <p>{{ userEmail }}</p>
          </div>
        </div>

        <!-- Bilgiler -->
        <div class="info-section">
          <h3 class="section-title">Hesap Bilgileri</h3>

          <ion-list class="info-list">
            <ion-item class="info-item" lines="none">
              <ion-icon name="person-circle-outline" slot="start" class="info-icon"></ion-icon>
              <ion-label>
                <p class="info-label">Ad Soyad</p>
                <h3>{{ userName }}</h3>
              </ion-label>
            </ion-item>

            <ion-item class="info-item" lines="none">
              <ion-icon name="mail-outline" slot="start" class="info-icon"></ion-icon>
              <ion-label>
                <p class="info-label">E-posta</p>
                <h3>{{ userEmail }}</h3>
              </ion-label>
            </ion-item>

            <ion-item class="info-item" lines="none">
              <ion-icon name="shield-checkmark-outline" slot="start" class="info-icon"></ion-icon>
              <ion-label>
                <p class="info-label">Hesap Durumu</p>
                <h3>Aktif</h3>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>

        <!-- Uygulama Bilgisi -->
        <div class="app-info">
          <ion-icon name="wallet-outline" class="app-info-icon"></ion-icon>
          <p>CüzdanApp v1.0</p>
          <p class="app-sub">Kişisel Finans Takipçisi</p>
        </div>

        <!-- Çıkış Butonu -->
        <ion-button
          id="logout-button"
          expand="block"
          fill="outline"
          (click)="confirmLogout()"
          class="logout-button"
        >
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Çıkış Yap
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .profile-content {
      --background: #0f0c29;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 22px;
      font-weight: 700;
    }

    .page-title ion-icon {
      color: #6C63FF;
    }

    .profile-wrapper {
      padding: 16px 20px 40px;
    }

    .profile-card {
      background: linear-gradient(135deg, #302b63, #6C63FF);
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      margin-bottom: 28px;
      animation: fadeInUp 0.6s ease-out;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      border: 3px solid rgba(255,255,255,0.3);
    }

    .avatar span {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .avatar-section h2 {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .avatar-section p {
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      margin: 0;
    }

    .section-title {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-left: 4px;
    }

    .info-list {
      background: transparent;
      padding: 0;
    }

    .info-item {
      --background: rgba(255,255,255,0.05);
      --padding-start: 16px;
      --padding-end: 16px;
      margin-bottom: 8px;
      border-radius: 14px;
      --border-radius: 14px;
    }

    .info-icon {
      color: #6C63FF;
      font-size: 24px;
      margin-right: 12px;
    }

    .info-label {
      color: rgba(255,255,255,0.4) !important;
      font-size: 12px !important;
      margin-bottom: 2px;
    }

    .info-item ion-label h3 {
      color: #fff;
      font-weight: 600;
      font-size: 15px;
    }

    .app-info {
      text-align: center;
      margin: 32px 0 24px;
    }

    .app-info-icon {
      font-size: 36px;
      color: rgba(108, 99, 255, 0.4);
      margin-bottom: 8px;
    }

    .app-info p {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      margin: 2px 0;
    }

    .app-sub {
      font-size: 12px !important;
      color: rgba(255,255,255,0.3) !important;
    }

    .logout-button {
      --border-color: #ff453a;
      --color: #ff453a;
      --border-radius: 14px;
      --border-width: 2px;
      font-weight: 600;
      font-size: 16px;
      height: 52px;
    }

    .logout-button:hover {
      --background: rgba(255, 69, 58, 0.1);
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ProfilePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  userName = '';
  userEmail = '';

  constructor() {
    addIcons({
      personCircleOutline, mailOutline, calendarOutline,
      logOutOutline, shieldCheckmarkOutline, walletOutline
    });

    const user = this.authService.getCurrentUser();
    this.userName = user?.displayName || 'Kullanıcı';
    this.userEmail = user?.email || '';
  }

  getInitials(): string {
    return this.userName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'İptal',
          role: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          role: 'destructive',
          handler: async () => {
            await this.authService.signOut();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
