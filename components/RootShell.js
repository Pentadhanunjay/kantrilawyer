'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageProgress from '@/components/PageProgress';

export default function RootShell({ children }) {
    const pathname = usePathname();

    // Pages that get NO Navbar / Footer / padding
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAuthRoute = pathname?.startsWith('/auth');

    if (isAdminRoute) {
        // Full-screen, no nav, no footer, no padding
        return <>{children}</>;
    }

    return (
        <>
            <PageProgress />
            <Navbar />
            <main style={{
                minHeight: 'calc(100vh - 100px)',
                paddingTop: isAuthRoute ? '0' : '100px',
                background: 'white'
            }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
