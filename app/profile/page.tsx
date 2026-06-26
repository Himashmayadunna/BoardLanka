"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FolderHeart,
  Edit,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

interface UserData {
  id: string;
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  marketingUpdates: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch from local cache first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setIsLoading(false);
            return;
          } catch (e) {
            console.error(e);
          }
        }

        // Fallback: API profile check
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
        const res = await fetch(`${apiUrl}/api/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = (await res.json()) as { message?: string; user?: UserData };
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/signin");
            return;
          }
          throw new Error(data.message || "Failed to load profile");
        }

        setUser(data.user || null);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.error(err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <div className="glass-card p-8 rounded-3xl border border-white/10 text-center max-w-sm">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cover Canvas Banner */}
        <div className="h-44 rounded-t-3xl bg-gradient-to-r from-primary/30 via-teal-500/20 to-secondary/30 border-t border-x border-white/10 relative overflow-hidden flex items-end p-6 shadow-inner">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 border border-white/10 text-[10px] font-bold text-primary relative z-10 select-none">
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
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <span className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full border ${
                user.accountType === "seller" 
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/25" 
                  : "bg-blue-500/10 text-blue-400 border-blue-500/25"
              }`}>
                {user.accountType === "seller" ? "Property Host / Owner" : "Room Seeker"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/profile/edit"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-glow text-primary hover:bg-primary hover:text-white rounded-xl border border-primary/20 text-xs font-semibold transition-all"
              >
                <Edit size={14} />
                Edit Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 text-xs font-semibold transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>

        </div>

        {/* Dashboard Panels Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Info Card */}
          <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <User size={16} className="text-primary" />
              Account Details
            </h2>
            <div className="space-y-3.5 text-sm">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Email Address</p>
                <p className="text-white font-medium mt-0.5">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Registered Since</p>
                <p className="text-white font-medium mt-0.5">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Hosting Metrics Card */}
          <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <TrendingUp size={16} className="text-primary" />
              Hosting Status
            </h2>
            <div className="space-y-3.5 text-sm">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Verification Status</p>
                <p className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Active Profile verified
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Newsletter Alerts</p>
                <p className="text-white font-medium mt-0.5">
                  {user.marketingUpdates ? "Subscribed to local listings" : "Muted"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions Panel */}
        <div className="glass p-6 rounded-3xl border border-white/10 text-left mt-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings size={16} className="text-primary" />
            Quick Access Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <Link
              href="/property-land"
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/30 rounded-2xl transition-all"
            >
              <div className="w-9 h-9 bg-primary-glow rounded-xl flex items-center justify-center text-primary">
                <Search size={16} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Find Houses</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Browse housing catalog</p>
              </div>
            </Link>

            <Link
              href="/anexxes-rooms"
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/30 rounded-2xl transition-all"
            >
              <div className="w-9 h-9 bg-primary-glow rounded-xl flex items-center justify-center text-primary">
                <Building size={16} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Find Rooms</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Browse annexes & rooms</p>
              </div>
            </Link>

            {user.accountType === "seller" ? (
              <>
                <Link
                  href="/addproperty"
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/30 rounded-2xl transition-all"
                >
                  <div className="w-9 h-9 bg-primary-glow rounded-xl flex items-center justify-center text-primary">
                    <PlusCircle size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Add Listing</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Host a new boarding</p>
                  </div>
                </Link>

                <Link
                  href="/my-listings"
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/30 rounded-2xl transition-all"
                >
                  <div className="w-9 h-9 bg-primary-glow rounded-xl flex items-center justify-center text-primary">
                    <LayoutDashboard size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Manage Listings</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">View & edit listings</p>
                  </div>
                </Link>
              </>
            ) : (
              <Link
                href="/profile/edit"
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-primary-glow border border-white/5 hover:border-primary/30 rounded-2xl transition-all"
              >
                <div className="w-9 h-9 bg-primary-glow rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Become Host</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Upgrade account scope</p>
                </div>
              </Link>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
