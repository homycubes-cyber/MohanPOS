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

        // 1. Fetch all products
        const products = await prisma.product.findMany({
            include: { inventory: true }
        });

        // 2. Fetch Movements within range (Sales & Purchases)
        const invoiceItems = await prisma.invoiceItem.findMany({
            where: { invoice: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } } }
        });

        const purchaseItems = await prisma.purchaseItem.findMany({
            where: { purchaseOrder: { createdAt: { gte: startDate, lte: endDate }, status: 'RECEIVED' } }
        });

        // 3. Fetch Movements BEFORE range (to calc Opening Balance)
        // This is tricky without a snapshot. 
        // Logic: Current Stock = Total In (All Time) - Total Out (All Time)
        // Opening Stock = Total In (Before Start) - Total Out (Before Start)

        // Simpler approach for now:
        // We assume 'inventory.quantity' is the CURRENT closing stock.
        // So Opening = Closing - In (Range) + Out (Range).
        // Wait, that's closing of TODAY. If range is past, we need to walk back.

        // Let's implement Current Snapshot backwards walk:
        // Opening = CurrentStock - In (Since Start) + Out (Since Start)
        // Range In = In (Within Range)
        // Range Out = Out (Within Range)
        // Closing (at end of range) = Opening + Range In - Range Out. (Or calculated from Current backwards to EndDate).

        // Let's stick to standard flow:
        // Opening = Total In (< Start) - Total Out (< Start)
        // But we don't have 'Total In' history easily unless we sum *all* past POs.
        // If we seeded stock, we don't have a record of that 'Initial' In.

        // FALLBACK SMART FEATURE:
        // Just show movements for the selected period.
        // Opening: "Unknown/—" if history incomplete, or assume 0 if new system.
        // Actually, if we use the 'Backwards from Current' method it works for seeded stock too (assuming seed is current).
        // Let's try:
        // 1. Get Current Stock (Now)
        // 2. Get All Comings/Goings from Now back to EndDate => Closing Stock of Range
        // 3. Get All Comings/Goings from EndDate back to StartDate => Opening Stock of Range

        // For simplicity in this version, let's just show In/Out during this period and the *Current* stock as Closing.
        // User screenshot shows "Opening Qty".
        // Let's try to calculate it: 
        // Opening = CurrentStock - (Total In > StartDate) + (Total Out > StartDate)
        // Note: This gives Opening at StartDate.

        // Fetch ALL movements AFTER startDate to now
        const futureInvoiceItems = await prisma.invoiceItem.findMany({
            where: { invoice: { createdAt: { gte: startDate }, status: { not: 'DRAFT' } } }
        });
        const futurePurchaseItems = await prisma.purchaseItem.findMany({
            where: { purchaseOrder: { createdAt: { gte: startDate }, status: 'RECEIVED' } }
        });

        const reportData = products.map((p: any) => {
            const currentQty = p.inventory?.quantity || 0;

            // Calculate movements from StartDate till NOW
            const totalOutSinceStart = futureInvoiceItems
                .filter((i: any) => i.productId === p.id)
                .reduce((sum: number, i: any) => sum + i.quantity, 0);

            const totalInSinceStart = futurePurchaseItems
                .filter((i: any) => i.productId === p.id)
                .reduce((sum: number, i: any) => sum + i.quantity, 0);

            const openingQty = currentQty - totalInSinceStart + totalOutSinceStart;

            // Calculate movements WITHIN range
            const outRange = invoiceItems
                .filter((i: any) => i.productId === p.id)
                .reduce((sum: number, i: any) => sum + i.quantity, 0);

            const inRange = purchaseItems
                .filter((i: any) => i.productId === p.id)
                .reduce((sum: number, i: any) => sum + i.quantity, 0);

            const closingQty = openingQty + inRange - outRange;

            return {
                name: p.name,
                opening: openingQty,
                in: inRange,
                out: outRange,
                closing: closingQty
            };
        });

        return NextResponse.json(reportData);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
