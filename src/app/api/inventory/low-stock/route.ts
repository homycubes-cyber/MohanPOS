import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/inventory/low-stock - Get products below threshold
export async function GET() {
    try {
        const lowStockItems = await prisma.inventory.findMany({
            where: {
                quantity: { lte: 5 } // Simple threshold for now
            },
            include: {
                product: true
            }
        });

        // Ensure consistent structure
        return NextResponse.json(lowStockItems);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch low stock' }, { status: 500 });
    }
}
