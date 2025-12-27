import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// PUT /api/vendors/[id] - Update vendor
export async function PUT(request: Request, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { name, contact, email, address, gstin } = body;

        const vendor = await prisma.vendor.update({
            where: { id },
            data: { name, contact, email, address, gstin }
        });

        return NextResponse.json(vendor);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
    }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(request: Request, { params }: { params: Params }) {
    const { id } = await params;
    try {
        await prisma.vendor.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Vendor deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
    }
}
