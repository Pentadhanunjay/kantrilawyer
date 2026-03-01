'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlayCircle, Lock, CheckCircle, Clock, Star, Globe,
    BookOpen, Target, ChevronDown, ChevronUp,
    Video, Users, Award, ShoppingCart, ArrowRight, CheckSquare, AlertTriangle, RefreshCw, CalendarClock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPlatformData } from '@/lib/db';
import VideoPlayer from '@/components/VideoPlayer';
import Link from 'next/link';

// Fallback curriculum shown when a course has no curriculum in the DB yet
const FALLBACK_CURRICULUM = [
    {
        title: 'Module 1 — Foundations',
        lessons: [
            { title: 'Introduction & Course Overview', duration: '12 min', preview: true, videoUrl: '' },
            { title: 'Core Concepts & Definitions', duration: '18 min', preview: false, videoUrl: '' },
            { title: 'Historical Background', duration: '22 min', preview: false, videoUrl: '' },
        ]
    },
    {
        title: 'Module 2 — Advanced Topics',
        lessons: [
            { title: 'Key Principles & Analysis', duration: '20 min', preview: false, videoUrl: '' },
            { title: 'Case Studies & Applications', duration: '25 min', preview: false, videoUrl: '' },
            { title: 'Exam Preparation & Tips', duration: '15 min', preview: false, videoUrl: '' },
        ]
    },
];

const FALLBACK_OUTCOMES = [
    'Master core legal concepts from scratch',
    'Understand syllabus requirements in depth',
    'Apply theoretical knowledge to practical problems',
    'Prepare effectively for university examinations',
    'Build confidence for viva and written papers',
    'Access expert explanations of complex topics',
];

export default function CourseDetail({ params }) {
    const { id } = use(params);
    const { user, purchases } = useAuth();
    const [course, setCourse] = useState(null);
    const [openModule, setOpenModule] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const load = async () => {
            const courses = await getPlatformData('courses');
            const found = courses.find(c => String(c.id) === String(id)) || courses[0];
            setCourse(found);
            // Auto-select first lesson
            const curriculum = (found?.curriculum && found.curriculum.length > 0) ? found.curriculum : FALLBACK_CURRICULUM;
            const firstLesson = curriculum[0]?.lessons?.[0];
            if (firstLesson) {
                setSelectedLesson({ ...firstLesson, videoUrl: firstLesson.videoUrl || found?.videoUrl || '' });
            }
        };
        load();
    }, [id]);

    const purchaseRecord = purchases.courses.find(p => String(p.id || p) === String(id));
    const isPurchased = !!purchaseRecord;
    const expiryDate = (purchaseRecord && typeof purchaseRecord === 'object' && purchaseRecord.expiryDate)
        ? new Date(purchaseRecord.expiryDate)
        : null;
    const isExpired = expiryDate && new Date() > expiryDate;
    const hasAccess = isPurchased && !isExpired;

    const formatExpiry = (date) => date?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!course || !selectedLesson) return (
        <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading course...
        </div>
    );

    // Use dynamic data or fallback
    const curriculum = (course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0)
        ? course.curriculum
        : FALLBACK_CURRICULUM;
    const outcomes = (course.outcomes && Array.isArray(course.outcomes) && course.outcomes.length > 0)
        ? course.outcomes
        : FALLBACK_OUTCOMES;

    const totalLessons = curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const canPlayLesson = (lesson) => hasAccess || lesson.preview;

    const handleLessonClick = (lesson, courseVideoUrl) => {
        if (canPlayLesson(lesson)) {
            setSelectedLesson({ ...lesson, videoUrl: lesson.videoUrl || courseVideoUrl || '' });
            document.getElementById('video-player-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // If they can't play, scroll them to the purchase card
            document.querySelector('.cd-buy-btn, [href*="/checkout"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const discountPct = course.originalPrice && course.originalPrice > course.price
        ? Math.round((1 - course.price / course.originalPrice) * 100)
        : 0;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .cd-buy-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    padding: 1rem; background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff; border-radius: 12px; font-weight: 800; font-size: 1rem;
                    text-decoration: none; margin-bottom: 0.8rem; transition: all 0.2s; box-shadow: 0 4px 15px rgba(16,185,129,0.3);
                }
                .cd-buy-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16,185,129,0.4); }
                .lesson-row { transition: background 0.15s; }
                .lesson-row:hover { background: rgba(16,185,129,0.05) !important; }
            `}</style>

            {/* ── Dark Hero ── */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a3a2a 100%)', paddingTop: isMobile ? '85px' : '100px', paddingBottom: isMobile ? '2rem' : '3.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div className="container">
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                        <Link href="/courses" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>← All Courses</Link>
                        <span style={{ margin: '0 8px', color: '#334155' }}>/</span>
                        <span style={{ color: '#94a3b8' }}>{course.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '7px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{course.category}</span>
                        {course.semester && <span style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>{course.semester}</span>}
                        {course.university && <span style={{ background: 'rgba(255,255,255,0.08)', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>{course.university}</span>}
                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>RECORDED COURSE</span>
                    </div>
                    <h1 style={{ fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '1rem', maxWidth: '750px', fontSize: isMobile ? 'clamp(1.4rem, 5vw, 2rem)' : '2.6rem', letterSpacing: '-0.5px' }}>{course.title}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '680px', marginBottom: '1.5rem' }}>{course.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '0.8rem' : '1.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}><Star size={14} fill="currentColor" /> {course.rating || '4.9'} Rating</span>
                        {course.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}><Clock size={14} /> {course.duration}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}><PlayCircle size={14} /> {totalLessons} Lessons</span>
                        {!isMobile && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}><Globe size={14} /> English / Telugu</span>}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="container" style={{ paddingTop: isMobile ? '1.5rem' : '2.5rem', paddingBottom: '5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 370px', gap: isMobile ? '1.5rem' : '2.5rem', alignItems: 'start' }}>

                    {/* LEFT */}
                    <div style={{ minWidth: 0 }}>
                        {/* Video Player */}
                        <div id="video-player-area" style={{ marginBottom: '1.5rem', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                            <div style={{ background: '#111827', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <PlayCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                                <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    Now Playing: <strong>{selectedLesson.title}</strong>
                                </span>
                                {!canPlayLesson(selectedLesson) && (
                                    <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                        <Lock size={11} /> LOCKED
                                    </span>
                                )}
                            </div>
                            <VideoPlayer
                                key={selectedLesson.title}
                                videoUrl={selectedLesson.videoUrl || course.videoUrl || ''}
                                isPurchased={hasAccess}
                                courseId={String(id)}
                            />
                        </div>

                        {/* What You'll Learn */}
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1.5px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                                <Target style={{ color: '#10b981' }} size={20} /> What You'll Learn
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.8rem' }}>
                                {outcomes.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <CheckSquare size={15} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.88rem', lineHeight: 1.5, color: '#334155' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Stats mini-row */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                            {[
                                { icon: <Video size={20} />, label: 'Lessons', value: `${totalLessons} Videos` },
                                { icon: <Users size={20} />, label: 'Instructor', value: 'Uday Kantri' },
                                { icon: <Award size={20} />, label: 'Certificate', value: 'On Completion' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem', textAlign: 'center' }}>
                                    <div style={{ color: '#10b981', marginBottom: '0.5rem' }}>{s.icon}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{s.value}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Purchase Card + Curriculum */}
                    <div style={{ position: isMobile ? 'static' : 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Purchase Card */}
                        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1.5px solid #e2e8f0' }}>
                            <div style={{ padding: '1.5rem 1.8rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>₹{course.price}</span>
                                    {course.originalPrice > course.price && <>
                                        <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{course.originalPrice}</span>
                                        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>{discountPct}% OFF</span>
                                    </>}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>⏰ Limited time offer</div>
                            </div>
                            <div style={{ padding: '1.2rem 1.8rem' }}>
                                {isExpired ? (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.9rem', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: '#ef4444', fontWeight: 800, marginBottom: '0.8rem', border: '1.5px solid rgba(239,68,68,0.15)' }}>
                                            <AlertTriangle size={20} />
                                            <div>
                                                <div>Access Expired</div>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8' }}>Expired on {formatExpiry(expiryDate)}</div>
                                            </div>
                                        </div>
                                        <Link href={`/checkout?type=courses&id=${id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.95rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', marginBottom: '0.6rem' }}>
                                            <RefreshCw size={16} /> Renew Access — ₹{course.price}
                                        </Link>
                                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>Renew for another 6 months</div>
                                    </div>
                                ) : isPurchased ? (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.9rem', background: 'rgba(5,150,105,0.08)', borderRadius: '12px', color: '#059669', fontWeight: 800, marginBottom: '0.8rem', border: '1px solid rgba(5,150,105,0.15)' }}>
                                            <CheckCircle size={20} /> You're Enrolled!
                                        </div>
                                        {expiryDate && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', justifyContent: 'center' }}>
                                                <CalendarClock size={13} style={{ color: '#10b981' }} />
                                                Access valid until <strong style={{ color: '#0f172a', marginLeft: '3px' }}>{formatExpiry(expiryDate)}</strong>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Link href={`/checkout?type=courses&id=${id}`} className="cd-buy-btn">
                                            <ShoppingCart size={18} /> Buy Now — ₹{course.price}
                                        </Link>
                                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>30-Day Money Back Guarantee</div>
                                    </>
                                )}
                            </div>
                            <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    [<Video size={13} />, `${totalLessons} on-demand video lessons`],
                                    [<BookOpen size={13} />, 'Full syllabus coverage'],
                                    [<Clock size={13} />, '6 Months access from purchase'],
                                    [<Award size={13} />, 'Certificate of completion'],
                                ].map(([icon, text], i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                                        <span style={{ color: '#10b981' }}>{icon}</span> {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum Panel */}
                        <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Course Curriculum</h3>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{totalLessons} lessons</span>
                            </div>
                            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                {curriculum.map((mod, mi) => (
                                    <div key={mi}>
                                        <button
                                            onClick={() => setOpenModule(openModule === mi ? -1 : mi)}
                                            style={{
                                                width: '100%', padding: '0.9rem 1.5rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                background: openModule === mi ? '#f8fafc' : 'transparent',
                                                border: 'none', borderBottom: '1px solid #f1f5f9',
                                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Module {mi + 1}</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{mod.title}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{mod.lessons?.length || 0} lessons</div>
                                            </div>
                                            {openModule === mi ? <ChevronUp size={15} style={{ color: '#94a3b8' }} /> : <ChevronDown size={15} style={{ color: '#94a3b8' }} />}
                                        </button>
                                        <AnimatePresence>
                                            {openModule === mi && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    {(mod.lessons || []).map((lesson, li) => {
                                                        const isActive = selectedLesson?.title === lesson.title;
                                                        const canPlay = canPlayLesson(lesson);
                                                        return (
                                                            <div
                                                                key={li}
                                                                className="lesson-row"
                                                                onClick={() => handleLessonClick(lesson, course.videoUrl)}
                                                                style={{
                                                                    padding: '0.75rem 1.5rem 0.75rem 2.2rem',
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    borderBottom: '1px solid #f9fafb',
                                                                    cursor: canPlay ? 'pointer' : 'not-allowed',
                                                                    background: isActive ? 'rgba(16,185,129,0.07)' : 'transparent',
                                                                    borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                                                    {isActive
                                                                        ? <PlayCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                                                                        : canPlay
                                                                            ? <PlayCircle size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                                            : <Lock size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                                                                    }
                                                                    <span style={{
                                                                        fontSize: '0.82rem',
                                                                        color: isActive ? '#10b981' : canPlay ? '#334155' : '#94a3b8',
                                                                        fontWeight: isActive ? 700 : 400,
                                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                                    }}>{lesson.title}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                                                                    {lesson.preview && !isPurchased && (
                                                                        <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 7px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>FREE</span>
                                                                    )}
                                                                    {lesson.duration && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{lesson.duration}</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                            {/* CTA at bottom of curriculum */}
                            {!hasAccess && (
                                <div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid #f1f5f9', background: isExpired ? 'rgba(239,68,68,0.03)' : 'rgba(16,185,129,0.03)', textAlign: 'center' }}>
                                    {isExpired
                                        ? <AlertTriangle size={18} style={{ color: '#ef4444', marginBottom: '6px' }} />
                                        : <Lock size={18} style={{ color: '#10b981', marginBottom: '6px' }} />
                                    }
                                    <p style={{ fontSize: '0.8rem', color: isExpired ? '#ef4444' : '#64748b', marginBottom: '0.8rem', fontWeight: 600 }}>
                                        {isExpired ? 'Your access has expired.' : `Purchase to unlock all ${totalLessons} lessons`}
                                    </p>
                                    <Link href={`/checkout?type=courses&id=${id}`} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '0.65rem 1.5rem',
                                        background: isExpired ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#10b981',
                                        color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none'
                                    }}>
                                        {isExpired ? <><RefreshCw size={13} /> Renew Access</> : <>Buy Now <ArrowRight size={14} /></>}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
