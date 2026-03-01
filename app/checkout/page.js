'use client';
import { CreditCard, ShieldCheck, User, ArrowRight, CheckCircle, PlayCircle, Tag, X, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData, getPlatformData } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Suspense } from 'react';

function CheckoutContent() {
    const { user, refreshPurchases } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [couponCode, setCouponCode] = useState('');
    const [couponState, setCouponState] = useState(null); // null | { valid, discountAmount, reason, couponId, type, value }
    const [couponLoading, setCouponLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { cartItems, subtotal: cartSubtotal } = useCart();
    const [item, setItem] = useState(null);

    const type = searchParams.get('type') || (cartItems.length > 0 ? 'cart' : 'courses');
    const itemId = searchParams.get('id');
    const qtyParam = searchParams.get('qty');
    const directQty = Math.max(1, parseInt(qtyParam) || 1);

    useEffect(() => {
        if (!user && !loading) {
            router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (itemId) {
            const load = async () => {
                const queryType = type === 'cart' ? 'books' : type;
                const allItems = await getPlatformData(queryType);
                const found = allItems.find(i => String(i.id) === String(itemId));
                if (found) setItem({ ...found, quantity: directQty });
            };
            load();
        }
    }, [itemId, type, directQty]);

    const isPhysicalOrder = type === 'books' || (type === 'cart' && cartItems.some(i => i.type === 'books' || i.category?.toLowerCase().includes('book')));

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', pincode: '' });
    const [formErrors, setFormErrors] = useState({});

    const subtotal = item ? (item.price * (item.quantity || 1)) : (type === 'cart' ? cartSubtotal : 0);
    const discount = couponState?.valid ? couponState.discountAmount : 0;
    const total = Math.max(0, subtotal - discount);

    // ── Coupon Validation ────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponState(null);
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    userId: user?.id || null,
                    item: {
                        id: item?.id,
                        type: type,
                        price: item?.price ?? subtotal,
                        university: item?.university,
                        semester: item?.semester,
                        state: item?.state,
                    }
                })
            });
            const data = await res.json();
            setCouponState(data);
        } catch (e) {
            setCouponState({ valid: false, reason: 'Could not validate coupon. Try again.' });
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => { setCouponState(null); setCouponCode(''); };

    // ── Form Validation ──────────────────────────────────────────────────────
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full name is required.';
        else if (formData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';

        if (!formData.email.trim()) errors.email = 'Email address is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address.';

        if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
        else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s+\-()]/g, '')))
            errors.phone = 'Enter a valid 10-digit Indian mobile number.';

        if (!formData.pincode.trim() && isPhysicalOrder) errors.pincode = 'Pincode is required.';
        else if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) errors.pincode = 'Pincode must be exactly 6 digits.';

        if (!formData.address.trim() && isPhysicalOrder) errors.address = 'Shipping address is required.';
        else if (formData.address.trim() && formData.address.trim().length < 10) errors.address = 'Please enter a complete address (min. 10 characters).';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Payment ──────────────────────────────────────────────────────────────
    const makePayment = async () => {
        if (!validateForm()) {
            const firstErr = document.querySelector('.f-group.error input, .f-group.error textarea');
            if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total, currency: 'INR', receipt: 'receipt_' + Date.now() }),
            });
            const order = await res.json();
            if (!res.ok) throw new Error(order.message || 'Failed to create order');
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount, currency: order.currency,
                name: "Kantri Lawyer",
                description: item ? `Purchase: ${item.title}` : 'Learning Materials',
                image: "/assets/images/logo.png",
                order_id: order.id,
                handler: async function (response) {
                    setLoading(true);
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                userId: user?.id,
                                purchaseType: type,
                                itemId,
                                quantity: type === 'books' ? (item?.quantity || 1) : 1,
                                cartItems: type === 'cart' ? cartItems : null,
                                amount: total,
                                addressInfo: formData
                            })
                        });

                        if (verifyRes.ok) {
                            // Record coupon usage if a coupon was applied
                            if (couponState?.valid && couponState.couponId && user?.id) {
                                await fetch('/api/coupons/apply', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        couponId: couponState.couponId,
                                        userId: user.id,
                                        type: type,
                                        productId: itemId,
                                        discountAmount: couponState.discountAmount,
                                        originalAmount: subtotal,
                                    })
                                });
                            }
                            await refreshPurchases();
                            if (type === 'courses' && itemId) router.push(`/courses/${itemId}?unlocked=1`);
                            else if (type === 'ebooks' && itemId) router.push(`/ebooks/${itemId}?unlocked=1`);
                            else if (isPhysicalOrder) router.push('/dashboard?order_success=1');
                            else router.push('/dashboard');
                        } else {
                            const errorData = await verifyRes.json();
                            const debugMsg = errorData.debug ? `\n\nDebug Info: ${errorData.debug}` : '';
                            alert(`Checkout Sync Failed: ${errorData.error || 'Server error'}${debugMsg}\n\nPlease take a screenshot and contact support with Payment ID: ${response.razorpay_payment_id}`);
                        }
                    } catch (e) {
                        alert('Verification Error: ' + e.message);
                    } finally {
                        setLoading(false);
                    }

                },
                prefill: { name: formData.name, email: formData.email, contact: formData.phone },
                notes: { address: formData.address },
                theme: { color: "#10b981" },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) { alert("Payment Failed: " + response.error.description); });
            rzp.open();
        } catch (error) {
            alert("Checkout Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1100px', paddingTop: '5rem', paddingBottom: '6rem' }}>
            <style>{`
                .checkout-h1 { font-size: 3rem; }
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 3.5rem;
                }
                .checkout-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .order-summary-box { position: sticky; top: 100px; }
                .f-group { display: flex; flex-direction: column; gap: 8px; }
                .f-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .f-group input, .f-group textarea {
                    padding: 0.9rem;
                    background: var(--surface);
                    border: 1.5px solid var(--border);
                    border-radius: 12px;
                    color: var(--text);
                    font-family: inherit;
                    font-size: 0.95rem;
                    transition: 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .f-group input:focus, .f-group textarea:focus { border-color: var(--primary); outline: none; }
                .f-group.error input, .f-group.error textarea { border-color: #ef4444 !important; background: rgba(239,68,68,0.03); }
                .f-err { font-size: 0.75rem; color: #ef4444; font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
                .req { color: #ef4444; margin-left: 2px; }
                .gradient-text { background: linear-gradient(135deg, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                @media (max-width: 768px) {
                    .checkout-h1 { font-size: clamp(1.8rem, 6vw, 2.4rem) !important; margin-bottom: 2rem !important; }
                    .checkout-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
                    .checkout-form-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .order-summary-box { position: static !important; order: -1; }
                }
            `}</style>

            <h1 className="checkout-h1" style={{ marginBottom: '3rem', fontWeight: 800 }}>
                Complete <span className="gradient-text">Checkout</span>
            </h1>

            <div className="checkout-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Personal Info */}
                    <section className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.8rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <User size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Personal Information</h3>
                        </div>
                        <div className="checkout-form-grid">
                            <div className={`f-group${formErrors.name ? ' error' : ''}`}>
                                <label>Full Name <span className="req">*</span></label>
                                <input type="text" placeholder="John Doe" value={formData.name}
                                    onChange={e => { setFormData({ ...formData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }} />
                                {formErrors.name && <span className="f-err">⚠ {formErrors.name}</span>}
                            </div>
                            <div className={`f-group${formErrors.email ? ' error' : ''}`}>
                                <label>Email Address <span className="req">*</span></label>
                                <input type="email" placeholder="john@example.com" value={formData.email}
                                    onChange={e => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }} />
                                {formErrors.email && <span className="f-err">⚠ {formErrors.email}</span>}
                            </div>
                            <div className={`f-group${formErrors.phone ? ' error' : ''}`}>
                                <label>Phone Number <span className="req">*</span></label>
                                <input type="tel" placeholder="9876543210" value={formData.phone}
                                    onChange={e => { setFormData({ ...formData, phone: e.target.value }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' }); }} />
                                {formErrors.phone && <span className="f-err">⚠ {formErrors.phone}</span>}
                            </div>
                            <div className={`f-group${formErrors.pincode ? ' error' : ''}`}>
                                <label>Pincode <span className="req">*</span></label>
                                <input type="text" placeholder="500001" maxLength={6} value={formData.pincode}
                                    onChange={e => { setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') }); if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: '' }); }} />
                                {formErrors.pincode && <span className="f-err">⚠ {formErrors.pincode}</span>}
                            </div>
                        </div>
                        <div className={`f-group${formErrors.address ? ' error' : ''}`} style={{ marginTop: '1.2rem' }}>
                            <label>Shipping Address <span className="req">*</span></label>
                            <textarea placeholder="House No., Street name, Landmark, City" style={{ height: '90px', resize: 'vertical' }} value={formData.address}
                                onChange={e => { setFormData({ ...formData, address: e.target.value }); if (formErrors.address) setFormErrors({ ...formErrors, address: '' }); }} />
                            {formErrors.address && <span className="f-err">⚠ {formErrors.address}</span>}
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CreditCard size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Payment Method</h3>
                        </div>
                        <div style={{ border: '2px solid var(--primary)', background: 'rgba(16,185,129,0.03)', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Razorpay Secure</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>UPI, Cards, Wallets & Netbanking</div>
                            </div>
                            <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" style={{ height: '24px', flexShrink: 0 }} />
                        </div>
                    </section>
                </div>

                {/* Order Summary */}
                <aside>
                    <div className="order-summary-box glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Order Summary</h3>
                        {item && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '1.2rem', background: 'rgba(5,150,105,0.05)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(5,150,105,0.15)' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(5,150,105,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                    <PlayCircle size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{item.category}</div>
                                        {item.quantity > 1 && <div style={{ fontSize: '0.78rem', background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>×{item.quantity}</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Basket Total</span>
                                <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Shipping & Delivery</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>FREE</span>
                            </div>
                            {couponState?.valid && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Tag size={13} /> {couponState.code}</span>
                                    <span>-₹{couponState.discountAmount}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Payable Amount</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total}</span>
                            </div>
                        </div>

                        {/* Coupon Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            {couponState?.valid ? (
                                // Applied state
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.25)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={16} color="#10b981" />
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#059669' }}>{couponState.code} — ₹{couponState.discountAmount} off</div>
                                            {couponState.description && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{couponState.description}</div>}
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}><X size={15} /></button>
                                </div>
                            ) : (
                                // Input state
                                <>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text" placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                            style={{ flex: 1, padding: '0.8rem', background: 'var(--surface)', border: `1.5px solid ${couponState?.valid === false ? '#ef4444' : 'var(--border)'}`, borderRadius: '10px', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem', letterSpacing: '1px', fontWeight: 700 }}
                                        />
                                        <button
                                            className="btn-secondary"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', opacity: couponLoading ? 0.7 : 1 }}
                                        >
                                            {couponLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Tag size={14} />}
                                            Apply
                                        </button>
                                    </div>
                                    {couponState?.valid === false && (
                                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            ⚠ {couponState.reason}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <button
                            className="btn-primary" disabled={loading} onClick={makePayment}
                            style={{ width: '100%', justifyContent: 'center', height: '56px', borderRadius: '14px', fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            {loading ? 'Processing...' : 'Complete Secure Payment'} <ArrowRight size={18} />
                        </button>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <ShieldCheck size={15} /> AES-256 Bit Encryption Active
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: '5rem' }}>Loading checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
