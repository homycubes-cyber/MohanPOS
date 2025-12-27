import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// POST /api/invoices - Create new invoice
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        let userId = (session?.user as any)?.id;

        // Fallback for Dev/Test if no session: Get ANY valid user
        if (!userId) {
            const defaultUser = await prisma.user.findFirst();
            if (defaultUser) {
                userId = defaultUser.id;
            } else {
                // Create a temporary admin if absolutely no users exist
                const newUser = await prisma.user.create({
                    data: {
                        name: 'Admin User',
                        email: 'admin@pos.com',
                        password: 'hashedpassword', // In real app use bcrypt
                        role: 'OWNER'
                    }
                });
                userId = newUser.id;
            }
        }

        const body = await request.json();
        const { items, totalAmount, taxAmount, paymentMode, discount, customerId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // Generate Invoice Number
        const count = await prisma.invoice.count();
        const invoiceNo = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

        // Transaction logic with prisma.$transaction
        const invoice = await prisma.$transaction(async (tx) => {
            if (body.status !== 'HELD' && body.status !== 'COMPLETED' && body.status !== 'ESTIMATE') {
                // Logic normally defaults to COMPLETED, but we added new valid statuses
            }
            // 1. Create Invoice
            const newInvoice = await tx.invoice.create({
                data: {
                    invoiceNo,
                    userId: userId || '00000000-0000-0000-0000-000000000000', // UUID Fallback
                    customerId: customerId || null,
                    totalAmount,
                    taxAmount,
                    discount: discount || 0,
                    status: 'COMPLETED',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            tax: (item.price * item.gstRate / (100 + item.gstRate)) * item.quantity,
                            total: item.price * item.quantity
                        }))
                    },
                    payments: {
                        create: {
                            amount: totalAmount,
                            mode: paymentMode || 'CASH'
                        }
                    }
                },
                include: {
                    items: true,
                    payments: true
                }
            });

            // 2. Reduce Inventory (Only if COMPLETED)
            // 2. Decrement Stock (Only if COMPLETED)
            if (body.status === 'COMPLETED') {
                for (const item of items) {
                    await tx.inventory.update({
                        where: { productId: item.productId },
                        data: {
                            quantity: {
                                decrement: item.quantity
                            }
                        }
                    });
                }
            }

            return newInvoice;
        });

        return NextResponse.json(invoice, { status: 201 });

    } catch (error) {
        console.error('Invoice creation failed:', error);
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
}

// GET /api/invoices - List invoices
// GET /api/invoices - List invoices (Optional filter by status)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                user: { select: { name: true } },
                items: { include: { product: true } },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(invoices);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}
