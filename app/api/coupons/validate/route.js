// app/api/coupons/validate/route.js
// View → Controller: validate a coupon before payment
import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/couponController';
import { parseCouponRequest } from '@/lib/middleware/couponValidator';

export async function POST(request) {
    // ── Middleware: parse + validate request ────────────────────────────────
    const parsed = await parseCouponRequest(request);
    if (parsed.error) return parsed.error;

    const { code, userId, item } = parsed.data;

    // ── Controller: run business logic ──────────────────────────────────────
    const result = await validateCoupon(code, userId, item);

    if (!result.valid) {
        return NextResponse.json({ valid: false, reason: result.reason }, { status: 200 });
    }

    return NextResponse.json({
        valid: true,
        couponId: result.coupon.id,
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        description: result.coupon.description,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
    });
}
