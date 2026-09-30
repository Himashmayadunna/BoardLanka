"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircle, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  CheckCircle, 
  Image as ImageIcon, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Sparkles,
  Eye,
  ShieldCheck,
  Plus
} from "lucide-react";
import { compressImage } from "@/lib/imageOptimizer";
import { clearClientPropertyCache } from "@/lib/propertyService";

interface FormData {
  title: string;
  location: string;
  area: string;
  type: string;
  price: number;
  advancePayment: number;
  bedrooms: number;
  bathrooms: number;
  size: string;
  description: string;
  amenities: string[];
  phone: string;
  whatsapp: string;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    location: "",
    area: "colombo",
    type: "annex",
    price: 0,
    advancePayment: 0,
    bedrooms: 1,
    bathrooms: 1,
    size: "",
    description: "",
    amenities: [],
    phone: "",
    whatsapp: "",
  });

  const amenitiesOptions = [
    "WiFi", "Air Conditioning", "Dedicated Parking", "Fitness Center", "Swimming Pool", "Private Garden",
    "Equipped Kitchen", "Hot Water", "24/7 Security", "Balcony Terrace", "Study Nook", "Laundry"
  ];

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    if (user) {
      const userData = JSON.parse(user);
      setAccountType(userData.accountType);
      if (userData.accountType !== "seller") {
        setMessage({
          type: "error",
          text: "Only landlord/host accounts can list properties. Visit Profile settings to update your role.",
        });
      }
      setIsLoggedIn(true);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const processFiles = async (files: FileList) => {
    if (uploadedImages.length >= 5) {
      setMessage({ type: "error", text: "Maximum 5 images permitted per listing." });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (uploadedImages.length >= 5) break;

      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please supply standard image files only." });
        continue;
      }

      try {
        const compressedBase64 = await compressImage(file, {
          maxWidth: 1280,
          maxHeight: 960,
          quality: 0.8,
        });
        setUploadedImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, compressedBase64];
        });
      } catch (err) {
        console.warn("Compression fallback:", err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setUploadedImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.location) {
        setMessage({ type: "error", text: "Please complete all mandatory fields." });
        return false;
      }
    }
    if (step === 2) {
      if (formData.type !== "land" && (!formData.bedrooms || !formData.bathrooms || !formData.size)) {
        setMessage({ type: "error", text: "Please define bedrooms, bathrooms, and floor area." });
        return false;
      }
      if (formData.type === "land" && !formData.size) {
        setMessage({ type: "error", text: "Please enter the plot extent." });
        return false;
      }
    }
    if (step === 3) {
      if (formData.price <= 0 || !formData.phone) {
        setMessage({ type: "error", text: "Monthly rate and phone contact are required." });
        return false;
      }
      if (uploadedImages.length === 0) {
        setMessage({ type: "error", text: "Please upload at least one photograph." });
        return false;
      }
    }
    setMessage(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setMessage(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType !== "seller") {
      setMessage({ type: "error", text: "Only seller/landlord accounts may publish listings." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("Missing authentication credentials.");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/_/backend";
      const payload = { ...formData, images: uploadedImages };

      const response = await fetch(`${apiUrl}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; property?: any };
      if (!response.ok) throw new Error(data.message || "Failed to publish property.");

      clearClientPropertyCache();

      setMessage({ type: "success", text: "Listing published successfully. Redirecting..." });
      setTimeout(() => {
        router.push("/my-listings");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Publishing failed. Please try again." });
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--border-hairline)] border-t-[var(--accent-earth)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-earth)] hover:underline uppercase tracking-wider font-semibold">
            <ArrowLeft size={13} /> Back to Profile
          </Link>
        </div>

        {/* Header & Step Tracker */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 md:p-10 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <span className="label-floating block mb-1">Host Operations</span>
              <h1 className="font-serif text-3xl md:text-4xl text-[var(--foreground)]">
                List a <span className="italic">Residence</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Publish a property listing to accept verified tenant inquiries.
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--accent-earth)]">
              Stage {step} of 4
            </span>
          </div>

          {/* Hairline Step Progress */}
          <div className="grid grid-cols-4 gap-3">
            {[
              "1. Overview",
              "2. Specs",
              "3. Media & Rate",
              "4. Verification"
            ].map((label, idx) => (
              <div key={idx} className="space-y-2">
                <div 
                  className={`h-[2px] transition-all ${
                    idx + 1 <= step ? "bg-[var(--accent-earth)]" : "bg-[var(--border-hairline)]"
                  }`}
                />
                <span className={`text-[9px] uppercase tracking-wider font-semibold block truncate ${
                  idx + 1 === step ? "text-[var(--foreground)]" : "text-[var(--text-muted)]"
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 border text-xs font-medium mb-6 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Wizard Form Body */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface)] p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-hairline)] pb-4">
                  <span className="label-floating block mb-1">Section 01</span>
                  <h3 className="font-serif text-2xl text-[var(--foreground)]">Basic Information</h3>
                </div>

                <div className="space-y-1">
                  <label className="label-floating">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Minimalist Studio Annex, Colombo 07"
                    required
                    className="input-underline"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="label-floating">Property Category *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="input-underline cursor-pointer"
                    >
                      <option value="annex">Private Annex</option>
                      <option value="room">Single / Shared Room</option>
                      <option value="house">Standalone House</option>
                      <option value="land">Plot / Land Extent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="label-floating">District Location *</label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="input-underline cursor-pointer"
                    >
                      <option value="colombo">Colombo District</option>
                      <option value="homagama">Homagama</option>
                      <option value="biyagama">Biyagama</option>
                      <option value="katunayaka">Katunayaka</option>
                      <option value="galle">Galle District</option>
                      <option value="jaffna">Jaffna District</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-floating">Specific Address / Road *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Barnes Place, Colombo 07"
                    required
                    className="input-underline"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-floating">Architectural & Neighborhood Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe natural lighting, room dimensions, nearby transit links, and residential policies..."
                    required
                    className="input-underline resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Specifications */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-hairline)] pb-4">
                  <span className="label-floating block mb-1">Section 02</span>
                  <h3 className="font-serif text-2xl text-[var(--foreground)]">Space Specifications</h3>
                </div>

                {formData.type !== "land" ? (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="label-floating">Bedrooms *</label>
                      <input
                        type="number"
                        name="bedrooms"
                        min="0"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="input-underline"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="label-floating">Bathrooms *</label>
                      <input
                        type="number"
                        name="bathrooms"
                        min="0"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="input-underline"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="label-floating">Floor Area (Sq.Ft) *</label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        placeholder="850"
                        className="input-underline"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="label-floating">Plot Land Extent (Perches / Sq.Ft) *</label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g. 15.5 Perches"
                      className="input-underline"
                    />
                  </div>
                )}

                {formData.type !== "land" && (
                  <div className="space-y-4 pt-4 border-t border-[var(--border-hairline)]">
                    <label className="label-floating block">Available Amenities & Fixtures</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenitiesOptions.map((opt) => (
                        <label 
                          key={opt}
                          className={`flex items-center gap-2.5 p-3 border cursor-pointer select-none text-xs transition-all ${
                            formData.amenities.includes(opt)
                              ? "border-[var(--accent-earth)] bg-[var(--surface-sunken)] text-[var(--foreground)] font-medium"
                              : "border-[var(--border-hairline)] text-[var(--text-muted)] hover:border-[var(--foreground)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(opt)}
                            onChange={() => handleAmenityToggle(opt)}
                            className="hidden"
                          />
                          <CheckCircle 
                            size={14} 
                            className={formData.amenities.includes(opt) ? "text-[var(--accent-earth)]" : "opacity-30"} 
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Media & Rates */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-hairline)] pb-4">
                  <span className="label-floating block mb-1">Section 03</span>
                  <h3 className="font-serif text-2xl text-[var(--foreground)]">Financials & Media Upload</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="label-floating">Monthly Rent (LKR) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="35000"
                      className="input-underline"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-floating">Security Deposit / Advance (LKR) *</label>
                    <input
                      type="number"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="105000"
                      className="input-underline"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="label-floating">Primary Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="071 234 5678"
                      className="input-underline"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-floating">WhatsApp Inquiries Contact</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="071 234 5678"
                      className="input-underline"
                    />
                  </div>
                </div>

                {/* Hairline Photo Dropzone */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-hairline)]">
                  <label className="label-floating block">Photography (1 to 5 high-resolution captures) *</label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border border-dashed p-8 text-center cursor-pointer transition-colors ${
                      dragActive 
                        ? "border-[var(--accent-earth)] bg-[var(--surface-sunken)]" 
                        : "border-[var(--border-hairline)] hover:border-[var(--foreground)]"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="file-upload"
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                      <ImageIcon size={28} className="mx-auto text-[var(--accent-earth)]" />
                      <p className="text-xs font-semibold text-[var(--foreground)]">Select files or drag and drop</p>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">PNG, JPG or WEBP formats</p>
                    </label>
                  </div>
                </div>

                {/* Thumbnails */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <span className="label-floating block">Uploaded Stills ({uploadedImages.length}/5)</span>
                    <div className="grid grid-cols-5 gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-video border border-[var(--border-hairline)] group overflow-hidden">
                          <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Editorial Catalog Preview */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="border-b border-[var(--border-hairline)] pb-4">
                  <span className="label-floating block mb-1">Section 04</span>
                  <h3 className="font-serif text-2xl text-[var(--foreground)]">Catalog Preview & Confirmation</h3>
                </div>

                {/* Boutique Listing Preview Card */}
                <div className="max-w-md mx-auto border border-[var(--border-hairline)] bg-[var(--surface)] overflow-hidden">
                  <div className="relative h-56 w-full bg-[var(--surface-sunken)]">
                    <img 
                      src={uploadedImages[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3 bg-[var(--background)]/90 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-semibold border border-[var(--border-hairline)]">
                      {formData.type}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="font-serif text-xl text-[var(--foreground)] line-clamp-1">
                        {formData.title || "Residence Title Placeholder"}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <MapPin size={12} className="text-[var(--accent-earth)]" />
                        {formData.location || "Address, Sri Lanka"}
                      </p>
                    </div>

                    {formData.type !== "land" && (
                      <div className="grid grid-cols-3 border-y border-[var(--border-hairline)] py-3 text-center text-xs">
                        <div>
                          <span className="label-floating block">Bedrooms</span>
                          <span className="font-serif text-sm font-semibold">{formData.bedrooms}</span>
                        </div>
                        <div>
                          <span className="label-floating block">Bathrooms</span>
                          <span className="font-serif text-sm font-semibold">{formData.bathrooms}</span>
                        </div>
                        <div>
                          <span className="label-floating block">Area</span>
                          <span className="font-serif text-sm font-semibold">{formData.size || "0"} Sq.Ft</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between pt-2">
                      <div>
                        <span className="font-serif text-2xl text-[var(--foreground)]">
                          LKR {formData.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider ml-1">/mo</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--accent-earth)]">
                        Active Listing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--surface-sunken)] border border-[var(--border-hairline)] max-w-md mx-auto flex gap-3 text-xs text-[var(--text-muted)]">
                  <ShieldCheck size={16} className="text-[var(--accent-earth)] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ready for Publication:</strong> Submitting will index this property across the public search catalog and trigger direct tenant inquiries.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-[var(--border-hairline)]">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn-editorial btn-editorial-outline flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-editorial btn-editorial-primary flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving || accountType !== "seller"}
                  className="btn-editorial btn-editorial-primary flex-1 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Publishing Property..." : "Publish Listing"}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
