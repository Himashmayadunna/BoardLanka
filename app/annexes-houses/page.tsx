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
  Phone, 
  Mail, 
  Calendar, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Share2, 
  Grid,
  Check,
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

const priceRanges = [
  { min: 0, max: 15000, label: "Under LKR 15,000" },
  { min: 15000, max: 35000, label: "LKR 15,000 – 35,000" },
  { min: 35000, max: 75000, label: "LKR 35,000 – 75,000" },
  { min: 75000, max: Infinity, label: "Above LKR 75,000" },
];

function AnnexesHousesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Selected Detail states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getExtendedImages = (property: Property) => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    return ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"];
  };

  const handleOverlayScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 60);
  };

  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      try {
        const { data } = await getProperties(
          { type: "room,annex,house" },
          (freshData) => {
            if (isMounted) setProperties(freshData);
          }
        );
        if (isMounted) {
          setProperties(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
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

  useEffect(() => {
    const location = searchParams.get("location") || searchParams.get("area");
    const id = searchParams.get("id");
    const search = searchParams.get("search");

    if (location) setSelectedArea(location.toLowerCase());
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
      setCurrentImageIdx(0);
      setShowContactDetails(false);
    } catch {
      const localProp = properties.find(p => String(p.id) === String(id));
      if (localProp) {
        setSelectedProperty(localProp);
        setCurrentImageIdx(0);
        setShowContactDetails(false);
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
      
    const matchesType = selectedType === "all" || 
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

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryName("");
      setInquiryPhone("");
    }, 4000);
  };

  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="border-b border-[var(--border-hairline)] pb-8 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            Annexes & University Corridors
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-5xl text-[var(--text-primary)] font-normal tracking-tight">
              Boutique Annexes & Suites
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md font-light">
              Independent living quarters with private entrance, sub-meters, and quiet study environments near NSBM, Moratuwa, and Colombo.
            </p>
          </div>
        </div>

        {/* Minimalist Filter Bar */}
        <div className="bg-[var(--surface)] border border-[var(--border-hairline)] p-6 rounded-[2px] shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="space-y-1">
              <label className="label-floating">Search Location / Title</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Pitipana, Homagama..."
                className="input-underline text-xs"
              />
            </div>

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

            <div className="space-y-1">
              <label className="label-floating">Unit Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-underline text-xs font-medium cursor-pointer"
              >
                <option value="all">All Annexes & Rooms</option>
                <option value="annex">Independent Annex</option>
                <option value="room">Private Single Room</option>
                <option value="house">House / Suite</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-floating">Budget Bracket</label>
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

        {/* Results Info */}
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] border-b border-[var(--border-hairline)] pb-4">
          <p className="font-serif">
            Displaying <span className="font-sans font-semibold text-[var(--text-primary)]">{filtered.length}</span> verified annexes
          </p>
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

                    <div className="flex gap-4 text-xs text-[var(--text-secondary)] border-y border-[var(--border-hairline)] py-2.5 my-2">
                      {item.bedrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Bed size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                          <span>{item.bedrooms} Bed</span>
                        </span>
                      )}
                      {item.bathrooms && item.bathrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Bath size={13} strokeWidth={1.5} className="text-[var(--accent-earth)]" />
                          <span>{item.bathrooms} Bath</span>
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
            <h3 className="font-serif text-2xl text-[var(--text-primary)] mb-2">No matching annexes found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Please adjust your filter parameters.
            </p>
          </div>
        )}

      </div>

      {/* Detail Overlay */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          loading={loadingDetail}
          onClose={handleCloseDetail}
        />
      )}

    </div>
  );
}

export default function AnnexesHousesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 text-center text-xs uppercase tracking-widest text-[var(--text-muted)]">Loading Annexes...</div>}>
      <AnnexesHousesContent />
    </Suspense>
  );
}