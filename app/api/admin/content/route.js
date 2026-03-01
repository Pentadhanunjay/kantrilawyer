// app/api/admin/content/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get correct prisma model
const getModel = (type) => {
    if (type === 'courses') return prisma.course;
    if (type === 'ebooks') return prisma.ebook;
    if (type === 'books') return prisma.book;
    if (type === 'classes') return prisma.liveClass;
    return null;
};

// GET all items for admin
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const model = getModel(type);

    if (!model) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    try {
        const data = await model.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Helper to get allowed fields per model
const getAllowedFields = (type) => {
    const common = ['title', 'description', 'category', 'price', 'originalPrice', 'rating', 'image', 'isPublished'];
    if (type === 'courses') return [...common, 'duration', 'videoUrl', 'university', 'semester', 'state', 'curriculum', 'outcomes'];
    if (type === 'ebooks') return [...common, 'fileUrl', 'university', 'semester'];
    if (type === 'books') return [...common, 'stock'];
    if (type === 'classes') return ['title', 'description', 'category', 'price', 'date', 'time', 'duration', 'host', 'meetLink', 'status', 'isPublished'];
    return [];
};

// POST: Create or Update
export async function POST(request) {
    try {
        const body = await request.json();
        const { type, action, data } = body;
        const model = getModel(type);

        if (!model) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

        if (action === 'delete') {
            const numId = Number(data.id);

            if (!numId || isNaN(numId)) {
                console.error('[Admin Delete] Invalid id received:', data.id);
                return NextResponse.json({ error: `Invalid id: "${data.id}"` }, { status: 400 });
            }

            // Remove related Purchase/Order records first (foreign key constraint)
            try {
                if (type === 'courses') {
                    await prisma.purchase.deleteMany({ where: { courseId: numId } });
                } else if (type === 'ebooks') {
                    await prisma.purchase.deleteMany({ where: { ebookId: numId } });
                } else if (type === 'classes') {
                    await prisma.purchase.deleteMany({ where: { classId: numId } });
                } else if (type === 'books') {
                    await prisma.order.deleteMany({ where: { bookId: numId } });
                }
            } catch (relErr) {
                console.warn('[Admin Delete] Related records cleanup warning:', relErr.message);
                // Continue — the item itself can still be deleted
            }

            try {
                await model.delete({ where: { id: numId } });
            } catch (delErr) {
                console.error('[Admin Delete] model.delete failed:', delErr.message);
                return NextResponse.json({ error: delErr.message }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        }

        // Sanitize data: only keep allowed fields for the specific model
        const allowed = getAllowedFields(type);
        const filteredData = {};

        allowed.forEach(field => {
            if (data[field] !== undefined) {
                filteredData[field] = data[field];
            }
        });

        // Ensure numbers are numbers
        if (filteredData.price !== undefined) filteredData.price = Number(filteredData.price);
        if (filteredData.originalPrice !== undefined) filteredData.originalPrice = Number(filteredData.originalPrice);
        if (filteredData.stock !== undefined) filteredData.stock = Number(filteredData.stock);

        // Upsert logic
        const id = Number(data.id);

        if (id && id > 1000000) {
            // Temporary frontend ID (timestamp), create new
            const newItem = await model.create({ data: filteredData });
            return NextResponse.json(newItem);
        } else if (id && id > 0) {
            // Update existing
            const updated = await model.update({
                where: { id },
                data: filteredData
            });
            return NextResponse.json(updated);
        } else {
            // Create new (no ID provided)
            const newItem = await model.create({ data: filteredData });
            return NextResponse.json(newItem);
        }
    } catch (e) {
        console.error('[Admin Content API] Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
