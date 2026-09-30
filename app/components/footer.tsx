"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--border-hairline)] bg-[var(--surface-subtle)] text-[var(--foreground)] mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        
        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[var(--border-hairline)]">
          
          {/* Brand & Manifesto Column (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-[2px] overflow-hidden border border-[var(--border-hairline)] bg-white flex items-center justify-center">
                <Image
                  src="/logo/logo.png"
                  alt="BoardLanka"
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="font-serif text-2xl tracking-tight text-[var(--text-primary)]">
                Board<span className="italic font-light text-[var(--accent-earth)]">Lanka</span>
              </span>
            </Link>

            <p className="font-serif italic text-base text-[var(--text-secondary)] leading-relaxed max-w-md">
              &ldquo;Connecting Sri Lanka&apos;s finest residential properties, student boarding annexes, and holiday villas with trusted, direct host communication.&rdquo;
            </p>

            <div className="space-y-2 pt-2 text-xs font-sans text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <MapPin size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                <span>Colombo 07 & Homagama University Corridor, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                <span>concierge@boardlanka.lk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                <span>+94 11 450 8900 (Mon–Sat, 8am–6pm)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Residences & Directory (3 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--text-primary)]">
              Residences
            </h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/findrooms" className="hover:text-[var(--accent-earth)] transition-colors">
                  All Residences
                </Link>
              </li>
              <li>
                <Link href="/findrooms?type=room" className="hover:text-[var(--accent-earth)] transition-colors">
                  Student Rooms
                </Link>
              </li>
              <li>
                <Link href="/findrooms?type=annex" className="hover:text-[var(--accent-earth)] transition-colors">
                  Private Annexes
                </Link>
              </li>
              <li>
                <Link href="/annexes-houses" className="hover:text-[var(--accent-earth)] transition-colors">
                  Houses & Villas
                </Link>
              </li>
              <li>
                <Link href="/findrooms?area=homagama" className="hover:text-[var(--accent-earth)] transition-colors">
                  Campus Corridor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Host With Us (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--text-primary)]">
              For Landlords
            </h4>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/addproperty" className="hover:text-[var(--accent-earth)] transition-colors">
                  List a Residence
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[var(--accent-earth)] transition-colors">
                  Host Portfolio
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--accent-earth)] transition-colors">
                  Verification Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--accent-earth)] transition-colors">
                  Host Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Gazette & Newsletter (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--text-primary)]">
              The Real Estate Gazette
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Curated monthly digest of Colombo rental trends, campus housing guides, and newly listed luxury villas.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="input-underline text-xs pr-8"
                />
                <button 
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-0 bottom-2 text-[var(--text-primary)] hover:text-[var(--accent-earth)] transition-colors cursor-pointer"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-[var(--accent-earth)] font-medium pt-1">
                  ✓ You are subscribed to the Gazette.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Strip — Minimal Hairline */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p className="font-serif tracking-tight">
            &copy; {currentYear} BoardLanka. Curated residential property marketplace.
          </p>

          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.16em]">
            <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact</Link>
            <Link href="/findrooms" className="hover:text-[var(--foreground)] transition-colors">Residences</Link>
            <Link href="/addproperty" className="hover:text-[var(--foreground)] transition-colors">Host</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}