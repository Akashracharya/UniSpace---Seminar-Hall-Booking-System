'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname(); // This lets us know which page we are on

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Title */}
          <Link href="/" className="text-xl font-bold tracking-wide">
            🎓 UniSpace
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Home
            </Link>
            
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard' ? 'bg-blue-800' : 'hover:bg-blue-700'
              }`}
            >
              Schedule Dashboard
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}