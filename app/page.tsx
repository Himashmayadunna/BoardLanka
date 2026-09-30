"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  DoorOpen,
  Users,
  MapPin,
  ArrowRight,
  Star,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  PhoneCall,
  Sparkles,
  Plus
} from "lucide-react";

const popularLocations = [
  { name: "Homagama Corridor", count: "180+ residences", area: "homagama", desc: "Near NSBM Green University & Tech Park", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80" },
  { name: "Colombo 03 – 07", count: "420+ residences", area: "colombo", desc: "Prime executive suites & luxury apartments", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80" },
  { name: "Katunayake FTZ", count: "120+ residences", area: "katunayaka", desc: "Free Trade Zone & Airport transit corridors", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80" },
  { name: "Galle Coastal", count: "150+ residences", area: "galle", desc: "Southern coastline villas & heritage studios", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80" },
];

const realisticListings = [
  {
    id: 1,
    title: "The Emerald Annex & Garden Terrace",
    location: "Pitipana, Homagama",
    type: "Private Annex",
    price: 42500,
    bedrooms: 1,
    bathrooms: 1,
    area: "homagama",
    amenities: ["Air Conditioned", "High-Speed Wi-Fi", "En-Suite Bath", "Dedicated Parking"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    rating: 4.9,
    reviews: 18,
    distance: "5 mins to NSBM Green University"
  },
  {
    id: 2,
    title: "Executive Residence at Cinnamon Gardens",
    location: "Cinnamon Gardens, Colombo 07",
    type: "Luxury Suite",
    price: 95000,
    bedrooms: 2,
    bathrooms: 2,
    area: "colombo",
    amenities: ["Fully Furnished", "Gated Security", "Hot Water", "Backup Generator"],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    rating: 5.0,
    reviews: 24,
    distance: "Walking distance to Asiri Central"
  },
  {
    id: 3,
    title: "Minimalist Studio for Tech & Aviation",
    location: "Katunayake Free Trade Zone",
    type: "Single Room",
    price: 25000,
    bedrooms: 1,
    bathrooms: 1,
    area: "katunayaka",
    amenities: ["Smart Sub-Meter", "Fiber Internet", "Study Desk", "Shared Kitchenette"],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    rating: 4.8,
    reviews: 14,
    distance: "Near Airport Link & Terminal"
  }
];

const marketplaceWorkflow = [
  { number: "01", name: "Curated Directory", desc: "Filter by exact university, budget, or district corridor", icon: Search },
  { number: "02", name: "Verified Identity", desc: "All hosts verified with Sri Lanka National Identity (NIC)", icon: ShieldCheck },
  { number: "03", name: "360 Virtual Tours", desc: "Inspect room lighting, furnishings, and surrounding environment", icon: Compass },
  { number: "04", name: "Direct Contact", desc: "Connect directly with verified owners via WhatsApp and call", icon: PhoneCall },
];

const genuineTestimonials = [
  {
    quote: "Finding a calm, verified annex near the Moratuwa campus used to mean searching random paper leaflets. On BoardLanka, the owner was verified, unit specs were accurate, and moving in was seamless.",
    author: "Shenal Perera",
    role: "Engineering Student",
    location: "Katubedda / Moratuwa"
  },
  {
    quote: "Listing our 4 annex units in Homagama took less than five minutes. We receive qualified student inquiries with complete peace of mind.",
    author: "Sunil Jayawardena",
    role: "Property Host",
    location: "Homagama Corridor"
  },
  {
    quote: "The direct WhatsApp communication and transparent rent details make finding long-term executive housing in Colombo effortless.",
    author: "Dr. Nilanthi Gunasekara",
    role: "Medical Resident",
    location: "Colombo 07"
  }
];

export default function HomePage() {
  const router = useRouter();

  // Search state
  const [searchLocation, setSearchLocation] = useState("all");
  const [searchType, setSearchType] = useState("all");
  const [searchBudget, setSearchBudget] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts: string[] = [];
    if (searchLocation !== "all") queryParts.push(`area=${encodeURIComponent(searchLocation)}`);
    if (searchType !== "all") queryParts.push(`type=${encodeURIComponent(searchType)}`);
    const q = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    router.push(`/findrooms${q}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#B85D3B]/20">
      
      {/* 1. Full-Bleed Editorial Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-6 sm:px-8 lg:px-12 border-b border-[var(--border-hairline)] overflow-hidden">
        {/* Natural Atmospheric Photographic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&auto=format&fit=crop&q=85"
            alt="Sri Lankan Boutique Residence Architecture"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center brightness-[0.88] contrast-[1.03]"
          />
          {/* Subtle Warm Photographic Overlay Tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#181816]/75 via-[#181816]/55 to-[#181816]/85" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 text-[#FAF8F5]">
          
          {/* Micro Subhead */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1 border border-white/20 text-[11px] uppercase tracking-[0.24em] font-medium text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-earth)]" />
            <span>Curated Real Estate Marketplace</span>
          </div>

          {/* Editorial Display Headline with Serif Italic Emphasis */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.08] text-white">
              Exceptional residences. <br />
              <span className="italic font-light text-[#E8DCCB]">Quiet, verified rentals.</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-light pt-2">
              Sri Lanka&apos;s premier marketplace for verified boarding, private annexes, and standalone houses — with direct host communication.
            </p>
          </div>

          {/* Quick Dual CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/findrooms"
              className="btn-editorial btn-editorial-primary px-7 py-3.5 text-xs font-semibold tracking-[0.18em]"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/addproperty"
              className="btn-editorial bg-white/10 hover:bg-white/20 text-white border border-white/30 px-7 py-3.5 text-xs font-semibold tracking-[0.18em]"
            >
              <Plus size={14} />
              <span>List a Property</span>
            </Link>
          </div>

          {/* Architectural Quick Search Bar */}
          <div className="pt-8 max-w-4xl mx-auto text-left">
            <div className="bg-[#FAF8F5] text-[#181816] border border-[var(--border-hairline)] p-6 sm:p-7 rounded-[2px] shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-hairline)]">
                <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--text-muted)]">
                  Property Finder — Verified Listings
                </span>
                <Link 
                  href="/addproperty" 
                  className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--accent-earth)] hover:underline flex items-center gap-1"
                >
                  <span>Host a Space</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">
                
                {/* Location */}
                <div className="space-y-1">
                  <label className="label-floating">City / Corridor</label>
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="input-underline text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Sri Lanka Locations</option>
                    <option value="colombo">Colombo 03 – 07</option>
                    <option value="homagama">Homagama (NSBM Corridor)</option>
                    <option value="katunayaka">Katunayake (FTZ / Airport)</option>
                    <option value="galle">Galle Coastal</option>
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="label-floating">Property Category</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="input-underline text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Residential Types</option>
                    <option value="room">Private Single Room</option>
                    <option value="annex">Independent Annex</option>
                    <option value="house">House / Villa Suite</option>
                  </select>
                </div>

                {/* Price Bracket */}
                <div className="space-y-1">
                  <label className="label-floating">Monthly Budget</label>
                  <select
                    value={searchBudget}
                    onChange={(e) => setSearchBudget(e.target.value)}
                    className="input-underline text-xs font-medium cursor-pointer"
                  >
                    <option value="all">Any Monthly Budget</option>
                    <option value="under_30k">Under LKR 30,000</option>
                    <option value="30k_60k">LKR 30,000 – 60,000</option>
                    <option value="60k_120k">LKR 60,000 – 120,000</option>
                    <option value="120k_plus">LKR 120,000+</option>
                  </select>
                </div>

                {/* Search CTA */}
                <div>
                  <button
                    type="submit"
                    className="w-full btn-editorial btn-editorial-dark py-3.5 text-xs font-semibold"
                  >
                    <Search size={14} />
                    <span>Search</span>
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>
      </section>

      {/* 2. Stats & Trust Metrics Strip — Large Serif Numerals + Hairlines */}
      <section className="border-b border-[var(--border-hairline)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-hairline)] text-center">
            
            <div className="py-4 md:py-0 px-4 space-y-1">
              <span className="stat-strip-numeral text-3xl sm:text-4xl text-[var(--text-primary)]">350+</span>
              <p className="stat-strip-label">Verified Residences</p>
            </div>

            <div className="py-4 md:py-0 px-4 space-y-1">
              <span className="stat-strip-numeral text-3xl sm:text-4xl text-[var(--text-primary)]">100%</span>
              <p className="stat-strip-label">NIC Verified Hosts</p>
            </div>

            <div className="py-4 md:py-0 px-4 space-y-1">
              <span className="stat-strip-numeral text-3xl sm:text-4xl text-[var(--text-primary)]">6 Regions</span>
              <p className="stat-strip-label">Major University Hubs</p>
            </div>

            <div className="py-4 md:py-0 px-4 space-y-1">
              <span className="stat-strip-numeral text-3xl sm:text-4xl text-[var(--accent-earth)]">4.9 / 5</span>
              <p className="stat-strip-label">Tenant Satisfaction</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Featured Verified Residences (Curated Boutique Marketplace) */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 border-b border-[var(--border-hairline)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
                Selected Portfolio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
                Featured Residences & Annexes
              </h2>
            </div>

            <Link
              href="/findrooms"
              className="text-xs uppercase tracking-[0.18em] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-earth)] transition-colors flex items-center gap-1 shrink-0 pb-1"
            >
              <span>View All Listings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Property Cards — Editorial, Minimal Hairlines, Serif Titles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {realisticListings.map((prop) => (
              <article
                key={prop.id}
                className="group border border-[var(--border-hairline)] bg-[var(--surface)] hover:border-[var(--text-primary)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Natural Toning */}
                  <div className="relative h-64 w-full overflow-hidden bg-[var(--surface-subtle)]">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold bg-[var(--surface)] text-[var(--text-primary)] px-2.5 py-1 border border-[var(--border-hairline)]">
                        {prop.type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] tracking-wider font-semibold bg-[var(--surface)]/95 text-[var(--text-primary)] px-2 py-1 flex items-center gap-1 border border-[var(--border-hairline)]">
                        <Star size={11} className="text-[var(--accent-earth)] fill-[var(--accent-earth)]" />
                        <span>{prop.rating}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      <MapPin size={13} className="text-[var(--accent-earth)] shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <h3 className="font-serif text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-earth)] transition-colors leading-snug line-clamp-1">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] font-serif italic">
                      {prop.distance}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[var(--border-hairline)]">
                      {prop.amenities.map((am, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-[2px]"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="p-6 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between bg-[var(--surface-subtle)]">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                      Monthly Rent
                    </span>
                    <span className="font-serif text-lg font-normal text-[var(--text-primary)]">
                      LKR {prop.price.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/findrooms?search=${encodeURIComponent(prop.location)}`}
                    className="btn-editorial btn-editorial-dark py-2 px-3.5 text-[11px]"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Popular Regional Corridors */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 border-b border-[var(--border-hairline)] bg-[var(--surface-subtle)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Regional Corridors
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
              Explore residences by location
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light">
              High-demand university corridors, business districts, and tranquil coastal sanctuaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularLocations.map((loc) => (
              <Link
                key={loc.area}
                href={`/findrooms?area=${loc.area}`}
                className="group border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden transition-all hover:border-[var(--text-primary)] flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[var(--surface-subtle)]">
                  <Image
                    src={loc.img}
                    alt={loc.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute bottom-3 left-3 bg-[var(--surface)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold">
                    {loc.count}
                  </div>
                </div>
                <div className="p-5 space-y-1 text-left">
                  <h3 className="font-serif text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-earth)] transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light">
                    {loc.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. How It Works (Boutique Marketplace Process) */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 border-b border-[var(--border-hairline)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              How BoardLanka Works
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
              A transparent rental experience for residents & hosts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {marketplaceWorkflow.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="border border-[var(--border-hairline)] p-8 flex flex-col justify-between space-y-6 hover:border-[var(--text-primary)] transition-all bg-[var(--background)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl text-[var(--accent-earth)]">{step.number}</span>
                    <div className="w-10 h-10 border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-primary)] bg-[var(--surface)]">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[var(--text-primary)]">{step.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Editorial Testimonials */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 border-b border-[var(--border-hairline)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Resident & Host Feedback
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
              Trusted across Sri Lanka
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {genuineTestimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="border border-[var(--border-hairline)] p-8 bg-[var(--surface)] space-y-6 flex flex-col justify-between"
              >
                <p className="font-serif italic text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-4 border-t border-[var(--border-hairline)]">
                  <h3 className="font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[var(--text-primary)]">
                    {t.author}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {t.role} • {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Confident Bottom CTA Strip */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-[#181816] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            Begin Exploring
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
            Find your ideal residence today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
            Browse verified boarding rooms, private annexes, and standalone houses across Sri Lanka with direct host contact.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/findrooms"
              className="btn-editorial btn-editorial-primary px-8 py-3.5 text-xs font-semibold"
            >
              Browse Residences
            </Link>
            <Link
              href="/addproperty"
              className="btn-editorial bg-transparent border border-white/30 hover:bg-white/10 text-white px-8 py-3.5 text-xs font-semibold"
            >
              Host a Property
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
