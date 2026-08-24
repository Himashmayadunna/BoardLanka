"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Building, 
  MapPin, 
  CheckCircle, 
  Trash2, 
  Edit, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  X, 
  Compass
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";
import { getSellerProperties, getPropertyById, clearClientPropertyCache } from "@/lib/propertyService";
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
    id?: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string | null;
    verified: boolean;
  };
  available: boolean;
  createdAt?: string;
  moderationStatus?: "pending" | "approved" | "rejected";
}

interface User {
  id?: string;
  seller_id?: string;
  email?: string;
  name?: string;
}

function MyListingsContent() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Selected Detail states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "360" | "map">("details");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [panX, setPanX] = useState(50);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setError("Please log in to view your listings.");
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
      setError("Failed to load user information.");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchSellerProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSellerProperties(token);
        setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching seller properties:", err);
        setError(err instanceof Error ? err.message : "Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProperties();
  }, [user]);

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

  const handleDelete = async (propertyId: string | number) => {
    try {
      setDeleting(true);
      setDeleteError(null);

      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${apiUrl}/api/properties/${propertyId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) throw new Error("Failed to delete property.");

      clearClientPropertyCache();
      setProperties(properties.filter((p) => p.id !== propertyId));
      setDeleteConfirm(null);
      setSelectedProperty(null);
    } catch (err) {
      console.error("Error deleting property:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete listing.");
    } finally {
      setDeleting(false);
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

  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.available).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl border border-white/10 text-center max-w-sm">
          <p className="text-gray-400 text-sm mb-6">{error || "Please log in to manage listings."}</p>
          <Link href="/signin" className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl transition-all">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold transition-all">
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Manage <span className="text-primary">My Listings</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Create, edit, or remove properties currently hosted across BoardLanka.
          </p>
        </div>

        {/* Stats metrics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          
          <div className="glass p-6 rounded-3xl border border-white/10 text-left flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Listings</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalListings}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-glow text-primary flex items-center justify-center shadow-inner">
              <Building size={20} />
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/10 text-left flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Active Listings</p>
              <h3 className="text-3xl font-extrabold text-primary mt-1">{activeListings}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-glow text-primary flex items-center justify-center shadow-inner">
              <CheckCircle size={20} />
            </div>
          </div>

        </div>

        {/* Add listing shortcut */}
        <div className="mb-8 flex justify-end">
          <Link
            href="/addproperty"
            className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle size={16} />
            Add New Property
          </Link>
        </div>

        {/* Listings catalog */}
        {properties.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property.id}
                className="glass-card rounded-3xl overflow-hidden group flex flex-col justify-between h-[420px]"
              >
                <div 
                  onClick={() => fetchSingleDetail(property.id)}
                  className="relative h-48 w-full overflow-hidden bg-white/5 cursor-pointer"
                >
                  <img
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                    alt={property.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {property.moderationStatus && (
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-md capitalize ${
                        property.moderationStatus === "approved"
                          ? "bg-emerald-500 text-white"
                          : property.moderationStatus === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-gray-950"
                      }`}>
                        {property.moderationStatus}
                      </div>
                    )}
                  </div>

                  {!property.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white font-extrabold text-sm uppercase tracking-wide">Deactivated</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <h3 
                      onClick={() => fetchSingleDetail(property.id)}
                      className="font-bold text-base text-white line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={12} className="text-primary" />
                      <span>{property.location}</span>
                    </div>
                    <div className="mt-2.5">
                      <span className="text-lg font-bold text-primary">Rs. {property.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500">/month</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-4 border-t border-white/5 mt-4">
                    <button
                      onClick={() => fetchSingleDetail(property.id)}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold text-[10px] transition-all"
                    >
                      Details
                    </button>
                    {/* Note: The edit link matches the original link. If they decide to build edit layout later, it's there. */}
                    <Link
                      href={`/my-listings/${property.id}/edit`}
                      className="flex-1 bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white py-2.5 rounded-xl font-bold text-[10px] text-center transition-all"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(String(property.id))}
                      className="flex-1 bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-5xl mb-4 block">🏘️</span>
            <h3 className="text-xl font-bold text-white mb-2">No properties listed yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm mb-6">
              Start by listing your university room, annex, or villa plot on the platform.
            </p>
            <Link
              href="/addproperty"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              Host Your First Space
            </Link>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass border border-white/10 rounded-3xl max-w-md w-full p-6 text-center animate-slide-up shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center rounded-2xl mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">Remove Property Listing</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to permanently remove this property listing from BoardLanka? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-xs mb-4 text-left font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Delete Property"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Detail Modal Overlay */}
      {selectedProperty && !deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col animate-slide-up shadow-2xl animate-fade-in">
            
            <button 
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/10 transition-all"
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
                
                {/* Visual Viewport Header */}
                <div className="relative h-64 md:h-[400px] w-full bg-black">
                  
                  {activeTab === "details" && (
                    <>
                      <img 
                        src={selectedProperty.images?.[currentImageIdx] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} 
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
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
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gray-900">
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
                        <Compass size={14} />
                        360 View Demo
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
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => setActiveTab("details")} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${activeTab === "details" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10"}`}>Gallery</button>
                    <button onClick={() => setActiveTab("360")} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${activeTab === "360" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10"}`}>360 Tour</button>
                    <button onClick={() => setActiveTab("map")} className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${activeTab === "map" ? "bg-primary text-white border-primary" : "bg-black/60 text-gray-300 border-white/10"}`}>Map View</button>
                  </div>

                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  <div className="lg:col-span-8 space-y-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">{selectedProperty.type}</span>
                        {selectedProperty.moderationStatus && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                            selectedProperty.moderationStatus === "approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>{selectedProperty.moderationStatus}</span>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{selectedProperty.title}</h2>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        {selectedProperty.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-5">
                      {selectedProperty.bedrooms > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Bedrooms</p>
                          <p className="text-lg font-bold text-white mt-1">{selectedProperty.bedrooms}</p>
                        </div>
                      )}
                      {selectedProperty.bathrooms && selectedProperty.bathrooms > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Bathrooms</p>
                          <p className="text-lg font-bold text-white mt-1">{selectedProperty.bathrooms}</p>
                        </div>
                      )}
                      {selectedProperty.size && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Area Size</p>
                          <p className="text-lg font-bold text-white mt-1">{selectedProperty.size} Sq.Ft</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-left">
                      <h3 className="text-lg font-bold text-white">About the Property</h3>
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{selectedProperty.description}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl text-left">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                      <h3 className="text-2xl font-extrabold text-primary mt-1">Rs. {selectedProperty.price.toLocaleString()}</h3>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href={`/my-listings/${selectedProperty.id}/edit`}
                        className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                      >
                        <Edit size={14} />
                        Edit Property
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(String(selectedProperty.id))}
                        className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                      >
                        <Trash2 size={14} />
                        Delete Property
                      </button>
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

function MyListingsLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <Suspense fallback={<MyListingsLoading />}>
      <MyListingsContent />
    </Suspense>
  );
}