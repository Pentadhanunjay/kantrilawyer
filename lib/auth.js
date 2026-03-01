// lib/auth.js
// Auth layer — calls PostgreSQL-backed API routes for login/register
// Session is stored in localStorage for client-side use only (token + user info)

const SESSION_KEY = 'kl_session_v2';

export const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

// ── Session helpers ────────────────────────────────────────────────────────
export function getSession() {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
}

export function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// ── Register (calls /api/auth/register → PostgreSQL) ──────────────────────
export async function registerUser({ name, email, password, phone }) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (data.error === 'EMAIL_EXISTS') throw new Error('EMAIL_EXISTS');
        throw new Error(data.error || 'REGISTER_FAILED');
    }

    saveSession(data);
    return data;
}

// ── Login (calls /api/auth/login → PostgreSQL) ─────────────────────────────
export async function loginUser({ email, password }) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (data.error === 'INVALID_CREDENTIALS') throw new Error('INVALID_CREDENTIALS');
        throw new Error(data.error || 'LOGIN_FAILED');
    }

    saveSession(data);
    return data;
}

// ── Seed Admin (no-op — admin is seeded via prisma/seed.js) ───────────────
export async function seedAdmin() {
    // Admin created in DB via: node prisma/seed.js
    // admin@kantrilawyer.com / admin@kantri2026
}

// ── Admin User Management (PostgreSQL backed) ──────────────────────────────
export async function getAllUsers() {
    try {
        const res = await fetch('/api/admin/users');
        if (res.ok) return await res.json();
    } catch (e) { console.error('Error fetching users:', e); }
    return [];
}

export async function adminUpdateUser(id, data) {
    try {
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', id, data }),
        });
        return res.ok;
    } catch (e) { console.error('Error updating user:', e); return false; }
}

export async function adminDeleteUser(id) {
    try {
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id }),
        });
        return res.ok;
    } catch (e) { console.error('Error deleting user:', e); return false; }
}

// ── User Purchases (Unlocking logic) ───────────────────────────────────────
export async function getUserPurchases(userId) {
    if (!userId) return { courses: [], ebooks: [], classes: [], books: [] };
    try {
        const res = await fetch(`/api/user/purchases?userId=${userId}`);
        if (res.ok) return await res.json();
    } catch (e) { console.error('Error fetching user purchases:', e); }
    return { courses: [], ebooks: [], classes: [], books: [] };
}

export function saveAllUsers() { } // Legacy support
