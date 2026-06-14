import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonButton,
  IonSpinner,
  IonNote,
  IonToggle,
  IonBadge,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  repeatOutline,
  trashOutline,
  calendarOutline,
  trendingUpOutline,
  trendingDownOutline,
  closeOutline,
  saveOutline,
  timeOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { RecurringTransaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../models/transaction.model';

@Component({
  selector: 'app-recurring',
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
    IonButton,
    IonSpinner,
    IonNote,
    IonToggle,
    IonBadge,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    IonTextarea
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="page-toolbar">
        <ion-title>
          <div class="page-title">
            <ion-icon name="repeat-outline"></ion-icon>
            Otomatik İşlemler
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page-content" [fullscreen]="true">
      <div class="page-wrapper">

        <!-- Açıklama -->
        <div class="info-card">
          <ion-icon name="time-outline"></ion-icon>
          <p>Her ay belirlediğin günde otomatik gelir/gider oluşturulur. Örn: Burs, maaş, kredi kartı ödemesi.</p>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </div>

        <!-- Boş -->
        <div *ngIf="!isLoading && recurringList.length === 0 && !showForm" class="empty-state">
          <ion-icon name="repeat-outline" class="empty-icon"></ion-icon>
          <p>Henüz otomatik işlem yok</p>
          <p class="empty-sub">+ butonuna tıklayarak ekleyin</p>
        </div>

        <!-- Liste -->
        <ion-list *ngIf="!isLoading && recurringList.length > 0 && !showForm" class="recurring-list">
          <ion-item-sliding *ngFor="let rec of recurringList">
            <ion-item class="recurring-item" lines="none">
              <div class="rec-icon" slot="start" [class.income]="rec.type === 'income'" [class.expense]="rec.type === 'expense'">
                <ion-icon [name]="rec.type === 'income' ? 'trending-up-outline' : 'trending-down-outline'"></ion-icon>
              </div>
              <ion-label>
                <h3>{{ rec.title }}</h3>
                <p>{{ rec.category }} · Her ayın <strong>{{ rec.dayOfMonth }}</strong>. günü</p>
                <p class="rec-status">
                  <ion-badge [color]="rec.isActive ? 'success' : 'medium'">
                    {{ rec.isActive ? 'Aktif' : 'Pasif' }}
                  </ion-badge>
                </p>
              </ion-label>
              <ion-note slot="end" [class.income-amount]="rec.type === 'income'" [class.expense-amount]="rec.type === 'expense'">
                {{ rec.type === 'income' ? '+' : '-' }}{{ rec.amount | number:'1.2-2' }} ₺
              </ion-note>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option [color]="rec.isActive ? 'warning' : 'success'" (click)="toggleActive(rec)">
                {{ rec.isActive ? 'Durdur' : 'Aktif Et' }}
              </ion-item-option>
              <ion-item-option color="danger" (click)="confirmDelete(rec)">
                <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>

        <!-- Ekleme Formu -->
        <div *ngIf="showForm" class="form-section">
          <h3 class="form-title-text">Yeni Otomatik İşlem</h3>

          <!-- Tür -->
          <ion-segment [(ngModel)]="newRecurring.type" (ionChange)="onTypeChange()" mode="ios" class="type-segment">
            <ion-segment-button value="income">
              <ion-label>💰 Gelir</ion-label>
            </ion-segment-button>
            <ion-segment-button value="expense">
              <ion-label>💸 Gider</ion-label>
            </ion-segment-button>
          </ion-segment>

          <!-- Başlık -->
          <div class="field-group">
            <label class="field-label">Başlık</label>
            <ion-input [(ngModel)]="newRecurring.title" placeholder="Örn: Burs, Kredi Kartı" fill="outline" class="custom-input"></ion-input>
          </div>

          <!-- Miktar -->
          <div class="field-group">
            <label class="field-label">Miktar (₺)</label>
            <ion-input type="number" [(ngModel)]="newRecurring.amount" placeholder="0.00" fill="outline" class="custom-input" inputmode="decimal"></ion-input>
          </div>

          <!-- Kategori -->
          <div class="field-group">
            <label class="field-label">Kategori</label>
            <ion-select [(ngModel)]="newRecurring.category" placeholder="Kategori seçin" interface="action-sheet" fill="outline" class="custom-select">
              <ion-select-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</ion-select-option>
            </ion-select>
          </div>

          <!-- Ayın Günü -->
          <div class="field-group">
            <label class="field-label">
              <ion-icon name="calendar-outline"></ion-icon>
              Ayın Günü (1-31)
            </label>
            <ion-input type="number" [(ngModel)]="newRecurring.dayOfMonth" placeholder="Örn: 15" fill="outline" class="custom-input" min="1" max="31" inputmode="numeric"></ion-input>
          </div>

          <!-- Açıklama -->
          <div class="field-group">
            <label class="field-label">Açıklama (Opsiyonel)</label>
            <ion-textarea [(ngModel)]="newRecurring.description" placeholder="Açıklama..." fill="outline" class="custom-input" [rows]="2"></ion-textarea>
          </div>

          <!-- Butonlar -->
          <div class="form-buttons">
            <ion-button expand="block" (click)="saveRecurring()" [disabled]="isSaving" class="save-btn">
              <ion-spinner *ngIf="isSaving" name="crescent" slot="start"></ion-spinner>
              <ion-icon *ngIf="!isSaving" name="save-outline" slot="start"></ion-icon>
              Kaydet
            </ion-button>
            <ion-button expand="block" fill="outline" (click)="showForm = false" class="cancel-btn">
              <ion-icon name="close-outline" slot="start"></ion-icon>
              İptal
            </ion-button>
          </div>
        </div>
      </div>

      <!-- FAB -->
      <ion-fab *ngIf="!showForm" vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openForm()" class="add-fab">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .page-toolbar { --background: transparent; --border-width: 0; }
    .page-content { --background: #0f0c29; }
    .page-title {
      display: flex; align-items: center; gap: 8px;
      color: #fff; font-size: 22px; font-weight: 700;
    }
    .page-title ion-icon { color: #6C63FF; }
    .page-wrapper { padding: 8px 16px 100px; }

    .info-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 16px; margin-bottom: 20px;
      background: rgba(108, 99, 255, 0.1);
      border: 1px solid rgba(108, 99, 255, 0.2);
      border-radius: 14px;
    }
    .info-card ion-icon { font-size: 24px; color: #6C63FF; flex-shrink: 0; margin-top: 2px; }
    .info-card p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; }

    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 64px; color: rgba(108, 99, 255, 0.3); margin-bottom: 16px; }
    .empty-state p { color: rgba(255,255,255,0.5); font-size: 15px; }
    .empty-sub { font-size: 13px !important; }

    .recurring-list { background: transparent; padding: 0; }
    .recurring-item {
      --background: rgba(255,255,255,0.05);
      --padding-start: 12px; --padding-end: 12px;
      margin-bottom: 8px; border-radius: 14px; --border-radius: 14px;
    }
    .rec-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; margin-right: 12px;
    }
    .rec-icon.income { background: rgba(48, 209, 88, 0.15); }
    .rec-icon.income ion-icon { color: #30d158; font-size: 22px; }
    .rec-icon.expense { background: rgba(255, 69, 58, 0.15); }
    .rec-icon.expense ion-icon { color: #ff453a; font-size: 22px; }
    .recurring-item ion-label h3 { color: #fff; font-weight: 600; font-size: 15px; margin-bottom: 4px; }
    .recurring-item ion-label p { color: rgba(255,255,255,0.4); font-size: 13px; margin: 2px 0; }
    .rec-status { margin-top: 4px !important; }
    .income-amount { color: #30d158 !important; font-weight: 700; font-size: 15px; }
    .expense-amount { color: #ff453a !important; font-weight: 700; font-size: 15px; }

    .form-section { animation: fadeInUp 0.4s ease-out; }
    .form-title-text { color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .type-segment {
      --background: rgba(255,255,255,0.08); border-radius: 14px; margin-bottom: 20px;
    }
    .type-segment ion-segment-button {
      --color: rgba(255,255,255,0.5); --color-checked: #fff;
      --indicator-color: #6C63FF; --border-radius: 12px;
      font-weight: 600; min-height: 44px; font-size: 15px;
    }
    .field-group { margin-bottom: 16px; }
    .field-label {
      display: flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500;
      margin-bottom: 8px; padding-left: 4px;
    }
    .field-label ion-icon { font-size: 16px; color: #6C63FF; }
    .custom-input {
      --background: rgba(255,255,255,0.08); --color: #fff;
      --placeholder-color: rgba(255,255,255,0.3); --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px; --padding-start: 16px; --highlight-color-focused: #6C63FF; font-size: 15px;
    }
    .custom-select {
      --background: rgba(255,255,255,0.08); --color: #fff;
      --placeholder-color: rgba(255,255,255,0.3); --border-color: rgba(255,255,255,0.15);
      --border-radius: 14px; --padding-start: 16px; font-size: 15px;
    }
    .form-buttons { margin-top: 16px; }
    .save-btn {
      --background: linear-gradient(135deg, #6C63FF, #a78bfa);
      --border-radius: 14px; --box-shadow: 0 8px 24px rgba(108, 99, 255, 0.4);
      font-weight: 600; font-size: 16px; height: 50px; margin-bottom: 10px;
    }
    .cancel-btn {
      --border-color: rgba(255,255,255,0.2); --color: rgba(255,255,255,0.6);
      --border-radius: 14px; font-weight: 500; height: 46px;
    }
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
export class RecurringPage implements OnInit, OnDestroy {
  private firestoreService = inject(FirestoreService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  recurringList: RecurringTransaction[] = [];
  isLoading = true;
  showForm = false;
  isSaving = false;
  categories: string[] = EXPENSE_CATEGORIES;

  newRecurring: RecurringTransaction = {
    title: '',
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    dayOfMonth: 1,
    isActive: true
  };

  private subscription?: Subscription;

  constructor() {
    addIcons({
      addOutline, repeatOutline, trashOutline, calendarOutline,
      trendingUpOutline, trendingDownOutline, closeOutline,
      saveOutline, timeOutline
    });
  }

  ngOnInit() {
    this.loadRecurring();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadRecurring() {
    this.isLoading = true;
    try {
      this.subscription = this.firestoreService.getRecurringTransactions().subscribe({
        next: (list) => {
          this.recurringList = list;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Tekrarlayan işlemler yüklenemedi:', err);
          this.isLoading = false;
        }
      });
    } catch (e) {
      this.isLoading = false;
    }
  }

  onTypeChange() {
    this.categories = this.newRecurring.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    this.newRecurring.category = '';
  }

  openForm() {
    this.showForm = true;
    this.newRecurring = {
      title: '', amount: 0, type: 'expense', category: '',
      description: '', dayOfMonth: 1, isActive: true
    };
    this.categories = EXPENSE_CATEGORIES;
  }

  async saveRecurring() {
    if (!this.newRecurring.title.trim()) {
      await this.showToast('Lütfen başlık giriniz', 'warning');
      return;
    }
    if (!this.newRecurring.amount || Number(this.newRecurring.amount) <= 0) {
      await this.showToast('Lütfen geçerli miktar giriniz', 'warning');
      return;
    }
    if (!this.newRecurring.category) {
      await this.showToast('Lütfen kategori seçiniz', 'warning');
      return;
    }
    if (this.newRecurring.dayOfMonth < 1 || this.newRecurring.dayOfMonth > 31) {
      await this.showToast('Gün 1-31 arasında olmalı', 'warning');
      return;
    }

    this.isSaving = true;
    try {
      await this.firestoreService.addRecurring(this.newRecurring);
      this.showForm = false;
      await this.showToast('Otomatik işlem eklendi ✓', 'success');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      await this.showToast('Kaydetme sırasında hata oluştu', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  async toggleActive(rec: RecurringTransaction) {
    try {
      await this.firestoreService.updateRecurring(rec.id!, { isActive: !rec.isActive });
      await this.showToast(rec.isActive ? 'İşlem durduruldu' : 'İşlem aktif edildi', 'primary');
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  }

  async confirmDelete(rec: RecurringTransaction) {
    const alert = await this.alertController.create({
      header: 'Otomatik İşlemi Sil',
      message: `"${rec.title}" otomatik işlemini silmek istediğinize emin misiniz?`,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'İptal', role: 'cancel' },
        {
          text: 'Sil', role: 'destructive',
          handler: async () => {
            await this.firestoreService.deleteRecurring(rec.id!);
            await this.showToast('Otomatik işlem silindi', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message, duration: 2000, position: 'bottom', color, cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
