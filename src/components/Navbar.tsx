'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import useSWR from 'swr';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import tLogo from '/public/tLens.jpg';

interface Report {
  id: string;
  title: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data } = useSWR<Report[]>('/api/reports', fetcher);
  const recentReports = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false); // Close on route change
  }, [pathname]);

  const linkClasses = (href: string) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition ${
      pathname === href
        ? 'bg-[#3942f2] text-white'
        : 'text-neutral-300 hover:bg-[#1c1f3a] hover:text-white'
    }`;

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0e1629] text-white border-r border-[#3942f2]/40 flex-col z-50 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-3 mb-8 hover:text-[#6570f2] transition">
            <Image src={tLogo} alt="ThreatLens AI" width={28} height={28} className="rounded-sm" />
            <span className="text-2xl font-bold">ThreatLens AI</span>
          </Link>

          <nav className="flex flex-col gap-2">
            <Link href="/" className={linkClasses('/')}>Home</Link>
            <Link href="/dashboard" className={linkClasses('/dashboard')}>Dashboard</Link>
          </nav>

          <div className="mt-6 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3942f2]/70">
            <h3 className="text-xs text-[#7681f7] font-semibold px-2 mb-2 uppercase">Recent Reports</h3>
            {recentReports.map((r) => (
              <Link key={r.id} href={`/dashboard/${r.id}`} className="block px-2 py-1.5 text-sm text-neutral-300 hover:text-white truncate">
                {r.title}
              </Link>
            ))}
          </div>

          <div className="mt-6 px-2 text-sm">
            {status === 'authenticated' ? (
              <div className="space-y-2">
                <p className="text-xs text-[#7681f7]">Signed in as</p>
                <p className="truncate">{session.user?.email}</p>
                <button onClick={() => signOut()} className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md">
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* --- Mobile Header --- */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-[#0e1629] border-b border-[#3942f2]/40 z-50 flex items-center justify-between px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <Image src={tLogo} alt="ThreatLens AI" width={24} height={24} className="rounded-sm" />
          ThreatLens AI
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle menu">
          {isMobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </header>

      {/* --- Mobile Overlay --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- Mobile Drawer --- */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0e1629] border-r border-[#3942f2]/40 transform transition-transform duration-300 z-50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <nav className="flex flex-col gap-3">
            <Link href="/" className={linkClasses('/')} onClick={() => setIsMobileOpen(false)}>Home</Link>
            <Link href="/dashboard" className={linkClasses('/dashboard')} onClick={() => setIsMobileOpen(false)}>Dashboard</Link>
          </nav>

          <div className="mt-6 flex-1 overflow-y-auto">
            <h3 className="text-xs text-[#7681f7] font-semibold mb-2">Recent Reports</h3>
            {recentReports.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/${r.id}`}
                onClick={() => setIsMobileOpen(false)}
                className="block px-2 py-1.5 text-sm text-neutral-300 hover:text-white truncate"
              >
                {r.title}
              </Link>
            ))}
          </div>

          <div className="mt-6 text-sm">
            {status === 'authenticated' ? (
              <div className="text-white space-y-2">
                <p className="text-xs text-[#7681f7]">Signed in as</p>
                <p className="truncate">{session.user?.email}</p>
                <button
                  onClick={() => { setIsMobileOpen(false); signOut(); }}
                  className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileOpen(false); signIn('google'); }}
                className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}