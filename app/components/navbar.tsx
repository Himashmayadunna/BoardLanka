"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Find Rooms", href: "/findrooms" },
  { label: "Annexes & Houses", href: "/annexes-houses" },
  { label: "Profile", href: "/profile" },
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token) {
      setIsLoggedIn(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          // Invalid user data
        }
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/findrooms?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white font-bold text-xl">BL</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">
              Board<span className="text-emerald-400">Lanka</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && user?.accountType === "seller" && (
              <Link
                href="/addproperty"
                className="text-gray-300 hover:text-white hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-emerald-500/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              type="submit"
              className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Search
            </button>
          </form>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.firstName?.charAt(0) || "U"}
                      {user?.lastName?.charAt(0) || ""}
                    </span>
                  </div>
                  <span className="hidden xl:inline">{user?.firstName || "Profile"}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600/50 hover:text-white transition-all duration-200 border border-gray-600/50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-300 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-700/50">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 focus:outline-none focus:border-emerald-500/50"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>

            {/* Mobile Nav Items */}
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg font-medium transition-all duration-200 mb-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn && user?.accountType === "seller" && (
              <Link
                href="/addproperty"
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-all duration-200 mb-1 border border-emerald-500/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </Link>
            )}

            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.firstName?.charAt(0) || "U"}
                        {user?.lastName?.charAt(0) || ""}
                      </span>
                    </div>
                    <span>{user?.firstName || "Profile"}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600/50 hover:text-white transition-all duration-200 text-center border border-gray-600/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block text-gray-300 hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-center shadow-lg shadow-emerald-500/25"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}