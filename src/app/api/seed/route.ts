import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        console.log('Starting Seed...');

        // 1. Create Categories
        const categoriesData = [
            { name: 'Spices & Masalas' },
            { name: 'Dals & Pulses' },
            { name: 'Rice & Flours' },
            { name: 'Oils & Ghee' },
            { name: 'Kitchen Utensils' },
            { name: 'Small Appliances' },
            { name: 'Cookware' },
            { name: 'Storage & Containers' }
        ];

        const createdCats: any[] = [];
        for (const cat of categoriesData) {
            const existing = await prisma.category.findUnique({ where: { name: cat.name } });
            if (!existing) {
                createdCats.push(await prisma.category.create({ data: cat }));
            } else {
                createdCats.push(existing);
            }
        }

        const getCatId = (name: string) => createdCats.find(c => c.name === name)?.id;

        // 2. Create Products List
        const productsData = [
            // --- SPICES ---
            { name: 'Turmeric Powder (Haldi) 500g', price: 140, costPrice: 90, sku: 'SPC001', category: 'Spices & Masalas' },
            { name: 'Red Chilli Powder 500g', price: 180, costPrice: 120, sku: 'SPC002', category: 'Spices & Masalas' },
            { name: 'Coriander Powder (Dhania) 500g', price: 150, costPrice: 100, sku: 'SPC003', category: 'Spices & Masalas' },
            { name: 'Cumin Seeds (Jeera) 250g', price: 120, costPrice: 80, sku: 'SPC004', category: 'Spices & Masalas' },
            { name: 'Mustard Seeds (Rai) 250g', price: 60, costPrice: 35, sku: 'SPC005', category: 'Spices & Masalas' },
            { name: 'Garam Masala 100g', price: 85, costPrice: 50, sku: 'SPC006', category: 'Spices & Masalas' },
            { name: 'Asafoetida (Hing) 50g', price: 160, costPrice: 110, sku: 'SPC007', category: 'Spices & Masalas' },

            // --- DALS ---
            { name: 'Toor Dal Premium 1kg', price: 160, costPrice: 130, sku: 'DAL001', category: 'Dals & Pulses' },
            { name: 'Moong Dal Yellow 1kg', price: 140, costPrice: 110, sku: 'DAL002', category: 'Dals & Pulses' },
            { name: 'Chana Dal 1kg', price: 110, costPrice: 85, sku: 'DAL003', category: 'Dals & Pulses' },
            { name: 'Urad Dal White 1kg', price: 150, costPrice: 120, sku: 'DAL004', category: 'Dals & Pulses' },
            { name: 'Masoor Dal 1kg', price: 120, costPrice: 90, sku: 'DAL005', category: 'Dals & Pulses' },

            // --- RICE & FLOUR ---
            { name: 'Basmati Rice Premium 5kg', price: 650, costPrice: 480, sku: 'RIC001', category: 'Rice & Flours' },
            { name: 'Sona Masoori Rice 10kg', price: 600, costPrice: 450, sku: 'RIC002', category: 'Rice & Flours' },
            { name: 'Chakki Fresh Atta 5kg', price: 240, costPrice: 190, sku: 'KAT001', category: 'Rice & Flours' },
            { name: 'Maida Refined Flour 1kg', price: 50, costPrice: 30, sku: 'KAT002', category: 'Rice & Flours' },
            { name: 'Besan Gram Flour 1kg', price: 100, costPrice: 70, sku: 'KAT003', category: 'Rice & Flours' },

            // --- OILS ---
            { name: 'Sunflower Oil 1L Pouch', price: 140, costPrice: 115, sku: 'OIL001', category: 'Oils & Ghee' },
            { name: 'Mustard Oil 1L Bottle', price: 180, costPrice: 150, sku: 'OIL002', category: 'Oils & Ghee' },
            { name: 'Pure Cow Ghee 500ml', price: 450, costPrice: 380, sku: 'OIL003', category: 'Oils & Ghee' },

            // --- UTENSILS ---
            { name: 'Stainless Steel Ladle Set (3pcs)', price: 350, costPrice: 200, sku: 'UTL001', category: 'Kitchen Utensils' },
            { name: 'Kitchen Knife Set (3pcs)', price: 450, costPrice: 280, sku: 'UTL002', category: 'Kitchen Utensils' },
            { name: 'Wooden Chopping Board', price: 300, costPrice: 180, sku: 'UTL003', category: 'Kitchen Utensils' },
            { name: 'Vegetable Peeler', price: 60, costPrice: 30, sku: 'UTL004', category: 'Kitchen Utensils' },
            { name: 'Steel Grater (Kadukas)', price: 120, costPrice: 70, sku: 'UTL005', category: 'Kitchen Utensils' },
            { name: 'Lemon Squeezer Heavy', price: 150, costPrice: 90, sku: 'UTL006', category: 'Kitchen Utensils' },
            { name: 'Tea Strainer Steel', price: 50, costPrice: 25, sku: 'UTL007', category: 'Kitchen Utensils' },
            { name: 'Balloon Whisk', price: 150, costPrice: 90, sku: 'UTL008', category: 'Kitchen Utensils' },
            { name: 'Kitchen Scissors Multi', price: 180, costPrice: 110, sku: 'UTL009', category: 'Kitchen Utensils' },
            { name: 'Oil Dispenser Bottle 1L', price: 200, costPrice: 130, sku: 'UTL010', category: 'Kitchen Utensils' },
            { name: 'Rolling Pin (Belan)', price: 120, costPrice: 60, sku: 'UTL011', category: 'Kitchen Utensils' },
            { name: 'Chakla (Roti Board)', price: 450, costPrice: 300, sku: 'UTL012', category: 'Kitchen Utensils' },
            { name: 'Tongs (Chimta)', price: 100, costPrice: 60, sku: 'UTL013', category: 'Kitchen Utensils' },
            { name: 'Potato Masher', price: 150, costPrice: 90, sku: 'UTL014', category: 'Kitchen Utensils' },
            { name: 'Colander/Strainer Bowl', price: 250, costPrice: 150, sku: 'UTL015', category: 'Kitchen Utensils' },

            // --- APPLIANCES ---
            { name: 'Mixer Grinder 500W', price: 2500, costPrice: 1800, sku: 'APP001', category: 'Small Appliances' },
            { name: 'Electric Kettle 1.5L', price: 850, costPrice: 600, sku: 'APP002', category: 'Small Appliances' },
            { name: 'Sandwich Maker / Toaster', price: 1200, costPrice: 900, sku: 'APP003', category: 'Small Appliances' },
            { name: 'Hand Blender 300W', price: 1400, costPrice: 1000, sku: 'APP004', category: 'Small Appliances' },
            { name: 'Induction Cooktop 2000W', price: 2200, costPrice: 1700, sku: 'APP005', category: 'Small Appliances' },
            { name: 'Rice Cooker 1.8L', price: 1800, costPrice: 1400, sku: 'APP006', category: 'Small Appliances' },
            { name: 'Juicer Mixer Grinder', price: 3200, costPrice: 2400, sku: 'APP007', category: 'Small Appliances' },
            { name: 'Pop-up Toaster 2 Slice', price: 1400, costPrice: 1000, sku: 'APP008', category: 'Small Appliances' },
            { name: 'Electric Chopper', price: 1100, costPrice: 800, sku: 'APP009', category: 'Small Appliances' },
            { name: 'Coffee Maker Drip', price: 2800, costPrice: 2100, sku: 'APP010', category: 'Small Appliances' },

            // --- COOKWARE ---
            { name: 'Non-Stick Tawa 28cm', price: 850, costPrice: 550, sku: 'CKW001', category: 'Cookware' },
            { name: 'Pressure Cooker 3L Alum', price: 1300, costPrice: 950, sku: 'CKW002', category: 'Cookware' },
            { name: 'Pressure Cooker 5L Alum', price: 1800, costPrice: 1400, sku: 'CKW003', category: 'Cookware' },
            { name: 'Kadhai with Lid 24cm', price: 950, costPrice: 700, sku: 'CKW004', category: 'Cookware' },
            { name: 'Sauce Pan 16cm', price: 450, costPrice: 300, sku: 'CKW005', category: 'Cookware' },
            { name: 'Tadka Pan Hard Anodized', price: 300, costPrice: 200, sku: 'CKW006', category: 'Cookware' },
            { name: 'Idli Maker 4 Plates', price: 1200, costPrice: 850, sku: 'CKW007', category: 'Cookware' },

            // --- STORAGE ---
            { name: 'Spice Box (Masala Dabba)', price: 650, costPrice: 400, sku: 'STR001', category: 'Storage & Containers' },
            { name: 'Stainless Steel Dabba Set (3pcs)', price: 550, costPrice: 380, sku: 'STR002', category: 'Storage & Containers' },
            { name: 'Glass Jar Set (6pcs)', price: 800, costPrice: 500, sku: 'STR003', category: 'Storage & Containers' },
            { name: 'Water Bottle Copper 1L', price: 950, costPrice: 650, sku: 'STR004', category: 'Storage & Containers' }
        ];

        let count = 0;
        for (const p of productsData) {
            const catId = getCatId(p.category);

            // Upsert products
            await prisma.product.upsert({
                where: { sku: p.sku },
                update: {
                    price: p.price,
                    costPrice: p.costPrice,
                    categoryId: catId
                },
                create: {
                    name: p.name,
                    sku: p.sku,
                    price: p.price,
                    costPrice: p.costPrice,
                    categoryId: catId,
                    gstRate: 18,
                    description: `Premium ${p.name}`,
                    barcode: Math.floor(10000000 + Math.random() * 90000000).toString(),
                    inventory: { create: { quantity: 25, lowStockThreshold: 5 } }
                }
            });
            count++;
        }

        console.log(`Seeding Complete: ${count} Items Added`);
        return NextResponse.json({ message: `Success! Added ${count} products.` });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Seeding Failed', details: error.message }, { status: 500 });
    }
}
