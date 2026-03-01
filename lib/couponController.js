// lib/couponController.js
// MVC Controller — pure business logic, no HTTP concerns
import { prisma } from '@/lib/prisma';

/**
 * Parse a JSON restriction string from DB safely
 */
function parseList(str) {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
}

/**
 * Calculate discount amount from a coupon + original price
 */
export function calcDiscount(coupon, originalAmount) {
    let discount = coupon.type === 'percentage'
        ? Math.round((originalAmount * coupon.value) / 100)
        : coupon.value;
    return Math.min(discount, originalAmount); // never discount more than price
}

/**
 * Core validation — returns { valid, coupon, reason, discountAmount }
 * item = { id, price, university, semester, state }
 */
export async function validateCoupon(code, userId, item) {
    if (!code) return { valid: false, reason: 'No coupon code provided.' };

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!coupon) return { valid: false, reason: 'Invalid coupon code.' };
    if (!coupon.isActive) return { valid: false, reason: 'This coupon is no longer active.' };

    // Expiry check
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        return { valid: false, reason: 'This coupon has expired.' };
    }

    // Global usage limit
    if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
        return { valid: false, reason: 'This coupon has reached its usage limit.' };
    }

    // Per-user usage limit
    if (userId) {
        const userUsage = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId }
        });
        if (userUsage >= coupon.maxUsagePerUser) {
            return { valid: false, reason: 'You have already used this coupon.' };
        }
    }

    // Minimum order amount
    if (item?.price < coupon.minOrderAmount) {
        return { valid: false, reason: `Minimum order amount is ₹${coupon.minOrderAmount}.` };
    }

    // ── Type Restriction ──────────────────────────────────────────────────────
    const allowedTypes = parseList(coupon.allowedTypes);
    if (allowedTypes.length && item?.type && !allowedTypes.includes(item.type)) {
        const typeLabels = { courses: 'Courses', ebooks: 'eBooks', books: 'Physical Books', classes: 'Live Classes' };
        return { valid: false, reason: `This coupon is not valid for ${typeLabels[item.type] || item.type}.` };
    }

    // ── LMS & Product Restrictions ──────────────────────────────────────────
    const allowedUnivs = parseList(coupon.allowedUniversities);
    const allowedSems = parseList(coupon.allowedSemesters);
    const allowedStates = parseList(coupon.allowedStates);

    if (allowedUnivs.length && item?.university && !allowedUnivs.includes(item.university)) {
        return { valid: false, reason: `This coupon is only valid for: ${allowedUnivs.join(', ')}.` };
    }
    if (allowedSems.length && item?.semester && !allowedSems.includes(item.semester)) {
        return { valid: false, reason: `This coupon is only valid for: ${allowedSems.join(', ')}.` };
    }
    if (allowedStates.length && item?.state && !allowedStates.includes(item.state)) {
        return { valid: false, reason: `This coupon is only valid for ${allowedStates.join(' or ')} courses.` };
    }

    // Specific ID restrictions per type
    const productRestrictions = {
        courses: parseList(coupon.allowedCourseIds),
        ebooks: parseList(coupon.allowedEbookIds),
        books: parseList(coupon.allowedBookIds),
        classes: parseList(coupon.allowedClassIds),
    };

    const allowedIds = productRestrictions[item.type] || [];
    if (allowedIds.length && item?.id && !allowedIds.map(Number).includes(Number(item.id))) {
        return { valid: false, reason: `This coupon is not valid for this specific ${item.type.slice(0, -1)}.` };
    }

    const discountAmount = calcDiscount(coupon, item?.price ?? 0);

    return { valid: true, coupon, discountAmount, finalAmount: (item?.price ?? 0) - discountAmount };
}

/**
 * Record coupon usage after successful payment
 */
export async function recordCouponUsage({ couponId, userId, type, productId, discountAmount, originalAmount }) {
    const data = {
        couponId,
        userId,
        discountAmount,
        originalAmount
    };

    if (type === 'courses') data.courseId = Number(productId);
    else if (type === 'ebooks') data.ebookId = Number(productId);
    else if (type === 'books') data.bookId = Number(productId);
    else if (type === 'classes') data.classId = Number(productId);

    await prisma.$transaction([
        prisma.couponUsage.create({ data }),
        prisma.coupon.update({
            where: { id: couponId },
            data: { usageCount: { increment: 1 } }
        })
    ]);
}

/**
 * Get analytics for a single coupon
 */
export async function getCouponAnalytics(couponId) {
    const usages = await prisma.couponUsage.findMany({
        where: { couponId: Number(couponId) },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { usedAt: 'desc' }
    });
    const totalDiscountGiven = usages.reduce((s, u) => s + u.discountAmount, 0);
    const totalRevenueSaved = usages.reduce((s, u) => s + u.originalAmount, 0);
    return { usages, totalDiscountGiven, totalRevenueSaved, useCount: usages.length };
}

/**
 * List all coupons with basic analytics counts
 */
export async function listCoupons() {
    return prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { usages: true } } }
    });
}
