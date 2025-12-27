import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const targetDate = dateStr ? new Date(dateStr) : new Date();

        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        // 1. Fetch Sales (Invoices) - Money IN
        // Note: Ideally we check 'payments' table, but assuming invoice total for simplicity or 'Transaction' table?
        // Let's use the 'Transaction' table for accuracy if available, but for now Invoice is easier to map.
        // Actually, let's use Payment Mode from schema if possible.
        // We really should use the Transaction table for payments.

        const sales = await prisma.invoice.findMany({
            where: { createdAt: { gte: start, lte: end }, status: { not: 'DRAFT' } },
            include: { customer: { select: { name: true } } }
        });

        // 2. Fetch Expenses - Money OUT
        const expenses = await prisma.expense.findMany({
            where: { date: { gte: start, lte: end } }
        });

        // 3. Fetch Purchases - Money OUT (Assuming paid immediately? Or based on PurchaseOrder?)
        // For DayBook, we usually track PAYMENTS. 
        // Let's assume we want to see Purchase Orders created today as 'Money Out' commit? 
        // Or actual payments. For simplicity, let's list POs as 'Purchase'.
        const purchases = await prisma.purchaseOrder.findMany({
            where: { createdAt: { gte: start, lte: end } },
            include: { vendor: { select: { name: true } } }
        });

        const ledger = [
            ...sales.map((s: any) => ({
                id: s.id,
                date: s.createdAt,
                name: s.customer?.name || 'Cash Sale',
                refNo: s.invoiceNo,
                category: 'SALE',
                mode: 'Mixed', // Details in payments
                amount: s.totalAmount,
                type: 'IN'
            })),
            ...expenses.map((e: any) => ({
                id: e.id,
                date: e.date,
                name: e.description || e.category || 'Expense',
                refNo: '-',
                category: 'EXPENSE',
                mode: e.paymentMode,
                amount: e.amount,
                type: 'OUT'
            })),
            ...purchases.map((p: any) => ({
                id: p.id,
                date: p.createdAt,
                name: p.vendor.name,
                refNo: p.poNumber,
                category: 'PURCHASE',
                mode: '-',
                amount: p.totalAmount,
                type: 'OUT'
            }))
        ];

        return NextResponse.json(ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch day book' }, { status: 500 });
    }
}
