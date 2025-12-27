import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/customers - Search customers
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    try {
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 20
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

// POST /api/customers - Create new customer
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, address } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: { name, phone, email, address }
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        // Handle unique constraint (phone)
        return NextResponse.json({ error: 'Failed to create customer (Phone might exist)' }, { status: 500 });
    }
}
