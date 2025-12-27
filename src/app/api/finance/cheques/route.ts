import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/finance/cheques
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status) where.status = status;

        const cheques = await prisma.cheque.findMany({
            where,
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(cheques);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST /api/finance/cheques - Record new cheque
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { checkNo, bankName, amount, date, type, partyName } = body;

        const cheque = await prisma.cheque.create({
            data: {
                checkNo,
                bankName,
                amount: parseFloat(amount),
                date: new Date(date),
                type, // 'IN' or 'OUT'
                partyName,
                status: 'PENDING'
            }
        });
        return NextResponse.json(cheque, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PATCH /api/finance/cheques - Update status
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body; // 'CLEARED' or 'BOUNCED'

        const cheque = await prisma.cheque.update({
            where: { id },
            data: { status }
        });
        return NextResponse.json(cheque);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
