import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
    try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // 1. Fetch Today's Cash Inflows (Transactions)
        const todayCashTxns = await prisma.transaction.findMany({
            where: {
                mode: 'CASH',
                createdAt: { gte: todayStart, lte: todayEnd }
            },
            include: {
                invoice: { select: { invoiceNo: true, customer: { select: { name: true } } } }
            }
        });

        // 2. Fetch Today's Cash Expenses
        const todayCashExpenses = await prisma.expense.findMany({
            where: {
                paymentMode: 'CASH',
                date: { gte: todayStart, lte: todayEnd }
            },
            select: { id: true, amount: true, description: true, date: true }
        });

        // Calculate Totals for Today
        const cashInToday = todayCashTxns.reduce((sum: number, tx: any) => sum + tx.amount, 0);
        const cashOutToday = todayCashExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

        // 3. Calculate Opening Balance (Everything before today)
        const prevCashIn = await prisma.transaction.aggregate({
            where: {
                mode: 'CASH',
                createdAt: { lt: todayStart }
            },
            _sum: { amount: true }
        });

        const prevCashOut = await prisma.expense.aggregate({
            where: {
                paymentMode: 'CASH',
                date: { lt: todayStart }
            },
            _sum: { amount: true }
        });

        const openingBal = (prevCashIn._sum.amount || 0) - (prevCashOut._sum.amount || 0);
        const currentBal = openingBal + cashInToday - cashOutToday;

        // 4. Format Transactions for Table
        const transactions = [
            ...todayCashTxns.map(tx => ({
                id: tx.id,
                date: tx.createdAt,
                description: `Sale - ${tx.invoice?.customer?.name || 'Walk-in'} (#${tx.invoice?.invoiceNo})`,
                amount: tx.amount,
                type: 'IN',
                ref: tx.reference || '-'
            })),
            ...todayCashExpenses.map(exp => ({
                id: exp.id,
                date: exp.date,
                description: exp.description || 'Expense',
                amount: exp.amount,
                type: 'OUT',
                ref: '-'
            }))
        ].sort((a: { date: Date }, b: { date: Date }) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            stats: {
                openingBalance: openingBal,
                cashIn: cashInToday,
                cashOut: cashOutToday,
                currentBalance: currentBal
            },
            transactions
        });

    } catch (error) {
        console.error('Cash Summary Error:', error);
        return NextResponse.json({ error: 'Failed to fetch cash summary' }, { status: 500 });
    }
}
