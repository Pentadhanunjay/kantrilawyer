// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(request) {
    try {
        const { name, email, password, phone } = await request.json();

        if (!name || !email || !password || !phone) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }
        if (!/[A-Z]/.test(password)) {
            return NextResponse.json({ error: 'Password must contain at least one capital letter.' }, { status: 400 });
        }
        if (!/^\d{10}$/.test(phone)) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits.' }, { status: 400 });
        }

        // Check existing user
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                passwordHash,
                role: 'user',
            }
        });

        // Create session token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await prisma.session.create({
            data: { userId: user.id, token, expiresAt }
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });

    } catch (error) {
        console.error('[/api/auth/register]', error.message);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
