import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, newPassword } = await request.json();

        if (!email || !newPassword) {
            return NextResponse.json({ error: 'Email and new password are required.' }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user) {
            return NextResponse.json({ error: 'No account found with that email address.' }, { status: 404 });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { email: email.toLowerCase().trim() },
            data: { passwordHash }
        });

        // Invalidate all existing sessions for security
        await prisma.session.deleteMany({ where: { userId: user.id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Reset Password] Error:', e.message);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
