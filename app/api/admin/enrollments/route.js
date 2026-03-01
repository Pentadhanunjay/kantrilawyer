// app/api/admin/enrollments/route.js
// Returns all course purchases with expiry info + user/course details for admin
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const purchases = await prisma.purchase.findMany({
            where: { type: 'courses' },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true, university: true, semester: true } },
            }
        });
        return NextResponse.json(purchases);
    } catch (e) {
        console.error('[Admin Enrollments] Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH: Extend expiry date for a specific purchase
export async function PATCH(request) {
    try {
        const { purchaseId, months = 6 } = await request.json();
        if (!purchaseId) return NextResponse.json({ error: 'purchaseId required' }, { status: 400 });

        const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
        if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });

        // If already expired, extend from today; otherwise extend from current expiry
        const base = purchase.expiryDate && new Date(purchase.expiryDate) > new Date()
            ? new Date(purchase.expiryDate)
            : new Date();

        const newExpiry = new Date(base);
        newExpiry.setMonth(newExpiry.getMonth() + months);

        const updated = await prisma.purchase.update({
            where: { id: purchaseId },
            data: { expiryDate: newExpiry }
        });
        return NextResponse.json({ success: true, expiryDate: updated.expiryDate });
    } catch (e) {
        console.error('[Admin Enrollments PATCH] Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
