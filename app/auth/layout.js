// Auth pages get their own layout — NO Navbar, NO Footer
// Just a clean full-screen page
export default function AuthLayout({ children }) {
    return (
        <div style={{ minHeight: '100vh' }}>
            {children}
        </div>
    );
}
