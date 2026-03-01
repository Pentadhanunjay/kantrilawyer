// verify_db_connection.js
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('--- Testing Database Connection ---');
        console.log('Attempting to connect...');

        // Perform a simple query
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();

        console.log('✅ Connection Successful!');
        console.log(`📊 Current Stats:`);
        console.log(`- Users: ${userCount}`);
        console.log(`- Courses: ${courseCount}`);

        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        if (admin) {
            console.log(`👑 Admin user found: ${admin.email}`);
        } else {
            console.log('⚠️ No admin user found. Did you run prisma db seed?');
        }

    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('Error Details:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
