'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster />
      <Navbar />
      <main className="md:ml-64">{children}</main>
    </SessionProvider>
  );
}