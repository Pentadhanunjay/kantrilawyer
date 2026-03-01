// lib/db.js
// Central Data Handler using LocalStorage with PostgreSQL Sync

// Fetches data from PostgreSQL API routes with persistent caching
export const fetchFromDB = async (type) => {
    try {
        const res = await fetch(`/api/data?type=${type}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data) {
                const cacheData = {
                    timestamp: Date.now(),
                    content: data
                };
                localStorage.setItem(`platform_v2_${type === 'books' ? 'books' : type}`, JSON.stringify(cacheData));
                return data;
            }
        }
    } catch (e) {
        console.error(`Sync error (${type}):`, e);
    }
    return null;
};

// Optimized version with 5-minute client-side caching
export const getPlatformData = async (key) => {
    if (typeof window === 'undefined') return [];

    const storageKey = `platform_v2_${key}`;
    const raw = localStorage.getItem(storageKey);

    if (raw) {
        const parsed = JSON.parse(raw);
        const isFresh = (Date.now() - parsed.timestamp) < 5 * 60 * 1000; // 5 mins cache
        if (isFresh) return parsed.content;
    }

    // Attempt sync if stale or missing
    const fresh = await fetchFromDB(key);
    if (fresh) return fresh;

    // Last resort fallback to stale local storage
    return raw ? JSON.parse(raw).content : [];
};

// Synchronous version (fallback/immediate)
export const getData = (key) => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`platform_${key}`);
    return raw ? JSON.parse(raw) : [];
};

// ── Admin Functions ────────────────────────────────────────────────────────

export const saveItemToDB = async (type, item) => {
    try {
        const res = await fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, action: 'save', data: item })
        });
        return await res.json();
    } catch (e) {
        console.error('Save to DB failed:', e);
        return null;
    }
};

export const deleteItemFromDB = async (type, id) => {
    try {
        await fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, action: 'delete', data: { id } })
        });
        return true;
    } catch (e) {
        console.error('Delete from DB failed:', e);
        return false;
    }
};

export const saveData = (key, data) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`platform_${key}`, JSON.stringify(data));
};
