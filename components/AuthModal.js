'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, Phone, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginUser, registerUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AuthModal({ isOpen, onClose, onSuccess, redirectMessage }) {
    const { login } = useAuth();
    const router = useRouter();

    // 'login' | 'register' | 'forgot' | 'reset_success'
    const [mode, setMode] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

    // Forgot password state
    const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = new password
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const switchMode = (m) => { setMode(m); setError(''); };

    // ── Login / Register ──────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
        if (mode === 'register' && (!form.name || !form.phone)) { setError('Please enter your name and phone number.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setLoading(true);
        try {
            let session;
            if (mode === 'login') {
                session = await loginUser({ email: form.email, password: form.password });
                login(session);
                if (session.role === 'admin') { onClose?.(); router.push('/admin'); }
                else { onSuccess?.(); onClose?.(); }
            } else {
                await registerUser({ name: form.name, email: form.email, password: form.password, phone: form.phone });
                // After register → go to login
                setForm({ name: '', email: form.email, password: '', phone: '' });
                switchMode('login');
                setError('');
            }
        } catch (err) {
            if (err.message === 'INVALID_CREDENTIALS') setError('Invalid email or password.');
            else if (err.message === 'EMAIL_EXISTS') setError('Email already registered. Please login.');
            else setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot: Step 1 — verify email ────────────────────────────────────────
    const handleForgotEmailNext = async (e) => {
        e.preventDefault();
        setError('');
        if (!resetEmail) { setError('Please enter your email address.'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, newPassword: '__check_only__' })
            });
            if (res.status === 404) {
                const d = await res.json();
                setError(d.error || 'No account found with that email.');
            } else {
                setForgotStep(2);
            }
        } catch { setError('Could not verify email. Please try again.'); }
        finally { setLoading(false); }
    };

    // ── Forgot: Step 2 — set new password ────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!newPassword || !confirmPassword) { setError('Please fill in both fields.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, newPassword })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to reset password.'); return; }
            setMode('reset_success');
            setTimeout(() => {
                setMode('login');
                setForm({ name: '', email: resetEmail, password: '', phone: '' });
                setForgotStep(1);
                setResetEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
            }, 2000);
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 9998 }}
                    />

                    {/* Scroll container */}
                    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 1rem 3rem' }}>

                        {/* Card */}
                        <motion.div
                            key={mode}
                            initial={{ scale: 0.92, y: -20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.92, y: -20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', position: 'relative', flexShrink: 0 }}
                        >
                            {/* Close */}
                            <button onClick={onClose} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>

                            {/* Brand */}
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>
                                    KANTRI<span style={{ color: '#059669' }}> LAWYER</span>
                                </div>
                                {redirectMessage && (
                                    <div style={{ fontSize: '0.8rem', color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '6px 14px', borderRadius: '20px', display: 'inline-block', marginTop: '6px' }}>
                                        🔒 {redirectMessage}
                                    </div>
                                )}
                            </div>

                            {/* ── LOGIN / REGISTER views ── */}
                            {(mode === 'login' || mode === 'register') && (<>
                                {/* Tab Toggle */}
                                <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '12px', padding: '4px', marginBottom: '1.8rem' }}>
                                    {['login', 'register'].map(m => (
                                        <button key={m} onClick={() => switchMode(m)} style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            background: mode === m ? '#fff' : 'transparent',
                                            color: mode === m ? '#0f172a' : '#94a3b8',
                                            fontWeight: mode === m ? 800 : 500,
                                            fontSize: '0.9rem',
                                            boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                            transition: '0.2s', fontFamily: 'inherit',
                                        }}>
                                            {m === 'login' ? '👤 Login' : '✨ Register'}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {mode === 'register' && (<>
                                        <div style={{ position: 'relative' }}>
                                            <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input type="text" placeholder="Phone Number (10 digits)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                                        </div>
                                    </>)}

                                    <div style={{ position: 'relative' }}>
                                        <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                                    </div>

                                    {/* Password row with Forgot link (login only) */}
                                    <div>
                                        {mode === 'login' && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                                <button type="button" onClick={() => { setResetEmail(form.email); setForgotStep(1); switchMode('forgot'); }}
                                                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                                                    Forgot password?
                                                </button>
                                            </div>
                                        )}
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, paddingRight: '3rem' }} />
                                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading} style={{ padding: '1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', marginTop: '4px', opacity: loading ? 0.8 : 1, transition: '0.2s' }}>
                                        {loading ? 'Please wait...' : mode === 'login'
                                            ? <><LogIn size={18} /> Login to Continue</>
                                            : <><UserPlus size={18} /> Create Account</>
                                        }
                                    </button>
                                </form>

                                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                                    {mode === 'login'
                                        ? <>No account? <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>Register Free</button></>
                                        : <>Already have an account? <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>Login</button></>
                                    }
                                </p>
                            </>)}

                            {/* ── FORGOT PASSWORD view ── */}
                            {mode === 'forgot' && (
                                <div>
                                    <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', marginBottom: '1.2rem', padding: 0 }}>
                                        <ArrowLeft size={14} /> Back to Login
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                        <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <KeyRound size={22} color="#fff" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>Reset Password</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Step {forgotStep} of 2</div>
                                        </div>
                                    </div>

                                    {/* Step progress bar */}
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
                                        {[1, 2].map(s => (
                                            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: forgotStep >= s ? '#059669' : '#e5e7eb', transition: '0.3s' }} />
                                        ))}
                                    </div>

                                    {/* Step 1 — Email */}
                                    {forgotStep === 1 && (
                                        <form onSubmit={handleForgotEmailNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Enter your registered email to continue.</p>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} style={inputStyle} autoFocus />
                                            </div>
                                            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600 }}>⚠️ {error}</div>}
                                            <button type="submit" disabled={loading} style={greenBtn}>{loading ? 'Verifying...' : 'Continue →'}</button>
                                        </form>
                                    )}

                                    {/* Step 2 — New Password */}
                                    {forgotStep === 2 && (
                                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.83rem', margin: 0 }}>
                                                Setting new password for <strong style={{ color: '#059669' }}>{resetEmail}</strong>
                                            </p>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input type={showNew ? 'text' : 'password'} placeholder="New Password (min. 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '3rem' }} autoFocus />
                                                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '3rem' }} />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {confirmPassword && (
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: newPassword === confirmPassword ? '#059669' : '#dc2626', marginTop: '-4px' }}>
                                                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                                </div>
                                            )}
                                            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600 }}>⚠️ {error}</div>}
                                            <button type="submit" disabled={loading} style={greenBtn}>{loading ? 'Resetting...' : <><KeyRound size={16} /> Reset Password</>}</button>
                                            <button type="button" onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>← Change email</button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* ── RESET SUCCESS view ── */}
                            {mode === 'reset_success' && (
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,#059669,#047857)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <CheckCircle2 size={34} color="#fff" />
                                    </motion.div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Password Reset!</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem' }}>Redirecting you to login...</p>
                                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }}
                                            transition={{ duration: 2, ease: 'linear' }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg,#059669,#10b981)', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.85rem 0.85rem 0.85rem 2.8rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    transition: '0.2s',
    boxSizing: 'border-box',
};

const greenBtn = {
    padding: '1rem', background: '#059669', color: '#fff',
    border: 'none', borderRadius: '12px', fontWeight: 800,
    fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: 'inherit', transition: '0.2s', width: '100%'
};
