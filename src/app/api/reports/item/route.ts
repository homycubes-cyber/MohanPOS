import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const productId = searchParams.get('productId');

        if (!productId) return NextResponse.json([]);

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        const items = await prisma.invoiceItem.findMany({
            where: {
                productId: productId,
                invoice: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } }
            },
            include: {
                invoice: { include: { customer: true } }
            },
            orderBy: { invoice: { createdAt: 'desc' } }
        });

        const reportData = items.map(item => ({
            id: item.id,
            date: item.invoice.createdAt,
            invoiceNo: item.invoice.invoiceNo,
            partyName: item.invoice.customer?.name || 'Cash Sale',
            quantity: item.quantity,
            price: item.price,
            total: item.total
        }));

        return NextResponse.json(reportData);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
