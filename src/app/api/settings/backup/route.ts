import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch All Data
        const [products, users, invoices, expenses, customers] = await Promise.all([
            prisma.product.findMany(),
            prisma.user.findMany(),
            prisma.invoice.findMany({ include: { items: true, payments: true } }),
            prisma.expense.findMany(),
            prisma.customer.findMany()
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            products,
            users,
            invoices,
            expenses,
            customers
        };

        return NextResponse.json(backupData);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
