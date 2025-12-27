import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const type = searchParams.get('type') || 'ALL';

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        let ledger: any[] = [];

        // 1. Sales
        if (type === 'ALL' || type === 'SALE') {
            const sales = await prisma.invoice.findMany({
                where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } },
                include: { customer: { select: { name: true } }, payments: true }
            });
            ledger.push(...sales.map(s => ({
                id: s.id,
                date: s.createdAt,
                name: s.customer?.name || 'Cash Sale',
                refNo: s.invoiceNo,
                category: 'SALE',
                mode: s.payments?.[0]?.mode || 'CASH',
                amount: s.totalAmount,
                type: 'IN'
            })));
        }

        // 2. Expenses
        if (type === 'ALL' || type === 'EXPENSE') {
            const expenses = await prisma.expense.findMany({
                where: { date: { gte: startDate, lte: endDate } }
            });
            ledger.push(...expenses.map(e => ({
                id: e.id,
                date: e.date,
                name: e.description || e.category,
                refNo: '-',
                category: 'EXPENSE',
                mode: e.paymentMode,
                amount: e.amount,
                type: 'OUT'
            })));
        }

        // 3. Purchases
        if (type === 'ALL' || type === 'PURCHASE') {
            const purchases = await prisma.purchaseOrder.findMany({
                where: { createdAt: { gte: startDate, lte: endDate } },
                include: { vendor: { select: { name: true } } }
            });
            ledger.push(...purchases.map(p => ({
                id: p.id,
                date: p.createdAt,
                name: p.vendor.name,
                refNo: p.poNumber,
                category: 'PURCHASE',
                mode: '-',
                amount: p.totalAmount,
                type: 'OUT'
            })));
        }

        // Sort by date desc
        ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(ledger);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
