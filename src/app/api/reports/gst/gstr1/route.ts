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
            include: { customer: true }
        });

        // Current Logic: We store 'taxAmount' on Invoice level. 
        // We assume Intra-state (CGST+SGST) for now unless customer state differs.
        // Since we don't have State stored on Customer yet, let's assume 50/50 CGST/SGST split for all.
        // Can be refined later with State logic.

        const reportData = invoices.map(inv => {
            const totalTax = inv.taxAmount || 0;
            const taxableValue = inv.totalAmount - totalTax;

            // Assume Intra-State
            const cgst = totalTax / 2;
            const sgst = totalTax / 2;
            const igst = 0;

            return {
                date: inv.createdAt,
                invoiceNo: inv.invoiceNo,
                gstin: 'N/A', // Customer GSTIN not in schema yet? Check.
                receiverName: inv.customer?.name || 'Cash Customer',
                taxableValue,
                igst,
                cgst,
                sgst,
                totalAmount: inv.totalAmount
            };
        });

        return NextResponse.json(reportData);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
