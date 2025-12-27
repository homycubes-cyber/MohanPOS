import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/products/[id] - Get single product
export async function GET(request: Request, { params }: Params) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                category: true,
                inventory: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// PUT /api/products/[id] - Update product
export async function PUT(request: Request, { params }: Params) {
    try {
        const body = await request.json();
        const {
            name, description, sku, barcode, hsnCode, gstRate, price, costPrice, categoryId, isActive
        } = body;

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name,
                description,
                sku,
                barcode,
                hsnCode,
                gstRate,
                price,
                costPrice, // If undefined (not sent), Prisma ignores. If null, sets to null.
                categoryId, // If undefined, ignored. If null, sets to null.
                isActive
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product', details: String(error) }, { status: 500 });
    }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request: Request, { params }: Params) {
    try {
        // Check if product has sales history (Invoices)
        // If yes, we should probably soft delete or prevent deletion. 
        // For now, let's just delete for simplicity as per requirements, but good practice is soft delete.

        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
