import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
  IonFab,
  IonFabButton,
  IonSpinner,
  IonNote,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  trendingUpOutline,
  trendingDownOutline,
  addOutline,
  timeOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
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
    IonFab,
    IonFabButton,
    IonSpinner,
    IonNote
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="dashboard-toolbar">
        <ion-title>
          <div class="greeting">
            <span class="greeting-text">Merhaba, {{ userName }} 👋</span>
            <span class="greeting-sub">Finansal durumunuz</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content" [fullscreen]="true">
      <div class="dashboard-wrapper">
        <!-- Ana Bakiye Kartı -->
        <div class="balance-card">
          <div class="balance-card-inner">
            <div class="balance-label">Toplam Bakiye</div>
            <div class="balance-amount" [class.positive]="totalBalance >= 0" [class.negative]="totalBalance < 0">
              {{ totalBalance | number:'1.2-2' }} ₺
            </div>
            <div class="balance-stats">
              <div class="stat income-stat">
                <ion-icon name="arrow-up-circle-outline"></ion-icon>
                <div>
                  <span class="stat-label">Gelir</span>
                  <span class="stat-value">{{ totalIncome | number:'1.2-2' }} ₺</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat expense-stat">
                <ion-icon name="arrow-down-circle-outline"></ion-icon>
                <div>
                  <span class="stat-label">Gider</span>
                  <span class="stat-value">{{ totalExpense | number:'1.2-2' }} ₺</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Son İşlemler -->
        <div class="section-header">
          <h2>
            <ion-icon name="time-outline"></ion-icon>
            Son İşlemler
          </h2>
        </div>

        <div *ngIf="isLoading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <div *ngIf="!isLoading && recentTransactions.length === 0" class="empty-state">
          <ion-icon name="wallet-outline" class="empty-icon"></ion-icon>
          <p>Henüz işlem eklenmemiş</p>
          <p class="empty-sub">İlk işleminizi eklemek için + butonuna tıklayın</p>
        </div>

        <ion-list *ngIf="!isLoading && recentTransactions.length > 0" class="transaction-list">
          <ion-item *ngFor="let tx of recentTransactions" class="transaction-item" lines="none">
            <div class="tx-icon" slot="start" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
              <ion-icon [name]="tx.type === 'income' ? 'trending-up-outline' : 'trending-down-outline'"></ion-icon>
            </div>
            <ion-label>
              <h3>{{ tx.title }}</h3>
              <p>{{ tx.category }} · {{ tx.date | date:'dd MMM yyyy' }}</p>
            </ion-label>
            <ion-note slot="end" [class.income-amount]="tx.type === 'income'" [class.expense-amount]="tx.type === 'expense'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | number:'1.2-2' }} ₺
            </ion-note>
          </ion-item>
        </ion-list>
      </div>

      <!-- FAB Butonu -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button id="add-transaction-fab" (click)="goToAddTransaction()" class="add-fab">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .dashboard-toolbar {
      --background: transparent;
      --border-width: 0;
      padding: 8px 0;
    }

    .dashboard-content {
      --background: #0f0c29;
    }

    .greeting {
      display: flex;
      flex-direction: column;
    }

    .greeting-text {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }

    .greeting-sub {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      font-weight: 400;
    }

    .dashboard-wrapper {
      padding: 0 16px 100px;
    }

    /* Bakiye Kartı */
    .balance-card {
      margin: 16px 0 24px;
      border-radius: 20px;
      background: linear-gradient(135deg, #302b63 0%, #6C63FF 100%);
      padding: 2px;
      animation: fadeInUp 0.6s ease-out;
    }

    .balance-card-inner {
      background: linear-gradient(135deg, rgba(48, 43, 99, 0.95) 0%, rgba(108, 99, 255, 0.85) 100%);
      border-radius: 18px;
      padding: 28px 24px;
    }

    .balance-label {
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .balance-amount {
      font-size: 36px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }

    .balance-amount.positive { color: #30d158; }
    .balance-amount.negative { color: #ff453a; }

    .balance-stats {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .stat ion-icon {
      font-size: 28px;
    }

    .income-stat ion-icon { color: #30d158; }
    .expense-stat ion-icon { color: #ff453a; }

    .stat-label {
      display: block;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }

    .stat-value {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      margin: 0 16px;
    }

    /* Section Header */
    .section-header {
      margin-bottom: 12px;
    }

    .section-header h2 {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .section-header h2 ion-icon {
      color: #6C63FF;
    }

    /* Loading */
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 64px;
      color: rgba(108, 99, 255, 0.3);
      margin-bottom: 16px;
    }

    .empty-state p {
      color: rgba(255,255,255,0.5);
      margin: 4px 0;
    }

    .empty-sub {
      font-size: 13px;
    }

    /* İşlem Listesi */
    .transaction-list {
      background: transparent;
      padding: 0;
    }

    .transaction-item {
      --background: rgba(255,255,255,0.05);
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-padding-end: 0;
      margin-bottom: 8px;
      border-radius: 14px;
      --border-radius: 14px;
      overflow: hidden;
    }

    .tx-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .tx-icon.income {
      background: rgba(48, 209, 88, 0.15);
    }

    .tx-icon.income ion-icon { color: #30d158; font-size: 22px; }

    .tx-icon.expense {
      background: rgba(255, 69, 58, 0.15);
    }

    .tx-icon.expense ion-icon { color: #ff453a; font-size: 22px; }

    .transaction-item ion-label h3 {
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .transaction-item ion-label p {
      color: rgba(255,255,255,0.4);
      font-size: 13px;
    }

    .income-amount {
      color: #30d158 !important;
      font-weight: 700;
      font-size: 15px;
    }

    .expense-amount {
      color: #ff453a !important;
      font-weight: 700;
      font-size: 15px;
    }

    /* FAB */
    .add-fab {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.5);
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  userName = '';
  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  totalIncome = 0;
  totalExpense = 0;
  totalBalance = 0;
  isLoading = true;

  private subscription?: Subscription;

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.displayName || 'Kullanıcı';

    // Otomatik tekrarlayan işlemleri çalıştır
    try {
      const count = await this.firestoreService.executeRecurringTransactions();
      if (count > 0) {
        const toast = await this.toastController.create({
          message: `${count} otomatik işlem uygulandı ✓`,
          duration: 3000,
          position: 'top',
          color: 'primary',
          cssClass: 'custom-toast'
        });
        await toast.present();
      }
    } catch (e) {
      // İlk girişte tekrarlayan yoksa sessizce geç
    }

    this.loadTransactions();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadTransactions() {
    this.isLoading = true;
    try {
      this.subscription = this.firestoreService.getTransactions().subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.recentTransactions = transactions.slice(0, 5);
          this.calculateTotals();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('İşlemler yüklenirken hata:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Subscription hatası:', error);
      this.isLoading = false;
    }
  }

  calculateTotals() {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.totalExpense = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.totalBalance = this.totalIncome - this.totalExpense;
  }

  goToAddTransaction() {
    this.router.navigate(['/transaction-form']);
  }
}

