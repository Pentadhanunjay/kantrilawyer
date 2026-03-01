
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log('👥 Database Users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    } catch (error) {
        console.error('❌ Error listing users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
