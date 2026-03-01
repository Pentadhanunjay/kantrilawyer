'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, BookOpen, Video, Package, Settings, LogOut,
    User, Lock, Phone, Mail, CheckCircle, Edit3,
    Eye, EyeOff, Download, ExternalLink, Calendar,
    ShoppingBag, Award, Clock, AlertCircle, Save
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getData, getPlatformData } from '@/lib/db';
import { ROLES } from '@/lib/auth';
import Link from 'next/link';

const TABS = [
    { key: 'courses', label: 'My Courses', icon: <Play size={18} /> },
    { key: 'ebooks', label: 'My eBooks', icon: <BookOpen size={18} /> },
    { key: 'classes', label: 'Live Classes', icon: <Video size={18} /> },
    { key: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
    { key: 'password', label: 'Change Password', icon: <Lock size={18} /> },
];

export default function Dashboard() {
    const { user, logout, login, isLoggedIn, isAdmin, loading, purchases } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('courses');
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get('order_success') === '1') {
            setOrderSuccess(true);
            setActiveTab('orders');
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    // Data
    const [myCourses, setMyCourses] = useState([]);
    const [myEbooks, setMyEbooks] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [myOrders, setMyOrders] = useState([]);

    // Profile form
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [profileMsg, setProfileMsg] = useState('');

    // Password form
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

    // Redirect if not logged in OR if admin (admin has its own panel)
    useEffect(() => {
        if (loading) return;
        if (!isLoggedIn) { router.push('/auth/login'); return; }
        if (isAdmin) { router.push('/admin'); return; }
    }, [loading, isLoggedIn, isAdmin]);

    useEffect(() => {
        if (!user || !purchases) return;
        setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '' });

        const loadContent = async () => {
            const allCourses = await getPlatformData('courses');
            const allEbooks = await getPlatformData('ebooks');
            const allBooks = await getPlatformData('books');
            const allClasses = await getPlatformData('classes');

            // Purchases.courses is now an array of objects: [{id, expiryDate}, ...]
            const purchasedCourseIds = (purchases.courses || []).map(p => Number(p.id));

            setMyCourses(allCourses.filter(c => purchasedCourseIds.includes(Number(c.id))));
            setMyEbooks(allEbooks.filter(e => (purchases.ebooks || []).includes(Number(e.id))));

            const bookedClasses = allClasses
                .filter(c => (purchases.classes || []).includes(Number(c.id)))
                .map(c => ({
                    ...c,
                    meetLink: c.meetLink || purchases.classLinks?.[c.id]
                }));
            setMyClasses(bookedClasses);

            setMyOrders(allBooks.filter(b => (purchases.books || []).includes(Number(b.id))));
        };
        loadContent();
    }, [user, purchases]);

    // ── Profile Update ──────────────────────────────────────────────────────
    const handleProfileSave = async () => {
        setProfileMsg('');
        if (!profile.name.trim()) { setProfileMsg('❌ Name cannot be empty.'); return; }
        if (profile.phone && !/^\d{10}$/.test(profile.phone.trim())) { setProfileMsg('❌ Phone must be exactly 10 digits.'); return; }
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name: profile.name, phone: profile.phone }),
            });
            const data = await res.json();
            if (!res.ok) { setProfileMsg('❌ ' + (data.error || 'Failed to update profile.')); return; }
            login({ ...user, name: data.name, phone: data.phone }); // update context
            setProfileMsg('✅ Profile updated successfully!');
        } catch {
            setProfileMsg('❌ Something went wrong. Please try again.');
        }
    };

    // ── Password Change ─────────────────────────────────────────────────────
    const handlePasswordChange = async () => {
        setPwMsg({ text: '', type: '' });
        if (!pwForm.current) { setPwMsg({ text: 'Please enter your current password.', type: 'error' }); return; }
        if (!pwForm.newPw) { setPwMsg({ text: 'Please enter a new password.', type: 'error' }); return; }
        if (pwForm.newPw.length < 6) { setPwMsg({ text: 'New password must be at least 6 characters.', type: 'error' }); return; }
        if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ text: 'New passwords do not match.', type: 'error' }); return; }
        if (pwForm.current === pwForm.newPw) { setPwMsg({ text: 'New password must be different from current password.', type: 'error' }); return; }

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, currentPassword: pwForm.current, newPassword: pwForm.newPw }),
            });
            const data = await res.json();
            if (!res.ok) { setPwMsg({ text: data.error || 'Failed to change password.', type: 'error' }); return; }
            setPwMsg({ text: '✅ Password changed successfully!', type: 'success' });
            setPwForm({ current: '', newPw: '', confirm: '' });
        } catch {
            setPwMsg({ text: 'Something went wrong. Please try again.', type: 'error' });
        }
    };

    if (loading || !user) return (
        <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)' }}>
            Loading your dashboard...
        </div>
    );

    const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '6rem' }}>
            <style>{`
                .db-grid { display: grid; grid-template-columns: 240px 1fr; gap: 2rem; align-items: start; }
                .db-sidebar-wrap { position: sticky; top: 90px; }
                .db-banner-h1 { font-size: 1.8rem; }
                .db-banner { padding: 3rem 0 5rem; }
                .db-banner-inner { display: flex; align-items: center; gap: 1.5rem; }
                .db-avatar { width: 70px; height: 70px; font-size: 1.6rem; }
                @media (max-width: 768px) {
                    .db-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .db-sidebar-wrap { position: static !important; }
                    .db-sidebar-tabs { display: flex !important; overflow-x: auto !important; gap: 0 !important; padding-bottom: 4px; }
                    .db-sidebar-tabs button { min-width: max-content !important; border-left: none !important; border-bottom: 3px solid transparent !important; border-radius: 0 !important; padding: 0.8rem 1rem !important; font-size: 0.82rem !important; }
                    .db-sidebar-tabs button.active-tab { border-bottom-color: #059669 !important; border-left: none !important; }
                    .db-sidebar-stats { display: none !important; }
                    .db-banner { padding: 2rem 0 4rem !important; }
                    .db-banner-inner { gap: 1rem !important; }
                    .db-banner-h1 { font-size: 1.3rem !important; }
                    .db-avatar { width: 52px !important; height: 52px !important; font-size: 1.2rem !important; }
                    .db-logout-btn span { display: none; }
                }
                @media (max-width: 480px) {
                    .card-row-mobile { flex-wrap: wrap !important; }
                    .card-row-mobile .card-action { width: 100% !important; justify-content: center !important; margin-top: 0.5rem; }
                }
            `}</style>

            {/* Top Banner */}
            <div className="db-banner" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
                <div className="container">
                    <div className="db-banner-inner">
                        <div className="db-avatar" style={{ borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 className="db-banner-h1" style={{ fontWeight: 900, color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Welcome, {user.name?.split(' ')[0]}! 👋
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        </div>
                        <button className="db-logout-btn" onClick={() => { logout(); router.push('/'); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            <LogOut size={16} /> <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-3rem' }}>
                <AnimatePresence>
                    {orderSuccess && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ background: '#10b981', color: '#fff', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                            <CheckCircle size={24} />
                            <div>
                                <div style={{ fontWeight: 800 }}>Order Placed Successfully!</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Your book(s) will be shipped within 7 days. Check "My Orders" for details.</div>
                            </div>
                            <button onClick={() => setOrderSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><LogOut size={18} style={{ transform: 'rotate(90deg)' }} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="db-grid">

                    {/* Sidebar */}
                    <div className="db-sidebar-wrap">
                        <div className="db-sidebar-tabs" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            {TABS.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={activeTab === tab.key ? 'active-tab' : ''}
                                    style={{
                                        width: '100%', padding: '1rem 1.5rem',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: activeTab === tab.key ? 'rgba(5,150,105,0.07)' : 'transparent',
                                        borderTop: 'none',
                                        borderRight: 'none',
                                        borderBottom: '1px solid #f1f5f9',
                                        borderLeft: activeTab === tab.key ? '3px solid #059669' : '3px solid transparent',
                                        color: activeTab === tab.key ? '#059669' : '#64748b',
                                        fontWeight: activeTab === tab.key ? 800 : 500,
                                        fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
                                        fontFamily: 'inherit', transition: '0.15s',
                                        whiteSpace: 'nowrap'
                                    }}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="db-sidebar-stats" style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Summary</div>
                            {[
                                { label: 'Courses', val: myCourses.length, icon: <Play size={14} />, color: '#10b981' },
                                { label: 'eBooks', val: myEbooks.length, icon: <BookOpen size={14} />, color: '#3b82f6' },
                                { label: 'Classes', val: myClasses.length, icon: <Video size={14} />, color: '#8b5cf6' },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                        <span style={{ color: s.color }}>{s.icon}</span> {s.label}
                                    </span>
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                            {/* ── MY COURSES ── */}
                            {activeTab === 'courses' && (
                                <Section title="My Courses" subtitle={`${myCourses.length} purchased course${myCourses.length !== 1 ? 's' : ''}`} icon={<Play />}>
                                    {myCourses.length === 0 ? (
                                        <EmptyState icon={<Play size={40} />} title="No Courses Yet" desc="Purchase your first course to see it here." link="/courses" linkLabel="Browse Courses" />
                                    ) : myCourses.map(course => (
                                        <div key={course.id} style={cardRow}>
                                            <div style={{ width: '80px', height: '60px', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Play size={22} style={{ color: '#10b981' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{course.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '12px' }}>
                                                    <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{course.duration || '7.5 Hours'}</span>
                                                    <span style={{ color: '#10b981', fontWeight: 700 }}><CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />Enrolled</span>
                                                </div>
                                            </div>
                                            <Link href={`/courses/${course.id}`} style={greenBtn}>
                                                <Play size={15} /> Watch Now
                                            </Link>
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* ── MY EBOOKS ── */}
                            {activeTab === 'ebooks' && (
                                <Section title="My eBooks" subtitle={`${myEbooks.length} purchased eBook${myEbooks.length !== 1 ? 's' : ''}`} icon={<BookOpen />}>
                                    {myEbooks.length === 0 ? (
                                        <EmptyState icon={<BookOpen size={40} />} title="No eBooks Yet" desc="Purchase an eBook to access it here." link="/ebooks" linkLabel="Browse eBooks" />
                                    ) : myEbooks.map(book => (
                                        <div key={book.id} style={cardRow}>
                                            <div style={{ width: '60px', height: '80px', background: 'linear-gradient(135deg,#1e3a5f,#0f172a)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <BookOpen size={22} style={{ color: '#3b82f6' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{book.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{book.category} &nbsp;·&nbsp; <span style={{ color: '#10b981', fontWeight: 700 }}>Purchased</span></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Link href={`/ebooks/${book.id}`} style={greenBtn}>
                                                    <BookOpen size={14} /> Read Online
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* ── LIVE CLASSES ── */}
                            {activeTab === 'classes' && (
                                <Section title="My Live Classes" subtitle="Classes you've purchased — Meet link visible here" icon={<Video />}>
                                    {myClasses.length === 0 ? (
                                        <EmptyState icon={<Video size={40} />} title="No Classes Purchased" desc="Purchase a live class to get the Google Meet link here." link="/live-classes" linkLabel="Browse Live Classes" />
                                    ) : myClasses.map(cls => (
                                        <div key={cls.id} style={cardRow}>
                                            <div style={{ width: '56px', height: '56px', background: 'rgba(139,92,246,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Video size={22} style={{ color: '#8b5cf6' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{cls.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    <span><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{cls.date}</span>
                                                    <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{cls.time}</span>
                                                    {cls.duration && <span>{cls.duration}</span>}
                                                    {cls.status && <span style={{ color: cls.status === 'live' ? '#16a34a' : '#64748b', fontWeight: 700, textTransform: 'capitalize' }}>{cls.status === 'live' ? '🔴 Live Now' : cls.status}</span>}
                                                </div>
                                            </div>
                                            {cls.meetLink && cls.status !== 'cancelled' ? (
                                                <a href={cls.meetLink} target="_blank" rel="noreferrer" style={{ ...greenBtn, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', textDecoration: 'none' }}>
                                                    <ExternalLink size={14} /> Join Meet
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    {cls.status === 'cancelled' ? 'Cancelled' : 'Link pending'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </Section>
                            )}

                            {/* ── BOOK ORDERS ── */}
                            {activeTab === 'orders' && (
                                <Section title="Book Orders" subtitle={`${myOrders.length} order${myOrders.length !== 1 ? 's' : ''}`} icon={<Package />}>
                                    {myOrders.length === 0 ? (
                                        <EmptyState icon={<ShoppingBag size={40} />} title="No Orders Yet" desc="Purchase a physical book to track it here." link="/books" linkLabel="Visit Bookstore" />
                                    ) : (
                                        <>
                                            <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <AlertCircle size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                                                <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                                    <strong>Shipping Information:</strong> All physical book orders will be shipped to your provided address within 7 days.
                                                    For tracking or queries, contact us via WhatsApp: <strong>+91 93929 07777</strong>
                                                </div>
                                            </div>
                                            {myOrders.map(book => (
                                                <div key={book.id} style={cardRow}>
                                                    <div style={{ width: '56px', height: '56px', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Package size={22} style={{ color: '#f59e0b' }} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{book.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '12px' }}>
                                                            <span>₹{book.price}</span>
                                                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>📦 Processing</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                                                        ✓ Paid
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </Section>
                            )}

                            {/* ── PROFILE ── */}
                            {activeTab === 'profile' && (
                                <Section title="Profile Details" subtitle="Update your personal information" icon={<User />}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '520px' }}>
                                        <Field icon={<User size={16} />} label="Full Name" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} placeholder="Your full name" />
                                        <Field icon={<Mail size={16} />} label="Email Address" value={profile.email} disabled placeholder="Email cannot be changed" hint="Email is your login ID and cannot be changed." />
                                        <Field icon={<Phone size={16} />} label="Phone Number (Optional)" value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} placeholder="+91 98765 43210" type="tel" />

                                        {profileMsg && (
                                            <div style={{ padding: '10px 16px', background: profileMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', color: profileMsg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: '0.88rem' }}>
                                                {profileMsg}
                                            </div>
                                        )}

                                        <button onClick={handleProfileSave} style={{ ...greenBtn, padding: '0.9rem 2rem', justifyContent: 'center', fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
                                            <Save size={16} /> Save Changes
                                        </button>
                                    </div>
                                </Section>
                            )}

                            {/* ── CHANGE PASSWORD ── */}
                            {activeTab === 'password' && (
                                <Section title="Change Password" subtitle="Keep your account secure" icon={<Lock />}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '520px' }}>
                                        <PwField label="Current Password" value={pwForm.current} show={showPw.current} onChange={v => setPwForm({ ...pwForm, current: v })} onToggle={() => setShowPw({ ...showPw, current: !showPw.current })} />
                                        <PwField label="New Password" value={pwForm.newPw} show={showPw.newPw} onChange={v => setPwForm({ ...pwForm, newPw: v })} onToggle={() => setShowPw({ ...showPw, newPw: !showPw.newPw })} />
                                        <PwField label="Confirm New Password" value={pwForm.confirm} show={showPw.confirm} onChange={v => setPwForm({ ...pwForm, confirm: v })} onToggle={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} />

                                        {pwMsg.text && (
                                            <div style={{ padding: '10px 16px', background: pwMsg.type === 'success' ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', color: pwMsg.type === 'success' ? '#059669' : '#dc2626', fontWeight: 600, fontSize: '0.88rem' }}>
                                                {pwMsg.text}
                                            </div>
                                        )}

                                        <button onClick={handlePasswordChange} style={{ ...greenBtn, padding: '0.9rem 2rem', justifyContent: 'center', fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
                                            <Lock size={16} /> Update Password
                                        </button>
                                    </div>
                                </Section>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ── Reusable Sub-components ─────────────────────────────────────────────────

function Section({ title, subtitle, icon, children }) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ color: '#059669' }}>{icon}</div>
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{title}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>{subtitle}</p>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
        </div>
    );
}

function EmptyState({ icon, title, desc, link, linkLabel }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#cbd5e1', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{desc}</p>
            <Link href={link} style={{ ...greenBtn, textDecoration: 'none', display: 'inline-flex' }}>{linkLabel} →</Link>
        </div>
    );
}

function Field({ icon, label, value, onChange, disabled, placeholder, hint, type = 'text' }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>{icon}</span>
                <input type={type} value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled} placeholder={placeholder}
                    style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', color: disabled ? '#9ca3af' : '#0f172a', background: disabled ? '#f8fafc' : '#fff', outline: 'none', boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text' }} />
            </div>
            {hint && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>}
        </div>
    );
}

function PwField({ label, value, show, onChange, onToggle }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 2.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

// ── Shared Styles ─────────────────────────────────────────────────────────
const cardRow = {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1.2rem 1.5rem',
    background: '#fff', borderRadius: '14px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const greenBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '0.6rem 1.2rem',
    background: 'rgba(5,150,105,0.1)', color: '#059669',
    borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
    flexShrink: 0, transition: '0.2s', textDecoration: 'none',
};
