import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                purchases: {
                    orderBy: { createdAt: 'desc' },
                    include: { items: true }
                }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        return NextResponse.json(vendor);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Vendor' }, { status: 500 });
    }
}
