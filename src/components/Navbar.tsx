'use client';
import { FiUser, FiLogIn, FiLogOut, FiUserPlus, FiPlusCircle } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Sidebar() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-[#1e293b]/80 backdrop-blur-md text-white shadow-lg z-50 border-r border-gray-700">
      <div className="flex flex-col h-full justify-between">
        {/* Logo */}
        <div className="py-6 px-6 text-3xl font-extrabold tracking-wide">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-pink-300 transition-all duration-300"
          >
            Larva
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-4 px-6">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-600 rounded animate-pulse"></div>
          ) : session ? (
            <>
              <Link
                href="/create-post"
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-indigo-600 hover:shadow transition-all duration-200 group"
              >
                <FiPlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> New Post
              </Link>

              <Link
                href="/profile"
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-purple-600 hover:shadow transition-all duration-200 group"
              >
                <FiUser className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> My Posts
              </Link>

              <div className="bg-gray-700/60 p-3 rounded-lg mt-4 text-sm text-gray-300">
                <div className="font-semibold text-white truncate">
                  {session.user?.name || session.user?.email}
                </div>
                <div className="text-xs text-gray-400">Logged in</div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-red-500 hover:shadow transition-all duration-200 group mt-2"
              >
                <FiLogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-blue-600 hover:shadow transition-all duration-200 group"
              >
                <FiLogIn className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> Login
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 hover:bg-green-600 hover:shadow transition-all duration-200 group"
              >
                <FiUserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> Register
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-xs text-center text-gray-500 border-t border-gray-700">
          <p>&copy; 2025 Facetbook. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
