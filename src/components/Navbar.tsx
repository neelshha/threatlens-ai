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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { data } = useSWR<Report[]>('/api/reports', fetcher);
  const recentReports = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const linkStyle = (href: string) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition ${
      pathname === href
        ? 'bg-[#3942f2] text-white'
        : 'text-neutral-300 hover:bg-[#1c1f3a] hover:text-white'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0e1629] text-neutral-300 border-r border-[#3942f2]/40 flex-col transition-shadow ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-3 mb-8 hover:text-[#6570f2] transition">
            <Image src={tLogo} alt="ThreatLens AI Logo" width={28} height={28} className="rounded-sm" />
            <span className="text-2xl font-bold text-white">ThreatLens AI</span>
          </Link>

          <nav className="flex flex-col gap-2">
            <Link href="/" className={linkStyle('/')}>Home</Link>
            <Link href="/dashboard" className={linkStyle('/dashboard')}>Dashboard</Link>
          </nav>

          <div className="flex flex-col mt-6 flex-1 overflow-hidden">
            <h3 className="text-xs font-semibold text-[#7681f7] uppercase mb-2 px-2">Recent Reports</h3>
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3942f2]/70">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/${report.id}`}
                  className="block text-sm text-neutral-300 hover:text-white px-2 py-1.5 rounded-md transition truncate"
                >
                  {report.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 px-2 text-sm">
            {status === 'authenticated' ? (
              <div className="text-white space-y-2">
                <p className="text-xs text-[#7681f7]">Signed in as</p>
                <p className="truncate font-medium">{session.user?.email}</p>
                <button
                  onClick={() => signOut()}
                  className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#0e1629] border-b border-[#3942f2]/40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <Image src={tLogo} alt="ThreatLens AI Logo" width={24} height={24} className="rounded-sm" />
            ThreatLens AI
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X className="text-white w-6 h-6" /> : <Menu className="text-white w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0e1629] border-r border-[#3942f2]/40 transform transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ marginTop: '60px' }}
      >
        <div className="p-6 flex flex-col h-[calc(100%-60px)] overflow-y-auto">
          <nav className="flex flex-col gap-3">
            <Link href="/" className={linkStyle('/')} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/dashboard" className={linkStyle('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          </nav>

          <div className="mt-6 flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-[#7681f7] uppercase mb-2">Recent Reports</h3>
            {recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/${report.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm text-neutral-300 hover:text-white py-1.5 truncate"
              >
                {report.title}
              </Link>
            ))}
          </div>

          <div className="mt-6 text-sm">
            {status === 'authenticated' ? (
              <div className="text-white space-y-2">
                <p className="text-xs text-[#7681f7]">Signed in as</p>
                <p className="truncate font-medium">{session.user?.email}</p>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                  className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); signIn('google'); }}
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
};

export default Navbar;