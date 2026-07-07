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

  // Seeding states
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  const handleSeedData = async () => {
    setIsSeeding(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/api/problems/seed-dummy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Demo dummy data seeded successfully! Go to favorites, hosted properties, and reports tabs to check.");
        // Reload all data
        loadFavorites();
        loadProblems();
        if (user?.accountType === "seller") {
          loadOwnListings();
        }
      } else {
        alert(data.message || "Failed to seed demo data");
      }
    } catch (e) {
      console.error(e);
      alert("Error seeding data.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`${apiUrl}/api/problems/clear-dummy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Demo dummy data cleared successfully.");
        // Reload all data
        loadFavorites();
        loadProblems();
        if (user?.accountType === "seller") {
          loadOwnListings();
        }
      } else {
        alert(data.message || "Failed to clear demo data");
      }
    } catch (e) {
      console.error(e);
      alert("Error clearing data.");
    } finally {
      setIsClearing(false);
    }
  };

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

      // Fetch all properties and filter locally by favorite IDs
      const res = await fetch(`${apiUrl}/api/properties`);
      if (res.ok) {
        const properties: Property[] = await res.json();
        const filtered = properties.filter(p => favIds.includes(Number(p.id)));
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
      // Landlords see their own properties. We'll fetch all properties and filter by seller ID
      const res = await fetch(`${apiUrl}/api/properties`);
      if (res.ok) {
        const data: Property[] = await res.json();
        // Since backend GET /api/properties has transformed details, we match landlord owned listings
        // We fetch and check owned listings
        const myProperties = data.filter((p: any) => {
          // If seller details match landlord or if we have a way to match.
          // Note: GET /api/properties transforms seller information but we can also match by telephone number or host name
          // Since the database matches owner properties, we will retrieve properties from API
          // Let's filter locally
          return p.seller?.phone === user?.phone || p.seller?.phone === localStorage.getItem("phone");
        });
        setOwnListings(myProperties);
      }
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
      <MeshBackground />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cover Canvas Banner */}
        <div className="h-48 rounded-t-3xl bg-gradient-to-r from-primary/30 via-teal-500/20 to-secondary/30 border-t border-x border-white/10 relative overflow-hidden flex items-end p-6 shadow-inner">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-primary relative z-10 select-none">
            <LayoutDashboard size={12} />
            <span>Dashboard Workspace</span>
          </div>
        </div>

        {/* Header Metadata Section */}
        <div className="bg-gray-950/80 backdrop-blur-2xl border-x border-b border-white/10 rounded-b-3xl p-6 relative shadow-2xl">
          
          {/* Avatar Position */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary p-1 shadow-xl shadow-black/20">
              <div className="w-full h-full bg-gray-950 rounded-[20px] flex items-center justify-center">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent uppercase">
                  {user.firstName.charAt(0)}{user.lastName?.charAt(0) || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-14 sm:pt-0 sm:pl-28 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  user.accountType === "seller" 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/25" 
                    : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                }`}>
                  {user.accountType === "seller" ? "Host / Owner" : "Room Seeker"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-lg leading-relaxed italic">
                {user.bio || "No biography added yet. Click 'Edit Profile' to add yours."}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/profile/edit"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-glow text-primary hover:bg-primary hover:text-white rounded-xl border border-primary/20 text-xs font-semibold transition-all"
              >
                <Edit size={14} />
                Edit Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 text-xs font-semibold transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>

        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex gap-2 p-1.5 mt-8 bg-white/5 border border-white/10 rounded-2xl max-w-fit">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "workspace" ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={14} />
            Workspace
          </button>
          
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "favorites" ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart size={14} />
            My Favorites ({favoritesList.length})
          </button>

          {user.accountType === "seller" && (
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "listings" ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building size={14} />
              Hosted Properties
            </button>
          )}

          <button
            onClick={() => setActiveTab("problems")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "problems" ? "bg-primary text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldAlert size={14} />
            Reported Issues ({problemsList.length})
          </button>
        </div>

        {/* TAB CONTENTS */}
        
        {/* Workspace Dashboard Tab */}
        {activeTab === "workspace" && (
          <div className="mt-8 space-y-6">
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glass p-5 rounded-2xl border border-white/10 text-left space-y-2 shadow-lg">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Verification Scope</span>
                <p className="text-lg font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  Active verified profile
                </p>
                <p className="text-[10px] text-gray-400">Registered: {formatDate(user.createdAt)}</p>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/10 text-left space-y-2 shadow-lg">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Saved Boardings</span>
                <p className="text-2xl font-black text-primary">{favoritesList.length}</p>
                <p className="text-[10px] text-gray-400">Items favorited across BoardLanka</p>
              </div>

              <div className="glass p-5 rounded-2xl border border-white/10 text-left space-y-2 shadow-lg">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Problem Reports</span>
                <p className="text-2xl font-black text-red-400">
                  {problemsList.filter(p => p.status !== "resolved" && p.status !== "closed").length}
                </p>
                <p className="text-[10px] text-gray-400">Open or In-Progress problem tickets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Account details panel */}
              <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 md:col-span-2 shadow-xl">
                <h3 className="font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                  <User size={16} className="text-primary" /> Profile details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Email Address</span>
                    <p className="text-white font-semibold mt-1">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Phone Number</span>
                    <p className="text-white font-semibold mt-1">{user.phone || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Account Authority</span>
                    <p className="text-white font-semibold mt-1 capitalize">{user.accountType === "seller" ? "Property Landlord" : "Property Buyer / Renter"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Alert Notifications</span>
                    <p className="text-white font-semibold mt-1">{user.marketingUpdates ? "Subscribed to alerts" : "Muted"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Quick Actions Panel */}
                <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 shadow-xl">
                  <h3 className="font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                    <Settings size={16} className="text-primary" /> Shortcut Actions
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/property-land"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/20 rounded-xl transition-all text-xs font-semibold text-white"
                    >
                      <span>Browse Houses / Land</span>
                      <Search size={14} className="text-primary" />
                    </Link>
                    <Link
                      href="/anexxes-rooms"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/20 rounded-xl transition-all text-xs font-semibold text-white"
                    >
                      <span>Browse Annexes</span>
                      <Building size={14} className="text-primary" />
                    </Link>
                    {user.accountType === "seller" && (
                      <Link
                        href="/addproperty"
                        className="flex items-center justify-between p-3 bg-primary text-white hover:bg-primary-hover rounded-xl transition-all text-xs font-bold"
                      >
                        <span>Add New Property Listing</span>
                        <PlusCircle size={14} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* System Testing & Demo Data Panel */}
                <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 shadow-xl">
                  <h3 className="font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                    <ShieldAlert size={16} className="text-red-400" /> Demo Sandbox
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Instantly generate dummy properties and problem reports to inspect the system flow. Clean them up easily when done.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleSeedData}
                      disabled={isSeeding}
                      className="px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSeeding ? "Seeding..." : "Seed Data"}
                    </button>
                    <button
                      onClick={handleClearData}
                      disabled={isClearing}
                      className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isClearing ? "Clearing..." : "Clear Data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab Content */}
        {activeTab === "favorites" && (
          <div className="mt-8 text-left">
            <h3 className="text-lg font-bold text-white mb-4">Saved Properties</h3>
            
            {loadingFavorites ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : favoritesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favoritesList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/property-land?id=${item.id}`)}
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer h-[320px] flex flex-col justify-between"
                  >
                    <div className="relative h-40 w-full bg-white/5">
                      <Image
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white uppercase font-bold">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-primary" /> {item.location}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="font-bold text-sm text-primary">Rs. {item.price.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <Heart size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No properties saved to favorites yet.</p>
                <Link href="/property-land" className="text-primary hover:underline text-xs font-semibold mt-2 inline-block">
                  Explore listings
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Landlord Hosted listings Tab Content */}
        {activeTab === "listings" && user.accountType === "seller" && (
          <div className="mt-8 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Your Property Listings</h3>
              <Link
                href="/addproperty"
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={14} /> Add Listing
              </Link>
            </div>

            {loadingListings ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : ownListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ownListings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/property-land?id=${item.id}`)}
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer h-[320px] flex flex-col justify-between"
                  >
                    <div className="relative h-40 w-full bg-white/5">
                      <Image
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white uppercase font-bold">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-primary" /> {item.location}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="font-bold text-sm text-primary">Rs. {item.price.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500">Edit / Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <Building size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">You haven't listed any properties yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Problems & Reports Tab Content */}
        {activeTab === "problems" && (
          <div className="mt-8 text-left space-y-6">
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
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 text-xs font-bold transition-all self-start sm:self-center"
                >
                  <ShieldAlert size={14} />
                  Report Web Issue
                </button>
              )}
            </div>

            {loadingProblems ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : problemsList.length > 0 ? (
              <div className="space-y-4">
                {problemsList.map((prob) => (
                  <div key={prob.id} className="glass p-5 rounded-2xl border border-white/10 shadow-lg space-y-4 text-left">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary-glow rounded-md uppercase tracking-wider">
                          {prob.issue_type}
                        </span>
                        <h4 className="font-bold text-white text-sm">{prob.title}</h4>
                        {prob.property_title && (
                          <p className="text-[10px] text-gray-400">
                            Property: <strong className="text-white">{prob.property_title}</strong>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Filed: {formatDate(prob.created_at)}
                        </span>
                        {getStatusBadge(prob.status)}
                      </div>
                    </div>

                    {/* Body description */}
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {prob.description}
                    </div>

                    {/* Landlord information or Tenant contact information (if host) */}
                    {user.accountType === "seller" && prob.profiles && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-[11px]">
                        <p className="font-bold text-white uppercase text-[9px] tracking-wider text-gray-400">Renter Contact details</p>
                        <div className="flex flex-wrap gap-4 text-gray-300">
                          <span className="flex items-center gap-1.5"><User size={12} className="text-primary" /> {prob.profiles.first_name} {prob.profiles.last_name}</span>
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> {prob.profiles.email}</span>
                          {prob.profiles.phone && (
                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-primary" /> {prob.profiles.phone}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions footer */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5 text-xs">
                      {/* Host Actions */}
                      {user.accountType === "seller" && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-semibold">Change status:</span>
                          
                          <button
                            disabled={updatingProblemId === prob.id || prob.status === "in-progress"}
                            onClick={() => handleStatusChange(prob.id, "in-progress")}
                            className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg font-bold text-[10px] transition-all disabled:opacity-50"
                          >
                            In Progress
                          </button>
                          
                          <button
                            disabled={updatingProblemId === prob.id || prob.status === "resolved"}
                            onClick={() => handleStatusChange(prob.id, "resolved")}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-[10px] transition-all disabled:opacity-50"
                          >
                            Resolved
                          </button>
                        </div>
                      )}

                      {/* Buyer Actions */}
                      {user.accountType === "buyer" && prob.status !== "closed" && (
                        <button
                          disabled={updatingProblemId === prob.id}
                          onClick={() => handleStatusChange(prob.id, "closed")}
                          className="px-3 py-1 bg-white/5 hover:bg-red-500 hover:text-white border border-white/10 rounded-lg font-bold text-[10px] transition-all text-gray-400"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <ShieldCheck size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-400">No issues reported or complaints logged.</p>
              </div>
            )}
          </div>
        )}

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
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
                  <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-red-400 text-xs font-semibold">
                    {generalError}
                  </div>
                )}

                {/* Issue Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Glitch Category</label>
                  <select
                    value={generalIssueType}
                    onChange={(e) => setGeneralIssueType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="General Web Problem" className="bg-gray-900 text-white">General Web Glitch / UI Bug</option>
                    <option value="Search Glitch" className="bg-gray-900 text-white">Property Search or Filtering Error</option>
                    <option value="Auth Issue" className="bg-gray-900 text-white">Account Login or Signup Problem</option>
                    <option value="Other Web Issue" className="bg-gray-900 text-white">Other Website Trouble</option>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGeneral}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
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
