'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react'; // Import hooks

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession(); // Get user session data

    return (
        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    <Link href="/" className="text-xl font-bold tracking-wide">
                        🎓 UniSpace
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link href="/" className="hover:text-blue-200 text-sm font-medium">Home</Link>
                        <Link href="/dashboard" className="hover:text-blue-200 text-sm font-medium">Dashboard</Link>

                        {session ? (
                            // IF LOGGED IN
                            <div className="flex items-center gap-4 ml-4">
                                {session.user.isAdmin && (
                                    <Link href="/admin" className="text-yellow-400 font-bold hover:text-yellow-300">
                                        Admin Panel
                                    </Link>
                                )}
                                <span className="text-sm text-blue-200">Hi, {session.user.name}</span>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // IF LOGGED OUT
                            <div className="flex items-center gap-2 ml-4">
                                <Link href="/login" className="bg-white text-blue-900 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100 transition">
                                    Login
                                </Link>
                                <Link href="/register" className="border border-white px-3 py-1 rounded text-sm hover:bg-blue-800 transition">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}