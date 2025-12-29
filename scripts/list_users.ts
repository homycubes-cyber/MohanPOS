
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Listing all users in DB...");
    const users = await prisma.user.findMany({
        select: { email: true, role: true, permissions: true }
    });
    console.table(users);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
