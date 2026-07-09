"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, ArrowRight, Github } from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";

  // 3D Left side illustration using pure Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = leftContainerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    const isLight = document.documentElement.classList.contains("light");
    const matColor = isLight ? 0x059669 : 0x1f2937;
    const matOpacity = isLight ? 0.15 : 0.8;
    const lineColor = isLight ? 0x0f766e : 0x10b981;

    // Primitives
    const geometry = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const material = new THREE.MeshStandardMaterial({
      color: matColor,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: matOpacity,
    });
    const mainBuilding = new THREE.Mesh(geometry, material);
    group.add(mainBuilding);

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 2 });
    const outline = new THREE.LineSegments(edges, lineMaterial);
    group.add(outline);

    // Floating pins and objects
    const pinGeo = new THREE.ConeGeometry(0.12, 0.28, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 });
    
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.rotation.x = Math.PI;
    pin1.position.set(-1.4, 0.6, 0.4);
    group.add(pin1);

    const pin2 = new THREE.Mesh(pinGeo, pinMat);
    pin2.rotation.x = Math.PI;
    pin2.position.set(1.4, -0.6, -0.4);
    group.add(pin2);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      
      // Floating rotations
      group.rotation.y = elapsed * 0.25;
      group.position.y = Math.sin(elapsed * 1.5) * 0.15;
      
      pin1.position.y = 0.6 + Math.sin(elapsed * 2.5) * 0.08;
      pin2.position.y = -0.6 + Math.cos(elapsed * 2.3) * 0.08;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      edges.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!agreeTerms) {
      alert("You must agree to the Terms & Privacy Policy");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Parse fullName into first and last names for backend compatibility
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
        alert(data.message || "Signup failed");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2500);
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(`Server error: ${error.message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background pt-16">
      <MeshBackground />

      {/* Left side: 3D Animation View */}
      <div 
        ref={leftContainerRef}
        className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col items-center justify-center relative border-r border-auth-left-border bg-gradient-to-br from-auth-left-bg-from via-auth-left-bg-via to-auth-left-bg-to overflow-hidden"
      >
        <div className="text-center max-w-lg z-10 space-y-4 px-8 mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight">
            Discover Verified Rental Spaces in Sri Lanka
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Create an account to save properties, check availability, and contact hosts directly with zero agency commission.
          </p>
        </div>
        <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-70" />
      </div>

      {/* Right side: Signup Glass Card */}
      <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo Title */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-base">BL</span>
              </div>
              <span className="text-xl font-bold text-text-primary">Board<span className="text-primary">Lanka</span></span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Create Account</h1>
            <p className="text-xs text-text-muted">Join BoardLanka and find your ideal place</p>
          </div>

          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            
            {isSuccess ? (
              <div className="text-center py-10 space-y-5 animate-fade-in">
                <div className="w-16 h-16 bg-primary-glow rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 animate-bounce">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Success!</h3>
                <p className="text-xs text-gray-400">
                  Your account was created successfully. Redirecting you to sign in...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role selection tabs */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-text-muted">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                        role === "buyer"
                          ? "bg-primary text-white border-transparent shadow-md shadow-primary/20"
                          : "bg-card-bg text-text-muted border-card-border hover:bg-card-hover-bg"
                      }`}
                    >
                      Find Property
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`py-3 px-4 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                        role === "seller"
                          ? "bg-primary text-white border-transparent shadow-md shadow-primary/20"
                          : "bg-card-bg text-text-muted border-card-border hover:bg-card-hover-bg"
                      }`}
                    >
                      List Property
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-text-muted">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 transition-all animate-none"
                    />
                    <User size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-text-muted">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 transition-all animate-none"
                    />
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-text-muted">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 transition-all animate-none"
                    />
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-text-muted">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder-text-muted/60 text-xs focus:outline-none focus:border-primary/50 transition-all animate-none"
                    />
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-text-muted hover:text-text-primary"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Agree terms & Updates */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded accent-primary border-card-border bg-card-bg w-4 h-4"
                    />
                    <span className="text-[10px] text-text-muted leading-normal text-left">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendUpdates}
                      onChange={(e) => setSendUpdates(e.target.checked)}
                      className="mt-0.5 rounded accent-primary border-card-border bg-card-bg w-4 h-4"
                    />
                    <span className="text-[10px] text-text-muted leading-normal text-left">
                      Send me updates about new listings and promotional offers.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Social logins */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-card-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-background text-text-muted font-semibold uppercase">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card-bg border border-card-border hover:bg-card-hover-bg transition-colors text-xs font-semibold text-text-primary cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card-bg border border-card-border hover:bg-card-hover-bg transition-colors text-xs font-semibold text-text-primary cursor-pointer"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </button>
                </div>

              </form>
            )}

          </div>

          <p className="text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline font-bold transition-all">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
