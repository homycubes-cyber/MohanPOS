import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        const body = await request.json();
        const customer = await prisma.customer.update({
            where: { id: id },
            data: body
        });
        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
