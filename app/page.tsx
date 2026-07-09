"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  MessageSquare, 
  Search, 
  ShieldCheck, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

interface Property {
  id: string | number;
  title: string;
  location: string;
  area?: string;
  price: number;
  type: string;
  images: string[];
  bedrooms: number;
  bathrooms?: number;
  seller?: { verified: boolean };
}

const cities = [
  { name: "Colombo", count: "420+ Listings", search: "colombo", img: "https://images.unsplash.com/photo-1588598126743-4e3112c32cf9?w=600" },
  { name: "Homagama", count: "180+ Listings", search: "homagama", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600" },
  { name: "Biyagama", count: "90+ Listings", search: "biyagama", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600" },
  { name: "Katunayaka", count: "120+ Listings", search: "katunayaka", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600" },
  { name: "Galle", count: "150+ Listings", search: "galle", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
  { name: "Jaffna", count: "65+ Listings", search: "jaffna", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600" },
];

const testimonials = [
  {
    quote: "Finding an annex near my campus was incredibly difficult until I used BoardLanka. The owner details were verified, and I booked it directly within a day!",
    author: "Shenal Perera",
    role: "Engineering Student, UoM",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    quote: "Listing my property on BoardLanka was seamless. I upgraded to a host account and started receiving high-quality leads from university students immediately.",
    author: "Nilanthi Jayasinghe",
    role: "Property Owner, Homagama",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
  },
  {
    quote: "A premium solution for modern rentals in Sri Lanka. The user interface feels next-generation, and filtering by university areas is a game-changer.",
    author: "Dr. Asela Gunawardena",
    role: "Senior Lecturer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  }
];

const mockProperties: Property[] = [
  {
    id: "mock-1",
    title: "Modern Annex near University of Moratuwa",
    location: "Katubedda, Moratuwa",
    price: 18000,
    type: "annex",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
    bedrooms: 1,
    bathrooms: 1,
    seller: { verified: true }
  },
  {
    id: "mock-2",
    title: "Luxury Sharing Room for Students - Homagama",
    location: "Pitipana, Homagama",
    price: 12000,
    type: "room",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    bedrooms: 2,
    bathrooms: 1,
    seller: { verified: true }
  },
  {
    id: "mock-3",
    title: "Premium 3-Bedroom Family House",
    location: "Thalawathugoda, Colombo",
    price: 75000,
    type: "house",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
    bedrooms: 3,
    bathrooms: 2,
    seller: { verified: true }
  }
];

export default function Home() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/property-land?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch properties from local API
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
        const res = await fetch(`${apiUrl}/api/properties`);
        if (res.ok) {
          const data = (await res.json()) as Property[];
          setFeatured(data.slice(0, 3)); // show first 3 items
        } else {
          throw new Error("Failed to fetch properties from API");
        }
      } catch (err) {
        console.warn("Failed to load featured properties from API. Using local mock data fallback.", err);
        setFeatured(mockProperties);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-20">
      
      {/* Mesh glowing particle background */}
      <MeshBackground />

      {/* Hero Section */}
      <section className="dark relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Full covered 3D background image with movement */}
        <motion.div 
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            x: mousePos.x,
            y: mousePos.y,
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
        >
          <div className="absolute inset-0 animate-slow-drift">
            <Image
              src="/hero-3d-bg.png"
              alt="BoardLanka Premium 3D Background"
              fill
              priority
              className="object-cover object-center"
              unoptimized
            />
          </div>
          {/* Multi-layered dark glass overlay for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35 mix-blend-multiply animate-fade-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            {/* Left Glass Card containing details */}
            <motion.div 
              className="glass-card backdrop-blur-md bg-black/45 border border-white/10 p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden space-y-6 md:space-y-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Decorative corner glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              <motion.div 
                variants={fadeInUp} 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-glow border border-primary/20 text-xs font-semibold text-primary"
              >
                <Sparkles size={14} />
                <span>The Future of Sri Lankan Rentals</span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp} 
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] keep-white"
              >
                Find Your Perfect <br />
                <span className="bg-gradient-to-r from-primary via-teal-400 to-secondary bg-clip-text text-transparent animate-pulse">
                  Annex or House
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp} 
                className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed keep-white"
              >
                Helping university students, working professionals and modern families discover verified boarding places and luxury homes across Sri Lanka.
              </motion.p>

              {/* Quick Search Widget */}
              <motion.form 
                variants={fadeInUp}
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 p-2 sm:p-2.5 rounded-2xl md:rounded-[1.5rem] backdrop-blur-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary-glow/20 transition-all"
              >
                <div className="flex-1 flex items-center gap-2 px-1 sm:px-3">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city or university (e.g. Homagama)..."
                    className="w-full bg-transparent border-0 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-0 py-2 keep-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto"
                >
                  Search
                </button>
              </motion.form>

              {/* Action Links */}
              <motion.div 
                variants={fadeInUp} 
                className="flex flex-col sm:flex-row items-center gap-3.5 pt-2"
              >
                <Link
                  href="/property-land"
                  className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 w-full sm:w-auto text-center font-semibold"
                >
                  Explore Properties
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5 w-full sm:w-auto text-center font-semibold"
                >
                  Become a Host
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="relative py-20 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Search by <span className="text-primary">Categories</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Explore listings tailored specifically to your residential needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Annexes", desc: "For young couples & professionals", link: "/anexxes-rooms", icon: "🏠", color: "from-purple-500/10 to-pink-500/10" },
              { title: "Houses", desc: "For families & sharing groups", link: "/property-land?type=house", icon: "🏰", color: "from-emerald-500/10 to-teal-500/10" },
              { title: "Land / Plots", desc: "Build your customized home", link: "/property-land?type=land", icon: "🏔️", color: "from-orange-500/10 to-red-500/10" }
            ].map((cat, i) => (
              <Link 
                key={i} 
                href={cat.link}
                className={`glass-card p-6 rounded-3xl text-left flex flex-col justify-between min-h-[180px] bg-gradient-to-br ${cat.color} group`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1.5 group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-xs text-text-muted">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <TrendingUp size={12} />
                <span>Featured Collections</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Our Most Popular <span className="text-primary">Listings</span>
              </h2>
            </div>
            <Link 
              href="/property-land" 
              className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors group"
            >
              View All Properties 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-3xl h-96 animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-48 bg-white/5 rounded-2xl" />
                  <div className="space-y-3 py-4">
                    <div className="h-6 bg-white/5 rounded w-2/3" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-white/5 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featured.map((item) => (
                <Link
                  href={item.type === "annex" || item.type === "room" ? `/anexxes-rooms?id=${item.id}` : `/property-land?id=${item.id}`}
                  key={item.id}
                  className="glass-card rounded-3xl overflow-hidden group flex flex-col justify-between h-[430px]"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image
                      src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {item.seller?.verified && (
                      <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle size={10} />
                        Verified
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
                      {item.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
                        <MapPin size={12} className="text-text-muted/70" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-card-border pt-4">
                      <div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                          Rs. {item.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-text-muted"> /month</span>
                      </div>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-card-bg text-text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-4xl mb-4 block">🏠</span>
              <p className="text-gray-400">No properties available at the moment. Try listing your own!</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="relative py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Popular <span className="text-primary">Locations</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Find accommodation options located adjacent to central cities and university districts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/property-land?location=${city.search}`}
                className="dark group relative h-48 rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-end p-4 shadow-lg hover:border-primary/50 transition-all duration-300"
              >
                {/* Background Image with Overlay */}
                <Image
                  src={city.img}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 z-0"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20">
                  <h3 className="font-bold text-base text-white mb-0.5 group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-[10px] text-gray-400">{city.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose BoardLanka */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-primary">BoardLanka</span>?
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              We focus on building the cleanest rental search platform in Sri Lanka.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Filters",
                desc: "Search properties by room count, pricing metrics, area proximity and university distance without clutter.",
                icon: <Search className="text-teal-400" size={24} />
              },
              {
                title: "Verified Listings",
                desc: "Properties are flagged as verified only after reviewing the seller credentials and documentation.",
                icon: <ShieldCheck className="text-primary" size={24} />
              },
              {
                title: "Zero Middlemen",
                desc: "Establish direct contact with the owner via WhatsApp or direct calls. We charge zero brokerage fee.",
                icon: <MessageSquare className="text-orange-400" size={24} />
              }
            ].map((box, i) => (
              <div 
                key={i}
                className="glass-card p-8 rounded-3xl text-left space-y-6 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
                  {box.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">{box.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{box.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 border-y border-white/5 bg-black/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
            <Users size={12} />
            <span>Success Stories</span>
          </div>

          {/* Testimonial Panel */}
          <div className="relative min-h-[220px] flex items-center justify-center">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl text-gray-300 italic font-medium leading-relaxed">
                &ldquo;{testimonials[testimonialIdx].quote}&rdquo;
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <img
                    src={testimonials[testimonialIdx].avatar}
                    alt={testimonials[testimonialIdx].author}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-sm text-white">{testimonials[testimonialIdx].author}</h4>
                  <p className="text-[10px] text-gray-500">{testimonials[testimonialIdx].role}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button 
              onClick={prevTestimonial}
              className="p-2 rounded-xl bg-card-bg hover:bg-card-hover-bg text-text-primary border border-card-border transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-muted font-semibold">{testimonialIdx + 1} / {testimonials.length}</span>
            <button 
              onClick={nextTestimonial}
              className="p-2 rounded-xl bg-card-bg hover:bg-card-hover-bg text-text-primary border border-card-border transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Rent boarding rooms or list your spaces in 3 simplified steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-[28px] inset-x-20 h-px bg-white/10 z-0" />

            {[
              { step: "01", title: "Search & Filter", desc: "Select rooms, annexes or houses. Filter by specific locations in Colombo, Galle, Homagama and price constraints." },
              { step: "02", title: "Direct Contact", desc: "View owner contact cards. Direct dial or tap to open WhatsApp to chat with the host instantly. Zero agent fee." },
              { step: "03", title: "Move In", desc: "Schedule a physical visit, review the facilities, complete payments directly and confirm your boarding details." }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 space-y-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white pt-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
