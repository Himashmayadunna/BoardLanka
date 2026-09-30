"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Check, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await res.json()) as { message?: string; token?: string; user?: any };

      if (!res.ok) {
        alert(data.message || "Sign in failed");
        setIsLoading(false);
        return;
      }

      if (rememberMe && data.token) {
        localStorage.setItem("token", data.token);
      } else if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.firstName || "User",
          lastName: data.user.user_metadata?.lastName || "",
          accountType: data.user.user_metadata?.accountType || "buyer",
          marketingUpdates: data.user.user_metadata?.marketingUpdates || false,
          createdAt: data.user.created_at,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (error: any) {
      console.error("Sign in error:", error);
      alert(`Server error: ${error.message || "Please try again."} Make sure the backend server on port 5000 is running.`);
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
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80"
            alt="Sri Lankan Architectural Residence"
            fill
            priority
            sizes="50vw"
            className="object-cover brightness-[0.7] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181816]/90 via-[#181816]/40 to-transparent" />
        </div>

        <div className="relative z-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
            BoardLanka Authentication
          </span>
          <p className="font-serif text-2xl text-white">
            Curated residences & digital lease management.
          </p>
        </div>

        <div className="relative z-10 max-w-md space-y-3 pt-12">
          <p className="font-serif italic text-xl text-neutral-200 leading-relaxed">
            &ldquo;Managing properties should feel calm, verified, and completely transparent.&rdquo;
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400 font-medium">
            Sri Lanka Real Estate Network
          </p>
        </div>
      </div>

      {/* Right Column: Underline Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 text-left">
          
          <div className="space-y-2 border-b border-[var(--border-hairline)] pb-6">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
              Welcome Back
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Access your portfolio, active leases, or saved rental listings.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-8 border border-[var(--border-hairline)] bg-[var(--surface)] text-center space-y-3">
              <div className="w-10 h-10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Check size={20} />
              </div>
              <h3 className="font-serif text-2xl text-[var(--text-primary)]">Access Granted</h3>
              <p className="text-xs text-[var(--text-muted)]">Redirecting to your dashboard profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
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

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="label-floating">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="input-underline text-sm"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[var(--accent-earth)]"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-editorial btn-editorial-primary w-full py-3.5 text-xs font-semibold"
                >
                  {isLoading ? "Authenticating..." : "Sign In to Console"}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-[var(--border-hairline)] text-xs text-[var(--text-muted)]">
                <span>Do not have an account yet? </span>
                <Link href="/signup" className="text-[var(--accent-earth)] font-semibold hover:underline">
                  Create Account →
                </Link>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
