import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: '   DevOps Boards — Multi-Tenant SaaS Project Management',
  description: 'Enterprise multi-tenant B2B project management platform inspired by       DevOps Boards.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full w-full overflow-hidden select-none">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

