import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const daysParam = searchParams.get('days') || '90';
        const days = parseInt(daysParam);
        const thresholdDate = subDays(new Date(), days);

        // 1. Fetch all products with Inventory > 0
        const products = await prisma.product.findMany({
            where: {
                inventory: {
                    quantity: { gt: 0 }
                }
            },
            include: {
                inventory: true,
                category: true,
                // Optimized: We only need the *latest* invoice item to check date
                invoiceItems: {
                    orderBy: { invoice: { createdAt: 'desc' } },
                    take: 1,
                    include: { invoice: { select: { createdAt: true } } }
                }
            }
        });

        // 2. Filter: Keep products where last sale is BEFORE threshold OR never sold
        // But we must also ensure the product itself isn't brand new (created recently)
        // If product created yesterday and not sold, it's not dead stock.

        const deadStock = products.filter(p => {
            const lastSale = p.invoiceItems[0]?.invoice?.createdAt;
            const created = p.createdAt;

            // If created recently (within threshold), skip it (it's new, not dead)
            if (new Date(created) > thresholdDate) return false;

            // If never sold, it's dead stock (since we already checked it wasn't created recently)
            if (!lastSale) return true;

            // If last sale was before threshold, it's dead stock
            return new Date(lastSale) < thresholdDate;
        }).map(p => {
            const lastSale = p.invoiceItems[0]?.invoice?.createdAt;
            const daysInactive = lastSale
                ? Math.floor((new Date().getTime() - new Date(lastSale).getTime()) / (1000 * 3600 * 24))
                : Math.floor((new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24)); // Days since creation if never sold

            return {
                id: p.id,
                name: p.name,
                category: p.category?.name || 'Uncategorized',
                sku: p.sku,
                stock: p.inventory?.quantity || 0,
                costPrice: p.costPrice || 0,
                price: p.price,
                lastSaleDate: lastSale || null,
                daysInactive: daysInactive,
                status: lastSale ? 'Slow Moving' : 'Non-Moving'
            };
        });

        // Sort by inactivity (worst first)
        deadStock.sort((a, b) => b.daysInactive - a.daysInactive);

        return NextResponse.json(deadStock);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
