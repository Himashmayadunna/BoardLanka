"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

function NavbarContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle scroll class toggle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync authentication and dark mode states
  useEffect(() => {
    // 1. Session Auth
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

    // 2. Theme Preferences
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.add("light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      localStorage.setItem("theme", "light");
      document.documentElement.classList.add("light");
    } else {
      setIsDarkMode(true);
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/property-land?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Annexes", href: "/anexxes-rooms" },
    { label: "Houses", href: "/property-land?type=house" },
    { label: "Lands", href: "/property-land?type=land" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "glass-nav py-3 shadow-lg shadow-black/10" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo/logo.png"
                alt="BoardLanka logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
              Board<span className="text-primary">Lanka</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const itemUrl = new URL(item.href, "http://localhost");
              const itemPathname = itemUrl.pathname;
              const itemType = itemUrl.searchParams.get("type");
              const currentType = searchParams.get("type");
              
              const isActive = pathname === itemPathname && (!itemType || currentType === itemType);
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "text-primary bg-primary-glow" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2.5">
            
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen && (
                <form 
                  onSubmit={handleSearchSubmit} 
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-3 animate-fade-in"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="w-48 px-3.5 py-1.5 rounded-lg text-xs bg-black/60 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary-glow transition-all"
                    autoFocus
                  />
                </form>
              )}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                title="Search Properties"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Notification Trigger */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors relative"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-4 shadow-xl text-left animate-slide-up">
                  <h4 className="font-semibold text-white text-sm border-b border-white/5 pb-2 mb-2">Notifications</h4>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="p-2 rounded hover:bg-white/5 cursor-pointer">
                      <p className="text-white font-medium">Welcome to BoardLanka!</p>
                      <p className="mt-0.5">Start exploring premium rooms and houses.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Vertical Divider */}
            <span className="h-5 w-px bg-white/10 hidden md:block" />

            {/* Become a Host & User Profile Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoggedIn ? (
                <>
                  {user?.accountType === "seller" ? (
                    <Link
                      href="/addproperty"
                      className="flex items-center gap-1.5 bg-primary-glow text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-semibold border border-primary/20 transition-all duration-300"
                    >
                      <PlusCircle size={14} />
                      Add Property
                    </Link>
                  ) : (
                    <Link
                      href="/profile/edit"
                      className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      Become a Host
                    </Link>
                  )}
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/5 text-xs font-semibold text-white transition-all"
                  >
                    <div className="w-6 h-6 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                    <span>{user?.firstName || "Profile"}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="text-gray-300 hover:text-white hover:bg-white/5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    Become a Host
                  </Link>
                  <Link
                    href="/signin"
                    className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-white/5"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Icon Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Glass Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-0 right-0 w-80 bg-gray-950/95 backdrop-blur-2xl border-l border-white/10 p-6 z-50 animate-slide-left shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-white font-bold text-lg">Board<span className="text-primary">Lanka</span></span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Auth Bottom Section */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{user?.accountType || "User"}</p>
                  </div>
                </Link>
                {user?.accountType === "seller" && (
                  <Link
                    href="/addproperty"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all"
                  >
                    <PlusCircle size={16} />
                    Add Property
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-semibold transition-all border border-red-500/25"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-white/5 text-white font-semibold transition-all border border-white/10"
                >
                  Become a Host
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="fixed top-0 inset-x-0 z-50 bg-transparent py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10" />
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  );
}