import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Transaction, RecurringTransaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Aktif kullanıcı UID'sini al
  private getUserId(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Kullanıcı oturumu açık değil');
    return uid;
  }

  // ═══════════════════════════════════════════════════════════
  //    Kullanıcı Bilgisi Kaydet (Hocanın kullaniciBilgiKaydet)
  // ═══════════════════════════════════════════════════════════
  kullaniciBilgiKaydet(uid: string, ad: string, email: string) {
    const kullaniciDoc = doc(this.firestore, `kullanicilar/${uid}`);
    const userInfo = {
      ad: ad,
      email: email,
      kayitTarihi: Math.floor(Date.now() / 1000)
    };
    return setDoc(kullaniciDoc, userInfo);
  }

  // ═══════════════════════════════════════════════════════════
  //   CREATE - addDoc ile yeni gelir/gider ekle
  //   Subcollection: kullanicilar/{uid}/islemler
  // ═══════════════════════════════════════════════════════════
  async addTransaction(transaction: Transaction): Promise<string> {
    const uid = this.getUserId();
    const colRef = collection(this.firestore, `kullanicilar/${uid}/islemler`);
    const docData = {
      title: transaction.title,
      amount: Number(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      date: Timestamp.fromDate(new Date(transaction.date)),
      tarih: Math.floor(Date.now() / 1000)
    };
    const docRef = await addDoc(colRef, docData);
    return docRef.id;
  }

  // ═══════════════════════════════════════════════════════════
  //   READ - collectionData ile listeleme
  //   Subcollection: kullanicilar/{uid}/islemler
  // ═══════════════════════════════════════════════════════════
  getTransactions(): Observable<Transaction[]> {
    const uid = this.getUserId();
    const colRef = collection(this.firestore, `kullanicilar/${uid}/islemler`);
    return collectionData(colRef, { idField: 'id' }).pipe(
      map((docs: any[]) => {
        const mapped = docs.map(d => ({
          id: d.id,
          title: d.title,
          amount: Number(d.amount),
          type: d.type,
          category: d.category,
          description: d.description,
          date: d.date instanceof Timestamp ? d.date.toDate() : new Date(d.date),
          tarih: d.tarih
        }));
        // İstemci tarafında tarihe göre azalan sıralama
        return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    );
  }

  // ═══════════════════════════════════════════════════════════
  //   Tek işlem getir (Hocanın urunGetir fonksiyonu gibi)
  //   docData kullanımı
  // ═══════════════════════════════════════════════════════════
  getTransaction(id: string): Observable<Transaction> {
    const uid = this.getUserId();
    const docRef = doc(this.firestore, `kullanicilar/${uid}/islemler/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Transaction>;
  }

  // ═══════════════════════════════════════════════════════════
  //   UPDATE - doc + updateDoc ile güncelleme
  //   Subcollection: kullanicilar/{uid}/islemler/{id}
  // ═══════════════════════════════════════════════════════════
  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    const uid = this.getUserId();
    const docRef = doc(this.firestore, `kullanicilar/${uid}/islemler/${id}`);
    
    // updateData nesnesini temiz oluştur (undefined değerleri elemek için)
    const updateData: any = {};
    if (transaction.title !== undefined) updateData.title = transaction.title;
    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.category !== undefined) updateData.category = transaction.category;
    if (transaction.description !== undefined) {
      updateData.description = transaction.description;
    } else {
      updateData.description = '';
    }
    if (transaction.amount) {
      updateData.amount = Number(transaction.amount);
    }
    if (transaction.date) {
      updateData.date = Timestamp.fromDate(new Date(transaction.date));
    }
    
    updateData.tarih = Math.floor(Date.now() / 1000);

    await updateDoc(docRef, updateData);
  }

  // ═══════════════════════════════════════════════════════════
  //   DELETE - doc + deleteDoc ile silme
  //   Subcollection: kullanicilar/{uid}/islemler/{id}
  // ═══════════════════════════════════════════════════════════
  async deleteTransaction(id: string): Promise<void> {
    const uid = this.getUserId();
    const docRef = doc(this.firestore, `kullanicilar/${uid}/islemler/${id}`);
    await deleteDoc(docRef);
  }

  // ═══════════════════════════════════════════════════════════
  //   TEKRARLAYAN İŞLEMLER (Otomasyon)
  //   Subcollection: kullanicilar/{uid}/tekrarlayan_islemler
  // ═══════════════════════════════════════════════════════════

  async addRecurring(recurring: RecurringTransaction): Promise<string> {
    const uid = this.getUserId();
    const colRef = collection(this.firestore, `kullanicilar/${uid}/tekrarlayan_islemler`);
    const docData = {
      title: recurring.title,
      amount: Number(recurring.amount),
      type: recurring.type,
      category: recurring.category,
      description: recurring.description || '',
      dayOfMonth: recurring.dayOfMonth,
      isActive: true,
      lastExecutedDate: '',
      tarih: Math.floor(Date.now() / 1000)
    };
    const docRef = await addDoc(colRef, docData);
    return docRef.id;
  }

  getRecurringTransactions(): Observable<RecurringTransaction[]> {
    const uid = this.getUserId();
    const colRef = collection(this.firestore, `kullanicilar/${uid}/tekrarlayan_islemler`);
    return collectionData(colRef, { idField: 'id' }).pipe(
      map((docs: any[]) =>
        docs.map(d => ({
          id: d.id,
          title: d.title,
          amount: Number(d.amount),
          type: d.type,
          category: d.category,
          description: d.description,
          dayOfMonth: d.dayOfMonth,
          isActive: d.isActive,
          lastExecutedDate: d.lastExecutedDate || '',
          tarih: d.tarih
        }))
      )
    );
  }

  async updateRecurring(id: string, data: Partial<RecurringTransaction>): Promise<void> {
    const uid = this.getUserId();
    const docRef = doc(this.firestore, `kullanicilar/${uid}/tekrarlayan_islemler/${id}`);
    const updateData: any = { ...data };
    if (data.amount) updateData.amount = Number(data.amount);
    delete updateData.id;
    await updateDoc(docRef, updateData);
  }

  async deleteRecurring(id: string): Promise<void> {
    const uid = this.getUserId();
    const docRef = doc(this.firestore, `kullanicilar/${uid}/tekrarlayan_islemler/${id}`);
    await deleteDoc(docRef);
  }

  // ═══════════════════════════════════════════════════════════
  //   OTOMATİK İŞLEM ÇALIŞTIRMA
  // ═══════════════════════════════════════════════════════════
  async executeRecurringTransactions(): Promise<number> {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    let executedCount = 0;

    return new Promise((resolve) => {
      this.getRecurringTransactions().subscribe({
        next: async (recurringList) => {
          for (const rec of recurringList) {
            if (!rec.isActive) continue;
            if (rec.lastExecutedDate === currentMonthKey) continue;

            if (currentDay >= rec.dayOfMonth) {
              const autoTransaction: Transaction = {
                title: `[Otomatik] ${rec.title}`,
                amount: rec.amount,
                type: rec.type,
                category: rec.category,
                description: rec.description || `Otomatik tekrarlayan işlem - Her ayın ${rec.dayOfMonth}. günü`,
                date: new Date(today.getFullYear(), today.getMonth(), rec.dayOfMonth)
              };

              try {
                await this.addTransaction(autoTransaction);
                await this.updateRecurring(rec.id!, { lastExecutedDate: currentMonthKey });
                executedCount++;
              } catch (error) {
                console.error(`Otomatik işlem hatası (${rec.title}):`, error);
              }
            }
          }
          resolve(executedCount);
        },
        error: () => resolve(0)
      });
    });
  }
}
