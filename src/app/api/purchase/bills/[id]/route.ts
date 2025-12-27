import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                vendor: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!po) {
            return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
        }

        return NextResponse.json(po);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Purchase Order' }, { status: 500 });
    }
}
