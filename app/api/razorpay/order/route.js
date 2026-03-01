import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { amount, currency = 'INR', receipt } = await request.json();

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        // Basic Auth Header
        const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: amount * 100, // in paise
                currency,
                receipt,
            })
        });

        const order = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: 'Error from Razorpay', error: order }, { status: response.status });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
