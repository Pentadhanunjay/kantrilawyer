'use client';
import { Download, FileText, ShieldCheck, Mail, User, Calendar, AlertTriangle, CheckCircle, BookOpen, Lock, Loader2, Award } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPlatformData } from '@/lib/db';
import Link from 'next/link';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

function useRightClickBlock() {
    useEffect(() => {
        const handleContextMenu = (e) => {
            // Only block right-click if it's not and input or textarea
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);
}

export default function EbookDetail({ params }) {
    const { id } = use(params);
    const { user, purchases } = useAuth();
    const [activeTab, setActiveTab] = useState('preview');
    const [ebookData, setEbookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();
    useRightClickBlock();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getPlatformData('ebooks');
            const found = data.find(it => it.id === Number(id));
            setEbookData(found);
            setLoading(false);
        };
        load();
    }, [id]);

    const isPurchased = purchases.ebooks.includes(Number(id));

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: '#64748b' }}>
            <Loader2 className="animate-spin" size={32} />
            <p style={{ fontWeight: 600 }}>Loading eBook Details...</p>
        </div>
    );

    if (!ebookData) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>eBook Not Found</h2>
            <p>We couldn't find the eBook you were looking for.</p>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Return Home</Link>
        </div>
    );

    const discount = ebookData.originalPrice
        ? Math.round((1 - ebookData.price / ebookData.originalPrice) * 100)
        : 0;

    const PREVIEW_PAGES = [
        {
            title: `Chapter 1: Introduction to ${ebookData.title}`,
            content: `This specialized guide focuses on the core principles of ${ebookData.category || 'this subject'}. It is designed to provide high-yield summaries for students preparing for examinations at ${ebookData.university || 'university level'}.`
        },
        {
            title: `${ebookData.category || 'Subject'} Core Framework`,
            content: `Understanding the essential framework of ${ebookData.title} is key to mastering the curriculum. This section covers the foundational theories and practices that are frequently tested in semester exams.`
        },
        {
            title: 'Important Case Studies & Analysis',
            content: `A deep dive into the recent developments in ${ebookData.category || 'this field'} and how they apply to the current professional landscape. This section helps in building a conceptual understanding for long-form answers.`
        },
    ];

    const isLaw = ebookData.category?.toLowerCase().includes('law') || ebookData.university;

    const PurchaseCard = () => (
        <div style={{ background: 'var(--surface)', border: isLaw ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>₹{ebookData.price}</span>
                {ebookData.originalPrice > ebookData.price && (
                    <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1rem' }}>₹{ebookData.originalPrice}</span>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>{discount}% OFF</span>
                    </>
                )}
            </div>

            {/* Buy Button / Status */}
            {isPurchased ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.95rem', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981',
                        borderRadius: '10px', fontWeight: 700, fontSize: '1rem', gap: '8px'
                    }}>
                        <ShieldCheck size={18} /> You Own this eBook
                    </div>
                </div>
            ) : (
                <Link href={`/checkout?type=ebooks&id=${id}`} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.95rem', background: 'var(--primary)', color: '#fff', border: 'none',
                    borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    fontFamily: 'inherit', marginBottom: '1.2rem', gap: '8px', textDecoration: 'none'
                }}>
                    Get eBook Now
                </Link>
            )}

            {/* Security */}
            <div style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: '10px', padding: '1rem', margin: '1.2rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Secure Online Access
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={13} /> Integrated Secure Reader</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={13} /> No Downloads Required</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={13} /> Non-Transferable License</div>
                </div>
            </div>

            {/* Details */}
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={15} style={{ flexShrink: 0 }} /> High-Yield Revision Content</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen size={15} style={{ flexShrink: 0 }} /> Instant Access After Payment</div>
                {ebookData.university && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Award size={15} style={{ flexShrink: 0 }} /> Verified for {ebookData.university}</div>}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem 1rem 3rem' : '1rem 2rem 4rem', boxSizing: 'border-box' }}>
            {/* Mobile: Purchase card first */}
            {isMobile && (
                <div style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                    <PurchaseCard />
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
                gap: isMobile ? '1.5rem' : '4rem',
                alignItems: 'start',
            }}>
                {/* LEFT: eBook content */}
                <div style={{ minWidth: 0, width: '100%' }}>
                    {ebookData.university && (
                        <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                            {ebookData.category || 'eBook'} • {ebookData.university}
                        </div>
                    )}
                    <h1 style={{
                        fontSize: isMobile ? 'clamp(1.3rem, 5vw, 1.8rem)' : '2.2rem',
                        marginBottom: '1rem', lineHeight: 1.3, wordBreak: 'break-word'
                    }}>
                        {ebookData.title}
                    </h1>
                    <p style={{ fontSize: isMobile ? '0.95rem' : '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                        {ebookData.description}
                    </p>

                    {/* Tabs */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                            {['preview', 'details'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    padding: '0.9rem 1.2rem', whiteSpace: 'nowrap', flexShrink: 0,
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab ? 700 : 400,
                                    background: 'none', border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem'
                                }}>
                                    {tab === 'preview' ? 'eBook Reader' : (isLaw ? 'Coverage' : 'Description')}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: isMobile ? '0.5rem' : '1.5rem', background: '#f1f5f9' }}>
                            {activeTab === 'preview' ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {ebookData.fileUrl ? (
                                        <div
                                            onContextMenu={(e) => e.preventDefault()}
                                            style={{
                                                width: '100%',
                                                height: isPurchased ? 'clamp(600px, 85vh, 900px)' : 'clamp(400px, 70vh, 600px)',
                                                background: '#fff',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Real PDF viewer (Restricted height for unpaid) */}
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                overflow: isPurchased ? 'auto' : 'hidden',
                                                WebkitOverflowScrolling: 'touch',
                                                position: 'relative'
                                            }}>
                                                <iframe
                                                    src={`${ebookData.fileUrl}#toolbar=0&navpanes=0&scrollbar=${isPurchased ? 1 : 0}`}
                                                    style={{
                                                        width: '100%',
                                                        height: isPurchased ? '100%' : '1200px',
                                                        border: 'none',
                                                        pointerEvents: isPurchased ? 'auto' : 'none' // Completely block mouse/touch events for unpaid
                                                    }}
                                                    title="eBook Viewer"
                                                />

                                                {/* Interaction Shield (Extra layer of security for unpurchased) */}
                                                {!isPurchased && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        zIndex: 50,
                                                        background: 'transparent'
                                                    }} />
                                                )}
                                            </div>

                                            {/* Lock Overlay for Unpaid Users */}
                                            {!isPurchased && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%', // Cover full height to protect content
                                                    background: 'linear-gradient(to bottom, transparent 0%, transparent 20%, #fff 40%, #f8fafc 100%)',
                                                    zIndex: 100,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    paddingBottom: '3.5rem',
                                                    textAlign: 'center',
                                                    pointerEvents: 'auto' // Ensure buttons are clickable
                                                }}>
                                                    <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', maxWidth: '450px', margin: '0 1rem' }}>
                                                        <div style={{ background: '#ecfdf5', color: '#10b981', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                                            <Lock size={32} />
                                                        </div>
                                                        <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.8rem' }}>Full Document Locked</h3>
                                                        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                                            You've reached the end of the free preview. Purchase this eBook to unlock the remaining pages and access the full high-quality PDF reader.
                                                        </p>
                                                        <Link href={`/checkout?type=ebooks&id=${id}`} style={{
                                                            background: 'var(--primary)', color: '#fff', padding: '1rem 2.5rem',
                                                            borderRadius: '12px', fontWeight: 800, textDecoration: 'none',
                                                            boxShadow: '0 10px 20px rgba(16,185,129,0.3)', display: 'inline-block'
                                                        }}>
                                                            Unlock Full eBook Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Safety overlay to prevent right-click on toolbar area */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', background: 'transparent', zIndex: 110 }} />
                                        </div>
                                    ) : (
                                        <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                                            <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                                            <h3>PDF Not Available</h3>
                                            <p>The PDF content for this eBook is currently being updated.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>About this eBook</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                                        {ebookData.description}
                                    </p>
                                    {ebookData.semester && <p style={{ marginTop: '1rem', fontWeight: 700 }}>Semester: {ebookData.semester}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Purchase card (desktop only) */}
                {!isMobile && (
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <PurchaseCard />
                    </div>
                )}
            </div>
        </div>
    );
}
