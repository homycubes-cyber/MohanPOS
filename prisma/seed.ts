import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@mohanpos.com'

    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingUser) {
        const user = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: adminEmail,
                password: 'admin123', // In production, this should be hashed!
                role: 'OWNER',
            },
        })
        console.log(`Created user: ${user.name} (${user.email})`)
    } else {
        console.log(`User already exists: ${existingUser.email}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
