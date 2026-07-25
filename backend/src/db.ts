import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function seedDefaultCategories() {
  const defaultCategories = [
    { name: 'Alimentación y Mercado', icon: 'shopping-cart', color: '#EF4444', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Restaurantes y Café', icon: 'utensils', color: '#F97316', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Vivienda y Arriendo', icon: 'home', color: '#3B82F6', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Servicios Básicos', icon: 'zap', color: '#EAB308', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Transporte y Auto', icon: 'car', color: '#8B5CF6', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Entretenimiento y Ocio', icon: 'film', color: '#EC4899', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Salud y Farmacia', icon: 'activity', color: '#10B981', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Educación', icon: 'book', color: '#06B6D4', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Suscripciones', icon: 'tv', color: '#6366F1', type: 'EXPENSE' as const, isDefault: true },
    { name: 'Compras Varias', icon: 'bag', color: '#64748B', type: 'EXPENSE' as const, isDefault: true },

    { name: 'Salario / Sueldo', icon: 'briefcase', color: '#22C55E', type: 'INCOME' as const, isDefault: true },
    { name: 'Ventas y Servicios', icon: 'trending-up', color: '#10B981', type: 'INCOME' as const, isDefault: true },
    { name: 'Inversiones', icon: 'pie-chart', color: '#0EA5E9', type: 'INCOME' as const, isDefault: true },
    { name: 'Otros Ingresos', icon: 'plus-circle', color: '#84CC16', type: 'INCOME' as const, isDefault: true },

    { name: 'Fondo de Emergencia', icon: 'shield', color: '#10B981', type: 'SAVING' as const, isDefault: true },
    { name: 'Inversión y Futuro', icon: 'trending-up', color: '#0EA5E9', type: 'SAVING' as const, isDefault: true },
    { name: 'Ahorro Michi Cerdito', icon: 'award', color: '#EC4899', type: 'SAVING' as const, isDefault: true },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  console.log('Default categories verified/created successfully');
}
