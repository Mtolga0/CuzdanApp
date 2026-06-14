import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonNote,
  IonText,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trendingUpOutline,
  trendingDownOutline,
  createOutline,
  trashOutline,
  swapHorizontalOutline,
  walletOutline,
  filterOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonNote,
    IonText
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="transactions-toolbar">
        <ion-title>
          <div class="page-title">
            <ion-icon name="swap-horizontal-outline"></ion-icon>
            İşlemler
          </div>
        </ion-title>
      </ion-toolbar>
      <!-- Filtre Segment -->
      <ion-toolbar class="segment-toolbar">
        <ion-segment [(ngModel)]="selectedFilter" (ionChange)="filterTransactions()" mode="ios" class="custom-segment">
          <ion-segment-button value="all">
            <ion-label>Tümü</ion-label>
          </ion-segment-button>
          <ion-segment-button value="income">
            <ion-label>Gelir</ion-label>
          </ion-segment-button>
          <ion-segment-button value="expense">
            <ion-label>Gider</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="transactions-content" [fullscreen]="true">
      <div class="transactions-wrapper">
        <!-- Yükleniyor -->
        <div *ngIf="isLoading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <!-- Boş durum -->
        <div *ngIf="!isLoading && filteredTransactions.length === 0" class="empty-state">
          <ion-icon name="wallet-outline" class="empty-icon"></ion-icon>
          <p>{{ selectedFilter === 'all' ? 'Henüz işlem yok' : (selectedFilter === 'income' ? 'Gelir kaydı yok' : 'Gider kaydı yok') }}</p>
        </div>

        <!-- İşlem Listesi -->
        <ion-list *ngIf="!isLoading && filteredTransactions.length > 0" class="transaction-list">
          <ion-item-sliding *ngFor="let tx of filteredTransactions">
            <ion-item class="transaction-item" lines="none">
              <div class="tx-icon" slot="start" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
                <ion-icon [name]="tx.type === 'income' ? 'trending-up-outline' : 'trending-down-outline'"></ion-icon>
              </div>
              <ion-label>
                <h3>{{ tx.title }}</h3>
                <p>{{ tx.category }}</p>
                <p class="tx-date">{{ tx.date | date:'dd MMMM yyyy' }}</p>
              </ion-label>
              <ion-note slot="end" [class.income-amount]="tx.type === 'income'" [class.expense-amount]="tx.type === 'expense'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | number:'1.2-2' }} ₺
              </ion-note>
            </ion-item>

            <!-- Kaydırma seçenekleri -->
            <ion-item-options side="end">
              <ion-item-option color="primary" (click)="editTransaction(tx)">
                <ion-icon slot="icon-only" name="create-outline"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" (click)="confirmDelete(tx)">
                <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>

        <!-- Toplam Özet -->
        <div *ngIf="!isLoading && filteredTransactions.length > 0" class="summary-bar">
          <span>{{ filteredTransactions.length }} işlem</span>
          <span class="summary-total" [class.income-amount]="getFilteredTotal() >= 0" [class.expense-amount]="getFilteredTotal() < 0">
            Toplam: {{ getFilteredTotal() | number:'1.2-2' }} ₺
          </span>
        </div>
      </div>

      <!-- FAB -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button id="add-transaction-fab-list" (click)="goToAddTransaction()" class="add-fab">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .transactions-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .segment-toolbar {
      --background: transparent;
      --border-width: 0;
      padding: 0 16px 8px;
    }

    .transactions-content {
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

    .custom-segment {
      --background: rgba(255,255,255,0.08);
      border-radius: 12px;
    }

    .custom-segment ion-segment-button {
      --color: rgba(255,255,255,0.5);
      --color-checked: #fff;
      --indicator-color: #6C63FF;
      --border-radius: 10px;
      font-weight: 600;
      min-height: 36px;
      font-size: 14px;
    }

    .transactions-wrapper {
      padding: 8px 16px 100px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 64px;
      color: rgba(108, 99, 255, 0.3);
      margin-bottom: 16px;
    }

    .empty-state p {
      color: rgba(255,255,255,0.5);
      font-size: 15px;
    }

    .transaction-list {
      background: transparent;
      padding: 0;
    }

    .transaction-item {
      --background: rgba(255,255,255,0.05);
      --padding-start: 12px;
      --padding-end: 12px;
      margin-bottom: 8px;
      border-radius: 14px;
      --border-radius: 14px;
      overflow: hidden;
    }

    .tx-icon {
      width: 44px;
      height: 44px;
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
      margin-bottom: 2px;
    }

    .transaction-item ion-label p {
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      margin: 2px 0;
    }

    .tx-date {
      font-size: 12px !important;
      color: rgba(255,255,255,0.3) !important;
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

    .summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      margin-top: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      color: rgba(255,255,255,0.5);
      font-size: 14px;
    }

    .summary-total {
      font-weight: 700;
    }

    .add-fab {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.5);
    }
  `]
})
export class TransactionsPage implements OnInit, OnDestroy {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedFilter = 'all';
  isLoading = true;

  private subscription?: Subscription;

  constructor() {
    addIcons({
      addOutline, trendingUpOutline, trendingDownOutline,
      createOutline, trashOutline, swapHorizontalOutline,
      walletOutline, filterOutline
    });
  }

  ngOnInit() {
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
          this.allTransactions = transactions;
          this.filterTransactions();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('İşlemler yüklenirken hata:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.isLoading = false;
    }
  }

  filterTransactions() {
    if (this.selectedFilter === 'all') {
      this.filteredTransactions = [...this.allTransactions];
    } else {
      this.filteredTransactions = this.allTransactions.filter(t => t.type === this.selectedFilter);
    }
  }

  getFilteredTotal(): number {
    return this.filteredTransactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  }

  goToAddTransaction() {
    this.router.navigate(['/transaction-form']);
  }

  editTransaction(tx: Transaction) {
    this.router.navigate(['/transaction-form', tx.id]);
  }

  async confirmDelete(tx: Transaction) {
    const alert = await this.alertController.create({
      header: 'İşlemi Sil',
      message: `"${tx.title}" işlemini silmek istediğinize emin misiniz?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'İptal',
          role: 'cancel'
        },
        {
          text: 'Sil',
          role: 'destructive',
          handler: async () => {
            try {
              await this.firestoreService.deleteTransaction(tx.id!);
            } catch (error) {
              console.error('Silme hatası:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
