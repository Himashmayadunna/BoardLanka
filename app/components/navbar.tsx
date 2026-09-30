"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Building,
  Plus
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Scroll detection for navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut listener for quick search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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

  // Initialize and synchronize auth and theme state
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token) {
      setIsLoggedIn(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      setIsDarkMode(true);
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.setAttribute("data-theme", "dark");
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
      router.push(`/findrooms?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navItems = [
    { label: "Residences", href: "/findrooms" },
    { label: "Houses & Villas", href: "/annexes-houses" },
    { label: "List a Property", href: "/addproperty" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Whether navbar is currently sitting over a full-bleed dark hero image (at top of Home page)
  const isOverDarkHero = pathname === "/" && !isScrolled;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Boutique Editorial Navigation Bar */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isOverDarkHero
            ? "bg-gradient-to-b from-black/85 via-black/45 to-transparent border-b border-white/10 py-5"
            : isScrolled
            ? "bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border-hairline)] shadow-[0_1px_0_0_rgba(0,0,0,0.03)] py-4"
            : "bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border-hairline)] py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-6">
          
          {/* Brand Logo & Editorial Wordmark */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className={`relative w-7 h-7 overflow-hidden rounded-[2px] flex items-center justify-center transition-colors ${
              isOverDarkHero 
                ? "border border-white/20 bg-white/10" 
                : "border border-[var(--border-hairline)] bg-[var(--surface)]"
            }`}>
              <Image
                src="/logo/logo.png"
                alt="BoardLanka"
                fill
                sizes="28px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-serif text-lg tracking-tight font-medium leading-tight ${
                isOverDarkHero ? "text-white" : "text-[var(--foreground)]"
              }`}>
                Board<span className={`italic font-light ${
                  isOverDarkHero ? "text-[#DEC29B]" : "text-[var(--accent-earth)]"
                }`}>Lanka</span>
              </span>
              <span className={`text-[9px] uppercase tracking-[0.24em] font-sans -mt-0.5 hidden sm:block ${
                isOverDarkHero ? "text-white/70" : "text-[var(--text-muted)]"
              }`}>
                Curated Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Small, Uppercase, Wide Tracking */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navItems.map((item) => {
              const itemPathname = item.href.split("?")[0];
              const isActive = pathname === itemPathname;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={true}
                  className={`group relative text-[11px] uppercase tracking-[0.2em] font-medium transition-colors py-1 ${
                    isOverDarkHero
                      ? isActive
                        ? "text-white font-semibold"
                        : "text-white/80 hover:text-white"
                      : isActive 
                        ? "text-[var(--foreground)] font-semibold" 
                        : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Subtle hairline hover underline */}
                  <span 
                    className={`absolute left-0 bottom-0 w-full h-[1px] transition-transform duration-300 origin-left ${
                      isOverDarkHero ? "bg-[#DEC29B]" : "bg-[var(--accent-earth)]"
                    } ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Search, Theme Switcher, Notifications & Auth */}
          <div className="flex items-center space-x-3.5">
            
            {/* Minimal Search Button */}
            <button 
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`flex items-center gap-2 transition-colors cursor-pointer p-1.5 border rounded-[2px] ${
                isOverDarkHero
                  ? "text-white/80 hover:text-white border-transparent hover:border-white/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)] border-transparent hover:border-[var(--border-hairline)]"
              }`}
              title="Search residences (Cmd+K)"
            >
              <Search size={15} strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.16em] hidden md:inline-block font-medium">
                Search
              </span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className={`transition-colors relative cursor-pointer p-1.5 border rounded-[2px] ${
                  isOverDarkHero
                    ? "text-white/80 hover:text-white border-transparent hover:border-white/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--foreground)] border-transparent hover:border-[var(--border-hairline)]"
                }`}
                title="Notifications"
              >
                <Bell size={15} strokeWidth={1.5} />
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                  isOverDarkHero ? "bg-[#DEC29B]" : "bg-[var(--accent-earth)]"
                }`} />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 border border-[var(--border-hairline)] bg-[var(--surface)] p-4 shadow-xl text-left z-50 rounded-[2px]"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2.5 mb-2.5">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--text-primary)]">
                        Notifications
                      </h4>
                      <span className="text-[9px] uppercase tracking-wider text-[var(--accent-earth)] font-semibold">
                        1 Recent
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 border border-[var(--border-hairline)] bg-[var(--surface-subtle)]">
                        <p className="font-serif text-sm text-[var(--text-primary)] font-medium">Welcome to BoardLanka</p>
                        <p className="text-[var(--text-muted)] text-[11px] mt-1 leading-relaxed">
                          Discover curated residential rentals across Colombo, Homagama, Galle, and university corridors.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark/Light Mode Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className={`transition-colors cursor-pointer p-1.5 border rounded-[2px] ${
                isOverDarkHero
                  ? "text-white/80 hover:text-white border-transparent hover:border-white/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)] border-transparent hover:border-[var(--border-hairline)]"
              }`}
              title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun size={15} strokeWidth={1.5} className={isOverDarkHero ? "text-[#DEC29B]" : "text-[var(--accent-sand)]"} />
              ) : (
                <Moon size={15} strokeWidth={1.5} />
              )}
            </button>

            {/* Thin Hairline Divider */}
            <div className={`h-4 w-px hidden sm:block ${
              isOverDarkHero ? "bg-white/20" : "bg-[var(--border-hairline)]"
            }`} />

            {/* Auth / Profile CTA */}
            <div className="hidden sm:flex items-center space-x-3">
              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer rounded-[2px] border ${
                      isOverDarkHero
                        ? "border-white/20 text-white bg-white/10 hover:border-white/40"
                        : "border-[var(--border-hairline)] hover:border-[var(--foreground)] text-[var(--foreground)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      isOverDarkHero ? "bg-[#DEC29B]" : "bg-[var(--accent-earth)]"
                    }`} />
                    <span>{user?.firstName || "Account"}</span>
                    <ChevronDown size={12} strokeWidth={1.5} />
                  </button>
                  
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 border border-[var(--border-hairline)] bg-[var(--surface)] p-2 shadow-xl text-left space-y-1 z-50 rounded-[2px]"
                      >
                        <Link 
                          href="/profile" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                        >
                          <LayoutDashboard size={13} strokeWidth={1.5} />
                          <span>My Portfolio</span>
                        </Link>
                        {user?.accountType === "seller" && (
                          <>
                            <Link 
                              href="/my-listings" 
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                            >
                              <Building size={13} strokeWidth={1.5} />
                              <span>My Listings</span>
                            </Link>
                            <Link 
                              href="/addproperty" 
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                            >
                              <Plus size={13} strokeWidth={1.5} />
                              <span>List Residence</span>
                            </Link>
                          </>
                        )}
                        <div className="h-px bg-[var(--border-hairline)] my-1" />
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-[11px] uppercase tracking-wider text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut size={13} strokeWidth={1.5} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/signin"
                    className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${
                      isOverDarkHero 
                        ? "text-white/90 hover:text-white" 
                        : "text-[var(--text-primary)] hover:text-[var(--accent-earth)]"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/addproperty"
                    className="btn-editorial btn-editorial-primary text-[11px] py-2 px-4 shadow-sm"
                  >
                    List Property
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1.5 cursor-pointer ${
                isOverDarkHero ? "text-white" : "text-[var(--foreground)]"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>

          </div>
        </div>

        {/* Mobile Expanded Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden lg:hidden bg-[var(--background)] border-t border-[var(--border-hairline)] mt-3"
            >
              <div className="px-6 py-5 space-y-4">
                
                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] py-2 border-b border-[var(--border-hairline)] flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Auth & Action Links */}
                <div className="pt-2 flex flex-col gap-2">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 text-[11px] uppercase tracking-[0.18em] font-medium border border-[var(--border-hairline)] text-[var(--foreground)] bg-[var(--surface)]"
                      >
                        My Portfolio
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-center py-2.5 text-[11px] uppercase tracking-[0.18em] font-medium text-rose-600 border border-rose-500/30 bg-rose-500/5 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center py-2.5 text-[11px] uppercase tracking-[0.18em] font-medium border border-[var(--border-hairline)] text-[var(--foreground)] bg-[var(--surface)]"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/addproperty"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-editorial btn-editorial-primary text-center py-2.5 text-[11px] uppercase tracking-[0.18em] font-semibold"
                      >
                        List Property
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* Global Quick Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-hairline)] rounded-[2px] shadow-2xl overflow-hidden p-6 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)]">
                  Quick Property Search
                </span>
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter location, property type, or university area..."
                  className="input-underline text-base font-serif italic placeholder:font-sans placeholder:not-italic"
                />
                <button 
                  type="submit"
                  className="absolute right-0 bottom-2 text-xs uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] hover:underline cursor-pointer"
                >
                  Search →
                </button>
              </form>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-light)] mb-2 font-medium">
                  Popular Regions
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Homagama", "Colombo 07", "Katunayake", "Galle", "NSBM Campus", "Moratuwa"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        router.push(`/findrooms?search=${encodeURIComponent(tag)}`);
                        setSearchOpen(false);
                      }}
                      className="text-[11px] tracking-wider px-2.5 py-1 border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors rounded-[2px] cursor-pointer bg-[var(--surface-subtle)]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16" />}>
      <NavbarContent />
    </Suspense>
  );
}