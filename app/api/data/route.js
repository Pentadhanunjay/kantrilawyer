// app/api/data/route.js
// Public API — serves courses, ebooks, books, live classes from PostgreSQL
// GET /api/data?type=courses|ebooks|books|classes

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        let data = [];

        switch (type) {
            case 'courses':
                data = await prisma.course.findMany({
                    where: { isPublished: true },
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, title: true, description: true, category: true,
                        price: true, originalPrice: true, rating: true,
                        duration: true, image: true, videoUrl: true, sales: true,
                        university: true, semester: true, state: true,
                        curriculum: true, outcomes: true
                    }
                });
                break;

            case 'ebooks':
                data = await prisma.ebook.findMany({
                    where: { isPublished: true },
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, title: true, description: true, category: true,
                        price: true, originalPrice: true, rating: true, image: true, fileUrl: true,
                        university: true, semester: true
                    }
                });
                break;

            case 'books':
                data = await prisma.book.findMany({
                    where: { isPublished: true },
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, title: true, description: true, category: true,
                        price: true, originalPrice: true, rating: true, image: true, stock: true
                    }
                });
                break;

            case 'classes':
                data = await prisma.liveClass.findMany({
                    where: { isPublished: true },
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, title: true, description: true, date: true, time: true,
                        duration: true, host: true, price: true, status: true,
                        category: true
                        // meetLink intentionally excluded from public API — only shown after purchase
                    }
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Use: courses, ebooks, books, classes' },
                    { status: 400 }
                );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error(`[/api/data] DB error (type=${type}):`, error.message);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
