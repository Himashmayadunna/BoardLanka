"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShieldAlert, ArrowLeft, Save, X } from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
  marketingUpdates: boolean;
  phone?: string;
  bio?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    accountType: "buyer",
    marketingUpdates: false,
    phone: "",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        accountType: userData.accountType || "buyer",
        marketingUpdates: userData.marketingUpdates || false,
        phone: userData.phone || "",
        bio: userData.bio || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setMessage({
        type: "error",
        text: "You are not authenticated. Redirecting...",
      });
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
      const res = await fetch(`${apiUrl}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          accountType: formData.accountType,
          marketingUpdates: formData.marketingUpdates,
          phone: formData.phone,
          bio: formData.bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile details");
      }

      // Update local storage cache
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage({
        type: "success",
        text: "Profile updated successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile details.",
      });
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <MeshBackground />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold transition-all">
            <ArrowLeft size={14} />
            Back to Profile
          </Link>
        </div>

        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1.5">Edit Profile</h1>
            <p className="text-xs text-gray-400">Update your account display metadata details</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold ${
                message.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/25 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-gray-400">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-gray-400">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-400">Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-xs transition-all appearance-none cursor-pointer"
              >
                <option value="buyer" className="bg-gray-900 text-white">Room Seeker</option>
                <option value="seller" className="bg-gray-900 text-white">Property Host / Owner</option>
              </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-400">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Short Bio */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-400">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Marketing Updates */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <input
                type="checkbox"
                name="marketingUpdates"
                checked={formData.marketingUpdates}
                onChange={handleChange}
                id="marketing"
                className="rounded accent-primary border-white/10 bg-white/5 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="marketing" className="text-xs text-gray-300 cursor-pointer select-none">
                Subscribe to active alerts and promotional property listings.
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <X size={14} />
                Cancel
              </button>
            </div>

          </form>

          {/* Email Lock Notice */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-2 text-gray-400">
            <ShieldAlert size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-left">
              <strong>Email Address Locked:</strong> Your email profile address (<strong>{user.email}</strong>) is tied to the central security scope database and cannot be modified.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
