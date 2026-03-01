// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true
            }
        });
        return NextResponse.json(users);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { action, id, data } = await request.json();

        if (action === 'update') {
            const updated = await prisma.user.update({
                where: { id },
                data: {
                    name: data.name,
                    role: data.role,
                    phone: data.phone
                }
            });
            return NextResponse.json(updated);
        }

        if (action === 'delete') {
            await prisma.user.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
