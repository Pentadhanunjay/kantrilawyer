// prisma/seed.js
// Seeds the database with initial courses, ebooks, books, live classes, and admin user

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Admin User ────────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            name: 'Platform Admin',
            email: 'admin@gmail.com',
            passwordHash: adminHash,
            role: 'admin',
        },
    });
    console.log('✅ Admin user seeded');

    // ── Courses ───────────────────────────────────────────────────────────────
    const courses = [
        // Osmania University
        {
            title: 'Constitutional Law - I (OU Sem 1)',
            description: 'Introduction to Constitutional Law for Osmania University, Semester 1.',
            category: 'LLB 3 YDC OU',
            price: 999,
            originalPrice: 1999,
            rating: '4.9',
            duration: '20 Hours',
            university: 'Osmania University',
            semester: 'Sem - I',
            image: '/assets/images/course_law.png',
        },
        {
            title: 'Law of Contracts - II (OU Sem 2)',
            description: 'Advanced Contracts Law for Osmania University, Semester 2.',
            category: 'LLB 3 YDC OU',
            price: 999,
            originalPrice: 1999,
            rating: '4.8',
            duration: '22 Hours',
            university: 'Osmania University',
            semester: 'Sem - II',
            image: '/assets/images/course_law.png',
        },
        // Kakatiya University
        {
            title: 'Family Law - I (KU Sem 1)',
            description: 'Family Law (Husband & Wife) for Kakatiya University, Semester 1.',
            category: 'LLB 3 YDC KU',
            price: 899,
            originalPrice: 1799,
            rating: '4.7',
            duration: '18 Hours',
            university: 'Kakatiya University',
            semester: 'Sem - I',
            image: '/assets/images/course_law.png',
        },
        {
            title: 'Environmental Law (KU Sem 3)',
            description: 'Environmental Law and protection for Kakatiya University, Semester 3.',
            category: 'LLB 3 YDC KU',
            price: 799,
            originalPrice: 1599,
            rating: '4.9',
            duration: '15 Hours',
            university: 'Kakatiya University',
            semester: 'Sem - III',
            image: '/assets/images/course_law.png',
        },
        // Andhra University
        {
            title: 'Torts and Consumer Protection (AU Sem 1)',
            description: 'Law of Torts for Andhra University, Semester 1.',
            category: 'LLB 3 YDC AU',
            price: 950,
            originalPrice: 1800,
            rating: '4.8',
            duration: '25 Hours',
            university: 'Andhra University',
            semester: 'Sem - I',
            image: '/assets/images/course_law.png',
        }
    ];

    for (const course of courses) {
        await prisma.course.create({ data: course }).catch(() => { });
    }
    console.log('✅ Courses seeded');

    // ── eBooks ────────────────────────────────────────────────────────────────
    const ebooks = [
        {
            title: 'Indian Contract Act – Complete Notes',
            description: 'Detailed notes with case laws, important sections and exam-focused summaries.',
            category: 'LLB TG-STATE',
            price: 299,
            originalPrice: 599,
            rating: '4.9',
            image: '/assets/images/ebook_law.png',
        },
        {
            title: 'Constitutional Law – Unit 1 to 5',
            description: 'All constitutional law units covered with diagrams, case references and previous paper analysis.',
            category: 'LLB ALL UNI',
            price: 399,
            originalPrice: 799,
            rating: '4.8',
            image: '/assets/images/ebook_law.png',
        },
    ];

    for (const ebook of ebooks) {
        await prisma.ebook.create({ data: ebook }).catch(() => { });
    }
    console.log('✅ eBooks seeded');

    // ── Physical Books ────────────────────────────────────────────────────────
    const books = [
        {
            title: 'LLB 3 YDC – Semester 1 Study Material',
            description: 'Printed study material for Semester 1 with practice questions and case summaries.',
            category: 'PHYSICAL BOOK',
            price: 699,
            originalPrice: 999,
            rating: '4.8',
            image: '/assets/images/book_llb.png',
        },
        {
            title: 'TS LAWCET Previous Papers (Last 10 Years)',
            description: 'Printed booklet of last 10 years TS LAWCET papers with detailed answer keys.',
            category: 'PHYSICAL BOOK',
            price: 349,
            originalPrice: 499,
            rating: '4.7',
            image: '/assets/images/book_llb.png',
        },
    ];

    for (const book of books) {
        await prisma.book.create({ data: book }).catch(() => { });
    }
    console.log('✅ Physical books seeded');

    // ── Live Classes ──────────────────────────────────────────────────────────
    const liveClasses = [
        {
            title: 'Indian Contract Act – Case Law Q&A',
            description: 'Interactive deep-dive into major judgments of the Indian Contract Act for first-year LLB students. Includes Q&A and exam tips.',
            date: 'Oct 25, 2026',
            time: '7:00 PM IST',
            duration: '90 mins',
            host: 'Uday Kantri',
            price: 199,
            meetLink: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled',
            category: 'LLB',
        },
        {
            title: 'Constitutional Law Unit-1 Masterclass',
            description: 'Live session covering preamble, citizenship, and fundamental rights with exam-focused notes.',
            date: 'Oct 28, 2026',
            time: '8:00 PM IST',
            duration: '120 mins',
            host: 'Uday Kantri',
            price: 299,
            meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            status: 'scheduled',
            category: 'LLB',
        },
    ];

    for (const cls of liveClasses) {
        await prisma.liveClass.create({ data: cls }).catch(() => { });
    }
    console.log('✅ Live classes seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin login: admin@gmail.com');
    console.log('🔑 Admin password: admin123');
}

main()
    .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
