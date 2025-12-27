import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/expenses
export async function GET(request: Request) {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { bankAccount: true }
        });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST /api/expenses
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, amount, category, date, description, paymentMode, accountId } = body;

        const expense = await prisma.expense.create({
            data: {
                title,
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                description,
                paymentMode,
                accountId: accountId || null
            }
        });

        // If tied to Bank Account, update balance
        if (accountId && paymentMode !== 'CASH') {
            await prisma.bankAccount.update({
                where: { id: accountId },
                data: { currentBalance: { decrement: parseFloat(amount) } }
            });
        }

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
