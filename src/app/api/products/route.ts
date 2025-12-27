import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - List all products
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const search = searchParams.get('search');

        const where: any = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                inventory: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, description, sku, barcode, hsnCode, gstRate, price, costPrice, categoryId, initialStock, lowStockThreshold
        } = body;

        // Basic validation
        if (!name || !sku || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                barcode,
                hsnCode,
                gstRate: gstRate ? parseFloat(gstRate) : 0,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                categoryId: categoryId || null,
                inventory: {
                    create: {
                        quantity: initialStock ? parseInt(initialStock) : 0,
                        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
                    }
                }
            },
            include: {
                inventory: true
            }
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Product with this SKU or Barcode already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
    }
}
