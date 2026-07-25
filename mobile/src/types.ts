export type TransactionType = 'EXPENSE' | 'INCOME' | 'SAVING';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
export type RecurrenceFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  notes?: string;
  categoryId: string;
  category: Category;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  billingDate?: string;
  createdAt?: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalSaving?: number;
  balance: number;
  monthlyLimit: number | null;
  budgetProgressPercentage: number;
  categoryBreakdown: CategoryBreakdown[];
  transactionCount: number;
}
