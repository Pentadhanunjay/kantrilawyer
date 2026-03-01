'use client';
import { Download, FileText, ShieldCheck, Mail, User, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function EbookDetail({ params }) {
    const [activeTab, setActiveTab] = useState('preview');
    const isMobile = useIsMobile();

    const PurchaseCard = () => (
        <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>₹499</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹999</span>
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>50% OFF</span>
            </div>
            <button style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.95rem', background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                fontFamily: 'inherit', marginBottom: '1.2rem'
            }}>
                Buy eBook Now
            </button>
            <div style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: '10px', padding: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Security Features
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} /> Watermarked with Your Email</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={13} /> Registered User Name</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={13} /> Purchase Date Stamp</div>
                </div>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={15} style={{ flexShrink: 0 }} /> 245 Pages (PDF)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={15} style={{ flexShrink: 0 }} /> Instant Access After Purchase</div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem 1rem 3rem' : '1rem 2rem 4rem', boxSizing: 'border-box' }}>

            {/* Mobile: show purchase card first */}
            {isMobile && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <PurchaseCard />
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
                gap: isMobile ? '1.5rem' : '3rem',
                alignItems: 'start',
            }}>
                {/* eBook Content */}
                <div style={{ minWidth: 0, width: '100%' }}>
                    <h1 style={{
                        fontSize: isMobile ? 'clamp(1.3rem, 5vw, 1.8rem)' : '2.2rem',
                        marginBottom: '0.8rem', lineHeight: 1.3, wordBreak: 'break-word'
                    }}>
                        The Modern JavaScript Handbook
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                        ES6, ESNext, and everything you need to know to build world-class JavaScript applications.
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
                                    {tab === 'preview' ? 'Preview Pages' : 'Description'}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: isMobile ? '1rem' : '1.5rem', minHeight: '220px', background: 'var(--surface)' }}>
                            {activeTab === 'preview' ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '100%', aspectRatio: '1/1.4',
                                        background: 'rgba(255,255,255,0.95)', borderRadius: '8px',
                                        margin: '0 auto', maxWidth: isMobile ? '240px' : '320px',
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                        padding: '1rem', color: '#333', position: 'relative',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                    }}>
                                        <h2 style={{ fontSize: '0.95rem', textTransform: 'uppercase' }}>Chapter 1: The Foundations</h2>
                                        <p style={{ marginTop: '1rem', textAlign: 'left', lineHeight: 1.7, fontSize: '0.78rem' }}>
                                            JavaScript is a versatile language that has evolved significantly over the years...
                                        </p>
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%) rotate(-45deg)',
                                            fontSize: '0.65rem', color: 'rgba(0,0,0,0.07)',
                                            fontWeight: 800, pointerEvents: 'none', whiteSpace: 'nowrap'
                                        }}>PREVIEW ONLY</div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '0.8rem', fontSize: '1rem' }}>About this eBook</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                                        This handbook covers everything from the basics of variables and functions to advanced topics like closures, prototypes, and asynchronous programming.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop purchase card */}
                {!isMobile && (
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <PurchaseCard />
                    </div>
                )}
            </div>
        </div>
    );
}
