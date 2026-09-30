"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Heart, 
  Building2,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProperties, getPropertyById } from "@/lib/propertyService";
import { PropertyGridSkeleton } from "@/app/components/PropertySkeleton";
import PropertyDetailModal from "@/app/components/PropertyDetailModal";

interface Property {
  id: string | number;
  title: string;
  location: string;
  area?: string;
  price: number;
  advancePayment?: number;
  bedrooms: number;
  bathrooms?: number;
  size?: number | string;
  type: string;
  images: string[];
  amenities: string[];
  description: string;
  seller: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string | null;
    verified: boolean;
  };
  available: boolean;
  createdAt?: string;
}

const locationOptions = [
  { value: "", label: "All Regions" },
  { value: "colombo", label: "Colombo 03 – 07" },
  { value: "homagama", label: "Homagama / NSBM" },
  { value: "biyagama", label: "Biyagama Corridor" },
  { value: "katunayaka", label: "Katunayake FTZ" },
  { value: "galle", label: "Galle Coast" },
  { value: "jaffna", label: "Jaffna Town" },
];

const typeOptions = [
  { value: "", label: "All Residential Types" },
  { value: "house", label: "House / Villa Suite" },
  { value: "land", label: "Estate & Land" },
  { value: "annex", label: "Independent Annex" },
  { value: "room", label: "Private Single Room" },
];

const priceRanges = [
  { min: 0, max: 20000, label: "Under LKR 20,000" },
  { min: 20000, max: 50000, label: "LKR 20,000 – 50,000" },
  { min: 50000, max: 100000, label: "LKR 50,000 – 100,000" },
  { min: 100000, max: Infinity, label: "Above LKR 100,000" },
];

function FindRoomsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Selected Detail states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleShare = () => {
    if (!selectedProperty) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${selectedProperty.id}`;
    navigator.clipboard.writeText(url);
  };

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Error loading favorites:", e);
      }
    }
  }, []);

  // Load properties
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      try {
        const { data } = await getProperties(
          { type: "house,land,annex,room" },
          (freshData) => {
            if (isMounted) setProperties(freshData);
          }
        );
        if (isMounted) {
          setProperties(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Error loading properties:", err);
        if (isMounted) {
          setProperties([]);
          setLoading(false);
        }
      }
    };
    fetchProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // Read URL query parameters
  useEffect(() => {
    const location = searchParams.get("location") || searchParams.get("area");
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const search = searchParams.get("search");

    if (location) setSelectedArea(location.toLowerCase());
    if (type) setSelectedType(type.toLowerCase());
    if (search) setSearchQuery(search);
    
    if (id) {
      fetchSingleDetail(id);
    } else {
      setSelectedProperty(null);
    }
  }, [searchParams]);

  const fetchSingleDetail = async (id: string | number) => {
    try {
      setLoadingDetail(true);
      const data = await getPropertyById(id);
      setSelectedProperty(data);
    } catch (err) {
      const localProp = properties.find(p => String(p.id) === String(id));
      if (localProp) {
        setSelectedProperty(localProp);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = properties.filter((prop) => {
    const matchesSearch = searchQuery === "" || 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prop.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesArea = selectedArea === "" || 
      prop.area?.toLowerCase() === selectedArea.toLowerCase();
      
    const matchesType = selectedType === "" || 
      prop.type.toLowerCase() === selectedType.toLowerCase();
      
    const matchesPrice = !selectedPriceRange || 
      (prop.price >= selectedPriceRange.min && prop.price <= selectedPriceRange.max);

    return matchesSearch && matchesArea && matchesType && matchesPrice;
  });

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  };

  const handleOpenDetail = (id: string | number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("id", String(id));
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
    const queryString = params.toString();
    router.push(`${window.location.pathname}${queryString ? `?${queryString}` : ""}`);
  };



  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-12">
        
        {/* Editorial Section Header */}
        <div className="border-b border-[var(--border-hairline)] pb-8 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            Marketplace Directory
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-5xl text-[var(--text-primary)] font-normal tracking-tight">
              Curated Residences & Estates
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md font-light">
              Verified private annexes, studio boarding spaces, and luxury homes with direct owner communication.
            </p>
          </div>
        </div>

        {/* Minimalist Architectural Filter Bar */}
        <div className="bg-[var(--surface)] border border-[var(--border-hairline)] p-6 rounded-[2px] shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Search Input */}
            <div className="space-y-1">
              <label className="label-floating">Search Location / Title</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Pitipana, Cinnamon Gardens..."
                className="input-underline text-xs"
              />
            </div>

            {/* Area Filter */}
            <div className="space-y-1">
              <label className="label-floating">Region</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="input-underline text-xs font-medium cursor-pointer"
              >
                {locationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-1">
              <label className="label-floating">Category</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-underline text-xs font-medium cursor-pointer"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-1">
              <label className="label-floating">Budget Range</label>
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  setSelectedPriceRange(isNaN(idx) ? null : priceRanges[idx]);
                }}
                className="input-underline text-xs font-medium cursor-pointer"
              >
                <option value="">All Price Brackets</option>
                {priceRanges.map((range, idx) => (
                  <option key={idx} value={idx}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Results Info & Count */}
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] border-b border-[var(--border-hairline)] pb-4">
          <p className="font-serif">
            Displaying <span className="font-sans font-semibold text-[var(--text-primary)]">{filtered.length}</span> verified listings
          </p>
          {selectedArea && (
            <span className="text-[11px] uppercase tracking-wider text-[var(--accent-earth)] font-semibold">
              Region: {selectedArea}
            </span>
          )}
        </div>

        {/* Listings Grid */}
        {loading && properties.length === 0 ? (
          <PropertyGridSkeleton count={6} />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => handleOpenDetail(item.id)}
                className="group border border-[var(--border-hairline)] bg-[var(--surface)] hover:border-[var(--text-primary)] transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative h-60 w-full overflow-hidden bg-[var(--surface-subtle)]">
                    <Image
                      src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      unoptimized={item.images?.[0]?.startsWith("data:")}
                    />
                    
                    <div className="absolute top-4 left-4">
                      {item.seller?.verified && (
                        <div className="bg-[var(--surface)] text-[var(--text-primary)] text-[9px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 border border-[var(--border-hairline)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>NIC Verified</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={(e) => toggleFavorite(Number(item.id), e)}
                      className="absolute top-4 right-4 p-2 bg-[var(--surface)]/90 border border-[var(--border-hairline)] text-[var(--text-primary)] hover:scale-105 transition-all"
                      title="Save to favorites"
                    >
                      <Heart 
                        size={13} 
                        className={favorites.includes(Number(item.id)) ? "fill-[var(--accent-earth)] text-[var(--accent-earth)]" : ""} 
                      />
                    </button>

                    <div className="absolute bottom-3 right-3 bg-[#181816]/80 text-[#FAF8F5] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-medium">
                      {item.type}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      <MapPin size={12} className="text-[var(--accent-earth)] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <h3 className="font-serif text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-earth)] transition-colors leading-snug line-clamp-1">
                      {item.title}
                    </h3>

                    {/* Specs strip */}
                    <div className="flex gap-4 text-xs text-[var(--text-secondary)] border-y border-[var(--border-hairline)] py-2.5 my-2">
                      {item.bedrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Bed size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                          <span>{item.bedrooms} Bed{item.bedrooms > 1 ? "s" : ""}</span>
                        </span>
                      )}
                      {item.bathrooms && item.bathrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Bath size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                          <span>{item.bathrooms} Bath{item.bathrooms > 1 ? "s" : ""}</span>
                        </span>
                      )}
                      {item.size && (
                        <span className="flex items-center gap-1.5">
                          <Maximize size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                          <span>{item.size} Sq.Ft</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between bg-[var(--surface-subtle)]">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] block">
                      Rent
                    </span>
                    <span className="font-serif text-lg text-[var(--text-primary)]">
                      LKR {item.price.toLocaleString()}
                      <span className="font-sans text-[10px] text-[var(--text-muted)]"> /mo</span>
                    </span>
                  </div>
                  <span className="btn-editorial btn-editorial-dark py-2 px-3 text-[10px]">
                    Inspect
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border-hairline)] p-8">
            <h3 className="font-serif text-2xl text-[var(--text-primary)] mb-2">No matching listings found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Please try adjusting your search terms, selecting all regions, or broadening your budget.
            </p>
          </div>
        )}

      </div>

      {/* Immersive Detail Overlay (Editorial Aesthetic) */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          loading={loadingDetail}
          isFavorite={favorites.includes(Number(selectedProperty.id))}
          onClose={handleCloseDetail}
          onToggleFavorite={toggleFavorite}
          onShare={handleShare}
        />
      )}

    </div>
  );
}

export default function FindRoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 text-center text-xs uppercase tracking-widest text-[var(--text-muted)]">Loading Marketplace...</div>}>
      <FindRoomsContent />
    </Suspense>
  );
}