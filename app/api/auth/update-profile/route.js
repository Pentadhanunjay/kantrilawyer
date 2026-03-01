import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
    try {
        const { userId, name, phone } = await request.json();

        if (!userId) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
        if (!name || !name.trim()) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
        if (phone && !/^\d{10}$/.test(phone.trim())) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits.' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim(), phone: phone?.trim() || null },
        });

        return NextResponse.json({ success: true, name: user.name, phone: user.phone });
    } catch (e) {
        console.error('[Update Profile]', e.message);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
