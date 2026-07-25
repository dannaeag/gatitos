import { Transaction, Category, MonthlySummary, TransactionType, PaymentMethod } from './types';

let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://radiant-volta-api.onrender.com/api';

export function setApiBaseUrl(url: string) {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned.endsWith('/api')) {
    cleaned += '/api';
  }
  API_BASE_URL = cleaned;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

// In-Memory Fallback Store with Cat Themes
const LOCAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Comida & Michi Snacks', icon: 'utensils', color: '#EF4444', type: 'EXPENSE' },
  { id: 'cat-2', name: 'Supermercado', icon: 'shopping-cart', color: '#F97316', type: 'EXPENSE' },
  { id: 'cat-3', name: 'Vivienda & Hogar', icon: 'home', color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat-4', name: 'Servicios & Luz/Agua', icon: 'zap', color: '#EAB308', type: 'EXPENSE' },
  { id: 'cat-5', name: 'Transporte & Auto', icon: 'car', color: '#8B5CF6', type: 'EXPENSE' },
  { id: 'cat-6', name: 'Entretenimiento & Juguetes', icon: 'film', color: '#EC4899', type: 'EXPENSE' },
  { id: 'cat-7', name: 'Salud & Vete', icon: 'activity', color: '#10B981', type: 'EXPENSE' },
  { id: 'cat-8', name: 'Suscripciones', icon: 'tv', color: '#6366F1', type: 'EXPENSE' },
  { id: 'cat-9', name: 'Salario / Sueldo', icon: 'briefcase', color: '#22C55E', type: 'INCOME' },
  { id: 'cat-10', name: 'Ventas & Servicios', icon: 'trending-up', color: '#10B981', type: 'INCOME' },
];

let LOCAL_TRANSACTIONS: Transaction[] = [];

let LOCAL_BUDGET_LIMIT = 1500;

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Using local fallback for categories');
  }
  return LOCAL_CATEGORIES;
}

export async function fetchTransactions(month?: number, year?: number): Promise<Transaction[]> {
  try {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    const res = await fetch(`${API_BASE_URL}/transactions${query}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Using local fallback for transactions');
  }

  if (month && year) {
    return LOCAL_TRANSACTIONS.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }
  return LOCAL_TRANSACTIONS;
}

export async function createTransaction(data: {
  title: string;
  amount: number;
  categoryId: string;
  date?: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Using local fallback for creating transaction');
  }

  const category = LOCAL_CATEGORIES.find((c) => c.id === data.categoryId) || LOCAL_CATEGORIES[0];
  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    title: data.title,
    amount: data.amount,
    date: data.date || new Date().toISOString(),
    type: data.type,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    categoryId: data.categoryId,
    category,
  };

  LOCAL_TRANSACTIONS.unshift(newTx);
  return newTx;
}

export async function updateTransaction(
  id: string,
  data: {
    title: string;
    amount: number;
    categoryId: string;
    date?: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
    notes?: string;
  }
): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Using local fallback for updating transaction');
  }

  const category = LOCAL_CATEGORIES.find((c) => c.id === data.categoryId) || LOCAL_CATEGORIES[0];
  const index = LOCAL_TRANSACTIONS.findIndex((t) => t.id === id);
  if (index !== -1) {
    LOCAL_TRANSACTIONS[index] = {
      ...LOCAL_TRANSACTIONS[index],
      title: data.title,
      amount: data.amount,
      categoryId: data.categoryId,
      category,
      type: data.type,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      date: data.date || LOCAL_TRANSACTIONS[index].date,
    };
    return LOCAL_TRANSACTIONS[index];
  }
  throw new Error('Transaction not found');
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return true;
  } catch (e) {
    console.log('Using local fallback for deleting transaction');
  }

  LOCAL_TRANSACTIONS = LOCAL_TRANSACTIONS.filter((tx) => tx.id !== id);
  return true;
}

export async function fetchBudget(month?: number, year?: number): Promise<number> {
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  try {
    const res = await fetch(`${API_BASE_URL}/budgets?month=${m}&year=${y}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.monthlyLimit === 'number' && data.monthlyLimit > 0) {
        LOCAL_BUDGET_LIMIT = data.monthlyLimit;
        return data.monthlyLimit;
      }
    }
  } catch (e) {
    console.log('Using local fallback for fetchBudget');
  }
  return LOCAL_BUDGET_LIMIT;
}

export async function saveBudget(month: number, year: number, limit: number): Promise<boolean> {
  LOCAL_BUDGET_LIMIT = limit;
  try {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, monthlyLimit: limit }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return true;
  } catch (e) {
    console.log('Using local fallback for budget save');
  }
  return true;
}
