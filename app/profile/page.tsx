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
  TrendingUp,
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  X,
  ShieldAlert
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";
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

    // Load Favorites if favorites tab or workspace is active
    if (activeTab === "favorites" || activeTab === "workspace") {
      loadFavorites();
    }

    // Load Problems if problems tab or workspace is active
    if (activeTab === "problems" || activeTab === "workspace") {
      loadProblems();
    }

    // Load Landlord's listings if seller
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

      // Fetch properties using fast SWR cache and filter locally
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
      // Query dedicated seller listings endpoint directly
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
        // Refresh local problems list
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

      setGeneralSuccess("Website problem reported successfully! Our technical team will inspect this immediately.");
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
      return `/anexxes-rooms?id=${item.id}`;
    }
    return `/property-land?id=${item.id}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-full uppercase">
            <AlertCircle size={10} /> Open
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-full uppercase">
            <Clock size={10} /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full uppercase">
            <CheckCircle2 size={10} /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-gray-500/10 border border-gray-500/25 text-gray-400 rounded-full uppercase">
            <X size={10} /> Closed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl border border-white/10 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Session Error</h2>
          <p className="text-xs text-gray-400 mb-6">{error || "User data not found."}</p>
          <Link href="/signin" className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all">
            Sign In Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Two-Column Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20 pb-8">
          
          {/* LEFT COLUMN: Profile card, verified details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass border border-white/10 rounded-[2.5rem] p-6 text-left shadow-2xl relative overflow-hidden space-y-6 bg-gray-950/75 backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Profile Logo Avatar */}
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="relative group">
                  {/* Glowing Double Ring border */}
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-teal-400 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-teal-400 p-[3px] shadow-xl">
                    <div className="w-full h-full bg-[#08090a] rounded-full flex items-center justify-center border border-white/5">
                      <span className="text-4xl font-black bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent uppercase tracking-wider">
                        {user.firstName.charAt(0)}{user.lastName?.charAt(0) || ""}
                      </span>
                    </div>
                  </div>
                  {/* Status verified online dot indicator */}
                  <div className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-4 border-gray-950 shadow-md flex items-center justify-center" title="Online & verified profile">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${
                    user.accountType === "seller" 
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-md shadow-purple-500/5" 
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-md shadow-blue-500/5"
                  }`}>
                    {user.accountType === "seller" ? "Host / Owner" : "Room Seeker"}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed max-w-xs italic bg-white/3 p-4.5 rounded-2xl border border-white/5">
                  {user.bio || "No biography added yet. Click 'Edit Profile' to add details about yourself."}
                </p>
              </div>

              {/* Core Credentials & Details */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Info</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Email Address</p>
                      <p className="text-xs font-semibold text-white mt-1 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5 flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Phone Number</p>
                      <p className="text-xs font-semibold text-white mt-1">{user.phone || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5 flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Member Since</p>
                      <p className="text-xs font-semibold text-white mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-primary border border-white/5 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none">Alert Subscription</p>
                      <p className="text-xs font-semibold text-white mt-1">
                        {user.marketingUpdates ? "Alert notifications enabled" : "Muted"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="border-t border-white/5 pt-5 flex gap-2">
                <Link
                  href="/profile/edit"
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary-glow text-primary hover:bg-primary hover:text-white rounded-xl border border-primary/20 text-xs font-bold transition-all hover:scale-[1.02] active:scale-98"
                >
                  <Edit size={14} />
                  Edit Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 text-xs font-bold transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Tab switcher and workspaces */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabbed Navigation Bar */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-full">
              <button
                onClick={() => setActiveTab("workspace")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "workspace" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard size={14} />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "favorites" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Heart size={14} />
                Favorites ({favoritesList.length})
              </button>

              {user.accountType === "seller" && (
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "listings" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Building size={14} />
                  Listings
                </button>
              )}

              <button
                onClick={() => setActiveTab("problems")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "problems" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldAlert size={14} />
                Issues ({problemsList.length})
              </button>
            </div>

            {/* TAB CONTENTS WITH ANIMATIONS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "workspace" && (
                  <div className="space-y-6">
                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="glass p-5 rounded-3xl border border-white/10 text-left space-y-2 relative overflow-hidden bg-gray-950/40">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Verification Scope</span>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                          <ShieldCheck size={16} className="text-emerald-400" />
                          Profile Active
                        </p>
                        <p className="text-[10px] text-gray-400 leading-none">Verified & Secured</p>
                      </div>

                      <div className="glass p-5 rounded-3xl border border-white/10 text-left space-y-1 relative overflow-hidden bg-gray-950/40">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Favorites</span>
                        <p className="text-3xl font-black text-primary leading-tight">{favoritesList.length}</p>
                        <p className="text-[10px] text-gray-400 leading-none">Boardings bookmarked</p>
                      </div>

                      <div className="glass p-5 rounded-3xl border border-white/10 text-left space-y-1 relative overflow-hidden bg-gray-950/40">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Active Problems</span>
                        <p className="text-3xl font-black text-red-400 leading-tight">
                          {problemsList.filter(p => p.status !== "resolved" && p.status !== "closed").length}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-none">Open complaints</p>
                      </div>

                    </div>

                    {/* Quick Shortcuts Dashboard section */}
                    <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 bg-gray-950/40">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-white/5 uppercase tracking-wider text-gray-400">
                        <Settings size={14} className="text-primary" /> Workspace Shortcuts
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link
                          href="/property-land"
                          className="flex flex-col justify-between p-4 bg-white/3 hover:bg-primary-glow border border-white/5 hover:border-primary/20 rounded-2xl transition-all group space-y-3"
                        >
                          <div className="p-2 w-8 h-8 rounded-xl bg-white/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Search size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Browse Houses & Lands</span>
                            <span className="text-[9px] text-gray-500 mt-1 block">Find large residential properties</span>
                          </div>
                        </Link>

                        <Link
                          href="/anexxes-rooms"
                          className="flex flex-col justify-between p-4 bg-white/3 hover:bg-primary-glow border border-white/5 hover:border-primary/20 rounded-2xl transition-all group space-y-3"
                        >
                          <div className="p-2 w-8 h-8 rounded-xl bg-white/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Building size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Browse Annexes & Rooms</span>
                            <span className="text-[9px] text-gray-500 mt-1 block">Find rooms or rental annexes</span>
                          </div>
                        </Link>

                        {user.accountType === "seller" ? (
                          <Link
                            href="/addproperty"
                            className="flex flex-col justify-between p-4 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-2xl transition-all group space-y-3"
                          >
                            <div className="p-2 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlusCircle size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-bold block">List a New Property</span>
                              <span className="text-[9px] mt-1 block opacity-80">Add boarding rooms, houses, etc</span>
                            </div>
                          </Link>
                        ) : (
                          <div
                            onClick={() => setShowGeneralReportModal(true)}
                            className="flex flex-col justify-between p-4 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/10 hover:border-red-500/35 rounded-2xl transition-all group space-y-3 cursor-pointer"
                          >
                            <div className="p-2 w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ShieldAlert size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-bold block text-white group-hover:text-white">Report Website Bug</span>
                              <span className="text-[9px] text-gray-500 group-hover:text-white/80 mt-1 block">Help us improve the system</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === "favorites" && (
                  <div className="space-y-4 text-left">
                    <h3 className="text-lg font-bold text-white">Saved Properties</h3>
                    
                    {loadingFavorites ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : favoritesList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritesList.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => router.push(getPropertyLink(item))}
                            className="glass-card rounded-[2rem] overflow-hidden cursor-pointer flex flex-col justify-between border border-white/5 bg-gray-950/40 hover:border-primary/30 transition-all hover:scale-[1.01] group"
                          >
                            <div className="relative h-44 w-full bg-white/5 overflow-hidden">
                              <Image
                                src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] text-white uppercase font-bold tracking-wider border border-white/10">
                                {item.type}
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-white text-base line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={12} className="text-primary" /> {item.location}
                                </p>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <span className="font-black text-base text-primary">Rs. {item.price.toLocaleString()}</span>
                                <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  View Space →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                          <Heart size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">No favorited boardings yet.</p>
                          <Link href="/property-land" className="text-primary hover:underline text-xs font-extrabold mt-2 inline-block">
                            Start exploring boardings & rooms
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "listings" && user.accountType === "seller" && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Your Listed Spaces</h3>
                      <Link
                        href="/addproperty"
                        className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/10 border border-primary/20"
                      >
                        <Plus size={14} /> Add Listing
                      </Link>
                    </div>

                    {loadingListings ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : ownListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ownListings.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => router.push(getPropertyLink(item))}
                            className="glass-card rounded-[2rem] overflow-hidden cursor-pointer flex flex-col justify-between border border-white/5 bg-gray-950/40 hover:border-primary/30 transition-all hover:scale-[1.01] group"
                          >
                            <div className="relative h-44 w-full bg-white/5 overflow-hidden">
                              <Image
                                src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] text-white uppercase font-bold tracking-wider border border-white/10">
                                {item.type}
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-white text-base line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={12} className="text-primary" /> {item.location}
                                </p>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <span className="font-black text-base text-primary">Rs. {item.price.toLocaleString()}</span>
                                <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  Edit Listing →
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">No listings published yet.</p>
                          <Link href="/addproperty" className="text-primary hover:underline text-xs font-extrabold mt-2 inline-block">
                            List your first property now
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "problems" && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">Reported Issues & Problem Tickets</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user.accountType === "seller" 
                            ? "Manage complaints and maintenance requests filed by tenants on your boardings."
                            : "Track issues you reported about boarding properties, landlords, or general website glitches."}
                        </p>
                      </div>

                      {user.accountType !== "seller" && (
                        <button
                          onClick={() => setShowGeneralReportModal(true)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-red-500/20 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-500/5 self-start sm:self-center"
                        >
                          <ShieldAlert size={14} />
                          Report Website Bug
                        </button>
                      )}
                    </div>

                    {loadingProblems ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : problemsList.length > 0 ? (
                      <div className="space-y-4">
                        {problemsList.map((prob) => (
                          <div key={prob.id} className="glass p-6 rounded-[2rem] border border-white/10 shadow-xl space-y-4 bg-gray-950/40">
                            {/* Header details */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                              <div className="space-y-2">
                                <span className="inline-block text-[9px] font-bold text-primary px-2.5 py-1 bg-primary-glow border border-primary/20 rounded-lg uppercase tracking-wider">
                                  {prob.issue_type}
                                </span>
                                <h4 className="font-extrabold text-white text-base leading-tight">{prob.title}</h4>
                                {prob.property_title && (
                                  <p className="text-xs text-gray-400">
                                    Affected boarding: <span className="text-white font-bold">{prob.property_title}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                  Filed: {formatDate(prob.created_at)}
                                </span>
                                {getStatusBadge(prob.status)}
                              </div>
                            </div>

                            {/* Description text */}
                            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/3 p-4.5 rounded-2xl border border-white/5">
                              {prob.description}
                            </div>

                            {/* Landlord Contact Info / Tenant Contact Info if seller */}
                            {user.accountType === "seller" && prob.profiles && (
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3.5 text-xs text-left">
                                <p className="font-bold text-[9px] uppercase tracking-widest text-gray-400 leading-none">Renter Contact details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-300 font-semibold mt-1">
                                  <span className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5"><User size={14} className="text-primary flex-shrink-0" /> {prob.profiles.first_name} {prob.profiles.last_name}</span>
                                  <span className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 truncate" title={prob.profiles.email}><Mail size={14} className="text-primary flex-shrink-0 truncate" /> {prob.profiles.email}</span>
                                  {prob.profiles.phone && (
                                    <span className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5"><Phone size={14} className="text-primary flex-shrink-0" /> {prob.profiles.phone}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status updating actions */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-white/5 text-xs">
                              {user.accountType === "seller" && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Change Status:</span>
                                  
                                  <button
                                    disabled={updatingProblemId === prob.id || prob.status === "in-progress"}
                                    onClick={() => handleStatusChange(prob.id, "in-progress")}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/25 hover:shadow-lg hover:shadow-amber-500/5 rounded-lg font-bold text-[10px] transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    In Progress
                                  </button>
                                  
                                  <button
                                    disabled={updatingProblemId === prob.id || prob.status === "resolved"}
                                    onClick={() => handleStatusChange(prob.id, "resolved")}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5 rounded-lg font-bold text-[10px] transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    Resolved
                                  </button>
                                </div>
                              )}

                              {user.accountType === "buyer" && prob.status !== "closed" && (
                                <button
                                  disabled={updatingProblemId === prob.id}
                                  onClick={() => handleStatusChange(prob.id, "closed")}
                                  className="px-4 py-1.5 bg-white/5 hover:bg-red-500 hover:text-white border border-white/10 hover:border-red-500/30 rounded-lg font-bold text-[10px] transition-all text-gray-400 cursor-pointer"
                                >
                                  Close Ticket
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">No reported tickets logged.</p>
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

      {/* Website General Problem Submission Modal Overlay */}
      {showGeneralReportModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative space-y-5 animate-slide-up text-left">
            <button 
              onClick={() => {
                setShowGeneralReportModal(false);
                setGeneralSuccess("");
                setGeneralError("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">Report Website Glitch</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Found a bug, layout issue, or problem with search/booking? Let us know so we can fix it.
              </p>
            </div>

            {generalSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl text-emerald-400 text-xs font-semibold text-center animate-fade-in">
                {generalSuccess}
              </div>
            ) : (
              <form onSubmit={handleGeneralReportSubmit} className="space-y-4">
                {generalError && (
                  <div className="bg-red-500/10 border border-red-500/25 p-3.5 rounded-2xl text-red-400 text-xs font-semibold">
                    {generalError}
                  </div>
                )}

                {/* Issue Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Glitch Category</label>
                  <select
                    value={generalIssueType}
                    onChange={(e) => setGeneralIssueType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="General Web Problem" className="bg-gray-950 text-white">General Web Glitch / UI Bug</option>
                    <option value="Search Glitch" className="bg-gray-950 text-white">Property Search or Filtering Error</option>
                    <option value="Auth Issue" className="bg-gray-950 text-white">Account Login or Signup Problem</option>
                    <option value="Other Web Issue" className="bg-gray-950 text-white">Other Website Trouble</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Short Summary</label>
                  <input
                    type="text"
                    required
                    value={generalTitle}
                    onChange={(e) => setGeneralTitle(e.target.value)}
                    placeholder="e.g., Cannot view map on room details"
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Describe what happened</label>
                  <textarea
                    required
                    rows={4}
                    value={generalDescription}
                    onChange={(e) => setGeneralDescription(e.target.value)}
                    placeholder="Tell us what page you were on and steps to reproduce the issue."
                    className="w-full px-4 py-3 rounded-2xl bg-[#08090a] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGeneral}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingGeneral ? "Submitting..." : "Submit Bug Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
