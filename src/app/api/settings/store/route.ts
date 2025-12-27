import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Fixed import

export async function GET() {
    try {
        const store = await prisma.storeProfile.findFirst();
        return NextResponse.json(store || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Upsert: Create if not exists, update first row if exists
        const store = await prisma.storeProfile.findFirst();

        let res;
        if (store) {
            res = await prisma.storeProfile.update({
                where: { id: store.id },
                data: body
            });
        } else {
            res = await prisma.storeProfile.create({ data: body });
        }
        return NextResponse.json(res);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
