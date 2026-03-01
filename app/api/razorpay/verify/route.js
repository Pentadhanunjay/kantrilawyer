// app/api/razorpay/verify/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const payload = await request.json();
        console.log('[Verify] Payload:', payload);

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            purchaseType,
            itemId,
            amount,
            addressInfo
        } = payload;

        // 1. Verify Signature
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            console.error('RAZORPAY_KEY_SECRET is not set');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        if (!userId) {
            console.error('[Verify] Missing userId in request');
            return NextResponse.json({ error: 'User must be logged in to complete purchase.' }, { status: 401 });
        }

        const numericItemId = Number(itemId);
        if (isNaN(numericItemId)) {
            console.error('[Verify] Invalid itemId:', itemId);
            return NextResponse.json({ error: 'Invalid product selection.' }, { status: 400 });
        }

        const numericAmount = Number(amount);

        // 2. Verify User and Item exist in DB (Avoid Foreign Key errors)
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            console.error('[Verify] User not found in DB:', userId);
            return NextResponse.json({ error: 'User account not found. Please logout and login again.' }, { status: 404 });
        }

        // 3. Save purchase(s) to Database
        if (purchaseType === 'cart' && Array.isArray(payload.cartItems)) {
            // Process multiple items from cart
            for (const item of payload.cartItems) {
                const isBook = item.type === 'books' || item.category?.toLowerCase().includes('book');
                const numericId = Number(item.id);

                if (isBook) {
                    await prisma.order.create({
                        data: {
                            userId,
                            bookId: numericId,
                            quantity: Number(item.quantity) || 1,
                            amount: Number(item.price) * (Number(item.quantity) || 1),
                            paymentId: razorpay_payment_id,
                            status: 'confirmed',
                            address: addressInfo?.address || '',
                            city: addressInfo?.city || '',
                            state: addressInfo?.state || '',
                            pincode: addressInfo?.pincode || '',
                            phone: addressInfo?.phone || ''
                        }
                    });
                } else {
                    const expiryDate = item.type === 'courses'
                        ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
                        : null;

                    await prisma.purchase.create({
                        data: {
                            userId,
                            type: String(item.type),
                            courseId: item.type === 'courses' ? numericId : null,
                            ebookId: item.type === 'ebooks' ? numericId : null,
                            classId: item.type === 'classes' ? numericId : null,
                            amount: Number(item.price),
                            paymentId: razorpay_payment_id,
                            status: 'completed',
                            expiryDate
                        }
                    });

                    // Increment sales count
                    if (item.type === 'courses') {
                        await prisma.course.update({ where: { id: numericId }, data: { sales: { increment: 1 } } });
                    } else if (item.type === 'ebooks') {
                        await prisma.ebook.update({ where: { id: numericId }, data: { sales: { increment: 1 } } });
                    } else if (item.type === 'classes') {
                        await prisma.liveClass.update({ where: { id: numericId }, data: { status: 'scheduled' } });
                    }
                }
            }
        } else if (purchaseType === 'books') {
            const numericItemId = Number(itemId);
            const itemExists = await prisma.book.findUnique({ where: { id: numericItemId } });
            if (!itemExists) {
                console.error('[Verify] Book not found:', numericItemId);
                return NextResponse.json({ error: 'Book not found in database.' }, { status: 404 });
            }

            // Physical item order
            await prisma.order.create({
                data: {
                    userId,
                    bookId: numericItemId,
                    quantity: Number(payload.quantity) || 1,
                    amount: numericAmount,
                    paymentId: razorpay_payment_id,
                    status: 'confirmed',
                    address: addressInfo?.address || '',
                    city: addressInfo?.city || '',
                    state: addressInfo?.state || '',
                    pincode: addressInfo?.pincode || '',
                    phone: addressInfo?.phone || ''
                }
            });
        } else {
            // Digital asset purchase (Course, Ebook, Live Class)
            const numericItemId = Number(itemId);
            let itemExists = false;
            if (purchaseType === 'courses') itemExists = await prisma.course.findUnique({ where: { id: numericItemId } });
            else if (purchaseType === 'ebooks') itemExists = await prisma.ebook.findUnique({ where: { id: numericItemId } });
            else if (purchaseType === 'classes') itemExists = await prisma.liveClass.findUnique({ where: { id: numericItemId } });

            if (!itemExists) {
                console.error(`[Verify] ${purchaseType} not found:`, numericItemId);
                return NextResponse.json({ error: `The selected ${purchaseType.slice(0, -1)} was not found in our database.` }, { status: 404 });
            }

            const expiryDate = purchaseType === 'courses'
                ? new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
                : null;

            console.log('[Verify] Creating purchase record:', {
                userId, purchaseType, itemId: numericItemId, expiryDate
            });

            await prisma.purchase.create({
                data: {
                    userId,
                    type: String(purchaseType),
                    courseId: purchaseType === 'courses' ? numericItemId : null,
                    ebookId: purchaseType === 'ebooks' ? numericItemId : null,
                    classId: purchaseType === 'classes' ? numericItemId : null,
                    amount: numericAmount,
                    paymentId: razorpay_payment_id,
                    status: 'completed',
                    expiryDate
                }
            });

            // Increment sales count
            if (purchaseType === 'courses') {
                await prisma.course.update({ where: { id: numericItemId }, data: { sales: { increment: 1 } } });
            } else if (purchaseType === 'ebooks') {
                await prisma.ebook.update({ where: { id: numericItemId }, data: { sales: { increment: 1 } } });
            } else if (purchaseType === 'classes') {
                await prisma.liveClass.update({ where: { id: numericItemId }, data: { status: 'scheduled' } });
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified and purchase recorded' });

    } catch (error) {
        console.error('Payment Verification Error FULL:', error);
        return NextResponse.json({
            error: error.message,
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
