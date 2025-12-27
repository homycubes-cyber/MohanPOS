import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const accounts = await prisma.bankAccount.findMany();

        // Calculate dynamic balance for each account
        // Balance = Opening + (UPI/Card/Transfer Income) - (Linked Expenses)
        // This is simplified. Real accounting needs a Ledger table.
        // For now, we approximate:
        // 1. Get total UPI/Card/B_TRANSFER sales (assuming they go to *some* bank).
        //    Issue: We don't track WHICH bank a sale goes to yet.
        //    Solution: For now, show just Opening Balance + manually tracked items?
        //    Better: Show Opening Balance.
        //    Wait, user wants automatic calculation.
        //    Let's assume ALL UPI/Card go to the FIRST bank account for now, or just show Opening Balance until we add 'Bank Selection' in POS.

        // Revised Strategy: Just return the stored 'currentBalance' which we should update on transactions.
        // But we haven't implemented the update logic.
        // Let's return accounts as is first.

        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching accounts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const account = await prisma.bankAccount.create({
            data: {
                name: body.name,
                accountNumber: body.accountNumber,
                branch: body.branch,
                openingBalance: body.openingBalance,
                currentBalance: body.openingBalance // Initialize
            }
        });
        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating account' }, { status: 500 });
    }
}
