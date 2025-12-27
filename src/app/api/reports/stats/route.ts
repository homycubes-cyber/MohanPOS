import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Total Sales Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaySales = await prisma.invoice.aggregate({
            where: {
                createdAt: {
                    gte: startOfDay,
                },
                status: 'COMPLETED',
            },
            _sum: {
                totalAmount: true,
            },
            _count: {
                id: true,
            }
        });

        // 2. Total Products
        const totalProducts = await prisma.product.count({
            where: { isActive: true }
        });

        // 3. Low Stock Items
        const lowStockCount = await prisma.inventory.count({
            where: {
                quantity: {
                    lte: 5 // Hardcoded for now, or match lowStockThreshold col query (complex)
                }
            }
        });

        // 4. Recent Sales (Last 5)
        const recentSales = await prisma.invoice.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });

        return NextResponse.json({
            todaySales: todaySales._sum.totalAmount || 0,
            todayCount: todaySales._count.id || 0,
            totalProducts,
            lowStockCount,
            recentSales
        });

    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
