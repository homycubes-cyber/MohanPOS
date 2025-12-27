import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role, permissions } = body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role, permissions }
        });
        return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions });
    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, email, password, role, permissions } = body;

        const data: any = { name, email, role, permissions };
        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });
        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
    }
}
