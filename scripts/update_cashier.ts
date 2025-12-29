
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for CASHIER users...");

    // 1. Find all cashiers
    const cashiers = await prisma.user.findMany({
        where: { role: 'CASHIER' }
    });

    console.log(`Found ${cashiers.length} cashier(s).`);

    if (cashiers.length === 0) {
        console.log("No cashiers found to update.");
        return;
    }

    // 2. Update them
    // Permissions needed: DASHBOARD (to see overview), POS (to sell), INVENTORY (to look up items), CUSTOMERS (to add customers)
    const newPermissions = ['DASHBOARD', 'POS', 'INVENTORY', 'CUSTOMERS'];

    const result = await prisma.user.updateMany({
        where: { role: 'CASHIER' },
        data: { permissions: newPermissions }
    });

    console.log(`Successfully updated ${result.count} users with permissions: ${newPermissions.join(', ')}`);
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
