import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/inventory/purchase-order - List all Purchase Orders
export async function GET() {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                vendor: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pos);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }
}

// POST /api/inventory/purchase-order - Create PO
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { vendorId, items, vendorInvoiceNo, invoiceUrl, confirmReceived } = body;

        if (!vendorId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.costPrice), 0);
        const poNumber = `PO-${Date.now()}`;
        const status = confirmReceived ? 'RECEIVED' : 'ORDERED';

        // Transaction to ensure PO and Inventory are synced
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create PO
            const po = await tx.purchaseOrder.create({
                data: {
                    poNumber,
                    vendorId,
                    vendorInvoiceNo,
                    invoiceUrl,
                    totalAmount,
                    status,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                            total: item.quantity * item.costPrice
                        }))
                    }
                }
            });

            // 2. If Received, Update Inventory & Product Cost
            if (confirmReceived) {
                for (const item of items) {
                    // Update Inventory Quantity
                    await tx.inventory.upsert({
                        where: { productId: item.productId },
                        update: {
                            quantity: { increment: item.quantity }
                        },
                        create: {
                            productId: item.productId,
                            quantity: item.quantity,
                            lowStockThreshold: 5 // Default
                        }
                    });

                    // Update Product Cost Price (Latest)
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { costPrice: item.costPrice }
                    });
                }
            }

            return po;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create PO' }, { status: 500 });
    }
}
