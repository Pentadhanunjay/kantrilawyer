
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    console.log('🔍 Testing Database Connection...');
    try {
        // 1. Try to connect and run a simple query
        const userCount = await prisma.user.count();
        console.log(`✅ Connection Successful!`);
        console.log(`📊 Current User Count: ${userCount}`);

        // 2. Check if the Admin user exists
        const admin = await prisma.user.findFirst({
            where: { role: 'admin' }
        });
        if (admin) {
            console.log(`👤 Admin Account Found: ${admin.email}`);
        } else {
            console.warn(`⚠️ Warning: No Admin account found in database.`);
        }

        // 3. Check for Sample Content
        const courseCount = await prisma.course.count();
        const ebookCount = await prisma.ebook.count();
        console.log(`📚 Content Status: ${courseCount} Courses, ${ebookCount} eBooks`);

    } catch (error) {
        console.error('❌ Database Connection Failed!');
        console.error('Error Details:', error.message);
        if (error.message.includes('Can\'t reach database')) {
            console.log('\n💡 Hint: Make sure your PostgreSQL server is running and the credentials in .env are correct.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
