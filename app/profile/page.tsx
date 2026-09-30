"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  MapPin, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Building, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  Search, 
  Edit,
  LayoutDashboard,
  Clock,
  Phone,
  Mail,
  Plus,
  X,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProperties, getSellerProperties } from "@/lib/propertyService";

interface UserData {
  id: string;
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  marketingUpdates: boolean;
  createdAt: string;
}

interface Property {
  id: string | number;
  title: string;
  location: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms?: number;
  images: string[];
  seller: {
    name: string;
    phone: string;
  };
  available: boolean;
}

interface ProblemReport {
  id: string | number;
  user_id: string;
  property_id: string | number | null;
  property_title: string | null;
  issue_type: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workspace" | "favorites" | "listings" | "problems">("workspace");

  // Dashboard Data states
  const [favoritesList, setFavoritesList] = useState<Property[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [problemsList, setProblemsList] = useState<ProblemReport[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [ownListings, setOwnListings] = useState<Property[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // General Report states
  const [showGeneralReportModal, setShowGeneralReportModal] = useState(false);
  const [generalIssueType, setGeneralIssueType] = useState("General Web Problem");
  const [generalTitle, setGeneralTitle] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");
  const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Status updating states
  const [updatingProblemId, setUpdatingProblemId] = useState<string | number | null>(null);

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const res = await fetch(`${apiUrl}/api/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            handleSignOut();
            return;
          }
          throw new Error(data.message || "Failed to load profile");
        }

        setUser(data.user || null);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router, apiUrl]);

  // Load secondary data depending on user type and active tab
  useEffect(() => {
    if (!user) return;

    if (activeTab === "favorites" || activeTab === "workspace") {
      loadFavorites();
    }

    if (activeTab === "problems" || activeTab === "workspace") {
      loadProblems();
    }

    if (user.accountType === "seller" && (activeTab === "listings" || activeTab === "workspace")) {
      loadOwnListings();
    }
  }, [user, activeTab]);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const storedFavs = localStorage.getItem("favorites");
      if (!storedFavs) {
        setFavoritesList([]);
        setLoadingFavorites(false);
        return;
      }
      const favIds: number[] = JSON.parse(storedFavs);
      if (favIds.length === 0) {
        setFavoritesList([]);
        setLoadingFavorites(false);
        return;
      }

      const { data } = await getProperties();
      if (Array.isArray(data)) {
        const filtered = data.filter(p => favIds.includes(Number(p.id)));
        setFavoritesList(filtered);
      }
    } catch (e) {
      console.error("Error fetching favorites:", e);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadProblems = async () => {
    setLoadingProblems(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${apiUrl}/api/problems`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProblemsList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error loading problem reports:", e);
    } finally {
      setLoadingProblems(false);
    }
  };

  const loadOwnListings = async () => {
    setLoadingListings(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const data = await getSellerProperties(token);
      setOwnListings(Array.isArray(data) ? (data as any) : []);
    } catch (e) {
      console.error("Error loading landlord listings:", e);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleStatusChange = async (problemId: string | number, nextStatus: string) => {
    setUpdatingProblemId(problemId);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/api/problems/${problemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        loadProblems();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update problem status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingProblemId(null);
    }
  };

  const handleGeneralReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGeneral(true);
    setGeneralSuccess("");
    setGeneralError("");

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/api/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          issueType: generalIssueType,
          title: generalTitle,
          description: generalDescription
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to file report");
      }

      setGeneralSuccess("Website issue reported successfully. Our team will review it promptly.");
      setGeneralTitle("");
      setGeneralDescription("");
      loadProblems();

      setTimeout(() => {
        setShowGeneralReportModal(false);
        setGeneralSuccess("");
      }, 3000);
    } catch (err: any) {
      setGeneralError(err.message || "Something went wrong.");
    } finally {
      setIsSubmittingGeneral(false);
    }
  };

  const getPropertyLink = (item: Property) => {
    if (item.type === "annex" || item.type === "room") {
      return `/annexes-houses?id=${item.id}`;
    }
    return `/findrooms?id=${item.id}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="status-dot-badge status-dot-badge-danger"><span className="status-dot-dot" /> Open</span>;
      case "in-progress":
        return <span className="status-dot-badge status-dot-badge-warning"><span className="status-dot-dot" /> In Progress</span>;
      case "resolved":
        return <span className="status-dot-badge status-dot-badge-success"><span className="status-dot-dot" /> Resolved</span>;
      case "closed":
        return <span className="status-dot-badge status-dot-badge-muted"><span className="status-dot-dot" /> Closed</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="p-10 border border-[var(--border-hairline)] bg-[var(--surface)] text-center max-w-sm w-full">
          <div className="w-10 h-10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={20} />
          </div>
          <h2 className="font-serif text-xl text-[var(--foreground)] mb-2">Session Expired</h2>
          <p className="text-xs text-[var(--text-muted)] mb-6">{error || "User data could not be verified."}</p>
          <Link href="/signin" className="btn-editorial btn-editorial-primary w-full inline-block">
            Sign In Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[var(--border-hairline)] pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-floating block mb-2">Account Overview</span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-[var(--foreground)]">
              Welcome back, <span className="italic font-normal">{user.firstName}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user.accountType === "seller" ? (
              <Link href="/addproperty" className="btn-editorial btn-editorial-primary flex items-center gap-2">
                <Plus size={13} />
                List a Property
              </Link>
            ) : null}
            <Link href="/profile/edit" className="btn-editorial btn-editorial-outline flex items-center gap-2">
              <Edit size={13} />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Profile info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 space-y-6">
              
              {/* Profile Monogram */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border border-[var(--border-hairline)] bg-[var(--surface-sunken)] flex items-center justify-center">
                    <span className="font-serif text-2xl font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      {user.firstName.charAt(0)}{user.lastName?.charAt(0) || ""}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-serif text-2xl text-[var(--foreground)]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className="status-dot-badge status-dot-badge-sand">
                    <span className="status-dot-dot" />
                    {user.accountType === "seller" ? "Host / Owner" : "Resident / Seeker"}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] italic leading-relaxed pt-2 border-t border-[var(--border-hairline)] w-full">
                  "{user.bio || "No biography added yet. Update profile settings to describe yourself."}"
                </p>
              </div>

              {/* Account Metadata details */}
              <div className="border-t border-[var(--border-hairline)] pt-6 space-y-4">
                <span className="label-floating block">Credentials</span>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <Mail size={13} /> Email
                    </span>
                    <span className="font-medium text-[var(--foreground)] truncate max-w-[180px]">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <Phone size={13} /> Phone
                    </span>
                    <span className="font-medium text-[var(--foreground)]">{user.phone || "Not set"}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <Calendar size={13} /> Member Since
                    </span>
                    <span className="font-medium text-[var(--foreground)]">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[var(--border-hairline)] pt-6">
                <button
                  onClick={handleSignOut}
                  className="w-full btn-editorial btn-editorial-outline text-red-500 border-red-500/30 hover:bg-red-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Tab switcher and views */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Minimalist Hairline Tab Bar */}
            <div className="flex border-b border-[var(--border-hairline)] gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("workspace")}
                className={`pb-3 text-xs uppercase tracking-[0.18em] font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === "workspace" 
                    ? "text-[var(--foreground)] border-b-2 border-[var(--accent-earth)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab("favorites")}
                className={`pb-3 text-xs uppercase tracking-[0.18em] font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === "favorites" 
                    ? "text-[var(--foreground)] border-b-2 border-[var(--accent-earth)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Favorites ({favoritesList.length})
              </button>

              {user.accountType === "seller" && (
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`pb-3 text-xs uppercase tracking-[0.18em] font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === "listings" 
                      ? "text-[var(--foreground)] border-b-2 border-[var(--accent-earth)]" 
                      : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  My Listings ({ownListings.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab("problems")}
                className={`pb-3 text-xs uppercase tracking-[0.18em] font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === "problems" 
                    ? "text-[var(--foreground)] border-b-2 border-[var(--accent-earth)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Inquiries & Issues ({problemsList.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "workspace" && (
                  <div className="space-y-8">
                    {/* Metrics Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 border border-[var(--border-hairline)] bg-[var(--surface)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)]">
                      <div className="p-6">
                        <span className="label-floating block">Account Status</span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-serif text-2xl font-normal text-[var(--foreground)]">Verified</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Full access enabled</span>
                      </div>

                      <div className="p-6">
                        <span className="label-floating block">Saved Properties</span>
                        <div className="mt-2">
                          <span className="font-serif text-3xl font-normal text-[var(--accent-earth)]">{favoritesList.length}</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Bookmarked spaces</span>
                      </div>

                      <div className="p-6">
                        <span className="label-floating block">Active Reports</span>
                        <div className="mt-2">
                          <span className="font-serif text-3xl font-normal text-[var(--foreground)]">
                            {problemsList.filter(p => p.status !== "resolved" && p.status !== "closed").length}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Pending resolution</span>
                      </div>
                    </div>

                    {/* Editorial Actions Directory */}
                    <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                        <span className="label-floating">Quick Navigation</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <Link
                          href="/findrooms"
                          className="p-6 border border-[var(--border-hairline)] hover:border-[var(--foreground)] transition-all group flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <span className="label-floating block">Marketplace</span>
                            <h4 className="font-serif text-lg text-[var(--foreground)]">Browse Rooms & Residences</h4>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                              Discover curated private annexes and student rooms.
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] mt-6 group-hover:translate-x-1 transition-transform">
                            Explore <ArrowUpRight size={13} />
                          </span>
                        </Link>

                        <Link
                          href="/annexes-houses"
                          className="p-6 border border-[var(--border-hairline)] hover:border-[var(--foreground)] transition-all group flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <span className="label-floating block">Estates</span>
                            <h4 className="font-serif text-lg text-[var(--foreground)]">Villas & Full Houses</h4>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                              View standalone residences and luxury rental listings.
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] mt-6 group-hover:translate-x-1 transition-transform">
                            Explore <ArrowUpRight size={13} />
                          </span>
                        </Link>

                        {user.accountType === "seller" ? (
                          <Link
                            href="/addproperty"
                            className="p-6 border border-[var(--accent-earth)] bg-[var(--surface-sunken)] hover:bg-[var(--accent-earth)]/5 transition-all group flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <span className="label-floating text-[var(--accent-earth)] block">Host Operations</span>
                              <h4 className="font-serif text-lg text-[var(--foreground)]">List New Property</h4>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Publish a boarding room or full residential lease.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] mt-6 group-hover:translate-x-1 transition-transform">
                              Create Listing <ArrowUpRight size={13} />
                            </span>
                          </Link>
                        ) : (
                          <div
                            onClick={() => setShowGeneralReportModal(true)}
                            className="p-6 border border-[var(--border-hairline)] hover:border-red-500/40 transition-all group flex flex-col justify-between cursor-pointer"
                          >
                            <div className="space-y-2">
                              <span className="label-floating text-red-500 block">Support Desk</span>
                              <h4 className="font-serif text-lg text-[var(--foreground)]">Report Technical Issue</h4>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Log bugs or feedback directly with our operations desk.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-red-500 mt-6 group-hover:translate-x-1 transition-transform">
                              File Report <ArrowUpRight size={13} />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === "favorites" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                      <h3 className="font-serif text-2xl text-[var(--foreground)]">Bookmarked Residences</h3>
                      <span className="text-xs text-[var(--text-muted)]">{favoritesList.length} saved</span>
                    </div>
                    
                    {loadingFavorites ? (
                      <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
                      </div>
                    ) : favoritesList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {favoritesList.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => router.push(getPropertyLink(item))}
                            className="group border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden cursor-pointer flex flex-col justify-between transition-all hover:border-[var(--foreground)]"
                          >
                            <div className="relative h-56 w-full overflow-hidden bg-[var(--surface-sunken)]">
                              <Image
                                src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                unoptimized
                              />
                              <div className="absolute top-3 left-3 bg-[var(--background)]/90 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-semibold border border-[var(--border-hairline)]">
                                {item.type}
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-serif text-xl text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--accent-earth)] transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                                  <MapPin size={12} className="text-[var(--accent-earth)]" /> {item.location}
                                </p>
                              </div>
                              <div className="flex justify-between items-baseline pt-4 border-t border-[var(--border-hairline)]">
                                <div>
                                  <span className="font-serif text-xl font-normal text-[var(--foreground)]">
                                    LKR {item.price.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider ml-1">/mo</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] group-hover:translate-x-1 transition-transform">
                                  View Property →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 border border-[var(--border-hairline)] bg-[var(--surface)] space-y-4">
                        <Heart size={24} className="mx-auto text-[var(--text-muted)] opacity-60" />
                        <div>
                          <p className="font-serif text-lg text-[var(--foreground)]">No saved residences yet</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Bookmark properties as you explore the catalogue.</p>
                        </div>
                        <Link href="/findrooms" className="btn-editorial btn-editorial-outline inline-block mt-2">
                          Explore Properties
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "listings" && user.accountType === "seller" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
                      <div>
                        <h3 className="font-serif text-2xl text-[var(--foreground)]">Active Hosted Spaces</h3>
                        <p className="text-xs text-[var(--text-muted)]">Properties published under your landlord account</p>
                      </div>
                      <Link href="/addproperty" className="btn-editorial btn-editorial-primary flex items-center gap-1.5">
                        <Plus size={13} /> Add Space
                      </Link>
                    </div>

                    {loadingListings ? (
                      <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
                      </div>
                    ) : ownListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ownListings.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => router.push(getPropertyLink(item))}
                            className="group border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden cursor-pointer flex flex-col justify-between transition-all hover:border-[var(--foreground)]"
                          >
                            <div className="relative h-56 w-full overflow-hidden bg-[var(--surface-sunken)]">
                              <Image
                                src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                unoptimized
                              />
                              <div className="absolute top-3 left-3 bg-[var(--background)]/90 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-semibold border border-[var(--border-hairline)]">
                                {item.type}
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-serif text-xl text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--accent-earth)] transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                                  <MapPin size={12} className="text-[var(--accent-earth)]" /> {item.location}
                                </p>
                              </div>
                              <div className="flex justify-between items-baseline pt-4 border-t border-[var(--border-hairline)]">
                                <div>
                                  <span className="font-serif text-xl font-normal text-[var(--foreground)]">
                                    LKR {item.price.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider ml-1">/mo</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)] group-hover:translate-x-1 transition-transform">
                                  Manage Space →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 border border-[var(--border-hairline)] bg-[var(--surface)] space-y-4">
                        <Building size={24} className="mx-auto text-[var(--text-muted)] opacity-60" />
                        <div>
                          <p className="font-serif text-lg text-[var(--foreground)]">No active listings yet</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Publish your first residence to accept tenant inquiries.</p>
                        </div>
                        <Link href="/addproperty" className="btn-editorial btn-editorial-primary inline-block mt-2">
                          List a Property
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "problems" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[var(--border-hairline)] pb-4">
                      <div>
                        <h3 className="font-serif text-2xl text-[var(--foreground)]">Inquiry & Ticket Registry</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {user.accountType === "seller" 
                            ? "Complaints and maintenance tickets logged by resident tenants."
                            : "Issue logs filed regarding properties, landlords, or technical items."}
                        </p>
                      </div>

                      {user.accountType !== "seller" && (
                        <button
                          onClick={() => setShowGeneralReportModal(true)}
                          className="btn-editorial btn-editorial-outline flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                        >
                          <ShieldAlert size={13} />
                          Report Issue
                        </button>
                      )}
                    </div>

                    {loadingProblems ? (
                      <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
                      </div>
                    ) : problemsList.length > 0 ? (
                      <div className="space-y-4">
                        {problemsList.map((prob) => (
                          <div key={prob.id} className="border border-[var(--border-hairline)] bg-[var(--surface)] p-6 space-y-4">
                            {/* Header details */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                              <div className="space-y-1">
                                <span className="label-floating text-[var(--accent-earth)] block">
                                  {prob.issue_type}
                                </span>
                                <h4 className="font-serif text-xl text-[var(--foreground)]">{prob.title}</h4>
                                {prob.property_title && (
                                  <p className="text-xs text-[var(--text-muted)]">
                                    Affected property: <span className="text-[var(--foreground)] font-medium">{prob.property_title}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                                  {formatDate(prob.created_at)}
                                </span>
                                {getStatusBadge(prob.status)}
                              </div>
                            </div>

                            {/* Description text */}
                            <div className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap bg-[var(--surface-sunken)] p-4 border border-[var(--border-hairline)]">
                              {prob.description}
                            </div>

                            {/* Contact details for seller */}
                            {user.accountType === "seller" && prob.profiles && (
                              <div className="p-4 bg-[var(--surface-sunken)] border border-[var(--border-hairline)] space-y-2 text-xs">
                                <span className="label-floating block">Resident Contact</span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[var(--foreground)]">
                                  <span className="flex items-center gap-2"><User size={13} className="text-[var(--accent-earth)]" /> {prob.profiles.first_name} {prob.profiles.last_name}</span>
                                  <span className="flex items-center gap-2 truncate"><Mail size={13} className="text-[var(--accent-earth)]" /> {prob.profiles.email}</span>
                                  {prob.profiles.phone && (
                                    <span className="flex items-center gap-2"><Phone size={13} className="text-[var(--accent-earth)]" /> {prob.profiles.phone}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status updating actions */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-hairline)] text-xs">
                              {user.accountType === "seller" && (
                                <div className="flex items-center gap-2">
                                  <span className="label-floating">Update:</span>
                                  <button
                                    disabled={updatingProblemId === prob.id || prob.status === "in-progress"}
                                    onClick={() => handleStatusChange(prob.id, "in-progress")}
                                    className="btn-editorial btn-editorial-outline text-[10px] py-1.5 px-3 cursor-pointer"
                                  >
                                    Mark In Progress
                                  </button>
                                  <button
                                    disabled={updatingProblemId === prob.id || prob.status === "resolved"}
                                    onClick={() => handleStatusChange(prob.id, "resolved")}
                                    className="btn-editorial btn-editorial-primary text-[10px] py-1.5 px-3 cursor-pointer"
                                  >
                                    Mark Resolved
                                  </button>
                                </div>
                              )}

                              {user.accountType === "buyer" && prob.status !== "closed" && (
                                <button
                                  disabled={updatingProblemId === prob.id}
                                  onClick={() => handleStatusChange(prob.id, "closed")}
                                  className="btn-editorial btn-editorial-outline text-[10px] py-1.5 px-3 cursor-pointer"
                                >
                                  Close Ticket
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 border border-[var(--border-hairline)] bg-[var(--surface)] space-y-4">
                        <ShieldCheck size={24} className="mx-auto text-[var(--text-muted)] opacity-60" />
                        <div>
                          <p className="font-serif text-lg text-[var(--foreground)]">No open inquiries or reports</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Everything is in good standing.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* Website Problem Modal */}
      {showGeneralReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border-hairline)] p-8 max-w-md w-full shadow-2xl relative space-y-6 text-left">
            <button 
              onClick={() => {
                setShowGeneralReportModal(false);
                setGeneralSuccess("");
                setGeneralError("");
              }}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="label-floating block mb-1">Support Desk</span>
              <h3 className="font-serif text-2xl text-[var(--foreground)]">File an Inquiry</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Describe the issue you encountered and our team will follow up.
              </p>
            </div>

            {generalSuccess ? (
              <div className="border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 text-xs font-medium text-center">
                {generalSuccess}
              </div>
            ) : (
              <form onSubmit={handleGeneralReportSubmit} className="space-y-5">
                {generalError && (
                  <div className="border border-red-500/30 bg-red-500/10 p-3 text-red-500 text-xs">
                    {generalError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="label-floating">Category</label>
                  <select
                    value={generalIssueType}
                    onChange={(e) => setGeneralIssueType(e.target.value)}
                    className="input-underline cursor-pointer"
                  >
                    <option value="General Web Problem">General Web Issue</option>
                    <option value="Search Glitch">Property Search or Filter Error</option>
                    <option value="Auth Issue">Account Authentication Problem</option>
                    <option value="Other Web Issue">Other Inquiries</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="label-floating">Subject</label>
                  <input
                    type="text"
                    required
                    value={generalTitle}
                    onChange={(e) => setGeneralTitle(e.target.value)}
                    placeholder="Brief description of the item"
                    className="input-underline"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-floating">Details</label>
                  <textarea
                    required
                    rows={4}
                    value={generalDescription}
                    onChange={(e) => setGeneralDescription(e.target.value)}
                    placeholder="Provide relevant information..."
                    className="input-underline resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGeneral}
                  className="btn-editorial btn-editorial-primary w-full cursor-pointer mt-4"
                >
                  {isSubmittingGeneral ? "Transmitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
