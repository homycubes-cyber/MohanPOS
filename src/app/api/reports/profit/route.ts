import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        const startDate = from ? new Date(from) : new Date(0);
        const endDate = to ? new Date(to) : new Date();
        endDate.setHours(23, 59, 59, 999);

        // Fetch Invoices (Sales)
        const invoices = await prisma.invoice.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            },
            include: {
                items: { include: { product: true } }
            }
        });

        // 1. Total Sales (Revenue)
        // Note: Revenue is typically strictly Sale Price - Tax (if tax excluded) or Total.
        // Let's use Total Amount for Revenue, and track Cost for COGS.
        // Actually, Revenue = Taxable Value.

        // Calculate Logic
        let totalRevenue = 0;
        let totalCost = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        invoices.forEach(inv => {
            totalDiscount += inv.discount;
            totalTax += inv.taxAmount;

            // For revenue, we often consider Net Sales = (Gross Sales - Returns - Allowances/Discounts).
            // Let's assume inv.totalAmount is the final amount paid by customer.
            // Revenue (excluding tax) = inv.totalAmount - inv.taxAmount.
            // But wait, inv.totalAmount ALREADY includes discount deduction in typical cart logic?
            // Let's check CartContext: cartTotal = subTotal - discount. Yes.

            totalRevenue += (inv.totalAmount - inv.taxAmount);

            // COGS (Cost of Goods Sold)
            inv.items.forEach(item => {
                // If we store historical cost price, use it. 
                // Currently schema item has 'price' (selling). 
                // We need to check if we store cost.
                // Schema has Product.costPrice.
                // Ideally we should snapshot cost price at time of sale in InvoiceItem, but we didn't add it to InvoiceItem schema.
                // We will fall back to *current* Product Cost Price. (Approximation)
                const cost = item.product.costPrice || 0;
                totalCost += (cost * item.quantity);
            });
        });

        // 2. Expenses (Fixed/OpEx)
        const expenses = await prisma.expense.findMany({
            where: {
                date: { gte: startDate, lte: endDate }
            }
        });
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // 3. Net Profit
        const grossProfit = totalRevenue - totalCost;
        const netProfit = grossProfit - totalExpenses;

        return NextResponse.json({
            revenue: totalRevenue,
            cogs: totalCost,
            grossProfit,
            expenses: totalExpenses,
            netProfit,
            totalTax,
            salesCount: invoices.length,
            expenseCount: expenses.length
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate P&L' }, { status: 500 });
    }
}
