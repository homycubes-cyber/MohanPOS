import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const tags = await prisma.tag.findMany();
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const tag = await prisma.tag.create({ data: { name } });
        return NextResponse.json(tag);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}
