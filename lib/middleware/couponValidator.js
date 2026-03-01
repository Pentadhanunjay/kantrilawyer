// lib/middleware/couponValidator.js
// Validation middleware — runs before route handler logic
import { NextResponse } from 'next/server';

/**
 * Parses and validates the incoming coupon validation request body.
 * Returns { error: NextResponse } on failure or { data } on success.
 */
export async function parseCouponRequest(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return {
            error: NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
        };
    }

    const { code, userId, item } = body;

    if (!code || typeof code !== 'string' || code.trim().length < 2) {
        return {
            error: NextResponse.json({ error: 'A valid coupon code is required.' }, { status: 400 })
        };
    }

    if (!item || typeof item !== 'object' || typeof item.price !== 'number') {
        return {
            error: NextResponse.json({ error: 'Item details (id, price, university, semester, state) are required.' }, { status: 400 })
        };
    }

    // Sanitise
    return {
        data: {
            code: code.trim().toUpperCase(),
            userId: userId || null,
            item: {
                id: item.id ?? null,
                price: Number(item.price),
                university: item.university || null,
                semester: item.semester || null,
                state: item.state || null,
            }
        }
    };
}

/**
 * Validate admin coupon creation/update payload.
 * Returns { error } or { data }.
 */
export function validateCouponPayload(body) {
    const errors = [];

    if (!body.code || body.code.length < 3) errors.push('Coupon code must be at least 3 characters.');
    if (!['percentage', 'fixed'].includes(body.type)) errors.push('Type must be "percentage" or "fixed".');
    if (isNaN(body.value) || Number(body.value) <= 0) errors.push('Value must be a positive number.');
    if (body.type === 'percentage' && Number(body.value) > 100) errors.push('Percentage discount cannot exceed 100%.');
    if (body.expiresAt && isNaN(Date.parse(body.expiresAt))) errors.push('Invalid expiry date.');

    if (errors.length) return { error: errors };
    return { data: body };
}
