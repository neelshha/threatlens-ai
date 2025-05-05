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

  const { data: recentReports = [] } = useSWR<Report[]>('/api/reports', fetcher);

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

  const getLinkClasses = (href: string, base: string, active: string, inactive: string) => {
    const isActive = pathname === href;
    return `${base} ${isActive ? active : inactive}`;
  };

  const desktopLinkBase = 'text-sm px-3 py-2 rounded-md transition-all block';
  const desktopLinkActive = 'bg-neutral-700 text-white font-medium';
  const desktopLinkInactive = 'text-neutral-300 hover:bg-neutral-800 hover:text-white';

  const mobileLinkBase = 'text-lg font-medium px-4 py-2 rounded-md transition-colors block';
  const mobileLinkActive = 'bg-neutral-800 text-white';
  const mobileLinkInactive = 'text-neutral-200 hover:text-white hover:bg-neutral-800';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed inset-y-0 left-0 w-64 bg-neutral-950 text-neutral-300 border-r border-neutral-800 flex-col transition-shadow duration-300 ease-in-out ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="p-6 flex flex-col h-full">
          <Link href="/" className="text-2xl font-bold text-white block mb-8 hover:text-blue-400 transition-colors">
            ThreatLens AI
          </Link>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className={getLinkClasses('/', desktopLinkBase, desktopLinkActive, desktopLinkInactive)}>
              Home
            </Link>
            <Link href="/dashboard" className={getLinkClasses('/dashboard', desktopLinkBase, desktopLinkActive, desktopLinkInactive)}>
              Dashboard
            </Link>
          </nav>

          <div className="flex flex-col mt-6 flex-1 overflow-hidden">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2 px-2">Recent Reports</h3>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/${report.id}`}
                  title={report.title}
                  className="block text-sm text-neutral-300 hover:text-white px-2 py-1.5 rounded-md transition-colors truncate"
                >
                  {report.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="mt-6 px-2 text-sm">
            {status === 'authenticated' ? (
              <div className="flex flex-col gap-2 text-white">
                <span className="text-xs text-neutral-400">Signed in as</span>
                <span className="font-medium truncate">{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="mt-2 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="w-full mt-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`md:hidden fixed top-0 inset-x-0 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 z-50 transition-shadow duration-300 ease-in-out ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="flex justify-between items-center px-4 py-3">
          <Link href="/" className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
            ThreatLens AI
          </Link>
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            className="p-2 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-In Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={toggleMobileMenu} />
        <aside className={`absolute inset-y-0 left-0 w-3/4 max-w-sm bg-neutral-950 p-6 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-xl font-semibold text-white">ThreatLens AI</Link>
            <button onClick={toggleMobileMenu} className="p-2 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link href="/" className={getLinkClasses('/', mobileLinkBase, mobileLinkActive, mobileLinkInactive)} onClick={toggleMobileMenu}>Home</Link>
            <Link href="/dashboard" className={getLinkClasses('/dashboard', mobileLinkBase, mobileLinkActive, mobileLinkInactive)} onClick={toggleMobileMenu}>Dashboard</Link>
          </nav>

          {/* Auth Controls */}
          <div className="mt-8 border-t border-neutral-800 pt-6">
            {status === 'authenticated' ? (
              <div className="text-sm text-white">
                <p className="mb-2">Signed in as <span className="font-medium">{session.user?.email}</span></p>
                <button
                  onClick={() => { toggleMobileMenu(); signOut(); }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { toggleMobileMenu(); signIn('google'); }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 transparent;
        }
      `}</style>
    </>
  );
};

export default Navbar;