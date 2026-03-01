'use client';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import { useCart } from '@/context/CartContext';

export default function ProductCard({ item, type }) {
    const { addToCart, cartItems } = useCart();
    const isInCart = cartItems.find(i => i.id === item.id && i.type === type);

    const handleAddToCart = () => {
        addToCart({ ...item, type });
        // Optional: you could add a toast here or redirect to cart
    };
    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem' }}
        >
            {/* Thumbnail */}
            <div style={{
                width: '100%', aspectRatio: '16/9',
                background: 'var(--surface)', borderRadius: '8px',
                overflow: 'hidden', position: 'relative', flexShrink: 0
            }}>
                {item.image ? (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(45deg, var(--surface), var(--surface-hover))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', color: 'var(--text-muted)'
                    }}>
                        {type.toUpperCase()} PREVIEW
                    </div>
                )}
                {/* Category badge */}
                <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.65)', padding: '2px 8px',
                    borderRadius: '4px', fontSize: '0.7rem', color: '#fff',
                    backdropFilter: 'blur(4px)', maxWidth: '70%',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                    {item.category}
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    {item.title}
                </h3>
                <p style={{
                    color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} className="text-primary" fill="currentColor" /> {item.rating || '4.8'}
                    </span>
                    {item.duration && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {item.duration}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer — price + button */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '0.8rem', borderTop: '1px solid var(--border)',
                gap: '0.5rem', flexWrap: 'wrap'
            }}>
                <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{item.price}</span>
                    {item.originalPrice && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '5px' }}>
                            ₹{item.originalPrice}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleAddToCart}
                        className="btn-secondary"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: `1px solid ${isInCart ? '#10b981' : 'var(--primary)'}`,
                            color: isInCart ? '#10b981' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isInCart ? 'rgba(16,185,129,0.1)' : 'transparent'
                        }}
                        disabled={isInCart}
                        title={isInCart ? "Already in Cart" : "Add to Cart"}
                    >
                        <ShoppingCart size={16} fill={isInCart ? "currentColor" : "none"} />
                    </button>
                    <Link
                        href={`/${type}/${item.id}`}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
