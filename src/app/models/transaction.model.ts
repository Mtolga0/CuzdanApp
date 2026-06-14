export interface Transaction {
  id?: string;
  userId?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tekrarlayan (Otomatik) İşlem modeli
export interface RecurringTransaction {
  id?: string;
  userId?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  dayOfMonth: number;        // Ayın hangi günü (1-31)
  isActive: boolean;         // Aktif mi?
  lastExecutedDate?: string; // Son çalıştırıldığı ay-yıl (YYYY-MM)
  createdAt?: Date;
}

export const INCOME_CATEGORIES: string[] = [
  'Maaş',
  'Burs',
  'Freelance',
  'Yatırım',
  'Hediye',
  'Diğer Gelir'
];

export const EXPENSE_CATEGORIES: string[] = [
  'Yiyecek & İçecek',
  'Ulaşım',
  'Konut & Kira',
  'Kredi Kartı',
  'Faturalar',
  'Sağlık',
  'Eğitim',
  'Eğlence',
  'Giyim',
  'Alışveriş',
  'Diğer Gider'
];
