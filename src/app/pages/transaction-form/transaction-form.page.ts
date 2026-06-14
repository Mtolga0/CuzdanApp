import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
  IonText,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  saveOutline,
  cashOutline,
  textOutline,
  pricetagOutline,
  calendarOutline,
  documentTextOutline
} from 'ionicons/icons';
import { FirestoreService } from '../../services/firestore.service';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonSpinner,
    IonText,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="form-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/transactions" text="" icon="arrow-back-outline" color="light"></ion-back-button>
        </ion-buttons>
        <ion-title class="form-title">{{ isEditMode ? 'İşlemi Düzenle' : 'Yeni İşlem' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="form-content" [fullscreen]="true">
      <div class="form-wrapper">
        <!-- Tür Seçimi -->
        <div class="type-selector">
          <ion-segment [(ngModel)]="transaction.type" (ionChange)="onTypeChange()" mode="ios" class="type-segment">
            <ion-segment-button value="income">
              <ion-label>💰 Gelir</ion-label>
            </ion-segment-button>
            <ion-segment-button value="expense">
              <ion-label>💸 Gider</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Miktar -->
        <div class="amount-section">
          <label class="field-label">Miktar (₺)</label>
          <div class="amount-input-wrapper">
            <ion-input
              id="form-amount"
              type="number"
              [(ngModel)]="transaction.amount"
              placeholder="0.00"
              class="amount-input"
              fill="outline"
              inputmode="decimal"
            ></ion-input>
          </div>
        </div>

        <!-- Başlık -->
        <div class="field-group">
          <label class="field-label">
            <ion-icon name="text-outline"></ion-icon>
            Başlık
          </label>
          <ion-input
            id="form-title"
            type="text"
            [(ngModel)]="transaction.title"
            placeholder="İşlem başlığı"
            fill="outline"
            class="custom-input"
          ></ion-input>
        </div>

        <!-- Kategori -->
        <div class="field-group">
          <label class="field-label">
            <ion-icon name="pricetag-outline"></ion-icon>
            Kategori
          </label>
          <ion-select
            id="form-category"
            [(ngModel)]="transaction.category"
            placeholder="Kategori seçin"
            interface="action-sheet"
            class="custom-select"
            fill="outline"
          >
            <ion-select-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</ion-select-option>
          </ion-select>
        </div>

        <!-- Tarih -->
        <div class="field-group">
          <label class="field-label">
            <ion-icon name="calendar-outline"></ion-icon>
            Tarih
          </label>
          <ion-input
            id="form-date"
            type="date"
            [value]="dateString"
            (ionInput)="onDateInput($event)"
            fill="outline"
            class="custom-input"
          ></ion-input>
        </div>

        <!-- Açıklama -->
        <div class="field-group">
          <label class="field-label">
            <ion-icon name="document-text-outline"></ion-icon>
            Açıklama (Opsiyonel)
          </label>
          <ion-textarea
            id="form-description"
            [(ngModel)]="transaction.description"
            placeholder="Açıklama ekleyin..."
            fill="outline"
            class="custom-input"
            [rows]="3"
            [autoGrow]="true"
          ></ion-textarea>
        </div>

        <!-- Hata Mesajı -->
        <ion-text color="danger" *ngIf="errorMessage" class="error-text">
          <p>{{ errorMessage }}</p>
        </ion-text>

        <!-- Kaydet Butonu -->
        <ion-button
          id="form-save-button"
          expand="block"
          (click)="saveTransaction()"
          [disabled]="isSaving"
          class="save-button"
        >
          <ion-spinner *ngIf="isSaving" name="crescent" slot="start"></ion-spinner>
          <ion-icon *ngIf="!isSaving" name="save-outline" slot="start"></ion-icon>
          {{ isSaving ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Kaydet') }}
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .form-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .form-title {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
    }

    .form-content {
      --background: #0f0c29;
    }

    .form-wrapper {
      padding: 16px 20px 40px;
    }

    .type-selector {
      margin-bottom: 28px;
    }

    .type-segment {
      --background: rgba(255,255,255,0.08);
      border-radius: 14px;
    }

    .type-segment ion-segment-button {
      --color: rgba(255,255,255,0.5);
      --color-checked: #fff;
      --indicator-color: #6C63FF;
      --border-radius: 12px;
      font-weight: 600;
      min-height: 44px;
      font-size: 15px;
    }

    .amount-section {
      margin-bottom: 24px;
    }

    .amount-input {
      --background: rgba(255,255,255,0.08);
      --color: #fff;
      --placeholder-color: rgba(255,255,255,0.3);
      --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px;
      --padding-start: 16px;
      --highlight-color-focused: #6C63FF;
      font-size: 32px;
      font-weight: 700;
      text-align: center;
    }

    .field-group {
      margin-bottom: 18px;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .field-label ion-icon {
      font-size: 16px;
      color: #6C63FF;
    }

    .custom-input {
      --background: rgba(255,255,255,0.08);
      --color: #fff;
      --placeholder-color: rgba(255,255,255,0.3);
      --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px;
      --padding-start: 16px;
      --highlight-color-focused: #6C63FF;
      font-size: 15px;
    }

    .custom-select {
      --background: rgba(255,255,255,0.08);
      --color: #fff;
      --placeholder-color: rgba(255,255,255,0.3);
      --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px;
      --padding-start: 16px;
      font-size: 15px;
    }

    .error-text {
      display: block;
      text-align: center;
      margin-bottom: 16px;
    }

    .error-text p {
      font-size: 13px;
      margin: 0;
      padding: 10px 16px;
      background: rgba(255, 69, 58, 0.15);
      border-radius: 10px;
      border: 1px solid rgba(255, 69, 58, 0.3);
    }

    .save-button {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --border-radius: 14px;
      --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.4);
      font-weight: 600;
      font-size: 16px;
      height: 52px;
      margin-top: 12px;
    }
  `]
})
export class TransactionFormPage implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);

  transaction: Transaction = {
    title: '',
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    date: new Date()
  };

  dateString = '';
  categories: string[] = EXPENSE_CATEGORIES;
  isEditMode = false;
  editId = '';
  isSaving = false;
  errorMessage = '';

  constructor() {
    addIcons({
      arrowBackOutline, saveOutline, cashOutline,
      textOutline, pricetagOutline, calendarOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    // Tarih başlangıç değeri
    const now = new Date();
    this.dateString = now.toISOString().split('T')[0];
    this.transaction.date = now;

    // Düzenleme modunu kontrol et
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = id;
      this.loadTransaction(id);
    }
  }

  async loadTransaction(id: string) {
    // Firestore'dan işlemi yükle - getTransactions üzerinden filtreleme (sadece ilk değeri al)
    const sub = this.firestoreService.getTransactions().subscribe({
      next: (transactions) => {
        const found = transactions.find(t => t.id === id);
        if (found) {
          this.transaction = { ...found };
          this.dateString = new Date(found.date).toISOString().split('T')[0];
          this.categories = found.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        }
        sub.unsubscribe(); // Aboneliği anında iptal et (take(1) işlevi görür)
      }
    });
  }

  onTypeChange() {
    this.categories = this.transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    this.transaction.category = '';
  }

  onDateInput(event: any) {
    const value = event.detail.value;
    if (value) {
      this.dateString = value;
      this.transaction.date = new Date(value);
    }
  }

  async saveTransaction() {
    // Validasyon
    if (!this.transaction.title.trim()) {
      this.errorMessage = 'Lütfen başlık giriniz.';
      return;
    }
    if (!this.transaction.amount || Number(this.transaction.amount) <= 0) {
      this.errorMessage = 'Lütfen geçerli bir miktar giriniz.';
      return;
    }
    if (!this.transaction.category) {
      this.errorMessage = 'Lütfen kategori seçiniz.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      if (this.isEditMode) {
        await this.firestoreService.updateTransaction(this.editId, {
          title: this.transaction.title,
          amount: this.transaction.amount,
          type: this.transaction.type,
          category: this.transaction.category,
          description: this.transaction.description,
          date: new Date(this.dateString)
        });
        await this.showToast('İşlem güncellendi ✓');
      } else {
        this.transaction.date = new Date(this.dateString);
        await this.firestoreService.addTransaction(this.transaction);
        await this.showToast('İşlem eklendi ✓');
      }
      this.router.navigate(['/tabs/transactions']);
    } catch (error: any) {
      console.error('Kaydetme hatası:', error);
      this.errorMessage = 'Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
    } finally {
      this.isSaving = false;
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
