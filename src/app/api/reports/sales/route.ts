import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        const invoices = await prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: { not: 'DRAFT' } // Exclude drafts
            },
            include: {
                customer: { select: { name: true } },
                payments: { select: { mode: true, amount: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate Balance (Total - Paid)
        const data = invoices.map((inv: any) => {
            const paid = inv.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
            return {
                ...inv,
                balance: inv.totalAmount - paid
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sales report' }, { status: 500 });
    }
}
