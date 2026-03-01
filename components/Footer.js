'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    // Start null so server & client first render match
    const [isMobile, setIsMobile] = useState(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Use safe defaults until client has measured
    const mobile = isMobile === true;

    return (
        <footer style={{
            background: '#1e293b',
            marginTop: isAdmin ? 0 : (mobile ? '2rem' : '6rem'),
            color: '#f8fafc',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div className="container" style={{ padding: mobile ? '1.2rem 1rem 0.8rem' : '4rem 1.5rem 2rem', boxSizing: 'border-box' }}>

                {/* Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: mobile ? '1fr 1fr' : '1.2fr 1fr 1fr',
                    gap: mobile ? '1rem' : '3rem',
                }}>

                    {/* Brand — full width on mobile */}
                    <div style={mobile ? { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' } : {}}>
                        <div>
                            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: mobile ? '0' : '1.2rem' }}>
                                <img
                                    src="/assets/images/kantri1_logo.jpeg"
                                    alt="Kantri Lawyer Logo"
                                    style={{
                                        height: mobile ? '70px' : '100px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        filter: 'brightness(1.2)' // Slightly brighten the sketch on dark background
                                    }}
                                />
                            </Link>
                            {!mobile && (
                                <p style={{ color: '#94a3b8', marginBottom: '0.8rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
                                    Kantri by Awareness, Honest by Conscience
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: mobile ? 'row' : 'column', gap: mobile ? '0.8rem' : '0.35rem', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                            <span>📞 +91 93929 07777</span>
                            <span>📧 uday@kantrilawyer.com</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: '#fff', fontSize: mobile ? '0.8rem' : '0.92rem', fontWeight: 700, marginBottom: mobile ? '0.6rem' : '0.9rem' }}>Quick Links</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '0.35rem' : '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                { href: '/courses', label: 'All Courses' },
                                { href: '/ebooks', label: 'eBooks Library' },
                                { href: '/books', label: 'Physical Books' },
                                { href: '/contact', label: 'Contact Us' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.88rem', transition: '0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#10b981'}
                                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 style={{ color: '#fff', fontSize: mobile ? '0.8rem' : '0.92rem', fontWeight: 700, marginBottom: mobile ? '0.6rem' : '0.9rem' }}>Legal</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '0.35rem' : '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                { href: '/cancellation-and-refunds', label: 'Cancellations & Refunds' },
                                { href: '/privacy-policy', label: 'Privacy Policy' },
                                { href: '/terms', label: 'Terms of Service' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.88rem', transition: '0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#10b981'}
                                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}

                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    marginTop: mobile ? '1rem' : '3rem',
                    paddingTop: mobile ? '0.8rem' : '1.2rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: mobile ? '0.7rem' : '0.82rem',
                    paddingBottom: mobile ? '0.5rem' : 0,
                }}>
                    © {new Date().getFullYear()} Kantri Lawyer. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
