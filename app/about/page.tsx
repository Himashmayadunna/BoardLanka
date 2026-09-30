"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Check, ShieldCheck, Compass } from "lucide-react";

const stats = [
  { value: "1,200+", label: "Verified Residences", desc: "Across 10+ districts" },
  { value: "5,000+", label: "Residents Placed", desc: "Students & executives" },
  { value: "50+", label: "University Zones", desc: "All major campus corridors" },
  { value: "100%", label: "Direct Landlord Contact", desc: "Zero broker markups" },
];

const team = [
  { name: "Himash Mayadunna", role: "Founder & Product Architect", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" },
  { name: "Dr. Asela Gunawardena", role: "Operations & Academic Advisor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300" },
  { name: "Shenal Perera", role: "Design Systems & Engineering", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-24 space-y-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* Editorial Section Header */}
        <div className="border-b border-[var(--border-hairline)] pb-12 space-y-4 max-w-3xl text-left">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            Our Manifesto & Story
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[var(--text-primary)] font-normal tracking-tight leading-[1.08]">
            Curating residential living in <span className="italic font-light text-[var(--accent-earth)]">Sri Lanka.</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed pt-2">
            BoardLanka was founded to replace chaotic roadside paper posters and predatory broker commissions with a calm, verified property ecosystem.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-hairline)] text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 space-y-1">
                <span className="stat-strip-numeral text-3xl sm:text-4xl text-[var(--text-primary)]">{s.value}</span>
                <p className="stat-strip-label">{s.label}</p>
                <p className="text-[11px] text-[var(--text-light)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision (Hairline Grid) */}
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent-earth)]">
              The Purpose
            </span>
            <h3 className="font-serif text-2xl text-[var(--text-primary)]">Zero Agency Friction</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
              Every student moving near NSBM or Moratuwa, and every doctor shifting to Colombo hospitals, deserves direct NIC-verified host contacts, authentic specs, and digital lease security.
            </p>
          </div>

          <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent-sand)]">
              The Infrastructure
            </span>
            <h3 className="font-serif text-2xl text-[var(--text-primary)]">Complete Operations Software</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
              We empower landlords with enterprise-grade tenancy management — rent ledger tracking, branded PDF invoicing, and repair logistics without complicated spreadsheets.
            </p>
          </div>
        </div>

        {/* Editorial Team Strip */}
        <div className="border-t border-[var(--border-hairline)] pt-16 space-y-8 text-left">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Leadership
            </span>
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">The Founding Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((m, idx) => (
              <div key={idx} className="border border-[var(--border-hairline)] bg-[var(--surface)] p-6 space-y-4">
                <div className="relative h-48 w-full overflow-hidden bg-[var(--surface-subtle)]">
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    fill
                    sizes="33vw"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[var(--text-primary)]">{m.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] font-light mt-0.5">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Contact CTA */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-[var(--text-primary)]">Have a partnership or campus inquiry?</h3>
            <p className="text-xs text-[var(--text-muted)]">Connect with our Colombo concierge team directly.</p>
          </div>
          <Link
            href="/contact"
            className="btn-editorial btn-editorial-primary py-3 px-6 text-xs font-semibold shrink-0"
          >
            <span>Contact Concierge</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}
