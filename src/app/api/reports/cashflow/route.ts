import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        // Aggregate by Day
        // Fetch all transactions in range
        const sales = await prisma.invoice.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } },
            _sum: { totalAmount: true }
        });

        // Group by day is hard with Prisma groupBy on DateTime field directly because of timestamps.
        // Better to fetch and process in memory for this scale, OR use raw query.
        // Let's use fetch and process.

        const invoices = await prisma.invoice.findMany({
            where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } },
            select: { createdAt: true, totalAmount: true }
        });

        const expenses = await prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { date: true, amount: true }
        });

        const purchases = await prisma.purchaseOrder.findMany({
            where: { createdAt: { gte: startDate, lte: endDate } },
            select: { createdAt: true, totalAmount: true }
        });

        const dailyMap = new Map<string, { in: number, out: number }>();

        // Init all days in range
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        days.forEach(d => dailyMap.set(format(d, 'yyyy-MM-dd'), { in: 0, out: 0 }));

        // Process Sales
        invoices.forEach(inv => {
            const key = format(inv.createdAt, 'yyyy-MM-dd');
            if (dailyMap.has(key)) {
                const day = dailyMap.get(key)!;
                day.in += inv.totalAmount;
            }
        });

        // Process Out (Expenses + Purchases)
        expenses.forEach(exp => {
            const key = format(exp.date, 'yyyy-MM-dd');
            if (dailyMap.has(key)) {
                const day = dailyMap.get(key)!;
                day.out += exp.amount;
            }
        });

        purchases.forEach(pur => {
            const key = format(pur.createdAt, 'yyyy-MM-dd');
            if (dailyMap.has(key)) {
                const day = dailyMap.get(key)!;
                day.out += pur.totalAmount;
            }
        });

        const reportData = Array.from(dailyMap.entries()).map(([date, val]) => ({
            date,
            in: val.in,
            out: val.out
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(reportData);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
