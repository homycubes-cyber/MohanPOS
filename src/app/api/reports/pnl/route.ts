import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date(new Date().getFullYear(), 0, 1));
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        // 1. Revenue (Sales)
        const sales = await prisma.invoice.aggregate({
            where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } },
            _sum: { totalAmount: true }
        });

        // 2. Expenses (Direct)
        const expenses = await prisma.expense.aggregate({
            where: { date: { gte: startDate, lte: endDate } },
            _sum: { amount: true }
        });

        // 3. Cost of Goods Sold (Purchases)
        // Simplified: Just total Purchase Orders in this period
        const purchases = await prisma.purchaseOrder.aggregate({
            where: { createdAt: { gte: startDate, lte: endDate } },
            _sum: { totalAmount: true }
        });

        return NextResponse.json({
            salesRevenue: sales._sum.totalAmount || 0,
            totalRevenue: sales._sum.totalAmount || 0,
            directExpenses: expenses._sum.amount || 0,
            purchaseCost: purchases._sum.totalAmount || 0,
            totalExpenses: (expenses._sum.amount || 0) + (purchases._sum.totalAmount || 0)
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
