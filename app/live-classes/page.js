'use client';
import { useState, useEffect } from 'react';
import { Video, Clock, User, Lock, ExternalLink, ShoppingCart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getData, getPlatformData } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const STATUS_STYLE = {
    scheduled: { bg: '#dbeafe', color: '#1d4ed8', label: '📅 Scheduled' },
    live: { bg: '#dcfce7', color: '#15803d', label: '🔴 Live Now' },
    completed: { bg: '#f1f5f9', color: '#64748b', label: '✅ Completed' },
    cancelled: { bg: '#fee2e2', color: '#dc2626', label: '❌ Cancelled' },
};

export default function LiveClassesPage() {
    const { user, isLoggedIn, purchases } = useAuth();
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [showAuth, setShowAuth] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const load = async () => {
            const raw = await getPlatformData('classes') || [];
            const unique = Array.from(new Map(raw.map(item => [item.id, item])).values());
            setClasses(unique);
        };
        load();
    }, []);

    const hasPurchased = (classId) => {
        if (!isLoggedIn || !purchases) return false;
        // purchases.classes is an array of IDs (strings or numbers)
        return purchases.classes?.some(id => String(id) === String(classId));
    };

    if (!mounted) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '2rem', paddingBottom: '5rem' }}>
            <style>{`
                .lc-hero { padding: 4rem 1.5rem; }
                .lc-hero h1 { font-size: clamp(1.7rem, 5vw, 3rem); }
                .lc-card { flex-direction: row; padding: 2rem; gap: 2rem; }
                .lc-date-block { min-width: 80px; }
                .lc-divider { display: block; }
                .lc-price-block { text-align: right; flex-shrink: 0; }
                @media (max-width: 640px) {
                    .lc-card {
                        flex-direction: column !important;
                        padding: 1.2rem !important;
                        gap: 1rem !important;
                    }
                    .lc-date-block {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        gap: 12px !important;
                        min-width: unset !important;
                    }
                    .lc-divider { display: none !important; }
                    .lc-price-block {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        text-align: left !important;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 1rem;
                        margin-top: 0.5rem;
                    }
                }
            `}</style>

            {/* Hero */}
            <div className="lc-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                    <Video size={14} /> Live Interactive Classes
                </div>
                <h1 style={{ fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>
                    Learn Live with Expert Faculty
                </h1>
                <p style={{ color: '#94a3b8', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>
                    Join real-time sessions on important law topics. Ask questions, interact live, and get exam-ready.
                </p>
            </div>

            {/* Access info banner */}
            <div style={{ maxWidth: '900px', margin: '0 auto 2rem', padding: '0 1rem' }}>
                <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '12px', padding: '1rem 1.2rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Lock size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', fontWeight: 600, lineHeight: 1.6 }}>
                        <strong>Access Control:</strong> Google Meet links are hidden until you purchase the class. After purchase, the link appears in your Dashboard → Live Classes section.
                    </p>
                </div>
            </div>

            {/* Classes List */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {classes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#94a3b8' }}>
                        <Video size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontWeight: 700 }}>No live classes scheduled yet. Check back soon!</p>
                    </div>
                )}

                {classes.map((cls, i) => {
                    const purchased = hasPurchased(cls.id);
                    const actualLink = cls.meetLink || purchases.classLinks?.[cls.id];
                    const status = STATUS_STYLE[cls.status] || STATUS_STYLE.scheduled;
                    const isCancelled = cls.status === 'cancelled';
                    const isCompleted = cls.status === 'completed';

                    return (
                        <motion.div
                            key={`${cls.id}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="lc-card"
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                boxShadow: cls.status === 'live' ? '0 0 0 2px #10b981, 0 8px 24px rgba(16,185,129,0.1)' : '0 2px 12px rgba(0,0,0,0.04)',
                                opacity: isCancelled ? 0.6 : 1,
                            }}
                        >
                            {/* Date Block */}
                            <div className="lc-date-block" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                                    {cls.date?.split(' ')[1]?.replace(',', '') || '—'}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                    {cls.date?.split(' ')[0] || ''}
                                </div>
                                <div style={{ marginTop: '8px', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: status.bg, color: status.color, whiteSpace: 'nowrap' }}>
                                    {status.label}
                                </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="lc-divider" style={{ width: '1px', background: '#f1f5f9', alignSelf: 'stretch', flexShrink: 0 }} />

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>{cls.title}</h2>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.8rem', lineHeight: 1.6 }}>{cls.description}</p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.82rem', color: '#64748b' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> {cls.time}</span>
                                    {cls.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Video size={13} /> {cls.duration}</span>}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {cls.host || 'Uday Kantri'}</span>
                                </div>

                                {purchased && actualLink && !isCancelled && (
                                    <div style={{ marginTop: '0.8rem', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <CheckCircle size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>You're enrolled!</span>
                                        <a href={actualLink} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
                                            Join Meet <ExternalLink size={13} />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Price + CTA */}
                            <div className="lc-price-block">
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: cls.price === 0 ? '#059669' : '#0f172a' }}>
                                    {cls.price === 0 ? 'FREE' : `₹${cls.price}`}
                                </div>
                                {!isCancelled && !isCompleted && (
                                    <>
                                        {purchased ? (
                                            <button
                                                onClick={() => actualLink ? window.open(actualLink, '_blank') : null}
                                                style={{ marginTop: '0.6rem', padding: '0.55rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                <ExternalLink size={13} /> Join Class
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => !isLoggedIn ? setShowAuth(true) : router.push(`/checkout?type=classes&id=${cls.id}`)}
                                                style={{ marginTop: '0.6rem', padding: '0.55rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                <ShoppingCart size={13} /> {cls.price === 0 ? 'Join Free' : 'Book Seat'}
                                            </button>
                                        )}
                                    </>
                                )}
                                {isCompleted && (
                                    <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Session ended</div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} redirectMessage="Login to book a live class seat" />
        </div>
    );
}
