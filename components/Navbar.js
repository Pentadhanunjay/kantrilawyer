'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [mobileAccordion, setMobileAccordion] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const { user, logout, isLoggedIn, isAdmin } = useAuth();
    const { count } = useCart();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 992);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const isActive = (path) => pathname === path;

    const tgUniversities = [
        'Osmania University', 'Kakatiya University', 'Palamuru University',
        'Satavahana University', 'Telangana University', 'Mahatma Gandhi University'
    ];

    const apUniversities = [
        'Andhra University', 'Adikavi Nannaya University', 'Damodaram Sanjivayya NLU',
        'Krishna University', 'Sri Krishnadevaraya University', 'Sri Venkateswara University',
        'Yogi Vemana University', 'Acharya Nagarjuna University', 'Andhra Kesari University',
        'KL University', 'Rayalaseema University', 'Sri Padmavati Mahila', 'Vikrama Simhapuri University'
    ];

    const menuItems = [
        { label: 'Courses', key: 'courses' },
        { label: 'eBooks', key: 'ebooks' },
        { label: 'Bookstore', key: 'bookstore' }
    ];

    return (
        <nav className="nav">
            <div className="container nav-content">
                <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Image
                        src="/assets/images/kantri1_logo.jpeg"
                        alt="Kantri Lawyer Logo"
                        width={isMobile ? 120 : 150}
                        height={isMobile ? 50 : 70}
                        priority
                        style={{ objectFit: 'contain', height: isMobile ? '50px' : '70px', width: 'auto' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: '2px' }}>
                        <span style={{ fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.5rem', color: '#1e293b' }}>KANTRI</span>
                        <span style={{ fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.5rem', color: '#10b981' }}>LAWYER</span>
                    </div>
                </Link>

                {/* Desktop Links with Mega Menu */}
                <div className="nav-links desktop-only">
                    <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>

                    <div
                        className="nav-item-dropdown"
                        onMouseEnter={() => setActiveMenu('courses')}
                        onMouseLeave={() => setActiveMenu(null)}
                    >
                        <Link href="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
                            Courses <ChevronDown size={14} />
                        </Link>
                        {activeMenu === 'courses' && (
                            <div className="mega-menu">
                                <div className="mega-menu-content">
                                    <div className="mega-column">
                                        <h4 className="column-title">TELANGANA (TG)</h4>
                                        <ul className="mega-list">
                                            {tgUniversities.map(uni => (
                                                <li key={uni}>
                                                    <Link href={`/courses/university/${encodeURIComponent(uni)}`}>{uni}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mega-column" style={{ flex: 1.5 }}>
                                        <h4 className="column-title">ANDHRA PRADESH (AP)</h4>
                                        <ul className="mega-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
                                            {apUniversities.map(uni => (
                                                <li key={uni}>
                                                    <Link href={`/courses/university/${encodeURIComponent(uni)}`}>{uni}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mega-column">
                                        <h4 className="column-title">EXAMS & CATEGORIES</h4>
                                        <ul className="mega-list">
                                            <li><Link href="/courses?cat=llb-3-ydc">LLB 3 YDC</Link></li>
                                            <li><Link href="/courses?cat=llb-5-ydc">LLB 5 YDC</Link></li>
                                            <li style={{ marginTop: '1.5rem' }}>
                                                <h5 className="sub-title">Entrance Exams</h5>
                                                <ul className="nested-list">
                                                    <li><Link href="/courses?cat=ts-lawcet">TS LAWCET</Link></li>
                                                    <li><Link href="/courses?cat=ap-lawcet">AP LAWCET</Link></li>
                                                    <li><Link href="/courses?cat=clat">CLAT</Link></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/ebooks" className={`nav-link ${isActive('/ebooks') ? 'active' : ''}`}>eBooks</Link>
                    <Link href="/books" className={`nav-link ${isActive('/books') ? 'active' : ''}`}>Bookstore</Link>
                    <Link href="/live-classes" className={`nav-link ${isActive('/live-classes') ? 'active' : ''}`}>Live Classes</Link>
                    <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
                </div>

                <div className="nav-links">
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isAdmin ? (
                                // Admin → Admin Panel button
                                <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 1rem', background: 'rgba(16,185,129,0.15)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#059669', fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}>
                                    🛡️ Admin Panel
                                </Link>
                            ) : (
                                // Regular user → My Dashboard
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Link href="/cart" className="nav-link" style={{ position: 'relative', padding: '0.4rem', background: 'rgba(5,150,105,0.05)', borderRadius: '10px', color: 'var(--primary)' }}>
                                        <ShoppingCart size={20} />
                                        {count > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                                                fontWeight: 800, width: '18px', height: '18px',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', border: '2px solid #fff',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                            }}>
                                                {count}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 1rem', background: 'rgba(5,150,105,0.1)', borderRadius: '10px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <User size={16} /> {user?.name?.split(' ')[0]}
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                            <User size={18} /> Login
                        </button>
                    )}
                    {/* Hamburger — mobile/tablet only */}
                    {isMobile && (
                        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
            />

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
                    <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
                        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Home</Link>

                        {/* Courses with Accordion */}
                        <div className="mobile-nav-group">
                            <button
                                onClick={() => setMobileAccordion(mobileAccordion === 'courses' ? null : 'courses')}
                                className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
                                style={{ width: '100%', justifyContent: 'space-between' }}
                            >
                                Courses <ChevronDown size={14} style={{ transform: mobileAccordion === 'courses' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                            </button>
                            {mobileAccordion === 'courses' && (
                                <div className="mobile-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.8rem 1rem 1rem 1.5rem', background: '#f8fafc', borderLeft: '3px solid var(--primary)', margin: '0.5rem 0 0.5rem 0.5rem', borderRadius: '0 0 0 10px' }}>
                                    <div className="mobile-subgroup" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div className="mobile-subgroup-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '0.8rem', textTransform: 'uppercase' }}>TELANGANA</div>
                                        {tgUniversities.map(uni => (
                                            <Link
                                                key={uni}
                                                href={`/courses/university/${encodeURIComponent(uni)}`}
                                                className="mobile-sub-link"
                                                onClick={() => setIsOpen(false)}
                                                style={{ display: 'block', padding: '0.6rem 0', color: '#475569', fontSize: '0.95rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                                            >
                                                {uni}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mobile-subgroup" style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                                        <div className="mobile-subgroup-title" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '0.8rem', textTransform: 'uppercase' }}>ANDHRA PRADESH</div>
                                        {apUniversities.map(uni => (
                                            <Link
                                                key={uni}
                                                href={`/courses/university/${encodeURIComponent(uni)}`}
                                                className="mobile-sub-link"
                                                onClick={() => setIsOpen(false)}
                                                style={{ display: 'block', padding: '0.6rem 0', color: '#475569', fontSize: '0.95rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                                            >
                                                {uni}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/ebooks" className={`nav-link ${isActive('/ebooks') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>eBooks</Link>
                        <Link href="/books" className={`nav-link ${isActive('/books') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Bookstore</Link>
                        <Link href="/live-classes" className={`nav-link ${isActive('/live-classes') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Live Classes</Link>
                        <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Contact</Link>

                        <hr style={{ borderColor: 'var(--border)', margin: '1rem 0', opacity: 0.1 }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {isLoggedIn ? (
                                <>
                                    {isAdmin ? (
                                        <Link href="/admin" className="btn-primary" style={{ justifyContent: 'center', color: '#fff' }} onClick={() => setIsOpen(false)}>
                                            🛡️ Admin Panel
                                        </Link>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            <Link href="/cart" className="btn-secondary" style={{ justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => setIsOpen(false)}>
                                                <ShoppingCart size={18} /> My Cart
                                            </Link>
                                            <Link href="/dashboard" className="btn-primary" style={{ justifyContent: 'center', color: '#fff' }} onClick={() => setIsOpen(false)}>
                                                <User size={18} /> My Dashboard
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button onClick={() => { setShowAuthModal(true); setIsOpen(false); }} className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
                                    <User size={18} /> Login / Signup
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .nav-item-dropdown {
                    position: relative;
                    height: 100%;
                    display: flex;
                    align-items: center;
                }
                .mega-menu {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0 0 24px 24px;
                    padding: 3.5rem;
                    min-width: 1050px;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.12);
                    z-index: 1000;
                    animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 15px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .mega-menu-content {
                    display: flex;
                    gap: 4rem;
                    justify-content: space-between;
                }
                .mega-column {
                    flex: 1;
                }
                .column-title {
                    font-size: 0.9rem;
                    color: #10b981;
                    text-transform: uppercase;
                    margin-bottom: 1.5rem;
                    letter-spacing: 1px;
                    font-weight: 800;
                    border-bottom: 2px solid #10b981;
                    display: inline-block;
                    padding-bottom: 0.4rem;
                }
                .mega-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .mega-list li a {
                    font-size: 0.95rem;
                    color: #334155;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 500;
                    display: block;
                }
                .mega-list li a:hover {
                    color: #10b981;
                    transform: translateX(4px);
                }
                .sub-title {
                    font-size: 0.85rem;
                    color: #10b981;
                    font-weight: 800;
                    margin-bottom: 1rem;
                }
                .nested-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }
                .nested-list a {
                    font-size: 0.9rem;
                    color: #475569;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }
                .nested-list a:hover {
                    color: #10b981;
                }
                
                /* Mobile Drawer Styles */
                .mobile-menu-overlay {
                    position: fixed;
                    top: 100px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(8px);
                    z-index: 999;
                }
                .mobile-menu-drawer {
                    background: #ffffff;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    border-bottom: 3px solid var(--primary);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    max-height: calc(100vh - 100px);
                    overflow-y: auto;
                }
                .mobile-menu-drawer .nav-link:hover,
                .mobile-menu-drawer .nav-link.active {
                    background: rgba(5, 150, 105, 0.1);
                    padding-left: 2.5rem;
                    box-shadow: inset 4px 0 0 var(--primary);
                }
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .mobile-accordion-content {
                    padding: 0 1rem 1rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    background: #f8fafc;
                    border-left: 2px solid var(--primary);
                    margin: 0.5rem 0 0.5rem 0.5rem;
                    border-radius: 0 0 0 8px;
                }

                .mobile-subgroup-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 0.5px;
                    margin-bottom: 0.8rem;
                }

                .mobile-sub-link {
                    display: block;
                    font-size: 0.95rem;
                    color: #475569;
                    font-weight: 500;
                    padding: 0.6rem 0;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    transition: all 0.2s;
                    width: 100%;
                }

                .mobile-sub-link:last-child {
                    border-bottom: none;
                }

                .mobile-sub-link:hover {
                    color: var(--primary);
                }

                @media (max-width: 992px) {
                    .desktop-only { display: none !important; }
                }
                .desktop-only { display: flex; gap: 1rem; }
            `}</style>
        </nav>
    );
}
