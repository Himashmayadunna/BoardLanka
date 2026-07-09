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
import { motion, AnimatePresence } from "framer-motion";

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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    setProfileDropdownOpen(false);
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
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header 
        className={`fixed top-4 inset-x-4 max-w-7xl mx-auto z-50 transition-all duration-300 rounded-[1.25rem] border ${
          mobileMenuOpen
            ? "bg-glass-bg border-glass-border shadow-2xl py-4"
            : isScrolled
              ? "bg-glass-bg border-glass-border shadow-xl shadow-black/5 py-2.5" 
              : "bg-transparent border-transparent py-4"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo/logo.png"
                  alt="BoardLanka logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-text-primary font-bold text-base sm:text-xl tracking-tight block">
                Board<span className="text-primary">Lanka</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
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
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300 text-text-muted hover:text-text-primary flex items-center justify-center"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-primary-glow rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 ${isActive ? "text-primary font-semibold" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center space-x-2.5">
              
              {/* Sleek Search Pill Trigger (Desktop) */}
              <div className="hidden md:block">
                <div 
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 bg-card-bg/60 border border-card-border/60 hover:border-primary/45 rounded-xl px-3 py-1.5 text-text-muted hover:text-text-primary transition-all duration-300 cursor-pointer text-xs font-medium"
                >
                  <Search size={14} className="text-text-muted/70" />
                  <span>Search locations...</span>
                  <span className="text-[9px] bg-card-hover-bg border border-card-border/50 rounded px-1.5 py-0.5 ml-1">⌘K</span>
                </div>
              </div>

              {/* Search Icon Trigger (Mobile) */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover-bg transition-colors md:hidden"
                title="Search Properties"
              >
                <Search size={18} />
              </button>

              {/* Notification Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover-bg transition-colors relative"
                  title="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-72 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl p-4 shadow-xl text-left z-50"
                    >
                      <h4 className="font-semibold text-text-primary text-sm border-b border-glass-border pb-2 mb-2">Notifications</h4>
                      <div className="space-y-2 text-xs text-text-muted">
                        <div className="p-2 rounded hover:bg-card-hover-bg cursor-pointer">
                          <p className="text-text-primary font-medium">Welcome to BoardLanka!</p>
                          <p className="mt-0.5">Start exploring premium rooms and houses.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover-bg transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Vertical Divider */}
              <span className="h-5 w-px bg-card-border hidden md:block" />

              {/* Become a Host & User Profile Actions */}
              <div className="hidden md:flex items-center space-x-2">
                {isLoggedIn ? (
                  <>
                    {/* User Profile Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className="flex items-center gap-2 bg-card-bg hover:bg-card-hover-bg px-3.5 py-1.5 rounded-xl border border-card-border text-xs font-semibold text-text-primary transition-all cursor-pointer"
                      >
                        <div className="w-6 h-6 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                          {user?.firstName?.charAt(0) || "U"}
                        </div>
                        <span>{user?.firstName || "Profile"}</span>
                      </button>
                      
                      <AnimatePresence>
                        {profileDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2.5 w-48 rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl p-2 shadow-xl text-left space-y-0.5 z-50"
                          >
                            <Link 
                              href="/profile" 
                              onClick={() => setProfileDropdownOpen(false)}
                              className="block px-3 py-2.5 rounded-lg text-xs text-text-primary hover:bg-card-hover-bg hover:text-primary transition-all font-medium"
                            >
                              My Dashboard
                            </Link>
                            {user?.accountType === "seller" && (
                              <Link 
                                href="/addproperty" 
                                onClick={() => setProfileDropdownOpen(false)}
                                className="block px-3 py-2.5 rounded-lg text-xs text-text-primary hover:bg-card-hover-bg hover:text-primary transition-all font-medium"
                              >
                                Add Property
                              </Link>
                            )}
                            <Link 
                              href="/profile/edit" 
                              onClick={() => setProfileDropdownOpen(false)}
                              className="block px-3 py-2.5 rounded-lg text-xs text-text-primary hover:bg-card-hover-bg hover:text-primary transition-all font-medium"
                            >
                              Edit Settings
                            </Link>
                            <hr className="border-glass-border my-1" />
                            <button 
                              onClick={handleSignOut}
                              className="flex items-center gap-1.5 w-full text-left px-3 py-2.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-all cursor-pointer font-medium"
                            >
                              <LogOut size={12} />
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="text-text-muted hover:text-text-primary hover:bg-card-hover-bg px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      Become a Host
                    </Link>
                    <Link
                      href="/signin"
                      className="bg-text-primary text-background hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-card-border"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Icon Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover-bg transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
          </div>

          {/* Mobile Glass Menu inside Capsule Container */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="pt-6 pb-2 space-y-4 border-t border-glass-border/60 mt-4">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-card-hover-bg active:bg-primary-glow/70 active:text-primary active:scale-[0.98] transition-all border border-transparent hover:border-glass-border/30 duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-glass-border/60 my-2" />

                  {/* Mobile Auth Bottom Section */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card-bg hover:bg-card-hover-bg active:bg-card-hover-bg active:scale-95 text-text-primary text-xs font-semibold border border-card-border transition-all duration-200"
                        >
                          <div className="w-5 h-5 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase shadow-sm">
                            {user?.firstName?.charAt(0) || "U"}
                          </div>
                          <span>My Dashboard</span>
                        </Link>
                        {user?.accountType === "seller" && (
                          <Link
                            href="/addproperty"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover active:scale-95 shadow-md shadow-primary/10 transition-all duration-200"
                          >
                            <PlusCircle size={14} />
                            Add Property
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white active:scale-95 text-xs font-bold border border-red-500/25 transition-all duration-200"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 flex items-center justify-center py-3 rounded-xl bg-card-bg text-text-primary text-xs font-bold border border-card-border hover:bg-card-hover-bg active:bg-card-hover-bg active:scale-95 text-center transition-all duration-200"
                        >
                          Become a Host
                        </Link>
                        <Link
                          href="/signin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 flex items-center justify-center py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover active:scale-95 text-center shadow-md shadow-primary/10 transition-all duration-200"
                        >
                          Sign In
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Global Overlay Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setSearchOpen(false)}
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-xl bg-glass-bg border border-glass-border rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 text-left"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where would you like to board? (e.g. Homagama, Colombo)"
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-card-bg text-text-primary placeholder-text-muted/60 border border-card-border focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary-glow text-sm transition-all text-text-primary"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 text-xs font-semibold text-text-muted hover:text-text-primary bg-card-hover-bg border border-card-border/60 rounded-md px-1.5 py-0.5 cursor-pointer"
                >
                  ESC
                </button>
              </form>
              <div className="text-xs text-text-muted space-y-2">
                <p className="font-semibold text-text-primary">Popular Districts / Universities</p>
                <div className="flex flex-wrap gap-2">
                  {["Homagama", "Colombo", "Galle", "Kandy", "Moratuwa", "Kelaniya"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSearchQuery(loc);
                        router.push(`/property-land?search=${encodeURIComponent(loc)}`);
                        setSearchOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-card-bg border border-card-border hover:bg-primary-glow hover:border-primary/30 hover:text-primary transition-all cursor-pointer font-medium text-text-primary"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="fixed top-4 inset-x-4 max-w-7xl mx-auto z-50 bg-transparent py-4 border border-transparent">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10" />
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  );
}