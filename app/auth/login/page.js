'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

// ── View states: 'login' | 'forgot' | 'reset_success'
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    // Login form
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // View: 'login' | 'forgot' | 'reset_success'
    const [view, setView] = useState('login');

    // Forgot / Reset form
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');

    // ── Login submit ────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            const session = await loginUser(form);
            login(session);
            router.push(session.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            if (err.message === 'INVALID_CREDENTIALS') setError('Invalid email or password. Please try again.');
            else setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password (step 1: verify email exists / step 2: set new pass) ─
    const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter new password

    const handleForgotEmailNext = async (e) => {
        e.preventDefault();
        setResetError('');
        if (!resetEmail) { setResetError('Please enter your email address.'); return; }
        setResetLoading(true);
        try {
            // Quick check: does the account exist?
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, newPassword: '__check_only__' })
            });
            const data = await res.json();
            // 404 = account not found, proceed only if account exists
            if (res.status === 404) {
                setResetError(data.error || 'No account found with that email.');
            } else {
                // Account exists (even if password too short error) → go to step 2
                setForgotStep(2);
            }
        } catch {
            setResetError('Could not verify email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        if (!newPassword || !confirmPassword) { setResetError('Please fill in both fields.'); return; }
        if (newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setResetError('Passwords do not match.'); return; }

        setResetLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, newPassword })
            });
            const data = await res.json();
            if (!res.ok) { setResetError(data.error || 'Failed to reset password.'); return; }
            // Success → show success card, then redirect to login after 2s
            setView('reset_success');
            setTimeout(() => {
                setView('login');
                setForm({ email: resetEmail, password: '' });
                setForgotStep(1);
                setResetEmail('');
                setNewPassword('');
                setConfirmPassword('');
            }, 2000);
        } catch {
            setResetError('Something went wrong. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
        }}>
            {/* Brand */}
            <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                        KANTRI<span style={{ color: '#10b981' }}> LAWYER</span>
                    </div>
                </Link>
            </div>

            <AnimatePresence mode="wait">

                {/* ── LOGIN CARD ── */}
                {view === 'login' && (
                    <motion.div key="login"
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ width: '100%', maxWidth: '440px', marginTop: '2rem' }}
                    >
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>Welcome Back</h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Login to access your courses and materials</p>

                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {/* Email */}
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={17} style={iconStyle} />
                                        <input type="email" placeholder="you@example.com" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                                        <button type="button" onClick={() => { setView('forgot'); setResetEmail(form.email); setForgotStep(1); setResetError(''); }}
                                            style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={17} style={iconStyle} />
                                        <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            style={{ ...inputStyle, paddingRight: '3rem' }} />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={btnStyle}>
                                    {loading ? 'Logging in...' : <><LogIn size={18} /> Login to Account</>}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6b7280' }}>
                                Don't have an account?{' '}
                                <Link href="/auth/register" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                                    Register Free →
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ── FORGOT PASSWORD CARD ── */}
                {view === 'forgot' && (
                    <motion.div key="forgot"
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ width: '100%', maxWidth: '440px', marginTop: '2rem' }}
                    >
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                            {/* Back button */}
                            <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: '1.5rem', padding: 0 }}>
                                <ArrowLeft size={15} /> Back to Login
                            </button>

                            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                                <KeyRound size={26} color="#fff" />
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Reset Password</h2>

                            {/* Step indicators */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
                                {[1, 2].map(s => (
                                    <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: forgotStep >= s ? '#059669' : '#e5e7eb', transition: '0.3s' }} />
                                ))}
                            </div>

                            {/* Step 1 — Verify Email */}
                            {forgotStep === 1 && (
                                <form onSubmit={handleForgotEmailNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '-0.5rem' }}>Enter your registered email to continue.</p>
                                    <div>
                                        <label style={labelStyle}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={17} style={iconStyle} />
                                            <input type="email" placeholder="you@example.com" value={resetEmail}
                                                onChange={e => setResetEmail(e.target.value)} style={inputStyle} autoFocus />
                                        </div>
                                    </div>
                                    {resetError && (
                                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600 }}>⚠️ {resetError}</div>
                                    )}
                                    <button type="submit" disabled={resetLoading} style={btnStyle}>
                                        {resetLoading ? 'Verifying...' : 'Continue →'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2 — Set New Password */}
                            {forgotStep === 2 && (
                                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '-0.5rem' }}>
                                        Setting new password for <strong style={{ color: '#059669' }}>{resetEmail}</strong>
                                    </p>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={17} style={iconStyle} />
                                            <input type={showNew ? 'text' : 'password'} placeholder="Min. 6 characters" value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                style={{ ...inputStyle, paddingRight: '3rem' }} autoFocus />
                                            <button type="button" onClick={() => setShowNew(!showNew)}
                                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={17} style={iconStyle} />
                                            <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                style={{ ...inputStyle, paddingRight: '3rem' }} />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </button>
                                        </div>
                                        {/* Match indicator */}
                                        {confirmPassword && (
                                            <div style={{ marginTop: '5px', fontSize: '0.75rem', fontWeight: 700, color: newPassword === confirmPassword ? '#059669' : '#dc2626' }}>
                                                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </div>
                                        )}
                                    </div>
                                    {resetError && (
                                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600 }}>⚠️ {resetError}</div>
                                    )}
                                    <button type="submit" disabled={resetLoading} style={btnStyle}>
                                        {resetLoading ? 'Resetting...' : <><KeyRound size={17} /> Reset Password</>}
                                    </button>
                                    <button type="button" onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        ← Change email
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── RESET SUCCESS CARD ── */}
                {view === 'reset_success' && (
                    <motion.div key="success"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ width: '100%', maxWidth: '400px', marginTop: '2rem' }}
                    >
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem 2.5rem', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}
                            >
                                <CheckCircle2 size={38} color="#fff" />
                            </motion.div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Password Reset!</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Your password has been updated successfully.<br />Redirecting you to login...
                            </p>
                            <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: '100%' }} animate={{ width: '0%' }}
                                    transition={{ duration: 2, ease: 'linear' }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg,#059669,#10b981)', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' };
const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };
const inputStyle = {
    width: '100%',
    padding: '0.85rem 0.85rem 0.85rem 2.8rem',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.95rem', fontFamily: 'inherit', color: '#0f172a',
    background: '#f9fafb', outline: 'none', boxSizing: 'border-box'
};
const btnStyle = {
    padding: '1rem', background: '#059669', color: '#fff',
    border: 'none', borderRadius: '12px', fontWeight: 800,
    fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginTop: '4px', transition: '0.2s', width: '100%'
};
