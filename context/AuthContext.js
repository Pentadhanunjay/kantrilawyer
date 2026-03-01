'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getSession, saveSession, clearSession, seedAdmin, ROLES, getUserPurchases } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState({ courses: [], ebooks: [], classes: [], books: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            // Always try to seed admin (the fn guards itself with a flag)
            try { await seedAdmin(); } catch { }

            // Restore saved session
            const session = getSession();
            if (session) {
                setUser(session);
                // Fetch purchases from DB to unlock content
                const data = await getUserPurchases(session.id);
                setPurchases(data);
            }

            setLoading(false);
        };
        init();
    }, []);

    const login = async (sessionUser) => {
        saveSession(sessionUser);
        setUser(sessionUser);
        const data = await getUserPurchases(sessionUser.id);
        setPurchases(data);
    };

    const logout = () => {
        clearSession();
        setUser(null);
        setPurchases({ courses: [], ebooks: [], classes: [], books: [] });
    };

    const isAdmin = user?.role === ROLES.ADMIN;
    const isUser = user?.role === ROLES.USER || isAdmin;
    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{
            user, login, logout, loading,
            isLoggedIn, isAdmin, isUser,
            role: user?.role || 'guest',
            purchases,
            refreshPurchases: async () => {
                if (user) setPurchases(await getUserPurchases(user.id));
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
