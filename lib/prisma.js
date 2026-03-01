// lib/prisma.js
// Singleton Prisma client — prevents too many connections in Next.js dev hot-reload

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
