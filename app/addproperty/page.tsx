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
  ShieldCheck
} from "lucide-react";
import MeshBackground from "@/app/components/MeshBackground";

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
    "WiFi", "AC", "Parking", "Gym", "Pool", "Garden",
    "Kitchen", "Hot Water", "24/7 Security", "Balcony", "Study Area", "Laundry"
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
          text: "Only hosts can list properties. Navigate to Profile settings to upgrade your account type.",
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

  // Convert files helper
  const processFiles = (files: FileList) => {
    if (uploadedImages.length >= 5) {
      setMessage({ type: "error", text: "Maximum 5 images allowed" });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (uploadedImages.length >= 5) break;

      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Only image files are allowed." });
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: `Image ${file.name} exceeds the 2MB threshold.` });
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  // Drag & drop handlers
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
        setMessage({ type: "error", text: "Please complete all fields before moving on." });
        return false;
      }
    }
    if (step === 2) {
      if (formData.type !== "land" && (!formData.bedrooms || !formData.bathrooms || !formData.size)) {
        setMessage({ type: "error", text: "Please enter bedroom, bathroom and size properties." });
        return false;
      }
      if (formData.type === "land" && !formData.size) {
        setMessage({ type: "error", text: "Please enter the plot land size." });
        return false;
      }
    }
    if (step === 3) {
      if (formData.price <= 0 || !formData.phone) {
        setMessage({ type: "error", text: "Rent pricing and contact details are required." });
        return false;
      }
      if (uploadedImages.length === 0) {
        setMessage({ type: "error", text: "Please upload at least one property image." });
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
      setMessage({ type: "error", text: "Only seller accounts can publish properties." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("Missing authentication token.");

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
      if (!response.ok) throw new Error(data.message || "Failed to publish listing.");

      setMessage({ type: "success", text: "Property published successfully! Redirecting..." });
      setTimeout(() => {
        router.push("/my-listings");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Publishing failed. Please try again." });
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <MeshBackground />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold transition-all">
            <ArrowLeft size={14} />
            Back to Profile
          </Link>
        </div>

        {/* Step Indicator Headers */}
        <div className="glass p-6 rounded-3xl border border-white/10 shadow-2xl mb-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Add New Listing</h1>
              <p className="text-xs text-gray-400">Host your property or annex in Colombo and Galle</p>
            </div>
            <span className="text-xs bg-primary-glow text-primary font-bold px-3 py-1.5 rounded-full">
              Step {step} of 4
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Basic Details" },
              { label: "Specifications" },
              { label: "Media & Rent" },
              { label: "Preview" }
            ].map((s, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx + 1 <= step ? "bg-primary" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                : "bg-red-500/10 border border-red-500/25 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Wizard Column */}
          <div className={`${step === 4 ? "lg:col-span-12" : "lg:col-span-12"} w-full`}>
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* STEP 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                      <Sparkles size={18} className="text-primary" />
                      Basic Information
                    </h3>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-gray-400">Property Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Luxury Annex near University of Moratuwa"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Property Type *</label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-xs transition-all appearance-none cursor-pointer"
                        >
                          <option value="annex" className="bg-gray-900 text-white">Annex</option>
                          <option value="house" className="bg-gray-900 text-white">House</option>
                          <option value="land" className="bg-gray-900 text-white">Land</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">General Area District *</label>
                        <select
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 text-xs transition-all appearance-none cursor-pointer"
                        >
                          <option value="colombo" className="bg-gray-900 text-white">Colombo</option>
                          <option value="homagama" className="bg-gray-900 text-white">Homagama</option>
                          <option value="biyagama" className="bg-gray-900 text-white">Biyagama</option>
                          <option value="katunayaka" className="bg-gray-900 text-white">Katunayaka</option>
                          <option value="galle" className="bg-gray-900 text-white">Galle</option>
                          <option value="jaffna" className="bg-gray-900 text-white">Jaffna</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-gray-400">Specific Location Address *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Havelock Town, Colombo 5"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-gray-400">Detailed Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Provide details about the spaces, rules, distance to public buses, and local areas..."
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Specifications */}
                {step === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                      <Maximize size={18} className="text-primary" />
                      Property Specifications
                    </h3>

                    {formData.type !== "land" ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-semibold text-gray-400">Bedrooms *</label>
                          <input
                            type="number"
                            name="bedrooms"
                            min="0"
                            value={formData.bedrooms}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-semibold text-gray-400">Bathrooms *</label>
                          <input
                            type="number"
                            name="bathrooms"
                            min="0"
                            value={formData.bathrooms}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-xs font-semibold text-gray-400">Size (Sq.Ft) *</label>
                          <input
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            placeholder="800"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Plot Land Size (Sq.Ft / Perches) *</label>
                        <input
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          placeholder="e.g. 15 Perches"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                    )}

                    {formData.type !== "land" && (
                      <div className="space-y-3.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Select Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {amenitiesOptions.map((opt) => (
                            <label 
                              key={opt}
                              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer select-none text-xs transition-all ${
                                formData.amenities.includes(opt)
                                  ? "bg-primary-glow border-primary text-white"
                                  : "bg-white/5 border-white/5 text-gray-400 hover:border-white/15"
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
                                className={formData.amenities.includes(opt) ? "text-primary" : "text-gray-600"} 
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Media & Pricing */}
                {step === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                      <ImageIcon size={18} className="text-primary" />
                      Pricing & Media Upload
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Monthly Rent (Rs) *</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="25000"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Advance Deposit (Rs) *</label>
                        <input
                          type="number"
                          name="advancePayment"
                          value={formData.advancePayment}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="75000"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">Contact Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0712345678"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold text-gray-400">WhatsApp Contact</label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="0712345678"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Image Drag & Drop */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-semibold text-gray-400">Upload Property Images (Min 1, Max 5) *</label>
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                          dragActive 
                            ? "border-primary bg-primary-glow" 
                            : "border-white/10 bg-white/5 hover:border-primary/40"
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
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <ImageIcon size={28} className="mx-auto text-primary mb-2.5" />
                          <p className="text-xs text-white font-semibold">Click to select files or drag and drop</p>
                          <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, JPEG up to 2MB per image</p>
                        </label>
                      </div>
                    </div>

                    {/* Thumbnails preview */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] text-gray-500 font-semibold uppercase">Preview Images ({uploadedImages.length})</p>
                        <div className="grid grid-cols-5 gap-3">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                              <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Live Preview & Submit */}
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                      <Eye size={18} className="text-primary" />
                      Live Catalog Preview
                    </h3>

                    {/* Property Card Mock */}
                    <div className="max-w-sm mx-auto bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-0 text-left">
                      <div className="relative h-44 w-full bg-white/5">
                        <img 
                          src={uploadedImages[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <CheckCircle size={10} />
                          Verified Seller (Mock)
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold text-white uppercase">
                          {formData.type}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-base line-clamp-1">{formData.title || "Listing Title Placeholder"}</h4>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <MapPin size={10} className="text-primary" />
                            {formData.location || "Address, Sri Lanka"}
                          </p>
                        </div>

                        {formData.type !== "land" && (
                          <div className="flex gap-4 text-[10px] text-gray-500 border-y border-white/5 py-2">
                            <span className="flex items-center gap-1">
                              <Bed size={12} className="text-primary" />
                              {formData.bedrooms} Bed{formData.bedrooms > 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath size={12} className="text-primary" />
                              {formData.bathrooms} Bath{formData.bathrooms > 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Maximize size={12} className="text-primary" />
                              {formData.size || "0"} Sq.Ft
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary">Rs. {formData.price.toLocaleString()}</span>
                            <span className="text-[9px] text-gray-500">/month</span>
                          </div>
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-3.5 py-1.5 rounded-xl border border-primary/20">
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl max-w-md mx-auto flex gap-2 text-emerald-400">
                      <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-left">
                        <strong>Ready to Publish:</strong> Review the card display preview above. Once you click "Publish Listing", the property will be synced and displayed immediately across the marketplace catalog.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  )}
                  
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      Continue
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSaving || accountType !== "seller"}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? "Publishing..." : "Publish Listing"}
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
