'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, CheckCircle, CheckCircle2, Phone } from 'lucide-react';
import { registerUser } from '@/lib/auth';

const PERKS = [
    'Access purchased courses anytime',
    'Track your learning progress',
    'Get certificate on completion',
    'Exclusive member discounts',
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);

    const validate = () => {
        if (!form.name.trim()) return 'Full name is mandatory.';
        if (!form.phone.trim()) return 'Phone number is mandatory.';
        if (!/^\d{10}$/.test(form.phone)) return 'Phone number must be exactly 10 digits.';
        if (!form.email.trim()) return 'Email address is mandatory.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
        if (!form.password) return 'Password is mandatory.';
        if (form.password.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(form.password)) return 'Password must include at least one capital letter.';
        if (!form.confirm) return 'Please confirm your password.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            await registerUser({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password
            });
            // Show success briefly, then go to login
            setForm({ name: '', email: '', phone: '', password: '', confirm: '' });
            setRegistered(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err) {
            if (err.message === 'EMAIL_EXISTS') setError('This email is already registered. Please login instead.');
            else setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (!form.password) return null;
        if (form.password.length < 8) return { label: 'Too short (Min. 8)', color: '#ef4444', width: '25%' };
        if (!/[A-Z]/.test(form.password)) return { label: 'Needs Capital Letter', color: '#f59e0b', width: '50%' };
        if (/[0-9]/.test(form.password)) return { label: 'Strong', color: '#10b981', width: '100%' };
        return { label: 'Medium', color: '#3b82f6', width: '75%' };
    };
    const strength = passwordStrength();

    // ── Success overlay (registered → redirect to login)
    if (registered) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#fff', borderRadius: '24px', padding: '3rem 2.5rem', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: '380px', width: '100%' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle2 size={38} color="#fff" />
                    </motion.div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Account Created!</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Welcome to Kantri Lawyer! 🎉<br />Redirecting you to login...
                    </p>
                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }}
                            transition={{ duration: 2, ease: 'linear' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg,#059669,#10b981)', borderRadius: '4px' }} />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}
            >

                {/* Left Panel */}
                <div style={{ background: 'linear-gradient(160deg, #064e3b, #065f46)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                            KANTRI<span style={{ color: '#34d399' }}> LAWYER</span>
                        </div>
                    </Link>
                    <p style={{ color: '#6ee7b7', fontSize: '0.85rem', marginBottom: '3rem' }}>Kantri by Awareness, Honest by Conscience</p>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem', lineHeight: 1.3 }}>
                        Start Your Legal<br />Learning Journey
                    </h2>
                    <p style={{ color: '#a7f3d0', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Join thousands of law students who trust Kantri Lawyer for their legal education.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {PERKS.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle size={18} style={{ color: '#34d399', flexShrink: 0 }} />
                                <span style={{ color: '#d1fae5', fontSize: '0.9rem' }}>{p}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div style={{ background: '#fff', padding: '3rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Create Account</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '2rem' }}>Free registration • No credit card required</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Name */}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={iconStyle} />
                                <input type="text" placeholder="e.g. Ravi Kumar" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                            </div>
                        </div>

                        {/* Email and Phone Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={iconStyle} />
                                    <input type="email" placeholder="you@example.com" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Phone <span style={{ color: '#dc2626' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={iconStyle} />
                                    <input type="text" placeholder="10 digits" value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password <span style={{ color: '#dc2626' }}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={iconStyle} />
                                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    style={{ ...inputStyle, paddingRight: '3rem' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {strength && (
                                <div style={{ marginTop: '6px' }}>
                                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '4px', transition: '0.3s' }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={labelStyle}>Confirm Password <span style={{ color: '#dc2626' }}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={iconStyle} />
                                <input type="password" placeholder="Re-enter password" value={form.confirm}
                                    onChange={e => setForm({ ...form, confirm: e.target.value })} style={inputStyle} />
                                {form.confirm && (
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                        {form.password === form.confirm
                                            ? <CheckCircle size={16} style={{ color: '#10b981' }} />
                                            : <span style={{ color: '#ef4444', fontSize: '1rem' }}>✕</span>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={btnStyle}>
                            {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Free Account</>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Login →</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '5px' };
const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };
const inputStyle = {
    width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.6rem',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.9rem', fontFamily: 'inherit', color: '#0f172a',
    background: '#f9fafb', outline: 'none', boxSizing: 'border-box'
};
const btnStyle = {
    padding: '0.95rem', background: '#059669', color: '#fff',
    border: 'none', borderRadius: '12px', fontWeight: 800,
    fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px'
};
