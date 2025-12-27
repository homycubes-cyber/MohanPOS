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
            where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } },
            include: {
                customer: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { costPrice: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const reportData = invoices.map(inv => {
            const totalSale = inv.items.reduce((sum, item) => sum + item.total, 0); // (price * qty) + tax
            // Note: Profit should ideally be calculated pre-tax or post-tax depending on cost.
            // Usually Profit = (Selling Price - Tax) - Cost. 
            // My 'item.total' includes tax. 
            // My 'item.price' is unit price (usually ex-tax or inc-tax? Schema comment says "Price at time of sale").
            // Schema also has 'tax' per item. 
            // Let's assume Profit = (Qty * Price) - (Qty * Cost). Ignoring tax collected.

            const totalCost = inv.items.reduce((sum, item) => {
                const cost = item.product?.costPrice || 0;
                return sum + (item.quantity * cost);
            }, 0);

            // My 'item.price' might be unit price.
            // Profit = Sum( (Item.price * Item.quantity) - (Item.product.costPrice * Item.quantity) )
            // Does strictly excludes tax from profit, which is correct (tax is liability).

            const revenueExTax = inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const profit = revenueExTax - totalCost;

            return {
                id: inv.id,
                date: inv.createdAt,
                invoiceNo: inv.invoiceNo,
                customerName: inv.customer?.name || 'Cash Sale',
                salesAmount: revenueExTax, // Excl Tax
                costAmount: totalCost,
                profit: profit,
                margin: revenueExTax > 0 ? ((profit / revenueExTax) * 100).toFixed(1) : 0
            };
        });

        return NextResponse.json(reportData);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
