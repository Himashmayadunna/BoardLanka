"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";

type Role = "buyer" | "seller";

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!agreeTerms) {
      alert("Please agree to the Terms & Privacy Policy to continue.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please verify your entries.");
      setIsLoading(false);
      return;
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountType: role,
          firstName,
          lastName,
          email,
          password,
          marketingUpdates: sendUpdates,
        }),
      });

      const data = (await res.json()) as { message?: string; user?: any };

      if (!res.ok) {
        alert(data.message || "Account creation failed.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(`Server error: ${error.message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--background)] text-[var(--foreground)] pt-20">
      
      {/* Left Column: Editorial Architectural Imagery */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 lg:p-16 border-r border-[var(--border-hairline)] overflow-hidden bg-[#181816] text-[#FAF8F5]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80"
            alt="Sri Lankan Contemporary Villa Architecture"
            fill
            priority
            sizes="50vw"
            className="object-cover brightness-[0.7] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181816]/90 via-[#181816]/40 to-transparent" />
        </div>

        <div className="relative z-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            New Account Registration
          </span>
          <p className="font-serif text-2xl text-white">
            Join Sri Lanka&apos;s curated property ecosystem.
          </p>
        </div>

        <div className="relative z-10 max-w-md space-y-3 pt-12">
          <p className="font-serif italic text-xl text-neutral-200 leading-relaxed">
            &ldquo;Whether searching for a student annex or managing an 8-unit estate, BoardLanka gives you effortless clarity.&rdquo;
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400 font-medium">
            Zero Hidden Agency Fees • Direct Verification
          </p>
        </div>
      </div>

      {/* Right Column: Underline Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 text-left">
          
          <div className="space-y-2 border-b border-[var(--border-hairline)] pb-6">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Registration
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Begin finding residences or listing units on the SaaS console.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-8 border border-[var(--border-hairline)] bg-[var(--surface)] text-center space-y-3">
              <div className="w-10 h-10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Check size={20} />
              </div>
              <h3 className="font-serif text-2xl text-[var(--text-primary)]">Account Created</h3>
              <p className="text-xs text-[var(--text-muted)]">Redirecting you to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Account Type Selector — Minimal Hairline Tabs */}
              <div className="space-y-1.5">
                <label className="label-floating">Account Purpose</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`py-2.5 px-3 text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer rounded-[2px] ${
                      role === "buyer"
                        ? "bg-[#181816] text-white border-[#181816] dark:bg-white dark:text-black dark:border-white"
                        : "bg-transparent text-[var(--text-muted)] border-[var(--border-hairline)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Tenant / Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`py-2.5 px-3 text-xs uppercase tracking-wider font-semibold border transition-all cursor-pointer rounded-[2px] ${
                      role === "seller"
                        ? "bg-[#181816] text-white border-[#181816] dark:bg-white dark:text-black dark:border-white"
                        : "bg-transparent text-[var(--text-muted)] border-[var(--border-hairline)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    Host / Landlord
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="label-floating">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sunil Jayawardena"
                  required
                  className="input-underline text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="label-floating">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.lk"
                  required
                  className="input-underline text-sm"
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="label-floating">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="input-underline text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="label-floating">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="input-underline text-sm"
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="space-y-2 pt-2 text-xs text-[var(--text-secondary)]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="mt-0.5 accent-[var(--accent-earth)]"
                  />
                  <span>
                    I agree to the <Link href="/terms" className="text-[var(--accent-earth)] underline">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--accent-earth)] underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-editorial btn-editorial-primary w-full py-3.5 text-xs font-semibold"
                >
                  {isLoading ? "Creating Account..." : "Register Account"}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-[var(--border-hairline)] text-xs text-[var(--text-muted)]">
                <span>Already registered with BoardLanka? </span>
                <Link href="/signin" className="text-[var(--accent-earth)] font-semibold hover:underline">
                  Sign In →
                </Link>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
