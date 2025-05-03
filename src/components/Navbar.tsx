'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 w-64 bg-gray-900 text-gray-300 border-r border-gray-800
                    flex flex-col justify-between transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}
      >
        <div className="p-6">
          <Link
            href="/"
            className="text-2xl font-black text-white block mb-8 hover:text-blue-500 transition-colors"
          >
            ThreatLens AI
          </Link>
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm font-medium rounded-md p-2 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 text-sm font-medium rounded-md p-2 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-900 text-gray-300 sticky top-0 z-50 border-b border-gray-800">
        <div className="flex justify-between items-center px-4 py-3">
          <Link
            href="/"
            className="text-xl font-semibold text-white transition-colors hover:text-blue-500"
          >
            ThreatLens AI
          </Link>
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            className="p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <aside className="md:hidden fixed inset-0 bg-gray-900 text-gray-300 z-50 p-4">
          <nav className="flex flex-col space-y-3 mt-12">
            <Link
              href="/"
              className="block text-lg font-medium rounded-md p-3 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="block text-lg font-medium rounded-md p-3 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={toggleMobileMenu}
            >
              Dashboard
            </Link>
          </nav>
        </aside>
      )}
    </>
  );
};

export default Navbar;