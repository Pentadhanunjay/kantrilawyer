// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const { name, email, phone, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
        }

        const newMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone,
                subject: subject || 'No Subject',
                message
            }
        });

        return NextResponse.json({ success: true, id: newMessage.id });

    } catch (error) {
        console.error('[/api/contact] Error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
