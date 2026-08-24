"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  CheckCircle, 
  Heart, 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar, 
  Compass, 
  Map, 
  BookOpen, 
  Activity, 
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Grid
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";
import { motion, AnimatePresence } from "framer-motion";
import { getProperties, getPropertyById } from "@/lib/propertyService";
import { PropertyGridSkeleton } from "@/app/components/PropertySkeleton";

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
  { value: "", label: "All Areas" },
  { value: "colombo", label: "Colombo" },
  { value: "homagama", label: "Homagama" },
  { value: "biyagama", label: "Biyagama" },
  { value: "katunayaka", label: "Katunayaka" },
  { value: "galle", label: "Galle" },
  { value: "jaffna", label: "Jaffna" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "house", label: "House" },
  { value: "land", label: "Land" },
];

const priceRanges = [
  { min: 0, max: 20000, label: "Under Rs. 20K" },
  { min: 20000, max: 50000, label: "Rs. 20K - 50K" },
  { min: 50000, max: 100000, label: "Rs. 50K - 100K" },
  { min: 100000, max: Infinity, label: "Over Rs. 100K" },
];

function FindRoomsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Selected Detail states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "360" | "map">("details");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [calendarDate, setCalendarDate] = useState("");
  const [panX, setPanX] = useState(50); // 360 viewer simulated drag percentage
  const [showShareToast, setShowShareToast] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Return the property's real database images
  const getExtendedImages = (property: Property) => {
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    return ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"];
  };

  const handleShare = () => {
    if (!selectedProperty) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${selectedProperty.id}`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleOverlayScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 80) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const clientWidth = e.currentTarget.clientWidth;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      setCurrentImageIdx(idx);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  // Problem Reporting states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("Maintenance");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState("");
  const [reportErrorMsg, setReportErrorMsg] = useState("");
  
  const panoramaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Error loading favorites from localStorage:", e);
      }
    }
  }, []);

  // Load properties with SWR caching (instant display from cache + background revalidation)
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      try {
        const { data, isFromCache } = await getProperties(
          { type: "house,land" },
          (freshData) => {
            if (isMounted) setProperties(freshData);
          }
        );
        if (isMounted) {
          setProperties(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Failed to load properties from database:", err);
        if (isMounted) {
          setProperties([]);
          setError(null);
          setLoading(false);
        }
      }
    };
    fetchProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // Read URL query parameters (e.g. ?location=homagama&type=house&id=123)
  useEffect(() => {
    const location = searchParams.get("location");
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

  // Lock body scroll when detail overlay is open
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  // Fetch full details of a single property (with all images, cached)
  const fetchSingleDetail = async (id: string | number) => {
    try {
      setLoadingDetail(true);
      const data = await getPropertyById(id);
      setSelectedProperty(data);
      setCurrentImageIdx(0);
      setActiveTab("details");
      setShowContactDetails(false);
    } catch (err) {
      console.warn("Error loading property details from API, searching local data:", err);
      const localProp = properties.find(p => String(p.id) === String(id));
      if (localProp) {
        setSelectedProperty(localProp);
        setCurrentImageIdx(0);
        setActiveTab("details");
        setShowContactDetails(false);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter logic
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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportErrorMsg("");
    setReportSuccessMsg("");

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setReportErrorMsg("You must be signed in to submit a problem report.");
      setIsSubmittingReport(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty?.id,
          propertyTitle: selectedProperty?.title,
          issueType: reportIssueType,
          title: reportTitle,
          description: reportDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to file report");
      }

      setReportSuccessMsg("Issue filed successfully! The host and team will review it.");
      setReportTitle("");
      setReportDescription("");
      
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccessMsg("");
      }, 2500);
    } catch (err: any) {
      setReportErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Image Navigation
  const nextImage = () => {
    if (selectedProperty) {
      setCurrentImageIdx(prev => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty) {
      setCurrentImageIdx(prev => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Simulated 360 Panorama Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    startX.current = e.clientX;
    setPanX(prev => Math.max(0, Math.min(100, prev - dx * 0.1)));
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Premium <span className="text-primary">Properties & Lands</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Browse through luxury, verified boarding spaces, villas, and lands across Sri Lanka.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="glass-card p-6 rounded-3xl mb-8 flex flex-col gap-5 border border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location or title..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 text-sm transition-all"
              />
              <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>

            {/* Area Filter */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-sm transition-all appearance-none cursor-pointer"
            >
              {locationOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-sm transition-all appearance-none cursor-pointer"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setSelectedPriceRange(isNaN(idx) ? null : priceRanges[idx]);
              }}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-sm transition-all appearance-none cursor-pointer"
            >
              <option value="">All Price Ranges</option>
              {priceRanges.map((range, idx) => (
                <option key={idx} value={idx} className="bg-gray-900 text-white">
                  {range.label}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-400">
            Showing <span className="text-primary font-bold">{filtered.length}</span> luxury listings
          </p>
        </div>

        {/* Listings Grid */}
        {loading && properties.length === 0 ? (
          <PropertyGridSkeleton count={6} />
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item.id)}
                className="glass-card rounded-3xl overflow-hidden group flex flex-col justify-between h-[420px] cursor-pointer"
              >
                <div className="relative h-52 w-full overflow-hidden bg-white/5">
                  <Image
                    src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={item.images?.[0]?.startsWith("data:")}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.seller?.verified && (
                      <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle size={10} />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Favorite Trigger */}
                  <button 
                    onClick={(e) => toggleFavorite(Number(item.id), e)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all"
                  >
                    <Heart 
                      size={14} 
                      className={favorites.includes(Number(item.id)) ? "fill-red-500 text-red-500" : "text-white"} 
                    />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
                    {item.type.toUpperCase()}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={12} className="text-primary" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex gap-4 text-xs text-gray-400 my-4 border-y border-white/5 py-2.5">
                    {item.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed size={14} className="text-primary" />
                        {item.bedrooms} Bed{item.bedrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {item.bathrooms && item.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath size={14} className="text-primary" />
                        {item.bathrooms} Bath{item.bathrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {item.size && (
                      <span className="flex items-center gap-1">
                        <Maximize size={14} className="text-primary" />
                        {item.size} Sq.Ft
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                        Rs. {item.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500"> /month</span>
                    </div>
                    <span className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-5xl mb-4 block">🏔️</span>
            <h3 className="text-xl font-bold text-white mb-2">No matching properties found</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              Adjust your search keywords, category type, or area filter options.
            </p>
          </div>
        )}

      </div>

      {/* Immersive Detail Full Page Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div 
            ref={overlayRef}
            onScroll={handleOverlayScroll}
            data-lenis-prevent
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto w-full h-full min-h-screen text-text-primary select-text"
            style={{ overflowY: "auto" }}
          >
            {/* Sticky Modern Glassmorphic Header */}
            <div className={`sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between transition-all duration-300 border-b ${
              isScrolled 
                ? "bg-glass-bg border-glass-border shadow-lg" 
                : "bg-transparent border-transparent"
            }`}>
              <button 
                onClick={handleCloseDetail}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg hover:bg-card-hover-bg text-text-primary font-bold text-xs border border-card-border group transition-all cursor-pointer animate-none"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Listings
              </button>

              {/* Title reveals on scroll */}
              <div className={`hidden md:block max-w-xl text-center transition-all duration-300 ${
                isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}>
                <h3 className="font-extrabold text-sm text-text-primary line-clamp-1">{selectedProperty.title}</h3>
                <p className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">{selectedProperty.location}</p>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-card-bg hover:bg-card-hover-bg text-text-primary border border-card-border transition-all flex items-center justify-center cursor-pointer animate-none"
                  title="Share property link"
                >
                  <Share2 size={15} />
                </button>
                <button 
                  onClick={(e) => toggleFavorite(Number(selectedProperty.id), e)}
                  className="p-2.5 rounded-xl bg-card-bg hover:bg-card-hover-bg text-text-primary border border-card-border transition-all flex items-center justify-center cursor-pointer animate-none"
                  title="Add to favorites"
                >
                  <Heart 
                    size={15} 
                    className={favorites.includes(Number(selectedProperty.id)) ? "fill-red-500 text-red-500" : "text-text-primary"} 
                  />
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm font-medium animate-pulse">Loading property details...</p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24">
                {(() => {
                  const extendedImages = getExtendedImages(selectedProperty);
                  return (
                    <div className="space-y-8">
                      {/* Image Presentation */}
                      <div className="relative">
                        {/* Desktop Bento Collage Grid */}
                        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                          {/* Main Left Image (Col-span 2, Row-span 2) */}
                          <div className="col-span-2 row-span-2 relative overflow-hidden group">
                            <Image 
                              src={extendedImages[0]} 
                              alt={selectedProperty.title}
                              fill
                              className="object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.02] cursor-pointer"
                              onClick={() => openLightbox(0)}
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
                          </div>

                          {/* 4 smaller images on the right */}
                          {extendedImages.slice(1, 5).map((img, idx) => (
                            <div key={idx} className="relative overflow-hidden group">
                              <Image 
                                src={img} 
                                alt={`${selectedProperty.title} detail ${idx + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 scale-100 group-hover:scale-[1.02] cursor-pointer"
                                onClick={() => openLightbox(idx + 1)}
                                unoptimized
                            />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
                            </div>
                          ))}
                        </div>

                        {/* Mobile Swipeable Carousel */}
                        <div className="block md:hidden relative h-[280px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                          <div 
                            onScroll={handleMobileScroll}
                            className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-none"
                          >
                            {extendedImages.map((img, idx) => (
                              <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
                                <Image 
                                  src={img} 
                                  alt={`${selectedProperty.title} ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  onClick={() => openLightbox(idx)}
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Indicator dots for Mobile slider */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                            {extendedImages.slice(0, 5).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIdx ? "bg-primary w-4" : "bg-white/40"}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* View all photos action overlay button */}
                        <button 
                          onClick={() => openLightbox(0)}
                          className="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Grid size={14} />
                          View all photos
                        </button>
                      </div>

                      {/* Main Info Split-Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column (Main specs & details) */}
                        <div className="lg:col-span-8 space-y-8 text-left">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                                {selectedProperty.type}
                              </span>
                              {selectedProperty.seller?.verified && (
                                <span className="bg-emerald-500/25 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
                                  <CheckCircle size={12} className="fill-emerald-400/20" />
                                  Verified Seller
                                </span>
                              )}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight mb-2">{selectedProperty.title}</h2>
                            <p className="text-sm text-text-muted flex items-center gap-1.5 mt-2">
                              <MapPin size={16} className="text-primary" />
                              {selectedProperty.location}
                            </p>
                          </div>

                          {/* Stats Metrics (Specs) */}
                          <div className="grid grid-cols-3 gap-4 border-y border-card-border py-6">
                            {selectedProperty.bedrooms > 0 && (
                              <div className="flex items-center gap-3 bg-card-bg p-4 rounded-2xl border border-card-border">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                  <Bed size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Bedrooms</p>
                                  <p className="text-sm font-extrabold text-text-primary mt-0.5">{selectedProperty.bedrooms} Rooms</p>
                                </div>
                              </div>
                            )}
                            {selectedProperty.bathrooms && selectedProperty.bathrooms > 0 && (
                              <div className="flex items-center gap-3 bg-card-bg p-4 rounded-2xl border border-card-border">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                  <Bath size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Bathrooms</p>
                                  <p className="text-sm font-extrabold text-text-primary mt-0.5">{selectedProperty.bathrooms} Baths</p>
                                </div>
                              </div>
                            )}
                            {selectedProperty.size && (
                              <div className="flex items-center gap-3 bg-card-bg p-4 rounded-2xl border border-card-border">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                  <Maximize size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Area Size</p>
                                  <p className="text-sm font-extrabold text-text-primary mt-0.5 truncate">{selectedProperty.size} Sq.Ft</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* About Section */}
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-text-primary">About the Space</h3>
                            <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line bg-card-bg p-5 rounded-2xl border border-card-border">
                              {selectedProperty.description || "No description provided for this listing."}
                            </p>
                          </div>

                          {/* Amenities Offered */}
                          {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-xl font-bold text-text-primary">Amenities Offered</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedProperty.amenities.map((amenity, i) => (
                                  <div key={i} className="flex items-center gap-2.5 p-3.5 bg-card-bg rounded-2xl border border-card-border text-xs text-text-primary hover:border-primary/25 transition-all">
                                    <CheckCircle size={14} className="text-primary flex-shrink-0" />
                                    <span>{amenity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Visual Tour & Location Console */}
                          <div className="space-y-4 border-t border-card-border pt-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div>
                                <h3 className="text-xl font-bold text-text-primary">Visual Tour & Location</h3>
                                <p className="text-xs text-text-muted mt-1">Explore the virtual 360° landscape and maps of this property.</p>
                              </div>
                              
                              {/* Tabs */}
                              <div className="flex gap-2 bg-card-bg p-1 rounded-xl border border-card-border">
                                <button 
                                  onClick={() => setActiveTab("360")}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer animate-none ${
                                    activeTab === "360" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-text-muted hover:text-text-primary"
                                  }`}
                                >
                                  <Compass size={14} />
                                  360° Tour
                                </button>
                                <button 
                                  onClick={() => setActiveTab("map")}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer animate-none ${
                                    activeTab === "map" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-text-muted hover:text-text-primary"
                                  }`}
                                >
                                  <Map size={14} />
                                  Map Location
                                </button>
                              </div>
                            </div>

                            {/* Interactive Area */}
                            <div className="relative h-64 md:h-[450px] w-full bg-gray-950 rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                              {activeTab === "360" && (
                                <div 
                                  ref={panoramaRef}
                                  onMouseDown={handleMouseDown}
                                  onMouseMove={handleMouseMove}
                                  onMouseUp={handleMouseUpOrLeave}
                                  onMouseLeave={handleMouseUpOrLeave}
                                  className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
                                >
                                  <div 
                                    className="w-[200%] h-full bg-cover bg-center transition-all ease-out pointer-events-none"
                                    style={{
                                      backgroundImage: `url(${extendedImages[0]})`,
                                      backgroundPosition: `${panX}% center`,
                                      filter: 'brightness(0.9)'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                    <Compass size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                                    Drag left or right to explore in 360°
                                  </div>
                                </div>
                              )}

                              {activeTab === "map" && (
                                <div className="absolute inset-0 w-full h-full">
                                  <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    className="filter invert hue-rotate-180 opacity-80"
                                  />
                                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                    <MapPin size={14} />
                                    Google Maps Location View
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Nearby Institutions Checklist */}
                          <div className="space-y-4 border-t border-card-border pt-8">
                            <h3 className="text-xl font-bold text-text-primary">Nearby spots & convenience</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-5 bg-card-bg rounded-3xl border border-card-border space-y-3.5 hover:border-card-hover-border transition-colors">
                                <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                    <BookOpen size={14} />
                                  </div>
                                  Universities
                                </h4>
                                <ul className="text-xs text-text-muted space-y-2">
                                  <li className="flex items-center gap-1.5">• University campus (1.2 km)</li>
                                  <li className="flex items-center gap-1.5">• Institute of Technology (2.5 km)</li>
                                </ul>
                              </div>
                              <div className="p-5 bg-card-bg rounded-3xl border border-card-border space-y-3.5 hover:border-card-hover-border transition-colors">
                                <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                                    <Activity size={14} />
                                  </div>
                                  Hospitals
                                </h4>
                                <ul className="text-xs text-text-muted space-y-2">
                                  <li className="flex items-center gap-1.5">• City Medical Centre (800m)</li>
                                  <li className="flex items-center gap-1.5">• General Hospital (3.4 km)</li>
                                </ul>
                              </div>
                              <div className="p-5 bg-card-bg rounded-3xl border border-card-border space-y-3.5 hover:border-card-hover-border transition-colors">
                                <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                                    <ShoppingBag size={14} />
                                  </div>
                                  Supermarkets
                                </h4>
                                <ul className="text-xs text-text-muted space-y-2">
                                  <li className="flex items-center gap-1.5">• Keells Super (400m)</li>
                                  <li className="flex items-center gap-1.5">• Cargills Food City (600m)</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Right Column: Floating Contact/Booking Widget */}
                        <div id="mobile-contact-trigger" className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                          
                          {/* Booking Card */}
                          <div className="glass border border-card-border rounded-[2rem] p-6 shadow-2xl space-y-6">
                            {/* Price Header */}
                            <div className="flex items-center justify-between border-b border-card-border pb-5">
                              <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Monthly Rental</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-3xl font-black text-primary">Rs. {selectedProperty.price.toLocaleString()}</span>
                                  <span className="text-xs text-text-muted">/mo</span>
                                </div>
                              </div>
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                {selectedProperty.available ? "Available" : "Leased"}
                              </span>
                            </div>

                            {/* Advance payment */}
                            {selectedProperty.advancePayment && (
                              <div className="bg-orange-500/10 border border-orange-500/25 p-3.5 rounded-2xl text-orange-400 flex items-center gap-2">
                                <ShieldAlert size={16} className="flex-shrink-0" />
                                <p className="text-[11px] leading-tight text-left">
                                  <strong>Advance:</strong> Rs. {selectedProperty.advancePayment.toLocaleString()}
                                </p>
                              </div>
                            )}

                            {/* Date picker */}
                            <div className="space-y-2 text-left">
                              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" />
                                Desired Move-in Date
                              </label>
                              <input
                                type="date"
                                value={calendarDate}
                                onChange={(e) => setCalendarDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            {/* Booking Button / Contact Details */}
                            <div className="space-y-3 pt-2">
                              {!showContactDetails ? (
                                <button
                                  onClick={() => setShowContactDetails(true)}
                                  className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-xs shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-none"
                                >
                                  Book Now / Contact Host
                                </button>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-3 pt-2 border-t border-card-border"
                                >
                                  <p className="text-xs text-text-muted text-center font-semibold uppercase tracking-wider mb-2">Host Contacts</p>
                                  
                                  <div className="flex items-center gap-3 p-3 bg-card-bg rounded-2xl border border-card-border mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                                      {selectedProperty.seller?.name?.slice(0, 2).toUpperCase() || "OWN"}
                                    </div>
                                    <div className="text-left">
                                      <h4 className="font-bold text-xs text-text-primary leading-none">{selectedProperty.seller?.name || "Property Owner"}</h4>
                                      <span className="text-[10px] text-text-muted mt-1 block font-semibold text-emerald-400">Verified Landlord</span>
                                    </div>
                                  </div>

                                  <a
                                    href={`tel:${selectedProperty.seller?.phone.replace(/\s/g, '')}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-card-bg border border-card-border hover:bg-card-hover-bg text-text-primary text-xs font-bold transition-all hover:scale-[1.01] active:scale-99"
                                  >
                                    <Phone size={14} className="text-primary" />
                                    Call: {selectedProperty.seller?.phone}
                                  </a>

                                  <a
                                    href={`https://wa.me/${selectedProperty.seller?.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-600 hover:text-white text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 text-xs font-bold transition-all hover:scale-[1.01] active:scale-99"
                                  >
                                    <MessageCircle size={14} />
                                    WhatsApp Message
                                  </a>

                                  {selectedProperty.seller?.email && (
                                    <a
                                      href={`mailto:${selectedProperty.seller?.email}`}
                                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500 hover:text-white text-blue-400 hover:shadow-lg hover:shadow-blue-500/10 text-xs font-bold transition-all hover:scale-[1.01] active:scale-99"
                                    >
                                      <Mail size={14} />
                                      Send Email
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-card-border pt-4">
                              {/* Safety Tips badge */}
                              <div className="flex gap-2.5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-relaxed text-left">
                                  <strong>Safety warning:</strong> Always meet landlords in person and verify listing conditions before signing contracts or transferring advance deposits.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Secondary actions container (Report problem) */}
                          <button
                            onClick={() => {
                              const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                              if (!token) {
                                alert("Please sign in first to report property problems.");
                                router.push("/signin");
                                return;
                              }
                              setShowReportModal(true);
                            }}
                            className="w-full bg-red-500/5 text-red-400/80 hover:bg-red-500 hover:text-white border border-red-500/10 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <ShieldAlert size={14} />
                            Report problem with this property
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Sticky Mobile Bottom CTA Bar */}
            {!loadingDetail && selectedProperty && (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-glass-bg backdrop-blur-md border-t border-glass-border p-4 flex items-center justify-between md:hidden">
                <div>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Rental Price</p>
                  <p className="text-lg font-black text-primary">Rs. {selectedProperty.price.toLocaleString()}<span className="text-[10px] text-text-muted font-normal"> /mo</span></p>
                </div>
                <button 
                  onClick={() => {
                    setShowContactDetails(true);
                    const element = document.getElementById("mobile-contact-trigger");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer animate-none"
                >
                  Contact Host
                </button>
              </div>
            )}

            {/* Lightbox Gallery Modal */}
            <AnimatePresence>
              {lightboxOpen && selectedProperty && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 animate-fade-in"
                >
                  {/* Lightbox Header */}
                  <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto">
                    <span className="text-xs font-semibold text-gray-400">
                      Image {lightboxIdx + 1} of {getExtendedImages(selectedProperty).length}
                    </span>
                    <button 
                      onClick={() => setLightboxOpen(false)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex items-center justify-center cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Lightbox Main Image */}
                  <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center my-4">
                    <button 
                      onClick={() => setLightboxIdx(prev => prev === 0 ? getExtendedImages(selectedProperty).length - 1 : prev - 1)}
                      className="absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="relative w-full h-full max-w-5xl">
                      <Image 
                        src={getExtendedImages(selectedProperty)[lightboxIdx]} 
                        alt={`Gallery image ${lightboxIdx + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    <button 
                      onClick={() => setLightboxIdx(prev => prev === getExtendedImages(selectedProperty).length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Lightbox Thumbnails */}
                  <div className="flex justify-center gap-2 overflow-x-auto pb-4 max-w-2xl mx-auto scrollbar-none">
                    {getExtendedImages(selectedProperty).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIdx(i)}
                        className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          i === lightboxIdx ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image 
                          src={img} 
                          alt={`Thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Toast Alert for sharing link */}
            <AnimatePresence>
              {showShareToast && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-primary text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/20"
                >
                  <CheckCircle size={16} />
                  Link copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Problem Modal Overlay */}
      {showReportModal && selectedProperty && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass-bg border border-glass-border p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative space-y-5 animate-slide-up text-left">
            <button 
              onClick={() => {
                setShowReportModal(false);
                setReportSuccessMsg("");
                setReportErrorMsg("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover-bg transition-colors"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1">Report Property Issue</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Describe the problem you are facing with <strong>{selectedProperty.title}</strong>.
              </p>
            </div>

            {reportSuccessMsg ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl text-emerald-400 text-xs font-semibold text-center">
                {reportSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportErrorMsg && (
                  <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-red-400 text-xs font-semibold">
                    {reportErrorMsg}
                  </div>
                )}

                {/* Issue Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Issue Category</label>
                  <select
                    value={reportIssueType}
                    onChange={(e) => setReportIssueType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-card-bg border border-card-border text-text-primary text-xs focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="Maintenance" className="bg-background text-text-primary">Maintenance (Water, Electricity, Plumbing)</option>
                    <option value="Landlord Issue" className="bg-background text-text-primary">Host / Landlord Behavior</option>
                    <option value="Pricing/Payment" className="bg-background text-text-primary">Billing or Price Dispute</option>
                    <option value="Listing Info Inaccuracy" className="bg-background text-text-primary">Inaccurate Listing Details</option>
                    <option value="General Web Problem" className="bg-background text-text-primary">General Website Bug</option>
                    <option value="Other" className="bg-background text-text-primary">Other Problem</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Title</label>
                  <input
                    type="text"
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g., Water pressure is too low"
                    className="w-full px-3 py-2.5 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide details about the issue so the owner or administration can address it."
                    className="w-full px-3 py-2.5 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 animate-none cursor-pointer"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function FindRoomsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <FindRoomsContent />
    </Suspense>
  );
}