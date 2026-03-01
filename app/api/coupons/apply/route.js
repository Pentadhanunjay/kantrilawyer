// app/api/coupons/apply/route.js
// Called after successful Razorpay payment to record coupon usage
import { NextResponse } from 'next/server';
import { recordCouponUsage } from '@/lib/couponController';

export async function POST(request) {
    try {
        const { couponId, userId, courseId, discountAmount, originalAmount } = await request.json();

        if (!couponId || !userId) {
            return NextResponse.json({ error: 'couponId and userId are required.' }, { status: 400 });
        }

        await recordCouponUsage({
            couponId: Number(couponId),
            userId,
            courseId,
            discountAmount: Number(discountAmount),
            originalAmount: Number(originalAmount),
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Coupon Apply] Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
