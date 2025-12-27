import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { products } = body; // Expects array of { name, sku, price, cost, stock, category }

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'No products provided' }, { status: 400 });
        }

        // 1. Manage Categories
        // Extract unique category names
        const uniqueCategories = Array.from(new Set(products.map((p: any) => p.category || 'General').filter(Boolean))) as string[];

        // Find existing categories
        const existingCats = await prisma.category.findMany({
            where: { name: { in: uniqueCategories } }
        });
        const existingCatMap = new Map(existingCats.map(c => [c.name, c.id]));

        // Identify and create missing categories
        const missingCats = uniqueCategories.filter(c => !existingCatMap.has(c));

        let newCatMap = new Map();
        if (missingCats.length > 0) {
            // We have to create them. createMany doesn't return IDs, so we generate IDs here too.
            const newCatsData = missingCats.map(name => ({
                id: uuidv4(),
                name
            }));

            await prisma.category.createMany({
                data: newCatsData,
                skipDuplicates: true
            });

            newCatsData.forEach(c => newCatMap.set(c.name, c.id));
        }

        // Merge maps
        const finalCatMap = new Map([...existingCatMap, ...newCatMap]);

        // 2. Prepare Data for Bulk Insert
        const products toInsert = [];
        const inventoryToInsert = [];

        for (const p of products) {
            const productId = uuidv4();
            const categoryId = finalCatMap.get(p.category || 'General');

            toInsert.push({
                id: productId,
                name: p.name,
                sku: p.sku || `SKU-${Math.floor(Math.random() * 100000)}`, // Fallback
                barcode: p.barcode || null,
                price: parseFloat(p.price) || 0,
                costPrice: parseFloat(p.cost) || 0,
                gstRate: parseFloat(p.gst) || 0,
                categoryId: categoryId,
                isActive: true
            });

            inventoryToInsert.push({
                productId: productId,
                quantity: parseInt(p.stock) || 0,
                lowStockThreshold: 5
            });
        }

        // 3. Execute Transaction
        await prisma.$transaction([
            prisma.product.createMany({
                data: toInsert,
                skipDuplicates: true // Skip if SKU exists
            }),
            prisma.inventory.createMany({
                data: inventoryToInsert,
                skipDuplicates: true
            })
        ]);

        return NextResponse.json({
            message: 'Import Successful',
            count: products.length,
            categoriesCreated: missingCats.length
        });

    } catch (error) {
        console.error('Bulk Import Error:', error);
        return NextResponse.json({ error: 'Failed to import products', details: error }, { status: 500 });
    }
}
