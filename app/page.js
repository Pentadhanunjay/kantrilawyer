'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Video, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, useCallback } from 'react';

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
import { getData, getPlatformData } from '@/lib/db';

export default function HomePage() {
    const isMobile = useIsMobile();
    const [courses, setCourses] = useState([]);
    const [ebooks, setEbooks] = useState([]);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const load = async () => {
            setCourses(await getPlatformData('courses'));
            setEbooks(await getPlatformData('ebooks'));
            setBooks(await getPlatformData('books'));
        };
        load();
    }, []);

    const features = [
        { icon: <Video className="text-primary" />, title: 'Expert Courses', desc: 'Pre-recorded video curriculum with quiz modules.', link: '/courses' },
        { icon: <BookOpen className="text-primary" />, title: 'Digital eBooks', desc: 'High-quality ebooks with watermarked security.', link: '/ebooks' },
        { icon: <Users className="text-primary" />, title: 'Live Classes', desc: 'Interactive sessions via Google Meet integration.', link: '/live-classes' },
        { icon: <ShoppingBag className="text-primary" />, title: `Bookstore ${books.length === 0 ? '(Soon)' : ''}`, desc: 'Physical book delivery with DTDC integration.', link: '/books' },
    ];

    const featuredCourse = courses[0] || {
        id: 1,
        title: 'Law of Contracts – I',
        description: 'Master the Indian Contract Act with a focus on Osmania University syllabus.',
        price: 1499,
        originalPrice: 2999,
        category: 'LLB 3 YDC OU Law',
        image: '/assets/images/course_law.png'
    };

    return (
        <div className="container">
            <style>{`
                /* ── Hero ── */
                .home-hero { text-align: center; padding: 6rem 0; background: radial-gradient(circle at center, rgba(0,255,136,0.05) 0%, transparent 70%); }
                .home-hero h1 { font-size: 4.4rem; margin-bottom: 1.5rem; font-weight: 800; }
                .home-hero p { font-size: 1.25rem; color: var(--text-muted); max-width: 800px; margin: 0 auto 3rem; }
                .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                /* ── Why Choose ── */
                .why-section { padding: 6rem 0; }
                .why-section h2 { text-align: center; margin-bottom: 4rem; font-size: 2.5rem; }

                /* ── Featured Course ── */
                .featured-section { padding: 6rem 0; }
                .featured-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
                .featured-header h2 { font-size: 2.8rem; }
                .featured-card {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 4rem;
                    padding: 3rem;
                    align-items: center;
                }
                .featured-price-row { display: flex; gap: 3rem; margin-bottom: 2.5rem; }
                .featured-price-divider { border-left: 2px solid #e2e8f0; padding-left: 3rem; }

                /* ── Resources ── */
                .resources-section { padding: 6rem 0; }
                .resources-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
                .resources-header h2 { font-size: 2.8rem; }

                /* ── CTA ── */
                .cta-section {
                    margin: 6rem 0;
                    padding: 5rem 3rem;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05));
                    border-radius: 32px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .cta-section h2 { font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: 800; }
                .cta-section p { color: var(--text-muted); margin-bottom: 2.5rem; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto; }

                /* ── MOBILE ── */
                @media (max-width: 768px) {
                    .home-hero { padding: 4rem 0 3rem; }
                    .home-hero h1 { font-size: clamp(2rem, 8vw, 3rem) !important; }
                    .home-hero p { font-size: 1rem !important; padding: 0 0.5rem; margin-bottom: 2rem; }

                    .why-section { padding: 3rem 0; }
                    .why-section h2 { font-size: 1.8rem !important; margin-bottom: 2rem; }

                    .featured-section { padding: 3rem 0; }
                    .featured-header h2 { font-size: 1.8rem !important; }
                    .featured-card {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                        padding: 1.5rem !important;
                    }
                    .featured-price-row { gap: 1.5rem !important; margin-bottom: 1.5rem !important; }
                    .featured-price-divider { padding-left: 1.5rem !important; }
                    .featured-h3 { font-size: 1.4rem !important; }
                    .featured-enroll-btn { width: 100% !important; justify-content: center !important; font-size: 0.95rem !important; height: auto !important; padding: 0.9rem 1.5rem !important; border-radius: 12px !important; }

                    .resources-section { padding: 3rem 0; }
                    .resources-header h2 { font-size: 1.8rem !important; }

                    .cta-section { margin: 3rem 0 !important; padding: 3rem 1.5rem !important; border-radius: 20px !important; }
                    .cta-section h2 { font-size: clamp(1.6rem, 6vw, 2.5rem) !important; margin-bottom: 1rem !important; }
                    .cta-section p { font-size: 0.95rem !important; margin-bottom: 1.5rem !important; }
                }
            `}</style>

            {/* ── Hero Section ── */}
            <section className="home-hero">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="gradient-text">Kantri Lawyer</span> <br />
                    Excellence in Legal Learning
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    Kantri by Awareness, Honest by Conscience. Access world-class legal education resources tailored for your success.
                </motion.p>
                <motion.div className="hero-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Link href="/courses" className="btn-primary">
                        Browse Courses <ArrowRight size={20} />
                    </Link>
                    <Link href="/books" className="btn-secondary">
                        Visit Bookstore {books.length === 0 ? '(Soon)' : ''}
                    </Link>
                </motion.div>
            </section>

            {/* ── Features Grid ── */}
            <section className="why-section">
                <h2>Why Choose <span className="gradient-text">Kantri Lawyer?</span></h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}>
                    {features.map((f, i) => (
                        <Link key={i} href={f.link} style={{
                            flex: '1 1 220px',
                            maxWidth: '280px',
                            minWidth: '200px',
                            pointerEvents: f.soon ? 'none' : 'auto'
                        }}>
                            <motion.div
                                whileHover={f.soon ? {} : { y: -8, scale: 1.03 }}
                                className="glass-card"
                                style={{
                                    textAlign: 'center', padding: '2.2rem 1.5rem',
                                    cursor: f.soon ? 'default' : 'pointer', height: '100%',
                                    border: '1.5px solid var(--border)', borderRadius: '20px',
                                    opacity: f.soon ? 0.8 : 1
                                }}
                            >
                                <div style={{
                                    background: 'rgba(5,150,105,0.1)', width: '68px', height: '68px',
                                    borderRadius: '18px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1.3rem', color: 'var(--primary)',
                                    position: 'relative'
                                }}>
                                    {f.icon}
                                    {f.soon && (
                                        <span style={{ position: 'absolute', top: '-10px', right: '-15px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>SOON</span>
                                    )}
                                </div>
                                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.7rem', fontWeight: 800 }}>{f.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Course ── */}
            {courses.length > 0 && (
                <section className="featured-section">
                    <div className="featured-header">
                        <div>
                            <h2>Featured <span className="gradient-text">Course</span></h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                                Get started with our most popular Osmania University law course.
                            </p>
                        </div>
                        <Link href="/courses" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            View all courses <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="glass-card featured-card">
                        {/* Image */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ padding: '5px 12px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, position: 'absolute', top: '16px', left: '16px', zIndex: 10, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                                BEST SELLER
                            </div>
                            <div style={{ width: '100%', aspectRatio: '16/9', background: '#0f172a', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                                <img src={featuredCourse.image} alt={featuredCourse.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {featuredCourse.category}
                            </div>
                            <h3 className="featured-h3" style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>
                                {featuredCourse.title}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.7 }}>
                                {featuredCourse.description}
                            </p>
                            <div className="featured-price-row">
                                <div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{featuredCourse.price}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{featuredCourse.originalPrice}</div>
                                </div>
                                <div className="featured-price-divider">
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{featuredCourse.duration || '7.5h'}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Interactive Content</div>
                                </div>
                            </div>
                            <Link href={`/courses/${featuredCourse.id}`} className="btn-primary featured-enroll-btn" style={{ height: '56px', borderRadius: '16px', fontSize: '1rem' }}>
                                Enroll Now and Start Learning
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Premium Resources Grid ── */}
            <section className="resources-section">
                <div className="resources-header">
                    <div>
                        <h2>Top <span className="gradient-text">Resources</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                            Top rated study materials for competitive LLB preparation.
                        </p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}>
                    {ebooks.slice(0, 1).map(item => (
                        <div key={item.id} style={{ flex: '1 1 280px', maxWidth: '360px', minWidth: '260px' }}>
                            <ProductCard type="ebooks" item={item} />
                        </div>
                    ))}
                    <div style={{ flex: '1 1 280px', maxWidth: '360px', minWidth: '260px' }}>
                        <div className="glass-card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '1.5px dashed var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                            <Video size={40} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.5rem' }}>Upcoming Sessions</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Stay tuned for new live masterclasses!</p>
                        </div>
                    </div>
                    {courses.slice(1, 2).map(item => (
                        <div key={item.id} style={{ flex: '1 1 280px', maxWidth: '360px', minWidth: '260px' }}>
                            <ProductCard type="courses" item={item} />
                        </div>
                    ))}
                </div>
            </section>


            {/* ── Call to Action ── */}
            <section style={{
                margin: isMobile ? '1.5rem 0' : '4rem 0',
                padding: isMobile ? '1.5rem 1rem' : '3.5rem 3rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #0891b2 100%)',
                borderRadius: isMobile ? '20px' : '32px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative glow blobs */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '260px', height: '260px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

                <h2 style={{
                    fontSize: isMobile ? '1.2rem' : '2.2rem',
                    marginBottom: isMobile ? '0.6rem' : '1rem',
                    lineHeight: 1.25, color: '#fff', position: 'relative'
                }}>
                    Ready to start learning?
                </h2>
                {!isMobile && (
                    <p style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6, maxWidth: '480px',
                        margin: `0 auto 2rem`,
                        position: 'relative'
                    }}>
                        Join thousands of students and start your professional legal growth today.
                    </p>
                )}
                {/* Button removed as requested */}
            </section>
        </div>
    );
}
