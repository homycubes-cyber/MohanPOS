import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/vendors - List all vendors
export async function GET() {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(vendors);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contact, email, address, gstin } = body;

        if (!name) {
            return NextResponse.json({ error: 'Vendor Name is required' }, { status: 400 });
        }

        const vendor = await prisma.vendor.create({
            data: {
                name,
                contact,
                email,
                address,
                gstin
            }
        });

        return NextResponse.json(vendor, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
    }
}
