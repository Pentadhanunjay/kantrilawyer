// app/api/admin/upload/route.js
// Uses Cloudinary for cloud storage — works on Vercel (no local filesystem writes)
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
            'application/pdf', 'application/x-zip-compressed', 'application/zip'
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only images (JPG, PNG, WEBP) and PDFs/ZIPs are allowed.' }, { status: 400 });
        }

        // Validate size (100MB max — Cloudinary free tier limit)
        const MAX_SIZE = 100 * 1024 * 1024;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        if (buffer.length > MAX_SIZE) {
            return NextResponse.json({ error: 'File must be under 100MB.' }, { status: 400 });
        }

        // ── Upload to Cloudinary via REST API (no SDK needed) ──
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            return NextResponse.json(
                { error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your environment variables.' },
                { status: 500 }
            );
        }

        // Convert buffer to base64 data URI for Cloudinary unsigned upload
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        const uploadFormData = new FormData();
        uploadFormData.append('file', dataUri);
        uploadFormData.append('upload_preset', uploadPreset);
        uploadFormData.append('folder', 'kantrilawyer');

        const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: 'POST', body: uploadFormData }
        );

        if (!cloudRes.ok) {
            const err = await cloudRes.json();
            throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const cloudData = await cloudRes.json();
        return NextResponse.json({ url: cloudData.secure_url });

    } catch (e) {
        console.error('[Upload]', e.message);
        return NextResponse.json({ error: 'Upload failed: ' + e.message }, { status: 500 });
    }
}
