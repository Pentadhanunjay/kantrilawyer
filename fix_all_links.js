const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const meetLink = 'https://meet.google.com/qjq-bzrz-neb';

    // Update ALL live classes with this meet link for testing purposes
    const result = await prisma.liveClass.updateMany({
        data: { meetLink: meetLink }
    });

    console.log(`Updated ${result.count} live classes with meetLink: ${meetLink}`);

    const all = await prisma.liveClass.findMany();
    all.forEach(c => {
        console.log(`ID: ${c.id}, Title: ${c.title}, meetLink: ${c.meetLink}`);
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
