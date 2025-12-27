import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true, // Cashier
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}
