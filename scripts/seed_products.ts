
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding products...');

    // 1. Create a default category if none exists
    let category = await prisma.category.findFirst();
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'General'
            }
        });
        console.log('Created Category: General');
    }

    const products = [
        { name: 'Parle-G Biscuit', price: 10, sku: 'PARLE-01', barcode: '8901719101017', gstRate: 5 },
        { name: 'Tata Salt 1kg', price: 28, sku: 'TATA-SALT', barcode: '8904083300021', gstRate: 0 },
        { name: 'Maggi Noodles 70g', price: 14, sku: 'MAGGI-70', barcode: '8901058000001', gstRate: 12 },
        { name: 'Amul Butter 100g', price: 56, sku: 'AMUL-100', barcode: '8901262010011', gstRate: 12 },
        { name: 'Coca Cola 600ml', price: 40, sku: 'COKE-600', barcode: '8901764010115', gstRate: 18 }
    ];

    for (const p of products) {
        const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
        if (!existing) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    price: p.price,
                    sku: p.sku,
                    barcode: p.barcode,
                    gstRate: p.gstRate,
                    categoryId: category.id,
                    inventory: {
                        create: {
                            quantity: 100,
                            lowStockThreshold: 10
                        }
                    }
                }
            });
            console.log(`Created Product: ${p.name}`);
        }
    }

    console.log('Seeding complete!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
