const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing prisma.purchase.create...');
        // Try creating with a dummy user (assuming some user exists or just checking schema validation)
        // We'll use a try-catch to see the validation error specifically.
        const result = await prisma.purchase.create({
            data: {
                userId: 'non-existent-user',
                type: 'courses',
                courseId: 1,
                amount: 100,
                paymentId: 'test_payment',
                status: 'completed',
                expiryDate: new Date()
            }
        });
        console.log('Success:', result);
    } catch (e) {
        console.error('FAILED with error:');
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
