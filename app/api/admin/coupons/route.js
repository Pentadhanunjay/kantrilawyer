// app/api/admin/coupons/route.js
// Admin CRUD + Analytics for Coupons
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listCoupons, getCouponAnalytics } from '@/lib/couponController';
import { validateCouponPayload } from '@/lib/middleware/couponValidator';

// GET: list all coupons
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const analyticsId = searchParams.get('analytics');

        if (analyticsId) {
            const analytics = await getCouponAnalytics(analyticsId);
            return NextResponse.json(analytics);
        }

        const coupons = await listCoupons();
        return NextResponse.json(coupons);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: create new coupon
export async function POST(request) {
    try {
        const body = await request.json();

        // Middleware validation
        const { error, data } = validateCouponPayload(body);
        if (error) return NextResponse.json({ errors: error }, { status: 400 });

        const coupon = await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase().trim(),
                description: data.description || null,
                type: data.type,
                value: Number(data.value),
                minOrderAmount: Number(data.minOrderAmount) || 0,
                maxUsage: data.maxUsage ? Number(data.maxUsage) : null,
                maxUsagePerUser: Number(data.maxUsagePerUser) || 1,
                allowedUniversities: data.allowedUniversities?.length
                    ? JSON.stringify(data.allowedUniversities) : null,
                allowedSemesters: data.allowedSemesters?.length
                    ? JSON.stringify(data.allowedSemesters) : null,
                allowedStates: data.allowedStates?.length
                    ? JSON.stringify(data.allowedStates) : null,
                allowedTypes: data.allowedTypes?.length
                    ? JSON.stringify(data.allowedTypes) : null,
                allowedCourseIds: data.allowedCourseIds?.length
                    ? JSON.stringify(data.allowedCourseIds) : null,
                allowedEbookIds: data.allowedEbookIds?.length
                    ? JSON.stringify(data.allowedEbookIds) : null,
                allowedBookIds: data.allowedBookIds?.length
                    ? JSON.stringify(data.allowedBookIds) : null,
                allowedClassIds: data.allowedClassIds?.length
                    ? JSON.stringify(data.allowedClassIds) : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isActive: data.isActive !== false,
            }
        });
        return NextResponse.json(coupon, { status: 201 });
    } catch (e) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Coupon code already exists.' }, { status: 409 });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH: update coupon (toggle active, update expiry, etc.)
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const formatted = {};
        if (updates.code !== undefined) formatted.code = updates.code.toUpperCase().trim();
        if (updates.description !== undefined) formatted.description = updates.description;
        if (updates.type !== undefined) formatted.type = updates.type;
        if (updates.value !== undefined) formatted.value = Number(updates.value);
        if (updates.minOrderAmount !== undefined) formatted.minOrderAmount = Number(updates.minOrderAmount);
        if (updates.maxUsage !== undefined) formatted.maxUsage = updates.maxUsage ? Number(updates.maxUsage) : null;
        if (updates.maxUsagePerUser !== undefined) formatted.maxUsagePerUser = Number(updates.maxUsagePerUser);
        if (updates.isActive !== undefined) formatted.isActive = Boolean(updates.isActive);
        if (updates.expiresAt !== undefined) formatted.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
        if (updates.allowedUniversities !== undefined) formatted.allowedUniversities = updates.allowedUniversities?.length ? JSON.stringify(updates.allowedUniversities) : null;
        if (updates.allowedSemesters !== undefined) formatted.allowedSemesters = updates.allowedSemesters?.length ? JSON.stringify(updates.allowedSemesters) : null;
        if (updates.allowedStates !== undefined) formatted.allowedStates = updates.allowedStates?.length ? JSON.stringify(updates.allowedStates) : null;
        if (updates.allowedTypes !== undefined) formatted.allowedTypes = updates.allowedTypes?.length ? JSON.stringify(updates.allowedTypes) : null;
        if (updates.allowedCourseIds !== undefined) formatted.allowedCourseIds = updates.allowedCourseIds?.length ? JSON.stringify(updates.allowedCourseIds) : null;
        if (updates.allowedEbookIds !== undefined) formatted.allowedEbookIds = updates.allowedEbookIds?.length ? JSON.stringify(updates.allowedEbookIds) : null;
        if (updates.allowedBookIds !== undefined) formatted.allowedBookIds = updates.allowedBookIds?.length ? JSON.stringify(updates.allowedBookIds) : null;
        if (updates.allowedClassIds !== undefined) formatted.allowedClassIds = updates.allowedClassIds?.length ? JSON.stringify(updates.allowedClassIds) : null;

        const updated = await prisma.coupon.update({ where: { id: Number(id) }, data: formatted });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE: delete coupon
export async function DELETE(request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await prisma.coupon.delete({ where: { id: Number(id) } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
