'use client';
import { ShoppingCart, Truck, ShieldCheck, MapPin, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getPlatformData } from '@/lib/db';

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

export default function BookDetail({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const [pin, setPin] = useState('');
    const [pinStatus, setPinStatus] = useState(null);
    const [book, setBook] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();
    const { addToCart, cartItems } = useCart();

    useEffect(() => {
        const loadBook = async () => {
            const allBooks = await getPlatformData('books');
            const foundBook = allBooks.find(b => String(b.id) === String(id));
            setBook(foundBook);
            setLoading(false);
        };
        loadBook();
    }, [id]);

    const checkDelivery = () => {
        setPinStatus(pin.length === 6
            ? 'Available for delivery via DTDC Express'
            : 'Please enter a valid 6-digit PIN code');
    };

    if (loading) return <div style={{ padding: '8rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading book details...</div>;
    if (!book) return <div style={{ padding: '8rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Book not found.</div>;

    const bookData = {
        title: book.title,
        price: book.price,
        originalPrice: book.originalPrice || book.price * 2,
        category: book.category || 'LLB / Law',
        description: book.description,
        disclaimer: "Please note that this revision book does not give in-depth explanations of topics, and that is not required at this stage. Use this book only for final revision, not as your main study material.",
        image: book.image,
        id: book.id
    };

    const isInCart = !!cartItems.find(i => i.id === bookData.id && i.type === 'books');
    const discount = Math.round((1 - bookData.price / bookData.originalPrice) * 100);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem 1rem 4rem' : '2rem 2rem 6rem', boxSizing: 'border-box' }}>

            {/* ── Top section: Book cover + Details ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr',
                gap: isMobile ? '1.5rem' : '4rem',
                marginTop: isMobile ? '0.5rem' : '2rem',
                alignItems: 'start'
            }}>

                {/* Book Cover — hidden on mobile to save space, shown as small thumbnail */}
                {isMobile ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '1rem'
                    }}>
                        <div style={{
                            width: '80px', height: '110px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                            borderRadius: '4px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', padding: '0.5rem'
                        }}>
                            <BookOpen size={20} style={{ color: '#10b981', marginBottom: '4px' }} />
                            <div style={{ color: '#fff', fontSize: '0.55rem', fontWeight: 700, lineHeight: 1.3 }}>TG EDITION</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>{bookData.category}</div>
                            <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', lineHeight: 1.3, marginBottom: '6px', wordBreak: 'break-word' }}>
                                {bookData.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Physical Book</span>
                                <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                                    <CheckCircle size={14} /> In Stock
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                        <div style={{
                            width: '260px', height: '380px',
                            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                            borderRadius: '4px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                        }}>
                            <BookOpen size={40} style={{ color: '#10b981', marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.4 }}>{bookData.title}</h2>
                            <div style={{ background: '#10b981', color: '#000', padding: '4px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '0.78rem' }}>TG EDITION</div>
                        </div>
                    </div>
                )}

                {/* ── Details column ── */}
                <div style={{ minWidth: 0 }}>
                    {/* Title — only on desktop (mobile shows it in the thumbnail row above) */}
                    {!isMobile && (
                        <>
                            <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.88rem' }}>{bookData.category}</div>
                            <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1.2 }}>{bookData.title}</h1>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ border: '1px solid var(--border)', padding: '4px 14px', borderRadius: '8px', fontSize: '0.82rem', background: 'var(--surface)' }}>Physical Book</span>
                                <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={16} /> In Stock
                                </span>
                            </div>
                        </>
                    )}

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.2rem', marginTop: isMobile ? '0.5rem' : 0 }}>
                        <span style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 800 }}>₹{bookData.price}</span>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>₹{bookData.originalPrice}</span>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>{discount}% OFF</span>
                    </div>

                    {/* Description */}
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: 1.7, fontSize: isMobile ? '0.92rem' : '0.95rem' }}>
                        {bookData.description}
                    </p>

                    {/* Disclaimer */}
                    <div style={{
                        background: 'rgba(244,63,94,0.08)', border: '1px solid var(--accent)',
                        padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem',
                        display: 'flex', gap: '0.8rem', alignItems: 'flex-start'
                    }}>
                        <AlertTriangle size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                            <strong>Important Note:</strong> {bookData.disclaimer}
                        </p>
                    </div>

                    {/* Delivery check */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                            <Truck size={16} style={{ color: 'var(--primary)' }} /> Check Delivery Availability
                        </h4>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <input
                                type="text" maxLength={6}
                                placeholder="Enter 6-digit PIN Code"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)', borderRadius: '8px',
                                    padding: '0.75rem', color: 'var(--text)', fontFamily: 'inherit',
                                    fontSize: '0.9rem', minWidth: 0
                                }}
                            />
                            <button onClick={checkDelivery} style={{
                                padding: '0.75rem 1.2rem', background: 'var(--primary)', color: '#fff',
                                border: 'none', borderRadius: '8px', fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0
                            }}>Check</button>
                        </div>
                        {pinStatus && (
                            <p style={{ marginTop: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: pinStatus.includes('Available') ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={13} /> {pinStatus}
                            </p>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quantity:</span>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px' }}>
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 600 }}
                            >
                                −
                            </button>
                            <span style={{ width: '40px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{qty}</span>
                            <button
                                onClick={() => setQty(Math.min(5, qty + 1))}
                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 600 }}
                            >
                                +
                            </button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Max 5 copies)</span>
                    </div>

                    {/* Add to Cart / Buy Now */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        <button
                            onClick={() => addToCart({ ...book, type: 'books' }, qty)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '1rem', background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                                cursor: 'pointer', fontFamily: 'inherit', minWidth: '140px'
                            }}>
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                        <Link href={`/checkout?type=books&id=${bookData.id}&qty=${qty}`} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem', background: 'var(--surface)', color: 'var(--text)',
                            border: '1.5px solid var(--border)', borderRadius: '10px',
                            fontWeight: 700, fontSize: '1rem', textDecoration: 'none', minWidth: '140px'
                        }}>
                            Buy Now
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} /> 100% Authentic
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <Truck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} /> DTDC Express Shipping
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Book Details Section ── */}
            <section style={{ marginTop: isMobile ? '3rem' : '5rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: isMobile ? '1.4rem' : '1.8rem' }}>Book Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.2rem' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                            <BookOpen size={16} style={{ color: 'var(--primary)' }} /> Covers Subjects
                        </h4>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {['Law of Contracts – I', 'Family Law – I', 'Constitutional Law – I', 'Law of Torts', 'Environmental Law'].map(s => (
                                <li key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                            <CheckCircle size={16} style={{ color: 'var(--primary)' }} /> Ideal For
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            Students requiring quick, high-yield revision just before Osmania University examinations.
                        </p>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                            <AlertTriangle size={16} style={{ color: 'var(--accent)' }} /> Note to Students
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                            From next time onwards, do not depend on last-day preparation. Start studying from the beginning for a better career.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
