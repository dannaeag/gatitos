import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const budgetsRouter = Router();

// GET Budget for specific month and year
budgetsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string, 10) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

    const budget = await prisma.budget.findFirst({
      where: {
        month,
        year,
      },
    });

    res.json(budget || { month, year, monthlyLimit: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching budget' });
  }
});

// POST or PUT Upsert budget
budgetsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { month, year, monthlyLimit } = req.body;

    if (!month || !year || monthlyLimit === undefined) {
      return res.status(400).json({ error: 'Month, year, and monthlyLimit are required' });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const existing = await prisma.budget.findFirst({
      where: { month: m, year: y },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { monthlyLimit: parseFloat(monthlyLimit) },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          month: m,
          year: y,
          monthlyLimit: parseFloat(monthlyLimit),
        },
      });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Error saving budget' });
  }
});
