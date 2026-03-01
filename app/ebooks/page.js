'use client';
import ProductCard from '@/components/ProductCard';
import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { getPlatformData } from '@/lib/db';
import { BookOpen, Filter, X, ChevronDown, Check } from 'lucide-react';

const TG_UNIVERSITIES = [
    'Osmania University', 'Kakatiya University', 'Palamuru University',
    'Satavahana University', 'Telangana University', 'Mahatma Gandhi University',
];
const AP_UNIVERSITIES = [
    'Andhra University', 'Adikavi Nannaya University', 'Damodaram Sanjivayya NLU',
    'Krishna University', 'Sri Krishnadevaraya University', 'Sri Venkateswara University',
    'Yogi Vemana University', 'Acharya Nagarjuna University', 'Andhra Kesari University',
    'KL University', 'Rayalaseema University', 'Sri Padmavati Mahila', 'Vikrama Simhapuri University',
];
const ALL_UNIVERSITIES = [...TG_UNIVERSITIES, ...AP_UNIVERSITIES];
const SEMESTERS = ['Sem - I', 'Sem - II', 'Sem - III', 'Sem - IV', 'Sem - V', 'Sem - VI'];

// ── Custom dropdown — always opens DOWNWARD ──────────────────────────────────
function Dropdown({ value, onChange, placeholder, options, grouped }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const label = value || placeholder;

    return (
        <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', padding: '0.65rem 2.5rem 0.65rem 1rem',
                    border: `1.5px solid ${value ? '#059669' : '#e2e8f0'}`,
                    borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'inherit',
                    color: value ? '#0f172a' : '#94a3b8', background: '#fff',
                    cursor: 'pointer', textAlign: 'left', fontWeight: value ? 600 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: '0.2s',
                    outline: 'none',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                <ChevronDown size={14} style={{ flexShrink: 0, color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {/* Dropdown panel — always below */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 9999,
                    maxHeight: '280px', overflowY: 'auto',
                    padding: '6px 0',
                }}>
                    {/* Clear option */}
                    <button
                        onClick={() => { onChange(''); setOpen(false); }}
                        style={{
                            width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'none',
                            textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8',
                            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        {placeholder}
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                    {grouped ? (
                        grouped.map(group => (
                            <div key={group.label}>
                                <div style={{ padding: '0.4rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {group.label}
                                </div>
                                {group.options.map(opt => (
                                    <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                                        style={{
                                            width: '100%', padding: '0.55rem 1rem 0.55rem 1.5rem', border: 'none',
                                            background: value === opt ? 'rgba(5,150,105,0.07)' : 'none',
                                            textAlign: 'left', cursor: 'pointer', fontSize: '0.87rem',
                                            color: value === opt ? '#059669' : '#334155', fontFamily: 'inherit',
                                            fontWeight: value === opt ? 700 : 400,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                        {opt} {value === opt && <Check size={13} style={{ color: '#059669' }} />}
                                    </button>
                                ))}
                            </div>
                        ))
                    ) : (
                        options.map(opt => (
                            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                                style={{
                                    width: '100%', padding: '0.6rem 1rem', border: 'none',
                                    background: value === opt ? 'rgba(5,150,105,0.07)' : 'none',
                                    textAlign: 'left', cursor: 'pointer', fontSize: '0.87rem',
                                    color: value === opt ? '#059669' : '#334155', fontFamily: 'inherit',
                                    fontWeight: value === opt ? 700 : 400,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                {opt} {value === opt && <Check size={13} style={{ color: '#059669' }} />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
function EbooksContent() {
    const [ebooks, setEbooks] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPlatformData('ebooks').then(data => { setEbooks(data); setLoading(false); });
    }, []);

    const availableColleges = useMemo(() => {
        const set = new Set(ebooks.map(e => e.university).filter(Boolean));
        return ALL_UNIVERSITIES.filter(u => set.has(u)).concat(
            [...set].filter(u => !ALL_UNIVERSITIES.includes(u)).sort()
        );
    }, [ebooks]);

    const availableSemesters = useMemo(() => {
        const set = new Set(ebooks.map(e => e.semester).filter(Boolean));
        return SEMESTERS.filter(s => set.has(s)).concat(
            [...set].filter(s => !SEMESTERS.includes(s)).sort()
        );
    }, [ebooks]);

    const filtered = useMemo(() => ebooks.filter(e => {
        if (selectedCollege && e.university !== selectedCollege) return false;
        if (selectedSemester && e.semester !== selectedSemester) return false;
        return true;
    }), [ebooks, selectedCollege, selectedSemester]);

    const hasFilters = selectedCollege || selectedSemester;
    const clearFilters = () => { setSelectedCollege(''); setSelectedSemester(''); };

    // Build college groups for dropdown
    const collegeGrouped = useMemo(() => {
        const list = availableColleges.length ? availableColleges : ALL_UNIVERSITIES;
        return [
            { label: 'Telangana (TG)', options: TG_UNIVERSITIES.filter(u => list.includes(u)) },
            { label: 'Andhra Pradesh (AP)', options: AP_UNIVERSITIES.filter(u => list.includes(u)) },
        ].filter(g => g.options.length > 0);
    }, [availableColleges]);

    const semesterList = availableSemesters.length ? availableSemesters : SEMESTERS;

    return (
        <div className="container">
            <style>{`
                .ebooks-h1 { font-size: 3.5rem; }
                .ebook-dropdown-group { display: flex; gap: 1rem; flex: 1; }
                @media (max-width: 768px) {
                    .ebooks-h1 { font-size: clamp(1.8rem, 6vw, 2.5rem) !important; }
                    .ebooks-header { padding-top: 2rem !important; margin-bottom: 2rem !important; }
                    .ebook-filter-bar { padding: 1rem !important; flex-direction: column !important; align-items: stretch !important; }
                    .ebook-dropdown-group { flex-direction: column !important; width: 100% !important; }
                }
            `}</style>

            <header className="ebooks-header" style={{ marginBottom: '3rem', textAlign: 'center', paddingTop: '4rem' }}>
                <h1 className="ebooks-h1" style={{ marginBottom: '1rem' }}>
                    Expertly Crafted <span className="gradient-text">eBooks</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto', padding: '0 0.5rem' }}>
                    Access premium digital resources and study guides — filter by college and semester to find what you need.
                </p>
            </header>

            {/* ── Filter Bar ── */}
            <div className="ebook-filter-bar" style={{
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                background: '#f8fafc', borderRadius: '16px', padding: '1.2rem 1.5rem',
                marginBottom: '2.5rem', border: '1px solid #e2e8f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                    <Filter size={16} /> Filter:
                </div>

                <div className="ebook-dropdown-group" style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
                    <Dropdown
                        value={selectedCollege}
                        onChange={setSelectedCollege}
                        placeholder="🏛️ All Colleges"
                        grouped={collegeGrouped}
                    />

                    <Dropdown
                        value={selectedSemester}
                        onChange={setSelectedSemester}
                        placeholder="📚 Semesters"
                        options={SEMESTERS}
                    />
                </div>

                {hasFilters && (
                    <button onClick={clearFilters} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.65rem 1rem', background: 'none',
                        border: '1.5px solid #e2e8f0', borderRadius: '10px',
                        cursor: 'pointer', color: '#64748b', fontWeight: 600,
                        fontSize: '0.83rem', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* ── Result count ── */}
            {hasFilters && (
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                    Showing <strong style={{ color: '#059669' }}>{filtered.length}</strong> eBook{filtered.length !== 1 ? 's' : ''}
                    {selectedCollege && <> for <strong style={{ color: '#0f172a' }}>{selectedCollege}</strong></>}
                    {selectedSemester && <>, <strong style={{ color: '#0f172a' }}>{selectedSemester}</strong></>}
                </p>
            )}

            {/* ── Grid ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>Loading eBooks...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <BookOpen size={48} style={{ color: '#cbd5e1', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No eBooks Found</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {hasFilters ? 'No eBooks match your selected filters.' : 'No eBooks available yet.'}
                    </p>
                    {hasFilters && (
                        <button onClick={clearFilters} style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                            Show All eBooks
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid-3" style={{ marginBottom: '6rem' }}>
                    {filtered.map(ebook => (
                        <ProductCard key={ebook.id} item={ebook} type="ebooks" />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function EbooksPage() {
    return (
        <Suspense fallback={<div style={{ padding: '6rem 1rem', textAlign: 'center' }}>Loading eBooks...</div>}>
            <EbooksContent />
        </Suspense>
    );
}
