import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/finance/loans - List all loans
export async function GET(request: Request) {
    try {
        const loans = await prisma.loan.findMany({
            include: { transactions: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(loans);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST /api/finance/loans - Create new loan account
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { partyName, principal, interestRate, startDate, type } = body;

        const loan = await prisma.loan.create({
            data: {
                partyName,
                principal: parseFloat(principal),
                interestRate: parseFloat(interestRate || 0),
                startDate: new Date(startDate),
                type, // 'GIVEN' or 'TAKEN'
            }
        });
        return NextResponse.json(loan, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
