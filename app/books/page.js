'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlatformData } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export default function BookstorePage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getPlatformData('books');
            setBooks(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading bookstore...</div>;
    }

    if (books.length > 0) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem' }}>
                        Physical <span className="gradient-text">Bookstore</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Premium legal textbooks and university guides delivered right to your doorstep via DTDC.
                    </p>
                </div>

                <div className="grid-3">
                    {books.map(book => (
                        <ProductCard key={book.id} item={book} type="books" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--background)',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', maxWidth: '500px' }}
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
                >
                    📚
                </motion.div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text)' }}>
                    Physical <span style={{ color: '#059669' }}>Bookstore</span>
                </h1>

                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(5,150,105,0.1)', color: '#059669',
                    padding: '0.5rem 1.2rem', borderRadius: '999px',
                    fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem',
                }}>
                    <Clock size={16} /> Coming Soon!
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                    We're curating the finest legal textbooks and university guides
                    to be delivered right to your doorstep. Check back soon!
                </p>

                <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '0.85rem 2rem', background: '#059669', color: '#fff',
                    borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
                    textDecoration: 'none',
                }}>
                    <BookOpen size={18} /> Back to Home
                </Link>
            </motion.div>
        </div>
    );
}
