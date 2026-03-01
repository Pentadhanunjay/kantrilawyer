// Admin panel gets its own layout — no Navbar, no Footer
// Full-screen app shell
export default function AdminLayout({ children }) {
    return (
        <div style={{ minHeight: '100vh' }}>
            {children}
        </div>
    );
}
