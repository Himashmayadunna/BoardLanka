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
  ShieldAlert
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

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
  { value: "room", label: "Room" },
  { value: "annex", label: "Annex" },
];

const priceRanges = [
  { min: 0, max: 10000, label: "Under Rs. 10K" },
  { min: 10000, max: 25000, label: "Rs. 10K - 25K" },
  { min: 25000, max: 50000, label: "Rs. 25K - 50K" },
  { min: 50000, max: Infinity, label: "Over Rs. 50K" },
];

function AnnexesHousesContent() {
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
  
  const panoramaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  // Load properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/properties?type=annex,room`);
        if (!res.ok) throw new Error("Failed to fetch listings");
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [apiUrl]);

  // Read URL query parameters (e.g. ?location=homagama&type=room&id=123)
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

  // Fetch full details of a single property (with all images)
  const fetchSingleDetail = async (id: string | number) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`${apiUrl}/api/properties/${id}`);
      if (res.ok) {
        const data = (await res.json()) as Property;
        setSelectedProperty(data);
        setCurrentImageIdx(0);
        setActiveTab("details");
        setShowContactDetails(false);
      }
    } catch (err) {
      console.error("Error loading property details:", err);
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
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleOpenDetail = (id: string | number) => {
    router.push(`${window.location.pathname}?id=${id}`);
  };

  const handleCloseDetail = () => {
    router.push(window.location.pathname);
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
      <MeshBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Luxury <span className="text-primary">Annexes & Rooms</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Find the perfect accommodation near universities and major technology parks.
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
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-3xl h-[400px] animate-pulse p-4 flex flex-col justify-between">
                <div className="h-48 bg-white/5 rounded-2xl" />
                <div className="h-6 bg-white/5 rounded w-3/4 my-2" />
                <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-10 bg-white/5 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {filtered.map((item) => (
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
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
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
            <span className="text-5xl mb-4 block">🏘️</span>
            <h3 className="text-xl font-bold text-white mb-2">No matching properties found</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              Adjust your search keywords, category type, or area filter options.
            </p>
          </div>
        )}

      </div>

      {/* Immersive Detail Modal Overlay */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col animate-slide-up shadow-2xl">
            
            {/* Modal Close */}
            <button 
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white hover:scale-105 border border-white/10 transition-all"
            >
              <X size={18} />
            </button>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="w-10 h-10 border-4 border-primary/25 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Fetching detailed listing...</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                
                {/* Visual Viewport Header (Gallery or 360 preview) */}
                <div className="relative h-64 md:h-[400px] w-full bg-black">
                  
                  {activeTab === "details" && (
                    <>
                      {/* Image Gallery view */}
                      <Image 
                        src={selectedProperty.images?.[currentImageIdx] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} 
                        alt={selectedProperty.title}
                        fill
                        className="object-cover transition-opacity duration-300"
                        unoptimized
                      />
                      {/* Slider Navigation */}
                      {selectedProperty.images && selectedProperty.images.length > 1 && (
                        <>
                          <button 
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black text-white border border-white/10 transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button 
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/60 hover:bg-black text-white border border-white/10 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                          {/* Image count markers */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                            {selectedProperty.images.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentImageIdx(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIdx ? "bg-primary w-4" : "bg-white/40"}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {activeTab === "360" && (
                    <div 
                      ref={panoramaRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center bg-gray-900"
                    >
                      <div 
                        className="w-[200%] h-full bg-cover bg-center transition-all ease-out pointer-events-none"
                        style={{
                          backgroundImage: `url(${selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'})`,
                          backgroundPosition: `${panX}% center`,
                          filter: 'brightness(0.95)'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Compass size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                        360 View: Drag left or right to explore
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
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Map size={14} />
                        Map Location
                      </div>
                    </div>
                  )}

                  {/* Layout Tabs Selector */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      onClick={() => setActiveTab("details")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${
                        activeTab === "details" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10 hover:bg-black"
                      }`}
                    >
                      Gallery
                    </button>
                    <button 
                      onClick={() => setActiveTab("360")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${
                        activeTab === "360" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10 hover:bg-black"
                      }`}
                    >
                      360° Tour
                    </button>
                    <button 
                      onClick={() => setActiveTab("map")}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${
                        activeTab === "map" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10 hover:bg-black"
                      }`}
                    >
                      Map View
                    </button>
                  </div>

                </div>

                {/* Content Panel Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Descriptions, Amenities, Surrounding */}
                  <div className="lg:col-span-8 space-y-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                          {selectedProperty.type}
                        </span>
                        {selectedProperty.seller?.verified && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} />
                            Verified Seller
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{selectedProperty.title}</h2>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        {selectedProperty.location}
                      </p>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-5">
                      {selectedProperty.bedrooms > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Bedrooms</p>
                          <p className="text-lg font-bold text-white mt-1 flex items-center justify-center gap-1">
                            <Bed size={16} className="text-primary" />
                            {selectedProperty.bedrooms}
                          </p>
                        </div>
                      )}
                      {selectedProperty.bathrooms && selectedProperty.bathrooms > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Bathrooms</p>
                          <p className="text-lg font-bold text-white mt-1 flex items-center justify-center gap-1">
                            <Bath size={16} className="text-primary" />
                            {selectedProperty.bathrooms}
                          </p>
                        </div>
                      )}
                      {selectedProperty.size && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Area Size</p>
                          <p className="text-lg font-bold text-white mt-1 flex items-center justify-center gap-1">
                            <Maximize size={16} className="text-primary" />
                            {selectedProperty.size} Sq.Ft
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 text-left">
                      <h3 className="text-lg font-bold text-white">About the Property</h3>
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                        {selectedProperty.description || "No description provided."}
                      </p>
                    </div>

                    {/* Amenities list */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-lg font-bold text-white">Amenities Offered</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProperty.amenities?.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-primary" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Surrounding Places Checklist */}
                    <div className="space-y-5 text-left border-t border-white/5 pt-6">
                      <h3 className="text-lg font-bold text-white">Nearby Institutions & Spots</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen size={14} className="text-blue-400" />
                            Universities
                          </h4>
                          <ul className="text-xs text-gray-400 space-y-1.5">
                            <li>• University campus (1.2 km)</li>
                            <li>• Institute of Tech (2.5 km)</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Activity size={14} className="text-red-400" />
                            Hospitals
                          </h4>
                          <ul className="text-xs text-gray-400 space-y-1.5">
                            <li>• City Medical Centre (800m)</li>
                            <li>• General Hospital (3.4 km)</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag size={14} className="text-orange-400" />
                            Supermarkets
                          </h4>
                          <ul className="text-xs text-gray-400 space-y-1.5">
                            <li>• Keells Super (400m)</li>
                            <li>• Cargills Food City (600m)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Booking Card & Calendar */}
                  <div className="lg:col-span-4 lg:sticky lg:top-4 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
                    
                    {/* Price summary */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Monthly Rental</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-primary">Rs. {selectedProperty.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">/ month</span>
                      </div>
                      {selectedProperty.advancePayment && (
                        <p className="text-xs text-orange-400 mt-1">
                          Advance Payment Required: Rs. {selectedProperty.advancePayment.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Mock Calendar Date Picker */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Calendar size={14} className="text-primary" />
                        Check Availability Date
                      </label>
                      <input
                        type="date"
                        value={calendarDate}
                        onChange={(e) => setCalendarDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>

                    {/* Booking / Contact Actions */}
                    <div className="space-y-3">
                      {!showContactDetails ? (
                        <button
                          onClick={() => setShowContactDetails(true)}
                          className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          Book Now / Contact Host
                        </button>
                      ) : (
                        <div className="space-y-2.5 pt-2 border-t border-white/5">
                          <p className="text-xs text-gray-500 text-center font-medium">Host Contact details</p>
                          <div className="text-center mb-3">
                            <h4 className="font-bold text-sm text-white">{selectedProperty.seller?.name || "Property Owner"}</h4>
                          </div>

                          <a
                            href={`tel:${selectedProperty.seller?.phone.replace(/\s/g, '')}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                          >
                            <Phone size={14} className="text-primary" />
                            Call: {selectedProperty.seller?.phone}
                          </a>

                          <a
                            href={`https://wa.me/${selectedProperty.seller?.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-600 hover:text-white text-emerald-400 text-xs font-bold transition-all"
                          >
                            <MessageCircle size={14} />
                            WhatsApp Chat
                          </a>

                          {selectedProperty.seller?.email && (
                            <a
                              href={`mailto:${selectedProperty.seller?.email}`}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500 hover:text-white text-blue-400 text-xs font-bold transition-all"
                            >
                              <Mail size={14} />
                              Email Host
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Safety Tip warning badge */}
                    <div className="flex gap-2 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-400">
                      <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-left">
                        <strong>Safety Warning:</strong> Visit the listing site in person. Never send advanced deposits or money transfers online before confirming details.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function AnnexesHousesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AnnexesHousesContent />
    </Suspense>
  );
}