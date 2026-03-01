// app/api/admin/upload/route.js
// Handles image uploads from admin panel — saves to /public/uploads/
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
            'application/pdf', 'application/x-zip-compressed', 'application/zip'
        ];
        if (!allowedTypes.includes(file.type)) {
            console.error('[Upload] Unsupported type:', file.type);
            return NextResponse.json({ error: 'Only images (JPG, PNG, WEBP) and PDFs/ZIPs are allowed.' }, { status: 400 });
        }

        // Validate size (650MB max)
        const MAX_SIZE = 650 * 1024 * 1024;
        if (buffer.length > MAX_SIZE) {
            return NextResponse.json({ error: 'File must be under 650MB.' }, { status: 400 });
        }

        // Build a safe unique filename
        const ext = file.name.split('.').pop().toLowerCase();
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, safeName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${safeName}`;
        return NextResponse.json({ url: publicUrl });

    } catch (e) {
        console.error('[Upload]', e.message);
        return NextResponse.json({ error: 'Upload failed: ' + e.message }, { status: 500 });
    }
}
