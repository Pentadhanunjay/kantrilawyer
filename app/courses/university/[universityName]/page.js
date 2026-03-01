'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlatformData } from '@/lib/db';
import { Star, Clock, ArrowRight, PlayCircle, ChevronLeft, ChevronDown, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const SEMESTERS = ['Sem - I', 'Sem - II', 'Sem - III', 'Sem - IV', 'Sem - V', 'Sem - VI'];

export default function UniversityCoursesPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const universityName = decodeURIComponent(params.universityName);
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const [courses, setCourses] = useState([]);
    const [activeSemester, setActiveSemester] = useState('Sem - I');
    const [showAuth, setShowAuth] = useState(false);
    const [pendingUrl, setPendingUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const allCourses = await getPlatformData('courses');
            const uniCourses = allCourses.filter(c => c.university === universityName);
            setCourses(uniCourses);
            setIsLoading(false);
        };
        load();
    }, [universityName]);

    const filtered = courses.filter(c => c.semester === activeSemester);

    const requireAuth = (url) => {
        if (!isLoggedIn) {
            setPendingUrl(url);
            setShowAuth(true);
            return false;
        }
        return true;
    };

    const handleCourseClick = (courseId) => {
        if (requireAuth(`/courses/${courseId}`)) router.push(`/courses/${courseId}`);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
            <style>{`
                .uni-banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 6rem 0 4rem; margin-top: 70px; position: relative; overflow: hidden; }
                .uni-banner::after { content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to top, var(--background), transparent); }
                .sem-select { width: 100%; max-width: 250px; padding: 12px 20px; border-radius: 12px; border: 2px solid #e2e8f0; background: #fff; font-weight: 700; color: #1e293b; cursor: pointer; appearance: none; outline: none; transition: border-color 0.2s; }
                .sem-select:focus { border-color: #10b981; }
                .course-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
                .back-btn { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-weight: 600; text-decoration: none; margin-bottom: 2rem; transition: color 0.2s; cursor: pointer; }
                .back-btn:hover { color: #fff; }
                @media (max-width: 768px) {
                    .uni-banner { padding: 4rem 0 3rem !important; }
                    .course-card-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="uni-banner">
                <div className="container">
                    <div className="back-btn" onClick={() => router.push('/courses')}>
                        <ChevronLeft size={18} /> Back to All Universities
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', padding: '5px 16px', borderRadius: '20px', marginBottom: '1.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                        <GraduationCap size={14} /> UNIVERSITY SYLLABUS
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
                        {universityName}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px' }}>
                        Specialized courses designed strictly according to the {universityName} official curriculum.
                    </p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '8rem' }}>
                <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', marginTop: '-3rem', position: 'relative', zIndex: 10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Discover Content</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>Select your semester to see matching courses</p>
                    </div>

                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <select
                            className="sem-select"
                            value={activeSemester}
                            onChange={(e) => setActiveSemester(e.target.value)}
                        >
                            {SEMESTERS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                    </div>
                </div>

                <div style={{ marginTop: '4rem' }}>
                    <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '4px', background: '#10b981', borderRadius: '2px' }}></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeSemester} Courses</h3>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading courses...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                            <PlayCircle size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                            <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>Currently no courses available for {activeSemester}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>We are working on adding more content soon.</p>
                        </div>
                    ) : (
                        <div className="course-card-grid">
                            {filtered.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => handleCourseClick(course.id)}
                                    style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                                >
                                    <div style={{ height: '200px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', position: 'relative' }}>
                                        {course.image ? (
                                            <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <PlayCircle size={48} color="#10b981" style={{ opacity: 0.5 }} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>VIDEO</div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.4 }}>{course.title}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem', height: '2.5rem', overflow: 'hidden' }}>{course.description}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1.5px solid #f8fafc' }}>
                                            <div>
                                                <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>₹{course.price}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>₹{course.originalPrice}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>
                                                <Star size={14} fill="#fbbf24" color="#fbbf24" /> {course.rating || '4.9'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={() => { setShowAuth(false); if (pendingUrl) router.push(pendingUrl); }}
                redirectMessage="Login to access this course"
            />
        </div>
    );
}
