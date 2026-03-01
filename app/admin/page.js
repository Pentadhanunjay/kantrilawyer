'use client';
import {
    LayoutDashboard, BookOpen, FileText, Package, Video,
    ShoppingBag, Users, Settings, LogOut, Plus, Edit,
    Trash2, X, Save, Menu, ShieldCheck, TrendingUp,
    PlayCircle, Eye, EyeOff, CheckCircle, Clock, Star, Link as LinkIcon,
    MessageSquare, CalendarClock, AlertTriangle, RefreshCw, Tag, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getData, saveData, getPlatformData, saveItemToDB, deleteItemFromDB } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, adminUpdateUser, adminDeleteUser } from '@/lib/auth';

// ── Sidebar Tab Config ──────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'Main' },
    { id: 'courses', label: 'Courses', icon: <PlayCircle size={18} />, section: 'Content' },
    { id: 'ebooks', label: 'eBooks', icon: <FileText size={18} />, section: 'Content' },
    { id: 'bookstore', label: 'Bookstore', icon: <Package size={18} />, section: 'Content' },
    { id: 'classes', label: 'Live Classes', icon: <Video size={18} />, section: 'Content' },
    { id: 'users', label: 'Users', icon: <Users size={18} />, section: 'System' },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} />, section: 'System' },
    { id: 'enrollments', label: 'Enrollments', icon: <CalendarClock size={18} />, section: 'System' },
    { id: 'coupons', label: 'Coupons', icon: <Tag size={18} />, section: 'System' },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, section: 'System' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, section: 'System' },
];

export default function AdminDashboard() {
    const { user, logout, isLoggedIn, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type, title }
    const [orders, setOrders] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Data
    const [courses, setCourses] = useState([]);
    const [ebooks, setEbooks] = useState([]);
    const [bookstore, setBookstore] = useState([]);
    const [liveClasses, setLiveClasses] = useState([]);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [couponAnalytics, setCouponAnalytics] = useState(null); // { usages, totalDiscountGiven, useCount }
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [couponForm, setCouponForm] = useState({
        code: '', description: '', type: 'percentage', value: '',
        minOrderAmount: 0, maxUsage: '', maxUsagePerUser: 1,
        allowedUniversities: [], allowedSemesters: [], allowedStates: [],
        allowedTypes: [], allowedCourseIds: [], allowedEbookIds: [],
        allowedBookIds: [], allowedClassIds: [],
        expiresAt: '', isActive: true
    });
    const [editingCouponId, setEditingCouponId] = useState(null); // null = create mode, number = edit mode

    // Course specialized fields
    const [curriculum, setCurriculum] = useState([]);
    const [outcomes, setOutcomes] = useState([]);
    const [imageUploading, setImageUploading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editingItem && activeTab === 'courses') {
            setCurriculum(editingItem.curriculum || []);
            setOutcomes(editingItem.outcomes || []);
        }
    }, [editingItem, activeTab]);
    useEffect(() => {
        setMounted(true);
        // Sidebar gap fix: make the parent <main> tag match the sidebar background
        const main = document.querySelector('main');
        if (main) {
            main.style.background = '#0f172a';
            return () => { if (main) main.style.background = 'white'; };
        }
    }, []);

    useEffect(() => {
        if (!mounted || loading || isLoggingOut) return;   // wait for auth to resolve
        if (!isLoggedIn || !isAdmin) {
            router.replace('/');  // Redirect to homepage, NOT login page
        }
    }, [mounted, loading, isLoggedIn, isAdmin, isLoggingOut]);

    useEffect(() => {
        if (!mounted || !isAdmin) return;
        const load = async () => {
            const cRes = await fetch('/api/admin/content?type=courses');
            if (cRes.ok) setCourses(await cRes.json());

            const eRes = await fetch('/api/admin/content?type=ebooks');
            if (eRes.ok) setEbooks(await eRes.json());

            const bRes = await fetch('/api/admin/content?type=books');
            if (bRes.ok) setBookstore(await bRes.json());

            const lRes = await fetch('/api/admin/content?type=classes');
            if (lRes.ok) setLiveClasses(await lRes.json());
            setUsers(await getAllUsers());

            const ordRes = await fetch('/api/admin/orders');
            if (ordRes.ok) setOrders(await ordRes.json());

            const enrRes = await fetch('/api/admin/enrollments');
            if (enrRes.ok) setEnrollments(await enrRes.json());

            const cpnRes = await fetch('/api/admin/coupons');
            if (cpnRes.ok) setCoupons(await cpnRes.json());

            const msgRes = await fetch('/api/admin/messages');
            if (msgRes.ok) setMessages(await msgRes.json());
        };
        load();
    }, [mounted, isAdmin]);

    if (isLoggingOut) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
            <LogOut size={24} style={{ marginRight: 12, color: '#10b981' }} /> Logging out...
        </div>
    );

    if (!mounted || loading || !isAdmin) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        </div>
    );

    // ── Save helpers ────────────────────────────────────────────────────────
    const commitChanges = async (type, data, singleItem = null) => {
        // Update local state for immediate feedback
        if (type === 'courses') setCourses(data);
        if (type === 'ebooks') setEbooks(data);
        if (type === 'books') setBookstore(data);
        if (type === 'classes') setLiveClasses(data);

        // Persistent local sync
        saveData(type, data);

        // Sync specific item to DB if provided
        if (singleItem) {
            try {
                const result = await saveItemToDB(type, singleItem);
                if (!result || result.error) {
                    alert('Warning: Changes saved locally but failed to sync with database: ' + (result?.error || 'Server error'));
                    return false;
                }
            } catch (e) {
                alert('Database sync error: ' + e.message);
                return false;
            }
        }
        return true;
    };

    const getTypeFromTab = () => {
        if (activeTab === 'ebooks') return 'ebooks';
        if (activeTab === 'bookstore') return 'books';
        if (activeTab === 'classes') return 'classes';
        return 'courses';
    };

    const getCurrentData = (type) => {
        if (type === 'ebooks') return ebooks;
        if (type === 'books') return bookstore;
        if (type === 'classes') return liveClasses;
        return courses;
    };

    const toggleVisibility = async (item, type) => {
        const updatedItem = { ...item, isPublished: !item.isPublished };

        // Optimistic local update
        if (type === 'courses') setCourses(courses.map(i => i.id === item.id ? updatedItem : i));
        if (type === 'ebooks') setEbooks(ebooks.map(i => i.id === item.id ? updatedItem : i));
        if (type === 'books') setBookstore(bookstore.map(i => i.id === item.id ? updatedItem : i));
        if (type === 'classes') setLiveClasses(liveClasses.map(i => i.id === item.id ? updatedItem : i));

        saveData(type, getCurrentData(type).map(i => i.id === item.id ? updatedItem : i));

        try {
            await saveItemToDB(type, updatedItem);
        } catch (e) {
            console.error('Visibility toggle failed:', e);
        }
    };

    // ── CRUD handlers ────────────────────────────────────────────────────────
    const handleDelete = (id, type, title) => {
        setDeleteConfirm({ id, type, title: title || 'this item' });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const { id, type } = deleteConfirm;
        setDeleteConfirm(null);

        // Optimistic local update
        const filtered = getCurrentData(type).filter(item => item.id !== id);
        if (type === 'courses') setCourses(filtered);
        if (type === 'ebooks') setEbooks(filtered);
        if (type === 'books') setBookstore(filtered);
        if (type === 'classes') setLiveClasses(filtered);
        saveData(type, filtered);

        // DB sync
        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, action: 'delete', data: { id } })
            });
            const result = await res.json();
            if (!res.ok || result.error) {
                alert('DB delete failed: ' + (result?.error || 'Server error'));
            }
        } catch (e) {
            alert('Delete failed: ' + e.message);
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const type = getTypeFromTab();
        const current = getCurrentData(type);

        const updatedItem = {
            ...editingItem,
            title: fd.get('title')?.trim(),
            description: fd.get('description')?.trim(),
            category: fd.get('category')?.trim(),
            price: Number(fd.get('price')) || 0,
            originalPrice: Number(fd.get('originalPrice')) || 0,
            videoUrl: fd.get('videoUrl')?.trim() || editingItem.videoUrl || '',
            image: fd.get('image')?.trim() || editingItem.image || '',
            fileUrl: fd.get('fileUrl')?.trim() || editingItem.fileUrl || '',
            stock: Number(fd.get('stock')) || editingItem.stock || 0,
            duration: fd.get('duration')?.trim() || editingItem.duration || '',
            date: fd.get('date')?.trim() || editingItem.date || '',
            time: fd.get('time')?.trim() || editingItem.time || '',
            host: fd.get('host')?.trim() || editingItem.host || 'Uday Kantri',
            rating: fd.get('rating')?.trim() || editingItem.rating || '4.9',
            meetLink: fd.get('meetLink')?.trim() || editingItem.meetLink || '',
            status: fd.get('status') || editingItem.status || 'scheduled',
            isPublished: fd.get('isPublished') === 'on',
            university: fd.get('university'),
            semester: fd.get('semester'),
            state: fd.get('state') || editingItem.state || 'Telangana',
            curriculum: activeTab === 'courses' ? curriculum : editingItem.curriculum,
            outcomes: activeTab === 'courses' ? outcomes : editingItem.outcomes,
        };

        const isNew = !current.find(i => i.id === updatedItem.id || (i.id === 0 && updatedItem.id === 0));

        // Set temp ID if new to prevent errors
        if (isNew && updatedItem.id === 0) {
            updatedItem.id = Date.now();
        }

        const nextData = isNew
            ? [...current, updatedItem]
            : current.map(i => i.id === updatedItem.id ? updatedItem : i);

        setEditingItem(null); // Close modal immediately
        await commitChanges(type, nextData, updatedItem);

        // Final refresh to get real ID from DB if it was a new item
        if (isNew) {
            const freshData = await getPlatformData(type);
            if (type === 'courses') setCourses(freshData);
            if (type === 'ebooks') setEbooks(freshData);
            if (type === 'books') setBookstore(freshData);
            if (type === 'classes') setLiveClasses(freshData);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {
            name: fd.get('name')?.trim(),
            role: fd.get('role'),
            phone: fd.get('phone')?.trim()
        };

        const success = await adminUpdateUser(editingUser.id, data);
        if (success) {
            setUsers(await getAllUsers());
            setEditingUser(null);
        } else {
            alert('Failed to update user.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user account permanently from database?')) return;
        const success = await adminDeleteUser(id);
        if (success) {
            setUsers(await getAllUsers());
        } else {
            alert('Failed to delete user.');
        }
    };

    const handleUpdateMessageStatus = async (id, status) => {
        const res = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_status', id, status })
        });
        if (res.ok) {
            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!confirm('Delete this message?')) return;
        const res = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        if (res.ok) {
            setMessages(messages.filter(m => m.id !== id));
        }
    };

    // ── Overview stats ────────────────────────────────────────────────────────
    const totalRevenue = [
        ...courses, ...ebooks, ...bookstore
    ].reduce((sum, item) => sum + (item.price * (item.sales || 0)), 0);

    const stats = [
        { label: 'Total Courses', value: courses.length, color: '#10b981', icon: <PlayCircle size={22} /> },
        { label: 'Total eBooks', value: ebooks.length, color: '#3b82f6', icon: <FileText size={22} /> },
        { label: 'Physical Books', value: bookstore.length, color: '#f59e0b', icon: <Package size={22} /> },
        { label: 'Live Classes', value: liveClasses.length, color: '#8b5cf6', icon: <Video size={22} /> },
        { label: 'Registered Users', value: users.length, color: '#ec4899', icon: <Users size={22} /> },
        { label: 'Support Messages', value: messages.length, color: '#0ea5e9', icon: <MessageSquare size={22} /> },
        { label: 'Revenue (est)', value: `₹${totalRevenue}`, color: '#059669', icon: <TrendingUp size={22} /> },
    ];

    // ── Shared section title bar ──────────────────────────────────────────────
    const titleBar = (label, type, blankItem) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>{label}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>All changes apply immediately to the website</p>
            </div>
            {blankItem && (
                <button onClick={() => setEditingItem(blankItem)} style={btnGreen}>
                    <Plus size={16} /> Add New
                </button>
            )}
        </div>
    );

    // ── Generic content table ─────────────────────────────────────────────────
    const ContentTable = ({ items, type }) => (
        <div style={tableCard}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {[
                            'Title',
                            type === 'courses' ? 'Univ/Sem' : 'Category',
                            type === 'classes' ? 'Date/Time' : 'Price',
                            type === 'classes' ? 'Host' : (type === 'ebooks' ? 'File Status' : (type === 'books' ? 'Stock' : 'Video URL')),
                            'Live',
                            'Actions'
                        ].map(h => (
                            <th key={h} style={h === 'Actions' || h === 'Live' ? { ...th, textAlign: 'right' } : th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No items yet. Click "Add New" to create one.</td></tr>
                    )}
                    {items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={td}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{item.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.description?.slice(0, 60)}...</div>
                            </td>
                            <td style={td}>
                                {type === 'courses' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ ...catBadge, background: item.state === 'Andhra Pradesh' ? '#fdf4ff' : '#f0fdf4', color: item.state === 'Andhra Pradesh' ? '#7c3aed' : '#059669', fontSize: '0.7rem' }}>{item.state || 'TG'}</span>
                                        <span style={{ ...catBadge, background: '#ecfdf5', color: '#059669' }}>{item.university || 'General'}</span>
                                        <span style={{ ...catBadge, background: '#eff6ff', color: '#1d4ed8' }}>{item.semester || 'All Sem'}</span>
                                    </div>
                                ) : (
                                    <span style={catBadge}>{item.category}</span>
                                )}
                            </td>
                            <td style={td}>
                                {type === 'classes'
                                    ? <><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.date}</div><div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.time}</div></>
                                    : <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{item.price}</span>
                                }
                            </td>
                            <td style={td}>
                                {type === 'classes' ? (
                                    <span style={{ fontSize: '0.85rem' }}>{item.host || 'Uday Kantri'}</span>
                                ) : type === 'ebooks' ? (
                                    item.fileUrl ? (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircle size={13} /> PDF Set
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⚠ No File</span>
                                    )
                                ) : type === 'books' ? (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: (item.stock || 0) < 10 ? '#ef4444' : '#0f172a' }}>
                                        {item.stock || 0} units
                                    </span>
                                ) : (
                                    item.videoUrl ? (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircle size={13} /> Video set
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⚠ No video</span>
                                    )
                                )}
                            </td>
                            <td style={{ ...td, textAlign: 'right' }}>
                                <button
                                    onClick={() => toggleVisibility(item, type)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: item.isPublished !== false ? '#10b981' : '#94a3b8',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        transition: '0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    title={item.isPublished !== false ? 'Visible on website' : 'Hidden from website'}
                                >
                                    {item.isPublished !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                    <span style={{ width: '25px', textAlign: 'left' }}>{item.isPublished !== false ? 'ON' : 'OFF'}</span>
                                </button>
                            </td>
                            <td style={{ ...td, textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditingItem(item)} style={btnEdit}><Edit size={15} /></button>
                                    <button onClick={() => handleDelete(item.id, type, item.title)} style={btnDel}><Trash2 size={15} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ── Edit form fields per content type ─────────────────────────────────────
    const renderFields = () => {
        const isClass = activeTab === 'classes';
        const isCourse = activeTab === 'courses';
        return (
            <>
                <FormField label="Title *" name="title" defaultValue={editingItem.title} required />
                <FormField label="Description *" name="description" defaultValue={editingItem.description} type="textarea" required />

                {!isClass && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <FormField label="Price (₹) *" name="price" defaultValue={editingItem.price} type="number" />
                        <FormField label="Original Price" name="originalPrice" defaultValue={editingItem.originalPrice} type="number" />
                        <FormField label="Rating" name="rating" defaultValue={editingItem.rating || '4.9'} />
                    </div>
                )}

                <FormField label="Category *" name="category" defaultValue={editingItem.category} required />

                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                        <input
                            type="checkbox"
                            name="isPublished"
                            defaultChecked={editingItem.isPublished !== false}
                            style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Visible on Main Website</span>
                    </label>
                    <p style={{ margin: '5px 0 0 28px', fontSize: '0.75rem', color: '#64748b' }}>
                        If disabled, this item will be hidden from the public library but stay in your admin panel.
                    </p>
                </div>

                {activeTab === 'ebooks' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>University / College</label>
                            <select name="university" defaultValue={editingItem.university || ''} style={inputStyle}>
                                <option value="">-- Not Specified --</option>
                                <optgroup label="Telangana (TG)">
                                    <option>Osmania University</option>
                                    <option>Kakatiya University</option>
                                    <option>Palamuru University</option>
                                    <option>Satavahana University</option>
                                    <option>Telangana University</option>
                                    <option>Mahatma Gandhi University</option>
                                </optgroup>
                                <optgroup label="Andhra Pradesh (AP)">
                                    <option>Andhra University</option>
                                    <option>Adikavi Nannaya University</option>
                                    <option>Damodaram Sanjivayya NLU</option>
                                    <option>Krishna University</option>
                                    <option>Sri Krishnadevaraya University</option>
                                    <option>Sri Venkateswara University</option>
                                    <option>Yogi Vemana University</option>
                                    <option>Acharya Nagarjuna University</option>
                                    <option>Andhra Kesari University</option>
                                    <option>KL University</option>
                                    <option>Rayalaseema University</option>
                                    <option>Sri Padmavati Mahila</option>
                                    <option>Vikrama Simhapuri University</option>
                                </optgroup>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Semester</label>
                            <select name="semester" defaultValue={editingItem.semester || ''} style={inputStyle}>
                                <option value="">-- Not Specified --</option>
                                <option>Sem - I</option>
                                <option>Sem - II</option>
                                <option>Sem - III</option>
                                <option>Sem - IV</option>
                                <option>Sem - V</option>
                                <option>Sem - VI</option>
                            </select>
                        </div>
                    </div>
                )}

                {isCourse && (
                    <>
                        {/* State */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>State *</label>
                            <select name="state" defaultValue={editingItem.state || 'Telangana'} style={inputStyle}>
                                <option value="Telangana">Telangana</option>
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>University *</label>
                                <select name="university" defaultValue={editingItem.university || 'Osmania University'} style={inputStyle}>
                                    <option value="Osmania University">Osmania University</option>
                                    <option value="Kakatiya University">Kakatiya University</option>
                                    <option value="Telangana University">Telangana University</option>
                                    <option value="Mahatma Gandhi University">Mahatma Gandhi University</option>
                                    <option value="Andhra University">Andhra University</option>
                                    <option value="Sri Venkateswara University">Sri Venkateswara University</option>
                                    <option value="Acharya Nagarjuna University">Acharya Nagarjuna University</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Semester *</label>
                                <select name="semester" defaultValue={editingItem.semester || 'Sem - I'} style={inputStyle}>
                                    <option value="Sem - I">Sem - I</option>
                                    <option value="Sem - II">Sem - II</option>
                                    <option value="Sem - III">Sem - III</option>
                                    <option value="Sem - IV">Sem - IV</option>
                                    <option value="Sem - V">Sem - V</option>
                                    <option value="Sem - VI">Sem - VI</option>
                                </select>
                            </div>
                        </div>
                        <FormField label="Duration (e.g. 7.5 Hours)" name="duration" defaultValue={editingItem.duration} />
                        <FormField
                            label="🎬 Preview Video URL (YouTube / Vimeo / MP4) — 30s preview shown before purchase"
                            name="videoUrl"
                            defaultValue={editingItem.videoUrl}
                            placeholder="https://www.youtube.com/watch?v=..."
                            hint="Paste the full YouTube or video URL. First 30 seconds plays as preview."
                        />

                        {/* Outcomes Editor */}
                        <div style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0', marginTop: '1rem' }}>
                            <label style={{ ...labelStyle, fontSize: '0.9rem', color: '#0f172a' }}>🎯 What you will learn (Outcomes)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                {outcomes.map((ot, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            style={inputStyle}
                                            value={ot}
                                            placeholder="e.g. Master the basics of Constitutional Law"
                                            onChange={(e) => {
                                                const newOut = [...outcomes];
                                                newOut[idx] = e.target.value;
                                                setOutcomes(newOut);
                                            }}
                                        />
                                        <button type="button" onClick={() => setOutcomes(outcomes.filter((_, i) => i !== idx))} style={btnDel}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setOutcomes([...outcomes, ''])} style={{ ...btnEdit, justifyContent: 'center', width: '100%', padding: '0.6rem', background: '#f0fdf4', color: '#16a34a' }}>
                                    <Plus size={14} /> Add Outcome
                                </button>
                            </div>
                        </div>

                        {/* ── Curriculum Builder (Udemy-style) ── */}
                        {(() => {
                            const totalSections = curriculum.length;
                            const totalLectures = curriculum.reduce((s, m) => s + (m.lessons?.length || 0), 0);

                            const updateSection = (si, key, val) => {
                                const c = curriculum.map((m, i) => i === si ? { ...m, [key]: val } : m);
                                setCurriculum(c);
                            };
                            const removeSection = (si) => setCurriculum(curriculum.filter((_, i) => i !== si));
                            const addSection = () => setCurriculum([...curriculum, { title: 'New Section', lessons: [] }]);

                            const updateLesson = (si, li, key, val) => {
                                const c = curriculum.map((m, i) => {
                                    if (i !== si) return m;
                                    const lessons = m.lessons.map((l, j) => j === li ? { ...l, [key]: val } : l);
                                    return { ...m, lessons };
                                });
                                setCurriculum(c);
                            };
                            const addLesson = (si) => {
                                const c = curriculum.map((m, i) => i === si
                                    ? { ...m, lessons: [...m.lessons, { title: '', videoUrl: '', duration: '', preview: false }] }
                                    : m);
                                setCurriculum(c);
                            };
                            const removeLesson = (si, li) => {
                                const c = curriculum.map((m, i) => i === si
                                    ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) }
                                    : m);
                                setCurriculum(c);
                            };

                            return (
                                <div style={{ border: '1.5px solid #d1d5db', borderRadius: '12px', overflow: 'hidden', marginTop: '1.5rem' }}>
                                    {/* Header */}
                                    <div style={{ background: '#f9fafb', padding: '0.9rem 1.2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>📚 Course Sections &amp; Lectures</span>
                                        <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
                                            {totalSections} section{totalSections !== 1 ? 's' : ''} • {totalLectures} lecture{totalLectures !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Sections */}
                                    <div style={{ background: '#fff', padding: '1rem' }}>
                                        {curriculum.length === 0 && (
                                            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem 0' }}>No sections yet. Click "+ Add Section" to start.</p>
                                        )}
                                        {curriculum.map((mod, si) => (
                                            <div key={si} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '1rem', overflow: 'hidden' }}>
                                                {/* Section Title Row */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: mod.lessons?.length > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                                    <span style={{ color: '#6b7280', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>∧</span>
                                                    <input
                                                        value={mod.title}
                                                        onChange={e => updateSection(si, 'title', e.target.value)}
                                                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.92rem', fontWeight: 700, color: '#111827', fontFamily: 'inherit', outline: 'none' }}
                                                        placeholder="Section title"
                                                    />
                                                    <button type="button" onClick={() => removeSection(si)} style={{ ...btnDel, padding: '4px', background: 'transparent', color: '#9ca3af' }}><Trash2 size={14} /></button>
                                                </div>

                                                {/* Lessons */}
                                                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {(mod.lessons || []).map((ls, li) => (
                                                        <div key={li} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', background: '#fff', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                            {/* Lecture number */}
                                                            <div style={{ width: '22px', height: '22px', background: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, marginTop: '7px' }}>{li + 1}</div>

                                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                                                {/* Title */}
                                                                <input
                                                                    value={ls.title}
                                                                    onChange={e => updateLesson(si, li, 'title', e.target.value)}
                                                                    placeholder="Lecture title"
                                                                    style={{ ...inputStyle, padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
                                                                />
                                                                {/* Video URL */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '0 0.8rem', background: '#fafafa' }}>
                                                                    <PlayCircle size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                                                    <input
                                                                        value={ls.videoUrl || ''}
                                                                        onChange={e => updateLesson(si, li, 'videoUrl', e.target.value)}
                                                                        placeholder="Video URL (YouTube, Vimeo, or direct .mp4 link)"
                                                                        style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.55rem 0', fontSize: '0.83rem', fontFamily: 'inherit', outline: 'none', color: '#374151' }}
                                                                    />
                                                                </div>
                                                                {/* Duration + Free Preview */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <input
                                                                        value={ls.duration || ''}
                                                                        onChange={e => updateLesson(si, li, 'duration', e.target.value)}
                                                                        placeholder="Duration (e.g. 12:34)"
                                                                        style={{ ...inputStyle, padding: '0.45rem 0.8rem', fontSize: '0.8rem', width: '140px' }}
                                                                    />
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#374151', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!ls.preview}
                                                                            onChange={e => updateLesson(si, li, 'preview', e.target.checked)}
                                                                            style={{ width: '15px', height: '15px', accentColor: '#2563eb', cursor: 'pointer' }}
                                                                        />
                                                                        Free Preview
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <button type="button" onClick={() => removeLesson(si, li)} style={{ ...btnDel, padding: '4px', background: 'transparent', color: '#9ca3af', marginTop: '5px' }}><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}

                                                    {/* + Add Lecture */}
                                                    <button type="button" onClick={() => addLesson(si)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', border: '1.5px dashed #3b82f6', borderRadius: '8px', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                        <Plus size={13} /> Add Lecture
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* + Add Section */}
                                        <button type="button" onClick={addSection} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0', border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            <Plus size={14} /> Add Section
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}

                {activeTab === 'ebooks' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>📄 eBook File URL (Secure PDF Link)</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                name="fileUrl"
                                type="text"
                                defaultValue={editingItem.fileUrl}
                                placeholder="https://storage.provider.com/ebook.pdf"
                                style={{ ...inputStyle, flex: 1 }}
                            />
                            {/* Hidden file input for eBooks */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.zip"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setFileUploading(true);
                                    try {
                                        const fd = new FormData();
                                        fd.append('file', file);
                                        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                                        const data = await res.json();
                                        if (!res.ok) { alert(data.error || 'Upload failed'); return; }

                                        // Update the input value
                                        const urlInput = fileInputRef.current?.parentElement?.querySelector('input[name="fileUrl"]');
                                        if (urlInput) { urlInput.value = data.url; }
                                        alert('✅ File uploaded successfully!');
                                    } catch (err) {
                                        alert('Upload error: ' + err.message);
                                    } finally {
                                        setFileUploading(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={fileUploading}
                                style={{
                                    padding: '0.75rem 1rem', background: fileUploading ? '#e2e8f0' : '#f0f9ff',
                                    border: '1.5px solid #0ea5e9', borderRadius: '10px',
                                    color: '#0ea5e9', fontWeight: 700, cursor: fileUploading ? 'wait' : 'pointer',
                                    whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                                }}
                            >
                                {fileUploading ? '⏳ Uploading...' : '📁 Upload PDF'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                            The protected link provided to users after purchase. Max size: 650MB.
                        </p>
                    </div>
                )}

                {activeTab === 'bookstore' && (
                    <FormField
                        label="📦 Stock Units Available"
                        name="stock"
                        defaultValue={editingItem.stock || 100}
                        type="number"
                    />
                )}

                {!isClass && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Thumbnail Image</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                name="image"
                                type="text"
                                defaultValue={editingItem.image}
                                placeholder="/assets/images/course_law.png or paste URL"
                                style={{ ...inputStyle, flex: 1 }}
                                onChange={e => {
                                    // live preview
                                    const preview = document.getElementById('img-preview-thumb');
                                    if (preview) preview.src = e.target.value;
                                }}
                            />
                            {/* Hidden file input */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setImageUploading(true);
                                    try {
                                        const fd = new FormData();
                                        fd.append('file', file);
                                        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                                        const data = await res.json();
                                        if (!res.ok) { alert(data.error || 'Upload failed'); return; }
                                        // Fill the URL input and update preview
                                        const urlInput = imageInputRef.current?.closest('div')?.querySelector('input[name="image"]');
                                        if (urlInput) { urlInput.value = data.url; }
                                        const preview = document.getElementById('img-preview-thumb');
                                        if (preview) preview.src = data.url;
                                    } catch (err) {
                                        alert('Upload error: ' + err.message);
                                    } finally {
                                        setImageUploading(false);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={imageUploading}
                                style={{
                                    padding: '0.75rem 1rem', background: imageUploading ? '#e2e8f0' : '#f0fdf4',
                                    border: '1.5px solid #059669', borderRadius: '10px',
                                    color: '#059669', fontWeight: 700, cursor: imageUploading ? 'wait' : 'pointer',
                                    whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                                }}
                            >
                                {imageUploading ? '⏳ Uploading...' : '📁 Upload Image'}
                            </button>
                        </div>
                        {/* Preview */}
                        {editingItem.image && (
                            <img
                                id="img-preview-thumb"
                                src={editingItem.image}
                                alt="thumbnail preview"
                                onError={e => { e.target.style.display = 'none'; }}
                                style={{ marginTop: '10px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                        )}
                        {!editingItem.image && (
                            <img id="img-preview-thumb" src="" alt="" style={{ display: 'none', marginTop: '10px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                        )}
                    </div>
                )}

                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="isPublished" defaultChecked={editingItem.isPublished !== false} id="isPublished" />
                    <label htmlFor="isPublished" style={{ ...labelStyle, marginBottom: 0 }}>Product is Live/Published</label>
                </div>

                {isClass && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <FormField label="Date *" name="date" defaultValue={editingItem.date} placeholder="Oct 25, 2026" required />
                            <FormField label="Start Time *" name="time" defaultValue={editingItem.time} placeholder="7:00 PM IST" required />
                            <FormField label="Duration" name="duration" defaultValue={editingItem.duration} placeholder="90 mins" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <FormField label="Price (₹) — 0 for Free" name="price" defaultValue={editingItem.price ?? 0} type="number" required />
                            <FormField label="Host Name" name="host" defaultValue={editingItem.host || 'Uday Kantri'} />
                        </div>
                        <FormField
                            label="🔗 Google Meet Link (only paid users see this)"
                            name="meetLink"
                            defaultValue={editingItem.meetLink}
                            placeholder="https://meet.google.com/abc-defg-hij"
                            hint="Paste the full Google Meet URL. Only users who have paid will see this link."
                        />
                        <div>
                            <label style={labelStyle}>Class Status</label>
                            <select name="status" defaultValue={editingItem.status || 'scheduled'}
                                style={{ width: '100%', padding: '0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', background: '#fafafa' }}>
                                <option value="scheduled">📅 Scheduled</option>
                                <option value="live">🔴 Live Now</option>
                                <option value="completed">✅ Completed</option>
                                <option value="cancelled">❌ Cancelled</option>
                            </select>
                        </div>
                    </>
                )}
            </>
        );
    };

    const sections = ['Main', 'Content', 'System'];

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 90px)', background: '#0f172a', fontFamily: "'Inter', sans-serif", alignItems: 'stretch' }}>

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <aside style={{
                width: sidebarOpen ? '260px' : '0px', flexShrink: 0,
                background: '#0f172a',
                display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease',
                overflow: 'hidden', position: 'sticky', top: 0,
                height: 'calc(100vh - 90px)',
                alignSelf: 'stretch',
            }}>
                {/* Brand */}
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>
                        KANTRI<span style={{ color: '#10b981' }}> ADMIN</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Content Management Panel</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0.75rem' }}>
                    {sections.map(section => (
                        <div key={section} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 0.5rem', marginBottom: '0.5rem' }}>{section}</div>
                            {TABS.filter(t => t.section === section).map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    background: activeTab === tab.id ? 'rgba(16,185,129,0.12)' : 'transparent',
                                    border: '0',
                                    borderLeft: activeTab === tab.id ? '3px solid #10b981' : '3px solid transparent',
                                    color: activeTab === tab.id ? '#10b981' : '#64748b',
                                    fontWeight: activeTab === tab.id ? 700 : 500,
                                    fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
                                    borderRadius: '0 8px 8px 0', fontFamily: 'inherit',
                                    marginBottom: '2px', whiteSpace: 'nowrap', transition: '0.15s'
                                }}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem 0.5rem', marginBottom: '0.8rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Administrator</div>
                        </div>
                    </div>
                    <button onClick={() => {
                        setIsLoggingOut(true);
                        logout();
                        router.push('/');
                    }} style={{ width: '100%', padding: '0.65rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ──────────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#f8fafc' }}>
                {/* Top Bar */}
                <header style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1rem', flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                        <Menu size={20} />
                    </button>
                    <div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{TABS.find(t => t.id === activeTab)?.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', marginLeft: '8px' }}>/ Admin Panel</span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a href="/" target="_blank" style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Eye size={14} /> View Website
                        </a>
                    </div>
                </header>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <AnimatePresence mode="wait">

                        {/* ── OVERVIEW ── */}
                        {activeTab === 'overview' && (
                            <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>Dashboard Overview</h2>
                                <p style={{ color: '#64748b', marginBottom: '2rem' }}>All changes made here reflect instantly on the main website.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2.5rem' }}>
                                    {stats.map((s, i) => (
                                        <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                                            <div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{s.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick actions */}
                                <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>Quick Actions</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    {[
                                        { label: 'Add Course', tab: 'courses', color: '#10b981' },
                                        { label: 'Add eBook', tab: 'ebooks', color: '#3b82f6' },
                                        { label: 'Add Book', tab: 'bookstore', color: '#f59e0b' },
                                        { label: 'View Messages', tab: 'messages', color: '#0ea5e9' },
                                        { label: 'Add Live Class', tab: 'classes', color: '#8b5cf6' },
                                    ].map(a => (
                                        <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{ padding: '1.2rem', background: a.color + '12', border: `1.5px solid ${a.color}30`, borderRadius: '12px', color: a.color, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            + {a.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── COURSES ── */}
                        {activeTab === 'courses' && (
                            <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {titleBar(`Courses (${courses.length})`, 'courses', { id: 0, title: '', price: 0, originalPrice: 0, category: 'LLB 3 YDC OU', description: '', image: '/assets/images/course_law.png', videoUrl: '', duration: '', rating: '4.9', university: 'Osmania University', semester: 'Sem - I', state: 'Telangana' })}
                                <ContentTable items={courses} type="courses" />
                            </motion.div>
                        )}

                        {/* ── EBOOKS ── */}
                        {activeTab === 'ebooks' && (
                            <motion.div key="ebooks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {titleBar(`eBooks (${ebooks.length})`, 'ebooks', { id: 0, title: '', price: 0, originalPrice: 0, category: 'LLB TG-STATE', description: '', image: '/assets/images/ebook_law.png', rating: '4.9' })}
                                <ContentTable items={ebooks} type="ebooks" />
                            </motion.div>
                        )}

                        {/* ── BOOKSTORE ── */}
                        {activeTab === 'bookstore' && (
                            <motion.div key="bookstore" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {titleBar(`Physical Books (${bookstore.length})`, 'books', { id: 0, title: '', price: 0, originalPrice: 0, category: 'PHYSICAL BOOK', description: '', image: '/assets/images/book_llb.png', rating: '4.8' })}
                                <ContentTable items={bookstore} type="books" />
                            </motion.div>
                        )}

                        {/* ── LIVE CLASSES ── */}
                        {activeTab === 'classes' && (
                            <motion.div key="classes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {titleBar(`Live Classes (${liveClasses.length})`, 'classes', { id: 0, title: '', date: '', time: '', host: 'Uday Kantri', category: 'LIVE', description: '' })}
                                <ContentTable items={liveClasses} type="classes" />
                            </motion.div>
                        )}

                        {/* ── USERS ── */}
                        {activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>Users ({users.length})</h2>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Manage registered users and their roles</p>
                                    </div>
                                </div>
                                <div style={tableCard}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                {['User', 'Email', 'Role', 'Phone', 'Joined', 'Actions'].map(h => (
                                                    <th key={h} style={th}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 && (
                                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No users registered yet.</td></tr>
                                            )}
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? '#10b981' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                                                                {u.name?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={td}><span style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</span></td>
                                                    <td style={td}>
                                                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: u.role === 'admin' ? '#10b98120' : '#3b82f620', color: u.role === 'admin' ? '#059669' : '#2563eb' }}>
                                                            {u.role?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={td}><span style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</span></td>
                                                    <td style={td}><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</span></td>
                                                    <td style={{ ...td, textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => setEditingUser(u)} style={btnEdit}><Edit size={15} /></button>
                                                            {u.role !== 'admin' && (
                                                                <button onClick={() => handleDeleteUser(u.id)} style={btnDel}><Trash2 size={15} /></button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* ── ORDERS ── */}
                        {activeTab === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Sales & Orders</h2>
                                        <p style={{ color: '#64748b' }}>Track all digital and physical transactions from PostgreSQL.</p>
                                    </div>
                                    <button onClick={async () => {
                                        const ordRes = await fetch('/api/admin/orders');
                                        if (ordRes.ok) setOrders(await ordRes.json());
                                    }} style={{ ...btnEdit, padding: '8px 16px', fontSize: '0.8rem' }}>Refresh Orders</button>
                                </div>

                                <div style={tableCard}>
                                    <table style={table}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                {['Customer', 'Product', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                                                    <th key={h} style={th}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 && (
                                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No orders found in database.</td></tr>
                                            )}
                                            {orders.map(o => (
                                                <tr key={o.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={td}>
                                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{o.userName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.userEmail}</div>
                                                    </td>
                                                    <td style={{ ...td, fontWeight: 700 }}>{o.itemTitle}</td>
                                                    <td style={td}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>{o.type}</span>
                                                    </td>
                                                    <td style={{ ...td, fontWeight: 900, color: '#10b981' }}>₹{o.amount}</td>
                                                    <td style={{ ...td, color: '#64748b', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    <td style={td}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: o.status === 'completed' || o.status === 'confirmed' ? '#059669' : '#b45309' }}>
                                                            {o.status?.toUpperCase() || 'PAID'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* ── ENROLLMENTS ── */}
                        {activeTab === 'enrollments' && (() => {
                            const now = new Date();
                            const activeCount = enrollments.filter(e => e.expiryDate && new Date(e.expiryDate) > now).length;
                            const expiredCount = enrollments.filter(e => e.expiryDate && new Date(e.expiryDate) <= now).length;

                            const handleExtend = async (purchaseId) => {
                                const res = await fetch('/api/admin/enrollments', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ purchaseId, months: 6 })
                                });
                                if (res.ok) {
                                    const enrRes = await fetch('/api/admin/enrollments');
                                    if (enrRes.ok) setEnrollments(await enrRes.json());
                                }
                            };

                            return (
                                <motion.div key="enrollments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>Enrollments ({enrollments.length})</h2>
                                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage student course access &amp; expiry dates (6-month system)</p>
                                        </div>
                                        <button onClick={async () => {
                                            const res = await fetch('/api/admin/enrollments');
                                            if (res.ok) setEnrollments(await res.json());
                                        }} style={{ ...btnEdit, padding: '8px 16px', fontSize: '0.8rem' }}>
                                            <RefreshCw size={14} /> Refresh
                                        </button>
                                    </div>

                                    {/* Summary Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        {[
                                            { label: 'Total Enrollments', value: enrollments.length, color: '#3b82f6', icon: <CalendarClock size={20} /> },
                                            { label: 'Active Access', value: activeCount, color: '#10b981', icon: <CheckCircle size={20} /> },
                                            { label: 'Expired Access', value: expiredCount, color: '#ef4444', icon: <AlertTriangle size={20} /> },
                                        ].map((s, i) => (
                                            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '1.2rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                                                <div>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Table */}
                                    <div style={tableCard}>
                                        <table style={table}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                    {['Student', 'Course', 'University / Sem', 'Purchased', 'Expires On', 'Status', 'Actions'].map(h => (
                                                        <th key={h} style={th}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {enrollments.length === 0 && (
                                                    <tr><td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No course enrollments found.</td></tr>
                                                )}
                                                {enrollments.map(e => {
                                                    const expiry = e.expiryDate ? new Date(e.expiryDate) : null;
                                                    const isExpired = expiry && expiry < now;
                                                    const isActive = expiry && expiry >= now;
                                                    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                                                    return (
                                                        <tr key={e.id} style={{ borderBottom: '1px solid #f8fafc', background: isExpired ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                                                            {/* Student */}
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#2563eb', flexShrink: 0 }}>
                                                                        {e.user?.name?.[0]?.toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{e.user?.name || '—'}</div>
                                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{e.user?.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {/* Course */}
                                                            <td style={td}>
                                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {e.course?.title || 'Deleted Course'}
                                                                </div>
                                                            </td>
                                                            {/* Univ / Sem */}
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <span style={{ ...catBadge, background: '#ecfdf5', color: '#059669', fontSize: '0.7rem' }}>{e.course?.university || 'General'}</span>
                                                                    <span style={{ ...catBadge, background: '#eff6ff', color: '#1d4ed8', fontSize: '0.7rem' }}>{e.course?.semester || '—'}</span>
                                                                </div>
                                                            </td>
                                                            {/* Purchased */}
                                                            <td style={{ ...td, fontSize: '0.8rem', color: '#64748b' }}>{formatDate(e.createdAt)}</td>
                                                            {/* Expires On */}
                                                            <td style={{ ...td, fontSize: '0.8rem', fontWeight: 700, color: isExpired ? '#ef4444' : isActive ? '#059669' : '#94a3b8' }}>
                                                                {expiry ? formatDate(expiry) : 'No Expiry'}
                                                            </td>
                                                            {/* Status Badge */}
                                                            <td style={td}>
                                                                {isExpired ? (
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#fef2f2', color: '#ef4444' }}>
                                                                        <AlertTriangle size={11} /> EXPIRED
                                                                    </span>
                                                                ) : isActive ? (
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#ecfdf5', color: '#059669' }}>
                                                                        <CheckCircle size={11} /> ACTIVE
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', color: '#64748b' }}>NO EXPIRY</span>
                                                                )}
                                                            </td>
                                                            {/* Actions */}
                                                            <td style={{ ...td, textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => handleExtend(e.id)}
                                                                    title="Extend access by 6 months"
                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: isExpired ? '#fef3c7' : '#eff6ff', color: isExpired ? '#d97706' : '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', fontFamily: 'inherit' }}
                                                                >
                                                                    <RefreshCw size={12} /> +6mo
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            );
                        })()}

                        {/* ── COUPONS ── */}
                        {activeTab === 'coupons' && (() => {
                            const now = new Date();

                            const BLANK_FORM = {
                                code: '', description: '', type: 'percentage', value: '',
                                minOrderAmount: 0, maxUsage: '', maxUsagePerUser: 1,
                                allowedUniversities: [], allowedSemesters: [], allowedStates: [],
                                allowedTypes: [], allowedCourseIds: [], allowedEbookIds: [],
                                allowedBookIds: [], allowedClassIds: [],
                                expiresAt: '', isActive: true
                            };

                            const handleCreateCoupon = async (e) => {
                                e.preventDefault();
                                const payload = {
                                    ...couponForm,
                                    value: Number(couponForm.value),
                                    minOrderAmount: Number(couponForm.minOrderAmount) || 0,
                                    maxUsage: couponForm.maxUsage ? Number(couponForm.maxUsage) : null,
                                    maxUsagePerUser: Number(couponForm.maxUsagePerUser) || 1,
                                };

                                const isEdit = editingCouponId !== null;
                                const res = await fetch('/api/admin/coupons', {
                                    method: isEdit ? 'PATCH' : 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(isEdit ? { id: editingCouponId, ...payload } : payload)
                                });
                                if (res.ok) {
                                    const cpnRes = await fetch('/api/admin/coupons');
                                    if (cpnRes.ok) setCoupons(await cpnRes.json());
                                    setShowCouponForm(false);
                                    setEditingCouponId(null);
                                    setCouponForm(BLANK_FORM);
                                } else {
                                    const err = await res.json();
                                    alert(err.errors?.join('\n') || err.error || `Failed to ${isEdit ? 'update' : 'create'} coupon`);
                                }
                            };

                            const handleEditCoupon = (cp) => {
                                // Parse stored JSON restriction arrays back to JS arrays
                                const parseArr = (str) => { try { return str ? JSON.parse(str) : []; } catch { return []; } };
                                setCouponForm({
                                    code: cp.code,
                                    description: cp.description || '',
                                    type: cp.type,
                                    value: String(cp.value),
                                    minOrderAmount: cp.minOrderAmount || 0,
                                    maxUsage: cp.maxUsage != null ? String(cp.maxUsage) : '',
                                    maxUsagePerUser: cp.maxUsagePerUser || 1,
                                    allowedUniversities: parseArr(cp.allowedUniversities),
                                    allowedSemesters: parseArr(cp.allowedSemesters),
                                    allowedStates: parseArr(cp.allowedStates),
                                    allowedTypes: parseArr(cp.allowedTypes),
                                    allowedCourseIds: parseArr(cp.allowedCourseIds),
                                    allowedEbookIds: parseArr(cp.allowedEbookIds),
                                    allowedBookIds: parseArr(cp.allowedBookIds),
                                    allowedClassIds: parseArr(cp.allowedClassIds),
                                    expiresAt: cp.expiresAt ? new Date(cp.expiresAt).toISOString().split('T')[0] : '',
                                    isActive: cp.isActive,
                                });
                                setEditingCouponId(cp.id);
                                setShowCouponForm(true);
                            };

                            const handleToggleActive = async (id, current) => {
                                await fetch('/api/admin/coupons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive: !current }) });
                                const cpnRes = await fetch('/api/admin/coupons');
                                if (cpnRes.ok) setCoupons(await cpnRes.json());
                            };

                            const handleDeleteCoupon = async (id) => {
                                if (!confirm('Delete this coupon? All usage history will also be deleted.')) return;
                                await fetch('/api/admin/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                                const cpnRes = await fetch('/api/admin/coupons');
                                if (cpnRes.ok) setCoupons(await cpnRes.json());
                                if (couponAnalytics?.couponId === id) setCouponAnalytics(null);
                            };

                            const handleViewAnalytics = async (id) => {
                                const res = await fetch(`/api/admin/coupons?analytics=${id}`);
                                if (res.ok) setCouponAnalytics({ ...(await res.json()), couponId: id });
                            };

                            const multiToggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

                            const COLLEGES_TG = [
                                'Osmania University', 'Kakatiya University', 'Telangana University',
                                'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
                                'Mahatma Gandhi University', 'Palamuru University', 'Satavahana University',
                                'Potti Sriramulu Telugu University', 'Dr. B.R. Ambedkar Open University',
                                'University of Hyderabad', 'Nizam College (OU)', 'Maulana Azad National Urdu University'
                            ];
                            const COLLEGES_AP = [
                                'Andhra University', 'Sri Venkateswara University', 'Acharya Nagarjuna University',
                                'Krishna University', 'Yogi Vemana University',
                                'JNTU Kakinada (JNTUK)', 'JNTU Anantapur (JNTUA)',
                                'Adikavi Nannaya University', 'Vikrama Simhapuri University',
                                'Dr. B.R. Ambedkar University Srikakulam', 'RGUKT AP (IIIT Nuzvid)',
                                'Rayalaseema University', 'Sri Padmavati Mahila Visvavidyalayam'
                            ];
                            const UNIVS = [...COLLEGES_TG, ...COLLEGES_AP];
                            const SEMS = ['Sem - I', 'Sem - II', 'Sem - III', 'Sem - IV', 'Sem - V', 'Sem - VI'];

                            return (
                                <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem' }}>Coupons ({coupons.length})</h2>
                                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Create discount codes with college, semester &amp; LMS restrictions</p>
                                        </div>
                                        <button onClick={() => {
                                            setShowCouponForm(v => {
                                                if (v) { setEditingCouponId(null); setCouponForm(BLANK_FORM ?? { code: '', description: '', type: 'percentage', value: '', minOrderAmount: 0, maxUsage: '', maxUsagePerUser: 1, allowedUniversities: [], allowedSemesters: [], allowedStates: [], expiresAt: '', isActive: true }); }
                                                return !v;
                                            });
                                        }} style={{ ...btnGreen, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={16} /> {showCouponForm ? 'Cancel' : 'New Coupon'}
                                        </button>
                                    </div>

                                    {/* Create Form */}
                                    {showCouponForm && (
                                        <form onSubmit={handleCreateCoupon} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: `1px solid ${editingCouponId ? '#dbeafe' : '#e2e8f0'}`, marginBottom: '1.5rem', boxShadow: editingCouponId ? '0 0 0 3px rgba(59,130,246,0.06)' : 'none' }}>
                                            <h3 style={{ margin: '0 0 1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {editingCouponId ? <><Edit size={18} color="#3b82f6" /> Edit Coupon — {couponForm.code}</> : 'Create New Coupon'}
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <label style={labelStyle}>Code *</label>
                                                    <input required style={inputStyle} placeholder="SAVE20" value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Type *</label>
                                                    <select required style={inputStyle} value={couponForm.type} onChange={e => setCouponForm(f => ({ ...f, type: e.target.value }))}>
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount (₹)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Value * ({couponForm.type === 'percentage' ? '%' : '₹'})</label>
                                                    <input required type="number" min="0" max={couponForm.type === 'percentage' ? 100 : undefined} style={inputStyle} placeholder={couponForm.type === 'percentage' ? '20' : '200'} value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))} />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={labelStyle}>Description (shown to users)</label>
                                                <input style={inputStyle} placeholder="20% off for OU Sem-I students" value={couponForm.description} onChange={e => setCouponForm(f => ({ ...f, description: e.target.value }))} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                                                <div>
                                                    <label style={labelStyle}>Min Order (₹)</label>
                                                    <input type="number" style={inputStyle} placeholder="0" value={couponForm.minOrderAmount} onChange={e => setCouponForm(f => ({ ...f, minOrderAmount: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Max Uses (blank=∞)</label>
                                                    <input type="number" style={inputStyle} placeholder="100" value={couponForm.maxUsage} onChange={e => setCouponForm(f => ({ ...f, maxUsage: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Per User Limit</label>
                                                    <input type="number" min="1" style={inputStyle} value={couponForm.maxUsagePerUser} onChange={e => setCouponForm(f => ({ ...f, maxUsagePerUser: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Expiry Date</label>
                                                    <input type="date" style={inputStyle} value={couponForm.expiresAt} onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))} />
                                                </div>
                                            </div>

                                            {/* LMS Restrictions */}
                                            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.2rem' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>🎓</span>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0c4a6e' }}>LMS Restrictions — Who can use this coupon?</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '3px', lineHeight: 1.6 }}>
                                                            Restrictions <strong>limit which students</strong> can apply this coupon.<br />
                                                            • Pick colleges → only students of those colleges can use it<br />
                                                            • Pick semesters → only those semester students can apply<br />
                                                            • Pick state → only courses of that state qualify<br />
                                                            <strong>Leave everything unchecked = no restriction (works for all).</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>

                                                    {/* ── College Dropdown ── */}
                                                    {(() => {
                                                        const sel = couponForm.allowedUniversities;
                                                        const toggle = (v) => setCouponForm(f => ({ ...f, allowedUniversities: f.allowedUniversities.includes(v) ? f.allowedUniversities.filter(x => x !== v) : [...f.allowedUniversities, v] }));
                                                        return (
                                                            <div>
                                                                <label style={{ ...labelStyle, marginBottom: '4px' }}>🏛 College / University</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.6rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                                                                        <span style={{ color: sel.length ? '#0f172a' : '#94a3b8' }}>
                                                                            {sel.length === 0 ? 'All colleges (no restriction)' : `${sel.length} college${sel.length > 1 ? 's' : ''} selected`}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '260px', overflowY: 'auto', padding: '6px' }}>
                                                                        <div style={{ padding: '4px 8px 6px', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telangana</div>
                                                                        {COLLEGES_TG.map(c => (
                                                                            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', background: sel.includes(c) ? '#ecfdf5' : 'transparent' }}>
                                                                                <input type="checkbox" checked={sel.includes(c)} onChange={() => toggle(c)} style={{ accentColor: '#10b981' }} />
                                                                                {c}
                                                                            </label>
                                                                        ))}
                                                                        <div style={{ padding: '6px 8px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>Andhra Pradesh</div>
                                                                        {COLLEGES_AP.map(c => (
                                                                            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', background: sel.includes(c) ? '#ecfdf5' : 'transparent' }}>
                                                                                <input type="checkbox" checked={sel.includes(c)} onChange={() => toggle(c)} style={{ accentColor: '#10b981' }} />
                                                                                {c}
                                                                            </label>
                                                                        ))}
                                                                        {sel.length > 0 && (
                                                                            <button type="button" onClick={() => setCouponForm(f => ({ ...f, allowedUniversities: [] }))} style={{ width: '100%', marginTop: '6px', padding: '5px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit' }}>✕ Clear selection</button>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                                {sel.length > 0
                                                                    ? <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>✓ {sel.length} selected</div>
                                                                    : <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>All colleges allowed</div>}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* ── Semester Dropdown ── */}
                                                    {(() => {
                                                        const sel = couponForm.allowedSemesters;
                                                        const toggle = (v) => setCouponForm(f => ({ ...f, allowedSemesters: f.allowedSemesters.includes(v) ? f.allowedSemesters.filter(x => x !== v) : [...f.allowedSemesters, v] }));
                                                        return (
                                                            <div>
                                                                <label style={{ ...labelStyle, marginBottom: '4px' }}>📚 Semester</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.6rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                                                                        <span style={{ color: sel.length ? '#0f172a' : '#94a3b8' }}>
                                                                            {sel.length === 0 ? 'All semesters (no restriction)' : sel.join(', ')}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '6px' }}>
                                                                        {SEMS.map(s => (
                                                                            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', background: sel.includes(s) ? '#eff6ff' : 'transparent' }}>
                                                                                <input type="checkbox" checked={sel.includes(s)} onChange={() => toggle(s)} style={{ accentColor: '#3b82f6' }} />
                                                                                {s}
                                                                            </label>
                                                                        ))}
                                                                        {sel.length > 0 && (
                                                                            <button type="button" onClick={() => setCouponForm(f => ({ ...f, allowedSemesters: [] }))} style={{ width: '100%', marginTop: '4px', padding: '5px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit' }}>✕ Clear</button>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                                {sel.length > 0
                                                                    ? <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>✓ {sel.join(', ')}</div>
                                                                    : <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>All semesters allowed</div>}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* ── State Dropdown ── */}
                                                    {(() => {
                                                        const sel = couponForm.allowedStates;
                                                        const toggle = (v) => setCouponForm(f => ({ ...f, allowedStates: f.allowedStates.includes(v) ? f.allowedStates.filter(x => x !== v) : [...f.allowedStates, v] }));
                                                        return (
                                                            <div>
                                                                <label style={{ ...labelStyle, marginBottom: '4px' }}>🗺 State</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.6rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                                                                        <span style={{ color: sel.length ? '#0f172a' : '#94a3b8' }}>
                                                                            {sel.length === 0 ? 'All states (no restriction)' : sel.join(', ')}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '6px' }}>
                                                                        {['Telangana', 'Andhra Pradesh'].map(s => (
                                                                            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', background: sel.includes(s) ? '#fef9c3' : 'transparent' }}>
                                                                                <input type="checkbox" checked={sel.includes(s)} onChange={() => toggle(s)} style={{ accentColor: '#f59e0b' }} />
                                                                                {s}
                                                                            </label>
                                                                        ))}
                                                                        {sel.length > 0 && (
                                                                            <button type="button" onClick={() => setCouponForm(f => ({ ...f, allowedStates: [] }))} style={{ width: '100%', marginTop: '4px', padding: '5px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit' }}>✕ Clear</button>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                                {sel.length > 0
                                                                    ? <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#d97706', fontWeight: 700 }}>✓ {sel.join(', ')}</div>
                                                                    : <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#94a3b8' }}>All states allowed</div>}
                                                            </div>
                                                        );
                                                    })()}

                                                </div>
                                            </div>

                                            {/* Product Coverage Restrictions — Which items qualify? */}
                                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.2rem' }}>
                                                    <ShoppingBag size={20} color="#64748b" />
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>Product Coverage — Which items qualify?</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px', lineHeight: 1.6 }}>
                                                            Restrict this coupon to specific product types or individual items.<br />
                                                            <strong>Leave categories unchecked = works for everything.</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                    {/* Category Selection */}
                                                    <div>
                                                        <label style={{ ...labelStyle, marginBottom: '8px' }}>🏷 Product Categories</label>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                            {['courses', 'ebooks', 'books', 'classes'].map(t => (
                                                                <label key={t} style={{
                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                                    fontSize: '0.82rem', fontWeight: 600,
                                                                    background: couponForm.allowedTypes.includes(t) ? '#3b82f6' : '#fff',
                                                                    color: couponForm.allowedTypes.includes(t) ? '#fff' : '#1e293b',
                                                                    border: '1px solid ' + (couponForm.allowedTypes.includes(t) ? '#3b82f6' : '#cbd5e1')
                                                                }}>
                                                                    <input type="checkbox" hidden checked={couponForm.allowedTypes.includes(t)} onChange={() => setCouponForm(f => ({ ...f, allowedTypes: f.allowedTypes.includes(t) ? f.allowedTypes.filter(x => x !== t) : [...f.allowedTypes, t] }))} />
                                                                    {t === 'books' ? 'Bookstore' : t.charAt(0).toUpperCase() + t.slice(1)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Item Specific Restrictions */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {couponForm.allowedTypes.includes('courses') && (
                                                            <div>
                                                                <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '4px' }}>🎓 Specific Courses (optional)</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.5rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{couponForm.allowedCourseIds.length ? `${couponForm.allowedCourseIds.length} selected` : 'Any Course'}</span>
                                                                        <span>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', padding: '6px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                        {courses.map(c => (
                                                                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                                <input type="checkbox" checked={couponForm.allowedCourseIds.includes(c.id)} onChange={() => setCouponForm(f => ({ ...f, allowedCourseIds: f.allowedCourseIds.includes(c.id) ? f.allowedCourseIds.filter(x => x !== c.id) : [...f.allowedCourseIds, c.id] }))} />
                                                                                {c.title}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        )}
                                                        {couponForm.allowedTypes.includes('ebooks') && (
                                                            <div>
                                                                <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '4px' }}>📖 Specific eBooks (optional)</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.5rem 0.8rem', background: '#fff', border: '1.5 solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{couponForm.allowedEbookIds.length ? `${couponForm.allowedEbookIds.length} selected` : 'Any eBook'}</span>
                                                                        <span>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', padding: '6px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                        {ebooks.map(eb => (
                                                                            <label key={eb.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                                <input type="checkbox" checked={couponForm.allowedEbookIds.includes(eb.id)} onChange={() => setCouponForm(f => ({ ...f, allowedEbookIds: f.allowedEbookIds.includes(eb.id) ? f.allowedEbookIds.filter(x => x !== eb.id) : [...f.allowedEbookIds, eb.id] }))} />
                                                                                {eb.title}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        )}
                                                        {couponForm.allowedTypes.includes('books') && (
                                                            <div>
                                                                <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '4px' }}>📦 Specific Bookstore Items (optional)</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.5rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{couponForm.allowedBookIds.length ? `${couponForm.allowedBookIds.length} selected` : 'Any Book'}</span>
                                                                        <span>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', padding: '6px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                        {bookstore.map(b => (
                                                                            <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                                <input type="checkbox" checked={couponForm.allowedBookIds.includes(b.id)} onChange={() => setCouponForm(f => ({ ...f, allowedBookIds: f.allowedBookIds.includes(b.id) ? f.allowedBookIds.filter(x => x !== b.id) : [...f.allowedBookIds, b.id] }))} />
                                                                                {b.title}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        )}
                                                        {couponForm.allowedTypes.includes('classes') && (
                                                            <div>
                                                                <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '4px' }}>🎙 Specific Live Classes (optional)</label>
                                                                <details style={{ position: 'relative' }}>
                                                                    <summary style={{ listStyle: 'none', padding: '0.5rem 0.8rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{couponForm.allowedClassIds.length ? `${couponForm.allowedClassIds.length} selected` : 'Any Class'}</span>
                                                                        <span>▼</span>
                                                                    </summary>
                                                                    <div style={{ position: 'absolute', zIndex: 999, left: 0, right: 0, top: '100%', padding: '6px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                        {liveClasses.map(c => (
                                                                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                                <input type="checkbox" checked={couponForm.allowedClassIds.includes(c.id)} onChange={() => setCouponForm(f => ({ ...f, allowedClassIds: f.allowedClassIds.includes(c.id) ? f.allowedClassIds.filter(x => x !== c.id) : [...f.allowedClassIds, c.id] }))} />
                                                                                {c.title}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button type="submit" style={{ ...btnGreen, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Save size={15} /> {editingCouponId ? 'Save Changes' : 'Create Coupon'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Coupons Table */}
                                    <div style={tableCard}>
                                        <table style={table}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                    {['Code', 'Type / Value', 'Restrictions', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                                                        <th key={h} style={th}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.length === 0 && (
                                                    <tr><td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No coupons yet. Create your first one!</td></tr>
                                                )}
                                                {coupons.map(cp => {
                                                    const expired = cp.expiresAt && new Date(cp.expiresAt) < now;
                                                    const univs = cp.allowedUniversities ? JSON.parse(cp.allowedUniversities) : [];
                                                    const sems = cp.allowedSemesters ? JSON.parse(cp.allowedSemesters) : [];
                                                    const states = cp.allowedStates ? JSON.parse(cp.allowedStates) : [];
                                                    const types = cp.allowedTypes ? JSON.parse(cp.allowedTypes) : [];
                                                    const ebIds = cp.allowedEbookIds ? JSON.parse(cp.allowedEbookIds) : [];
                                                    const bIds = cp.allowedBookIds ? JSON.parse(cp.allowedBookIds) : [];
                                                    const cIds = cp.allowedClassIds ? JSON.parse(cp.allowedClassIds) : [];
                                                    return (
                                                        <tr key={cp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                            <td style={td}>
                                                                <div style={{ fontWeight: 900, fontSize: '0.95rem', fontFamily: 'monospace', letterSpacing: '1px', color: '#0f172a' }}>{cp.code}</div>
                                                                {cp.description && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{cp.description}</div>}
                                                            </td>
                                                            <td style={td}>
                                                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, background: cp.type === 'percentage' ? '#eff6ff' : '#fef3c7', color: cp.type === 'percentage' ? '#1d4ed8' : '#d97706' }}>
                                                                    {cp.type === 'percentage' ? `${cp.value}% OFF` : `₹${cp.value} OFF`}
                                                                </span>
                                                                {cp.minOrderAmount > 0 && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Min: ₹{cp.minOrderAmount}</div>}
                                                            </td>
                                                            <td style={td}>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '180px' }}>
                                                                    {types.map(t => <span key={t} style={{ ...catBadge, background: '#f8fafc', color: '#64748b', fontSize: '0.65rem' }}>TYPE: {t}</span>)}
                                                                    {univs.map(u => <span key={u} style={{ ...catBadge, background: '#ecfdf5', color: '#059669', fontSize: '0.65rem' }}>{u.replace(' University', '')}</span>)}
                                                                    {sems.map(s => <span key={s} style={{ ...catBadge, background: '#eff6ff', color: '#2563eb', fontSize: '0.65rem' }}>{s}</span>)}
                                                                    {states.map(s => <span key={s} style={{ ...catBadge, background: '#fef3c7', color: '#d97706', fontSize: '0.65rem' }}>{s}</span>)}
                                                                    {ebIds.length > 0 && <span style={{ ...catBadge, background: '#f0fdf4', color: '#166534', fontSize: '0.65rem' }}>{ebIds.length} eBooks</span>}
                                                                    {bIds.length > 0 && <span style={{ ...catBadge, background: '#fff7ed', color: '#9a3412', fontSize: '0.65rem' }}>{bIds.length} Books</span>}
                                                                    {cIds.length > 0 && <span style={{ ...catBadge, background: '#f5f3ff', color: '#5b21b6', fontSize: '0.65rem' }}>{cIds.length} Classes</span>}
                                                                    {!types.length && !univs.length && !sems.length && !states.length && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Catalog-wide</span>}
                                                                </div>
                                                            </td>
                                                            <td style={{ ...td, fontWeight: 700 }}>
                                                                {cp.usageCount}
                                                                {cp.maxUsage && <span style={{ color: '#94a3b8', fontWeight: 400 }}>/{cp.maxUsage}</span>}
                                                            </td>
                                                            <td style={{ ...td, fontSize: '0.8rem', color: expired ? '#ef4444' : '#64748b', fontWeight: expired ? 700 : 400 }}>
                                                                {cp.expiresAt ? new Date(cp.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '∞ Always'}
                                                            </td>
                                                            <td style={td}>
                                                                {expired ? (
                                                                    <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#fef2f2', color: '#ef4444' }}>EXPIRED</span>
                                                                ) : cp.isActive ? (
                                                                    <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#ecfdf5', color: '#059669' }}>ACTIVE</span>
                                                                ) : (
                                                                    <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', color: '#64748b' }}>PAUSED</span>
                                                                )}
                                                            </td>
                                                            <td style={{ ...td, textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                    <button title="Analytics" onClick={() => handleViewAnalytics(cp.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>
                                                                        <BarChart2 size={12} /> Stats
                                                                    </button>
                                                                    <button title="Edit" onClick={() => handleEditCoupon(cp)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>
                                                                        <Edit size={12} /> Edit
                                                                    </button>
                                                                    <button onClick={() => handleToggleActive(cp.id, cp.isActive)} style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', background: cp.isActive ? '#fef3c7' : '#ecfdf5', color: cp.isActive ? '#d97706' : '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit' }}>
                                                                        {cp.isActive ? 'Pause' : 'Activate'}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteCoupon(cp.id)} style={btnDel}><Trash2 size={13} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Analytics Panel */}
                                    {couponAnalytics && (
                                        <div style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                                <h3 style={{ margin: 0, fontWeight: 800 }}>Usage Analytics</h3>
                                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                    {[
                                                        { label: 'Total Uses', value: couponAnalytics.useCount, color: '#3b82f6' },
                                                        { label: 'Discount Given', value: `₹${couponAnalytics.totalDiscountGiven}`, color: '#10b981' },
                                                    ].map(s => (
                                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <table style={table}>
                                                <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Student', 'Email', 'Discount', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                                <tbody>
                                                    {couponAnalytics.usages.length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No usage yet.</td></tr>}
                                                    {couponAnalytics.usages.map(u => (
                                                        <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                            <td style={td}><div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{u.user?.name}</div></td>
                                                            <td style={{ ...td, fontSize: '0.8rem', color: '#64748b' }}>{u.user?.email}</td>
                                                            <td style={{ ...td, fontWeight: 800, color: '#10b981' }}>-₹{u.discountAmount}</td>
                                                            <td style={{ ...td, fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(u.usedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })()}

                        {/* ── MESSAGES ── */}
                        {activeTab === 'messages' && (
                            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Contact Messages</h2>
                                        <p style={{ color: '#64748b' }}>Customer inquiries from your contact form.</p>
                                    </div>
                                    <button onClick={async () => {
                                        const res = await fetch('/api/admin/messages');
                                        if (res.ok) setMessages(await res.json());
                                    }} style={{ ...btnEdit, padding: '8px 16px', fontSize: '0.8rem' }}>Refresh Messages</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                                    {messages.length === 0 && (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '20px', color: '#94a3b8' }}>
                                            📬 No messages received yet.
                                        </div>
                                    )}
                                    {messages.map(m => (
                                        <div key={m.id} style={{
                                            background: '#fff', borderRadius: '16px', padding: '1.5rem',
                                            border: '1px solid #e2e8f0', position: 'relative',
                                            boxShadow: m.status === 'new' ? '0 10px 25px rgba(16,185,129,0.08)' : 'none'
                                        }}>
                                            {m.status === 'new' && (
                                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px' }}>NEW</div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569' }}>
                                                    {m.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{m.name}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.email}</div>
                                                    {m.phone && (
                                                        <a href={`tel:${m.phone}`} style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                                                            📞 {m.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Subject</div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{m.subject}</div>
                                            </div>

                                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Message</div>
                                                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.message}</div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    {new Date(m.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {m.status === 'new' && (
                                                        <button onClick={() => handleUpdateMessageStatus(m.id, 'read')} style={{ ...btnEdit, color: '#059669', background: '#ecfdf5', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800 }}>Mark as Read</button>
                                                    )}
                                                    <button onClick={() => handleDeleteMessage(m.id)} style={{ ...btnDel, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800 }}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── SETTINGS ── */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>Platform Settings</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {[
                                        { label: 'Platform Name', value: 'Kantri Lawyer', hint: 'Shown in browser tab and meta tags' },
                                        { label: 'Tagline', value: 'Kantri by Awareness, Honest by Conscience', hint: 'Hero section tagline' },
                                        { label: 'Admin Email', value: 'admin@kantrilawyer.com', hint: 'Used to receive order notifications' },
                                        { label: 'Razorpay Key', value: 'rzp_test_*****', hint: 'Set in .env.local as NEXT_PUBLIC_RAZORPAY_KEY_ID' },
                                        { label: 'Preview Duration', value: '30 seconds', hint: 'Free preview duration before paywall' },
                                        { label: 'WhatsApp Number', value: '+91 XXXXX XXXXX', hint: 'Book Free Consultation button target' },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
                                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{s.value}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.hint}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* ── Content Edit Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {editingItem && (
                    <>
                        <div onClick={() => setEditingItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
                        <div style={{ position: 'fixed', inset: 0, zIndex: 101, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '3rem 1rem' }}>
                            <motion.form
                                onSubmit={handleSaveItem}
                                initial={{ scale: 0.95, y: -10, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
                            >
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 800 }}>{editingItem.id === 0 ? '➕ Add New' : '✏️ Edit'} {TABS.find(t => t.id === activeTab)?.label}</h3>
                                    <button type="button" onClick={() => setEditingItem(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                                </div>
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {renderFields()}
                                </div>
                                <div style={{ padding: '1.2rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                    <button type="submit" style={btnGreen}><Save size={16} /> Save &amp; Publish</button>
                                </div>
                            </motion.form>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ── User Edit Modal ────────────────────────────────────────────── */}
            <AnimatePresence>
                {editingUser && (
                    <>
                        <div onClick={() => setEditingUser(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
                        <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                            <motion.form
                                onSubmit={handleSaveUser}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}
                            >
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 800 }}>✏️ Edit User</h3>
                                    <button type="button" onClick={() => setEditingUser(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                                </div>
                                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <FormField label="Full Name" name="name" defaultValue={editingUser.name} />
                                    <FormField label="Email (Read-only)" name="email" defaultValue={editingUser.email} disabled />
                                    <FormField label="Phone" name="phone" defaultValue={editingUser.phone || ''} placeholder="+91 XXXXX XXXXX" />
                                    <div>
                                        <label style={labelStyle}>Role</label>
                                        <select name="role" defaultValue={editingUser.role} style={{ width: '100%', padding: '0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                                            <option value="user">User (Student)</option>
                                            <option value="admin">Admin (Instructor)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ padding: '1.2rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" onClick={() => setEditingUser(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                    <button type="submit" style={btnGreen}><Save size={16} /> Update User</button>
                                </div>
                            </motion.form>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ───────────────────────────────── */}
            {deleteConfirm && (
                <div onClick={() => setDeleteConfirm(null)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(4px)', zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#fff', borderRadius: '20px', padding: '2rem',
                        maxWidth: '420px', width: '100%',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
                        textAlign: 'center',
                    }}>
                        <div style={{ width: '56px', height: '56px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                            <Trash2 size={24} color="#dc2626" />
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>Delete Item?</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
                            You are about to permanently delete <strong style={{ color: '#0f172a' }}>"{deleteConfirm.title}"</strong>.<br />This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                                padding: '0.75rem 1.5rem', background: '#f1f5f9', border: 'none',
                                borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: '0.9rem', color: '#64748b',
                            }}>Cancel</button>
                            <button onClick={confirmDelete} style={{
                                padding: '0.75rem 1.5rem', background: '#dc2626', border: 'none',
                                borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: '0.9rem', color: '#fff',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <Trash2 size={15} /> Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Reusable FormField ─────────────────────────────────────────────────────
function FormField({ label, name, defaultValue, type = 'text', required, placeholder, hint, disabled }) {
    return (
        <div>
            <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
            {type === 'textarea'
                ? <textarea name={name} defaultValue={defaultValue} required={required} placeholder={placeholder} rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                : <input type={type} name={name} defaultValue={defaultValue} required={required} placeholder={placeholder} disabled={disabled}
                    style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'text', color: disabled ? '#9ca3af' : '#0f172a' }} />
            }
            {hint && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>}
        </div>
    );
}

// ── Shared Styles ──────────────────────────────────────────────────────────
const tableCard = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', background: '#fafafa' };
const td = { padding: '1rem 1.5rem', verticalAlign: 'middle' };
const catBadge = { background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 };
const btnGreen = { padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontFamily: 'inherit' };
const btnEdit = { padding: '7px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const btnDel = { padding: '7px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const inputStyle = { width: '100%', padding: '0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fafafa' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px' };
