// app/api/admin/messages/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('[/api/admin/messages] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { action, id, status } = await request.json();

        if (action === 'update_status') {
            const updated = await prisma.contactMessage.update({
                where: { id },
                data: { status }
            });
            return NextResponse.json(updated);
        }

        if (action === 'delete') {
            await prisma.contactMessage.delete({
                where: { id }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('[/api/admin/messages] POST Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
