import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const partyId = searchParams.get('partyId');

        if (!partyId) return NextResponse.json([]);

        const startDate = start ? startOfDay(new Date(start)) : startOfDay(new Date());
        const endDate = end ? endOfDay(new Date(end)) : endOfDay(new Date());

        let ledger: any[] = [];

        // 1. Sales (Invoices) -> DEBIT (Party owes us)
        const invoices = await prisma.invoice.findMany({
            where: { customerId: partyId, createdAt: { gte: startDate, lte: endDate }, status: { not: 'DRAFT' } }
        });

        ledger.push(...invoices.map(inv => ({
            date: inv.createdAt,
            refNo: inv.invoiceNo,
            description: 'Sale Invoice',
            amount: inv.totalAmount,
            type: 'DEBIT'
        })));

        // 2. Payments Received -> CREDIT (Party pays us)
        // We need to fetch transactions where invoice belongs to this customer
        // Or if we had a dedicated 'PaymentReceived' model. 
        // Currently payments are linked to Invoice.

        // This logic is slightly flawed because Invoice Total is fully debited, 
        // but we don't have a separate 'Payment' record independent of invoice creation in this schema version 
        // EXCEPT for the 'Transaction' model which is created at Checkout.

        // So:
        // Invoice Creation = Debit Full Amount.
        // Payment (Transaction) = Credit Amount Paid.

        const transactions = await prisma.transaction.findMany({
            where: {
                invoice: { customerId: partyId },
                createdAt: { gte: startDate, lte: endDate }
            },
            include: { invoice: true }
        });

        ledger.push(...transactions.map(tx => ({
            date: tx.createdAt,
            refNo: tx.reference || 'Cash',
            description: `Payment Received (${tx.mode})`,
            amount: tx.amount,
            type: 'CREDIT'
        })));

        // Sort by date
        ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return NextResponse.json(ledger);

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
