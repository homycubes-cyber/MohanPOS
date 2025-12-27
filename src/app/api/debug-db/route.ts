import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Attempt to connect explicitly
        await prisma.$connect();

        // Attempt a simple query
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            userCount,
            env_db_url_exists: !!process.env.DATABASE_URL
        });
    } catch (error: any) {
        console.error('Database Connection Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
