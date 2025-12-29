
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count();
    console.log(`Product count: ${count}`);

    if (count > 0) {
        const users = await prisma.user.findMany();
        console.log(`User count: ${users.length}`);
        console.table(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
    }
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
