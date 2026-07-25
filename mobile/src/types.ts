export type TransactionType = 'EXPENSE' | 'INCOME';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

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
  balance: number;
  monthlyLimit: number | null;
  budgetProgressPercentage: number;
  categoryBreakdown: CategoryBreakdown[];
  transactionCount: number;
}
