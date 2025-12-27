import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        const startDate = from ? new Date(from) : new Date(0); // Default to beginning
        const endDate = to ? new Date(to) : new Date();

        // Adjust endDate to end of day
        endDate.setHours(23, 59, 59, 999);

        const invoices = await prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'COMPLETED'
            },
            include: {
                items: {
                    include: { product: true } // Need HSN and GST Rate
                }
            }
        });

        // Transform for GSTR-1 Format (B2C Large / Small, but simplified for retail)
        // Group by HSN or Tax Rate typically
        // For simple report: List of Invoices with Taxable Value, Tax Amount, Total

        const report = invoices.map(inv => ({
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            date: inv.createdAt,
            customer: inv.customerId || 'Cash Customer',
            taxableValue: inv.totalAmount - inv.taxAmount,
            taxAmount: inv.taxAmount,
            totalAmount: inv.totalAmount
        }));

        return NextResponse.json(report);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
