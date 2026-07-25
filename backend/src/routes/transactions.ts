import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const transactionsRouter = Router();

// GET all transactions with optional filters for month & year
transactionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { month, year, categoryId, type } = req.query;

    const whereClause: any = {};

    if (month && year) {
      const m = parseInt(month as string, 10);
      const y = parseInt(year as string, 10);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId as string;
    }

    if (type) {
      whereClause.type = type as 'EXPENSE' | 'INCOME';
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// GET Summary for dashboard analytics
transactionsRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string, 10) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSaving = 0;
    const categoryTotalsMap: Record<string, { category: any; total: number }> = {};

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else if (tx.type === 'SAVING') {
        totalSaving += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (!categoryTotalsMap[tx.categoryId]) {
          categoryTotalsMap[tx.categoryId] = {
            category: tx.category,
            total: 0,
          };
        }
        categoryTotalsMap[tx.categoryId].total += tx.amount;
      }
    });

    const categoryBreakdown = Object.values(categoryTotalsMap)
      .map(({ category, total }) => ({
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        icon: category.icon,
        total,
        percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Fetch monthly budget if available
    const budget = await prisma.budget.findFirst({
      where: {
        month,
        year,
      },
    });

    res.json({
      month,
      year,
      totalIncome,
      totalExpense,
      totalSaving,
      balance: totalIncome - totalExpense - totalSaving,
      monthlyLimit: budget ? budget.monthlyLimit : null,
      budgetProgressPercentage: budget && budget.monthlyLimit > 0 ? (totalExpense / budget.monthlyLimit) * 100 : 0,
      categoryBreakdown,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Error calculating monthly summary' });
  }
});

// POST Create new transaction
transactionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, amount, categoryId, date, type, paymentMethod, notes, isRecurring, recurrenceFrequency, billingDate } = req.body;

    if (!title || amount === undefined || !categoryId) {
      return res.status(400).json({ error: 'Title, amount, and categoryId are required' });
    }

    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(',', '.'));
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: numAmount,
        categoryId,
        date: date ? new Date(date) : new Date(),
        type: type || 'EXPENSE',
        paymentMethod: paymentMethod || 'CARD',
        notes: notes || null,
        isRecurring: !!isRecurring,
        recurrenceFrequency: recurrenceFrequency || null,
        billingDate: billingDate ? new Date(billingDate) : null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

// PUT Update transaction
transactionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, amount, categoryId, date, type, paymentMethod, notes, isRecurring, recurrenceFrequency, billingDate } = req.body;

    let numAmount: number | undefined = undefined;
    if (amount !== undefined) {
      numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(',', '.'));
      if (isNaN(numAmount)) {
        return res.status(400).json({ error: 'Monto inválido' });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        title,
        amount: numAmount,
        categoryId,
        date: date ? new Date(date) : undefined,
        type,
        paymentMethod,
        notes,
        isRecurring,
        recurrenceFrequency,
        billingDate: billingDate ? new Date(billingDate) : undefined,
      },
      include: {
        category: true,
      },
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

// DELETE transaction
transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});
