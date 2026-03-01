const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'dhanu123@gmail.com';

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            purchases: {
                include: {
                    liveClass: true
                }
            }
        }
    });

    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`User: ${user.name} (${user.id})`);
    console.log('Purchases:');
    user.purchases.forEach(p => {
        console.log(`- Type: ${p.type}, ID: ${p.courseId || p.ebookId || p.classId}, Status: ${p.status}`);
        if (p.type === 'classes' && p.liveClass) {
            console.log(`  LiveClass: ${p.liveClass.title}, meetLink: ${p.liveClass.meetLink}`);
        } else if (p.type === 'classes' && !p.liveClass) {
            console.log(`  LiveClass RELATION MISSING! classId: ${p.classId}`);
        }
    });

    const allClasses = await prisma.liveClass.findMany();
    console.log('\nAll Live Classes:');
    allClasses.forEach(c => {
        console.log(`- ID: ${c.id}, Title: ${c.title}, meetLink: ${c.meetLink}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
