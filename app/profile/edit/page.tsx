"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, ShieldAlert } from "lucide-react";

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
        text: "You are not authenticated. Redirecting to sign in...",
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

      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      });

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-earth)] hover:underline uppercase tracking-wider font-semibold">
            <ArrowLeft size={13} /> Back to Profile
          </Link>
        </div>

        <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 md:p-12 space-y-8">
          
          <div className="border-b border-[var(--border-hairline)] pb-6">
            <span className="label-floating block mb-2">Account Settings</span>
            <h1 className="font-serif text-3xl md:text-4xl text-[var(--foreground)]">
              Edit <span className="italic">Profile</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Update your public identity and notification preferences.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 border text-xs font-medium ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                  : "bg-red-500/10 border-red-500/30 text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="label-floating">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  className="input-underline"
                />
              </div>

              <div className="space-y-1">
                <label className="label-floating">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  className="input-underline"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="label-floating">Account Role</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="input-underline cursor-pointer"
              >
                <option value="buyer">Resident / Room Seeker</option>
                <option value="seller">Property Host / Landlord</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-floating">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="input-underline"
              />
            </div>

            <div className="space-y-1">
              <label className="label-floating">Biography</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="A brief overview about yourself or your properties..."
                rows={3}
                className="input-underline resize-none"
              />
            </div>

            <div className="flex items-center gap-3 py-3 border-y border-[var(--border-hairline)]">
              <input
                type="checkbox"
                name="marketingUpdates"
                checked={formData.marketingUpdates}
                onChange={handleChange}
                id="marketing"
                className="accent-[var(--accent-earth)] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="marketing" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                Receive curated property recommendations and platform updates.
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 btn-editorial btn-editorial-primary cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="btn-editorial btn-editorial-outline cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </form>

          {/* Email Notice */}
          <div className="p-4 bg-[var(--surface-sunken)] border border-[var(--border-hairline)] flex gap-3 text-xs text-[var(--text-muted)]">
            <ShieldAlert size={16} className="text-[var(--accent-earth)] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Account Identifier:</strong> Primary email (<strong className="text-[var(--foreground)]">{user.email}</strong>) is permanently bound for security verification.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
