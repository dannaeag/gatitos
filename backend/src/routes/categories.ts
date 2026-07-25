import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const categoriesRouter = Router();

// Get all categories
categoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Create custom category
categoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, icon, color, type } = req.body;
    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'Name, icon, and color are required' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type: type || 'EXPENSE',
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error creating category' });
  }
});
