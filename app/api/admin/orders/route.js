// app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch all digital purchases
        const purchases = await prisma.purchase.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
                ebook: { select: { title: true } },
                liveClass: { select: { title: true } }
            }
        });

        // Fetch all physical book orders
        const bookOrders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                book: { select: { title: true } }
            }
        });

        // Normalize data for admin view
        const normalized = [
            ...purchases.map(p => ({
                id: p.id,
                userName: p.user?.name,
                userEmail: p.user?.email,
                itemTitle: p.course?.title || p.ebook?.title || p.liveClass?.title || 'Unknown',
                type: p.type,
                amount: p.amount,
                paymentId: p.paymentId,
                status: p.status,
                createdAt: p.createdAt
            })),
            ...bookOrders.map(o => ({
                id: o.id,
                userName: o.user?.name,
                userEmail: o.user?.email,
                itemTitle: o.book?.title || 'Physical Book',
                type: 'book',
                amount: o.amount,
                paymentId: o.paymentId,
                status: o.status,
                createdAt: o.createdAt,
                address: o.address,
                phone: o.phone
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json(normalized);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
