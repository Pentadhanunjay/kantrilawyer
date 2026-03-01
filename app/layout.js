import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import PageProgress from '@/components/PageProgress';
import Script from 'next/script';

export const metadata = {
  title: 'Kantri Lawyer | Legal Education Platform',
  description: 'Kantri by Awareness, Honest by Conscience. Access expert legal courses, eBooks, live classes and more.',
  icons: {
    icon: '/assets/images/kantri1_logo.jpeg',
  },
};

import { CartProvider } from '@/context/CartContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <AuthProvider>
          <CartProvider>
            <PageProgress />
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 100px)', paddingTop: '100px', background: 'white' }}>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
