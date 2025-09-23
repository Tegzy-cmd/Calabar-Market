
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { CartProvider } from '@/hooks/cart-provider';
import { AuthProvider } from '@/hooks/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
    subsets: ['latin'], 
    weight: ['600', '700', '800', '900'],
    variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Calabar Eats',
  description: 'Food and grocery delivery service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased`}>
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
