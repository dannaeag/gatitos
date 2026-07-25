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
  { id: 'cat-11', name: 'Fondo de Emergencia', icon: 'shield', color: '#10B981', type: 'SAVING' },
  { id: 'cat-12', name: 'Inversión & Futuro', icon: 'trending-up', color: '#0EA5E9', type: 'SAVING' },
  { id: 'cat-13', name: 'Ahorro Michi Cerdito', icon: 'award', color: '#EC4899', type: 'SAVING' },
];

function loadLocalTransactionsFromStorage(): Transaction[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('michi_local_transactions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
  }
  return [];
}

function saveLocalTransactionsToStorage(txs: Transaction[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('michi_local_transactions', JSON.stringify(txs));
    } catch (e) {}
  }
}

let LOCAL_TRANSACTIONS: Transaction[] = loadLocalTransactionsFromStorage();

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
      const serverTxs = await res.json();
      if (Array.isArray(serverTxs)) {
        LOCAL_TRANSACTIONS = serverTxs;
        saveLocalTransactionsToStorage(serverTxs);
        return serverTxs;
      }
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
  isRecurring?: boolean;
  recurrenceFrequency?: any;
  billingDate?: string;
}): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const created = await res.json();
      LOCAL_TRANSACTIONS.unshift(created);
      saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
      return created;
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
    isRecurring: data.isRecurring,
    recurrenceFrequency: data.recurrenceFrequency,
    billingDate: data.billingDate,
  };

  LOCAL_TRANSACTIONS.unshift(newTx);
  saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
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
    isRecurring?: boolean;
    recurrenceFrequency?: any;
    billingDate?: string;
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
      const updated = await res.json();
      const idx = LOCAL_TRANSACTIONS.findIndex((t) => t.id === id);
      if (idx !== -1) {
        LOCAL_TRANSACTIONS[idx] = updated;
      } else {
        LOCAL_TRANSACTIONS.unshift(updated);
      }
      saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
      return updated;
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
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.recurrenceFrequency,
      billingDate: data.billingDate,
    };
    saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
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
    if (res.ok) {
      LOCAL_TRANSACTIONS = LOCAL_TRANSACTIONS.filter((tx) => tx.id !== id);
      saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
      return true;
    }
  } catch (e) {
    console.log('Using local fallback for deleting transaction');
  }

  LOCAL_TRANSACTIONS = LOCAL_TRANSACTIONS.filter((tx) => tx.id !== id);
  saveLocalTransactionsToStorage(LOCAL_TRANSACTIONS);
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

export async function fetchSummary(month?: number, year?: number): Promise<MonthlySummary> {
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/summary?month=${m}&year=${y}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Using local fallback for fetchSummary');
  }

  // Local fallback calculation
  const txs = LOCAL_TRANSACTIONS.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() + 1 === m && d.getFullYear() === y;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let totalSaving = 0;
  const catMap: Record<string, { category: Category; total: number }> = {};

  txs.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else if (tx.type === 'SAVING') {
      totalSaving += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (!catMap[tx.categoryId]) {
        catMap[tx.categoryId] = { category: tx.category, total: 0 };
      }
      catMap[tx.categoryId].total += tx.amount;
    }
  });

  const categoryBreakdown = Object.values(catMap).map(({ category, total }) => ({
    categoryId: category.id,
    categoryName: category.name,
    color: category.color,
    icon: category.icon,
    total,
    percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
  }));

  return {
    month: m,
    year: y,
    totalIncome,
    totalExpense,
    totalSaving,
    balance: totalIncome - totalExpense - totalSaving,
    monthlyLimit: LOCAL_BUDGET_LIMIT,
    budgetProgressPercentage: LOCAL_BUDGET_LIMIT > 0 ? (totalExpense / LOCAL_BUDGET_LIMIT) * 100 : 0,
    categoryBreakdown,
    transactionCount: txs.length,
  };
}
