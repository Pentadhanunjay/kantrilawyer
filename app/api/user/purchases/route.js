// app/api/user/purchases/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        // Get digital purchases (courses, ebooks, classes)
        const purchases = await prisma.purchase.findMany({
            where: { userId },
            include: {
                liveClass: {
                    select: { meetLink: true }
                }
            }
        });

        // Get physical book orders
        const orders = await prisma.order.findMany({
            where: { userId },
            select: { bookId: true, status: true }
        });

        return NextResponse.json({
            // Courses returned as objects for expiry checking: { id, expiryDate }
            courses: purchases
                .filter(p => p.type === 'courses')
                .map(p => ({ id: p.courseId, expiryDate: p.expiryDate })),
            ebooks: purchases.filter(p => p.type === 'ebooks').map(p => p.ebookId),
            classes: purchases.filter(p => p.type === 'classes').map(p => p.classId),
            classLinks: purchases
                .filter(p => p.type === 'classes' && p.liveClass?.meetLink)
                .reduce((acc, p) => {
                    acc[p.classId] = p.liveClass.meetLink;
                    return acc;
                }, {}),
            books: orders.map(o => o.bookId)
        });

    } catch (error) {
        console.error('[API User Purchases] Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
