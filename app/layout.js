import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import RootShell from '@/components/RootShell';
import Script from 'next/script';

export const metadata = {
  title: 'Kantri Lawyer | Legal Education Platform',
  description: 'Kantri by Awareness, Honest by Conscience. Access expert legal courses, eBooks, live classes and more.',
  icons: {
    icon: '/assets/images/kantri1_logo.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <AuthProvider>
          <CartProvider>
            <RootShell>
              {children}
            </RootShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
