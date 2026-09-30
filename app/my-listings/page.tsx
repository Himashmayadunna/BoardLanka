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
  Plus,
  ArrowLeft
} from "lucide-react";
import { getSellerProperties, getPropertyById, clearClientPropertyCache } from "@/lib/propertyService";
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

  const fetchSingleDetail = async (id: string | number) => {
    try {
      setLoadingDetail(true);
      const data = await getPropertyById(id);
      setSelectedProperty(data);
    } catch (err) {
      console.warn("Error loading property details from API, searching local data:", err);
      const localProp = properties.find(p => String(p.id) === String(id));
      if (localProp) {
        setSelectedProperty(localProp);
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

  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.available).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-10 text-center max-w-sm w-full">
          <p className="text-xs text-[var(--text-muted)] mb-6">{error || "Please log in to manage listings."}</p>
          <Link href="/signin" className="btn-editorial btn-editorial-primary w-full inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-earth)] hover:underline uppercase tracking-wider font-semibold">
            <ArrowLeft size={13} /> Back to Profile
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-[var(--border-hairline)] pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-floating block mb-2">Host Management</span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[var(--foreground)]">
              Managed <span className="italic font-normal">Residences</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Oversee and configure spaces currently hosted across the BoardLanka registry.
            </p>
          </div>
          <Link
            href="/addproperty"
            className="btn-editorial btn-editorial-primary flex items-center gap-2 self-start md:self-end"
          >
            <Plus size={13} /> List New Property
          </Link>
        </div>

        {/* Stats metrics strip */}
        <div className="grid grid-cols-2 border border-[var(--border-hairline)] bg-[var(--surface)] divide-x divide-[var(--border-hairline)] mb-10">
          <div className="p-6">
            <span className="label-floating block">Total Hosted</span>
            <div className="mt-2">
              <span className="font-serif text-3xl md:text-4xl text-[var(--foreground)]">{totalListings}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Properties in portfolio</span>
          </div>

          <div className="p-6">
            <span className="label-floating block">Active Availability</span>
            <div className="mt-2">
              <span className="font-serif text-3xl md:text-4xl text-[var(--accent-earth)]">{activeListings}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Accepting tenant inquiries</span>
          </div>
        </div>

        {/* Listings catalog */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property.id}
                className="border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden flex flex-col justify-between group transition-all hover:border-[var(--foreground)]"
              >
                <div 
                  onClick={() => fetchSingleDetail(property.id)}
                  className="relative h-52 w-full overflow-hidden bg-[var(--surface-sunken)] cursor-pointer"
                >
                  <img
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                    alt={property.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">
                    {property.moderationStatus && (
                      <span className={`text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 border ${
                        property.moderationStatus === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : property.moderationStatus === "rejected"
                          ? "bg-red-500/10 text-red-500 border-red-500/30"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}>
                        {property.moderationStatus}
                      </span>
                    )}
                  </div>

                  {!property.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white font-serif text-sm uppercase tracking-widest">Inactive</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-left">
                    <h3 
                      onClick={() => fetchSingleDetail(property.id)}
                      className="font-serif text-xl text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--accent-earth)] transition-colors cursor-pointer"
                    >
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <MapPin size={12} className="text-[var(--accent-earth)]" />
                      <span>{property.location}</span>
                    </div>
                    <div className="pt-2">
                      <span className="font-serif text-xl font-normal text-[var(--foreground)]">
                        LKR {property.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider ml-1">/mo</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-hairline)]">
                    <button
                      onClick={() => fetchSingleDetail(property.id)}
                      className="flex-1 btn-editorial btn-editorial-outline text-[10px] py-2 cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(String(property.id))}
                      className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove Listing"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-[var(--border-hairline)] bg-[var(--surface)] space-y-4">
            <Building size={28} className="mx-auto text-[var(--text-muted)] opacity-60" />
            <h3 className="font-serif text-2xl text-[var(--foreground)]">No residences listed</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Publish your first rental listing to start receiving qualified inquiries.
            </p>
            <Link
              href="/addproperty"
              className="btn-editorial btn-editorial-primary inline-flex items-center gap-2 mt-2"
            >
              <Plus size={13} />
              Host Your First Property
            </Link>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-[var(--border-hairline)] bg-[var(--surface)] max-w-md w-full p-8 text-center space-y-5 shadow-2xl">
            <div className="w-10 h-10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={20} />
            </div>
            
            <h3 className="font-serif text-2xl text-[var(--foreground)]">Remove Property Listing</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you wish to permanently remove this property listing from the public index? This operation cannot be reversed.
            </p>

            {deleteError && (
              <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-500 text-xs text-left">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 btn-editorial btn-editorial-outline cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 btn-editorial bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {deleting ? "Removing..." : "Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Inspection Modal */}
      {selectedProperty && !deleteConfirm && (
        <PropertyDetailModal
          property={selectedProperty}
          loading={loadingDetail}
          onClose={() => setSelectedProperty(null)}
        />
      )}

    </div>
  );
}

function MyListingsLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
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