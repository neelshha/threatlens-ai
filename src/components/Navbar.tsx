'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import useSWR from 'swr';

interface Report {
  id: string;
  title: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const { data, error } = useSWR('/api/reports', fetcher);
  const recentReports: Report[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const linkStyle = (href: string, current: string) =>
    `block px-3 py-2 rounded-md text-sm transition font-medium ${
      pathname === href
        ? 'bg-[#3942f2] text-white'
        : 'text-neutral-300 hover:bg-[#1c1f3a] hover:text-white'
    }`;

  return (
    <>
      <aside className={`hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0e1629] text-neutral-300 border-r border-[#3942f2] flex-col transition-shadow ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          <Link href="/" className="text-2xl font-bold text-white mb-8 hover:text-[#6570f2]">
            ThreatLens AI
          </Link>
          <nav className="flex flex-col gap-2">
            <Link href="/" className={linkStyle('/', pathname)}>Home</Link>
            <Link href="/dashboard" className={linkStyle('/dashboard', pathname)}>Dashboard</Link>
          </nav>

          <div className="flex flex-col mt-6 flex-1 overflow-hidden">
            <h3 className="text-xs font-semibold text-[#7681f7] uppercase mb-2 px-2">Recent Reports</h3>
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3942f2]/70 scrollbar-track-transparent">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/${report.id}`}
                  title={report.title}
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
    </>
  );
};

export default Navbar;
