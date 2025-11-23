'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  return (
    <nav className="fixed w-full h-20 z-50 top-0 start-0 border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 mt-2 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="">
            </div>
            <span className="self-center text-3xl font-bold whitespace-nowrap text-gray-900 tracking-tight">
              UniSpace
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/')}`}>
              Home
            </Link>
            <Link href="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard')}`}>
              My Schedule
            </Link>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {session.user.isAdmin && (
                  <Link href="/admin" className="hidden md:block bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition">
                    Admin Panel
                  </Link>
                )}
                
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-900">{session.user.name}</span>
                  <span className="text-xs text-gray-500">{session.user.isAdmin ? 'Administrator' : 'Student'}</span>
                </div>
                
                <button 
                  onClick={() => signOut()} 
                  className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-900 hover:bg-gray-100 font-medium rounded-lg px-4 py-2 transition">
                  Log in
                </Link>
                <Link href="/register" className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition">
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}