'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlatformData } from '@/lib/db';
import { Star, Clock, ArrowRight, Video, PlayCircle, BookOpen, Users, Trophy, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const CATEGORIES = ['All', 'LLB 3 YDC OU', 'LLB 3 YDC TG/AP', 'LLB 3 YDC KU', 'LLB 5 YDC', 'TS LAWCET', 'AP LAWCET', 'CLAT'];

const SEMESTERS = ['All Semesters', 'Sem - I', 'Sem - II', 'Sem - III', 'Sem - IV', 'Sem - V', 'Sem - VI'];

const STATS = [
    { icon: <BookOpen size={22} />, value: '200+', label: 'Video Lectures' },
    { icon: <Users size={22} />, value: '5000+', label: 'Students Enrolled' },
    { icon: <Trophy size={22} />, value: '98%', label: 'Pass Rate' },
    { icon: <Star size={22} />, value: '4.9★', label: 'Average Rating' },
];

function CoursesContent() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSemester, setActiveSemester] = useState('All Semesters');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuth, setShowAuth] = useState(false);
    const [pendingUrl, setPendingUrl] = useState(null);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        getPlatformData('courses').then(setCourses);
    }, []);

    const requireAuth = (url) => {
        if (!isLoggedIn) { setPendingUrl(url); setShowAuth(true); return false; }
        return true;
    };

    const handleCourseClick = (courseId) => {
        if (requireAuth(`/courses/${courseId}`)) router.push(`/courses/${courseId}`);
    };

    const handleAuthSuccess = () => {
        setShowAuth(false);
        if (pendingUrl) router.push(pendingUrl);
    };

    const filtered = courses.filter(c => {
        const catMatch = activeCategory === 'All' || c.category === activeCategory;
        const semMatch = activeSemester === 'All Semesters' || c.semester === activeSemester;
        const searchMatch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return catMatch && semMatch && searchMatch;
    });

    const discountPct = (orig, price) => orig && orig > price ? Math.round((1 - price / orig) * 100) : 0;

    return (
        <>
            <style>{`
                body { background: #f8fafc; }
                .course-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
                .course-card-new { background: #fff; border-radius: 20px; overflow: hidden; border: 1.5px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; display: flex; flex-direction: column; }
                .course-card-new:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); border-color: #10b981; }
                .course-card-new:hover .card-cta { background: #059669; }
                .card-cta { transition: background 0.2s; }
                .cat-pill { transition: all 0.2s; font-family: inherit; cursor: pointer; white-space: nowrap; }
                .cat-pill:hover { border-color: #10b981 !important; color: #10b981 !important; }
                .search-input:focus { outline: none; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                @media (max-width: 768px) {
                    .hero-title { font-size: 2.2rem !important; }
                    .course-card-grid { grid-template-columns: 1fr; }
                    .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .filter-row { flex-direction: column; }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

                {/* ── Hero ── */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2d1a 100%)', paddingTop: '6rem', paddingBottom: '5rem', marginTop: '70px', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative circles */}
                    <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 18px', borderRadius: '50px', color: '#34d399', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                                <Video size={13} /> Recorded Video Courses
                            </span>
                            <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', marginBottom: '1.2rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
                                Master Legal Excellence<br />
                                <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>With Expert Guidance</span>
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                                Comprehensive recordings for OU, KU, Telangana & Andhra Pradesh university syllabi — curated by top legal educators.
                            </p>
                            {/* Search */}
                            <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                                <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 1 }} />
                                <input
                                    className="search-input"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    suppressHydrationWarning
                                    style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 3rem', borderRadius: '50px', border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box', backdropFilter: 'blur(10px)' }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1.5rem 0' }}>
                    <div className="container">
                        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {STATS.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                                    <div style={{ color: '#10b981' }}>{s.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{s.value}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="container" style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>

                    {/* Filter Row */}
                    <div className="filter-row" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Category Pills */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className="cat-pill"
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '7px 18px', borderRadius: '50px',
                                        border: activeCategory === cat ? 'none' : '1.5px solid #e2e8f0',
                                        background: activeCategory === cat ? '#10b981' : '#fff',
                                        color: activeCategory === cat ? '#fff' : '#475569',
                                        fontWeight: activeCategory === cat ? 800 : 500,
                                        fontSize: '0.85rem',
                                    }}
                                >{cat}</button>
                            ))}
                        </div>
                        {/* Semester Selector */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <select
                                value={activeSemester}
                                onChange={e => setActiveSemester(e.target.value)}
                                suppressHydrationWarning
                                style={{ appearance: 'none', padding: '8px 36px 8px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Results count */}
                    <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
                        {activeCategory !== 'All' && <> in <strong style={{ color: '#10b981' }}>{activeCategory}</strong></>}
                        {activeSemester !== 'All Semesters' && <> · {activeSemester}</>}
                    </p>

                    {/* Course Cards Grid */}
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '7rem 2rem', color: '#94a3b8' }}>
                                <PlayCircle size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>No courses match your filters.</p>
                                <button onClick={() => { setActiveCategory('All'); setActiveSemester('All Semesters'); setSearchQuery(''); }} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>
                            </motion.div>
                        ) : (
                            <motion.div key="grid" className="course-card-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {filtered.map((course, i) => {
                                    const disc = discountPct(course.originalPrice, course.price);
                                    return (
                                        <motion.div
                                            key={course.id}
                                            className="course-card-new"
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => handleCourseClick(course.id)}
                                        >
                                            {/* Thumbnail */}
                                            <div style={{ position: 'relative', height: '190px', background: 'linear-gradient(135deg, #0f172a, #1a3a5c)', overflow: 'hidden', flexShrink: 0 }}>
                                                {course.image ? (
                                                    <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                        <PlayCircle size={52} style={{ color: '#10b981', opacity: 0.6 }} />
                                                    </div>
                                                )}
                                                {/* Badges */}
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />
                                                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                                                    <span style={{ background: '#10b981', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>VIDEO</span>
                                                    {disc > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>{disc}% OFF</span>}
                                                </div>
                                                {course.semester && (
                                                    <span style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>{course.semester}</span>
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
                                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>{course.category}</span>
                                                    {course.university && <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>{course.university?.replace(' University', ' Univ.')}</span>}
                                                </div>
                                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.4 }}>{course.title}</h3>
                                                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 'auto' }}>
                                                    {course.description?.length > 100 ? course.description.substring(0, 100) + '…' : course.description}
                                                </p>

                                                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.2rem', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#d97706' }}>
                                                            <Star size={13} fill="#fbbf24" color="#fbbf24" /> {course.rating || '4.9'}
                                                        </span>
                                                        {course.duration && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#64748b' }}>
                                                                <Clock size={13} /> {course.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div>
                                                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>₹{course.price}</span>
                                                            {course.originalPrice > course.price && <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '5px' }}>₹{course.originalPrice}</span>}
                                                        </div>
                                                        <button
                                                            className="card-cta"
                                                            onClick={e => { e.stopPropagation(); handleCourseClick(course.id); }}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0.6rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >
                                                            View <ArrowRight size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} redirectMessage="Login to access this course" />
        </>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>}>
            <CoursesContent />
        </Suspense>
    );
}
