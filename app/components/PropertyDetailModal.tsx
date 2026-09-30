"use client";

import { useState, useRef, useEffect, FormEvent, MouseEvent } from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Phone, 
  Mail, 
  Grid, 
  X, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property } from "@/lib/propertyService";

interface PropertyDetailModalProps {
  property: Property;
  loading?: boolean;
  isFavorite?: boolean;
  onClose: () => void;
  onToggleFavorite?: (id: number, e: MouseEvent) => void;
  onShare?: () => void;
}

export default function PropertyDetailModal({
  property,
  loading = false,
  isFavorite = false,
  onClose,
  onToggleFavorite,
  onShare,
}: PropertyDetailModalProps) {
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [calendarDate, setCalendarDate] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"];

  const handleOverlayScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 80);
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleInquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquiryName("");
      setInquiryPhone("");
      setCalendarDate("");
    }, 1000);
  };

  // Ensure body scroll is locked and restored safely
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length]);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        data-lenis-prevent="true"
        onScroll={handleOverlayScroll}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch",
        }}
        className="fixed inset-0 z-50 bg-[var(--background)] overflow-y-scroll w-full h-full text-[var(--text-primary)] select-text"
      >
        {/* Top Sticky Header */}
        <div
          className={`sticky top-0 z-40 w-full px-6 sm:px-10 lg:px-12 py-4 flex items-center justify-between transition-all duration-300 border-b ${
            isScrolled
              ? "bg-[var(--background)]/95 border-[var(--border-hairline)] backdrop-blur-md shadow-xs"
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Back Action: Minimal text link with hover underline */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
            <span>Return to Listings</span>
          </button>

          {/* Scrolled Center Header with Serif/Small-Caps Pairing */}
          <div
            className={`hidden md:block max-w-md text-center transition-all duration-300 ${
              isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <h3 className="font-serif text-base text-[var(--text-primary)] line-clamp-1">
              {property.title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-earth)] font-semibold pt-0.5">
              {property.location}
            </p>
          </div>

          {/* Action Buttons: Minimal Square Outlines */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShareClick}
              className="w-9 h-9 border border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors flex items-center justify-center rounded-[2px] cursor-pointer"
              title="Share property link"
            >
              <Share2 size={14} strokeWidth={1.5} />
            </button>
            {onToggleFavorite && (
              <button
                onClick={(e) => onToggleFavorite(Number(property.id), e)}
                className="w-9 h-9 border border-[var(--border-hairline)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors flex items-center justify-center rounded-[2px] cursor-pointer"
                title={isFavorite ? "Remove from bookmarks" : "Save to bookmarks"}
              >
                <Heart
                  size={14}
                  strokeWidth={1.5}
                  className={isFavorite ? "fill-[var(--accent-earth)] text-[var(--accent-earth)]" : ""}
                />
              </button>
            )}
          </div>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <div className="fixed top-20 right-6 z-50 bg-[#181816] text-white text-xs px-4 py-2.5 rounded-[2px] shadow-lg border border-white/20 animate-fade-in">
            ✓ Property link copied to clipboard
          </div>
        )}

        {/* Main Loading or Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-8 h-8 border-2 border-[var(--accent-earth)]/30 border-t-[var(--accent-earth)] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
              Loading Residence Portfolio...
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 pb-32 space-y-12">
            
            {/* 1. HERO IMAGE: Confident, Full-Width, Tall Aspect Ratio, Overlay Chip */}
            <div className="relative w-full aspect-[16/9] max-h-[560px] min-h-[360px] sm:min-h-[440px] overflow-hidden rounded-[4px] border border-[var(--border-hairline)] bg-[var(--surface-subtle)] group">
              <Image
                src={images[0]}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover w-full h-full group-hover:scale-[1.01] transition-transform duration-700 cursor-pointer"
                onClick={() => {
                  setLightboxIdx(0);
                  setLightboxOpen(true);
                }}
                unoptimized
              />

              {/* Gallery Trigger Overlay Chip in Bottom-Right Corner */}
              <button
                onClick={() => {
                  setLightboxIdx(0);
                  setLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/65 hover:bg-black/85 text-white backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium border border-white/25 rounded-[2px] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Grid size={13} strokeWidth={1.5} />
                <span>View Gallery ({images.length})</span>
              </button>
            </div>

            {/* 2. MAIN CONTENT GRID: 8 Cols Details + 4 Cols Sticky Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* Left Main Column (8 cols) */}
              <div className="lg:col-span-8 space-y-10 text-left">
                
                {/* Title & Location Header */}
                <div className="space-y-3 border-b border-[var(--border-hairline)] pb-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[var(--accent-earth)]">
                      {property.type || "RESIDENCE"}
                    </span>
                    {property.seller?.verified && (
                      <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-[2px]">
                        <ShieldCheck size={12} />
                        <span>NIC Host Verified</span>
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] font-normal tracking-tight leading-[1.14]">
                    {property.title}
                  </h1>

                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-[0.16em] pt-1">
                    <MapPin size={13} strokeWidth={1.5} className="text-[var(--accent-earth)] shrink-0" />
                    <span>{property.location}</span>
                  </p>
                </div>

                {/* Stat Values with Thin Vertical Dividers */}
                <div className="grid grid-cols-3 divide-x divide-[var(--border-hairline)] border-y border-[var(--border-hairline)] py-6 text-left">
                  <div className="px-3 sm:px-6 first:pl-0 space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                      Bedrooms
                    </span>
                    <p className="font-sans text-xl sm:text-2xl text-[var(--text-primary)] font-medium">
                      {property.bedrooms > 0 ? `${property.bedrooms} Rooms` : "Studio"}
                    </p>
                  </div>

                  <div className="px-3 sm:px-6 space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                      Bathrooms
                    </span>
                    <p className="font-sans text-xl sm:text-2xl text-[var(--text-primary)] font-medium">
                      {property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms} Baths` : "1 Attached"}
                    </p>
                  </div>

                  <div className="px-3 sm:px-6 last:pr-0 space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                      Floor Area
                    </span>
                    <p className="font-sans text-xl sm:text-2xl text-[var(--text-primary)] font-medium">
                      {property.size ? (typeof property.size === "number" ? `${property.size} Sq.Ft` : property.size) : "Standard"}
                    </p>
                  </div>
                </div>

                {/* Residence Details / Overview */}
                <div className="space-y-3.5 border-b border-[var(--border-hairline)] pb-8">
                  <h3 className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--text-muted)]">
                    Residence Details
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light whitespace-pre-line">
                    {property.description || "Quiet, verified residential space with independent utilities, direct owner communication, and transparent tenancy terms."}
                  </p>
                </div>

                {/* Inclusions & Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--text-muted)]">
                      Inclusions & Amenities
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-3.5 border border-[var(--border-hairline)] bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)] rounded-[2px]"
                        >
                          <Check size={13} strokeWidth={2} className="text-[var(--accent-earth)] shrink-0" />
                          <span className="font-sans">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Sidebar Column (4 cols): Distinct Panel */}
              <div className="lg:col-span-4 sticky top-24 bg-[var(--surface-subtle)] border border-[var(--border-hairline)] p-6 sm:p-8 space-y-6 rounded-[2px]">
                
                {/* Monthly Rent Block */}
                <div className="border-b border-[var(--border-hairline)] pb-6 space-y-1 text-left">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                    Monthly Rent
                  </span>
                  <div className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight flex items-baseline gap-1.5 pt-1">
                    LKR {property.price ? property.price.toLocaleString() : "Contact"}
                    <span className="font-sans text-xs text-[var(--text-muted)] font-normal tracking-normal">
                      / mo
                    </span>
                  </div>
                  {property.advancePayment && property.advancePayment > 0 && (
                    <p className="text-[11px] text-[var(--text-muted)] font-serif italic pt-1.5">
                      Advance Deposit: LKR {property.advancePayment.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Property Host Card */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                    Property Host
                  </span>
                  
                  <div className="p-4 border border-[var(--border-hairline)] bg-[var(--surface)] space-y-2 rounded-[2px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                          {property.seller?.name || "Verified Landlord"}
                        </h4>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Host Verified via Sri Lanka NIC</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowContactDetails(!showContactDetails)}
                        className="text-[11px] uppercase tracking-wider font-semibold text-[var(--accent-earth)] hover:underline underline-offset-4 cursor-pointer shrink-0"
                      >
                        {showContactDetails ? "Hide" : "Reveal"}
                      </button>
                    </div>

                    {/* Revealed Host Phone & WhatsApp */}
                    {showContactDetails && (
                      <div className="pt-3 mt-2 border-t border-[var(--border-hairline)] space-y-2 text-xs text-[var(--text-secondary)] animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-[var(--accent-earth)]" />
                            <span>{property.seller?.phone || "+94 77 123 4567"}</span>
                          </div>
                          {property.seller?.whatsapp && (
                            <a
                              href={`https://wa.me/${property.seller.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello, I am interested in viewing "${property.title}" on BoardLanka.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 hover:underline"
                            >
                              <MessageCircle size={11} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        {property.seller?.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-[var(--accent-earth)]" />
                            <span className="truncate">{property.seller.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Viewing Request Form */}
                <form onSubmit={handleInquirySubmit} className="space-y-4 pt-2 border-t border-[var(--border-hairline)] text-left">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-semibold block">
                    Request a Viewing
                  </span>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Ruwan Wickramasinghe"
                      className="input-underline text-xs py-2 w-full bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold block">
                      Contact Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                      className="input-underline text-xs py-2 w-full bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold block">
                      Preferred Date (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={calendarDate}
                        onChange={(e) => setCalendarDate(e.target.value)}
                        className="input-underline text-xs py-2 w-full bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-editorial btn-editorial-primary w-full py-3.5 text-xs uppercase tracking-[0.16em] font-semibold rounded-[2px] cursor-pointer text-center"
                    >
                      Send Viewing Request
                    </button>
                  </div>

                  {inquirySent && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs text-center rounded-[2px] space-y-0.5 animate-fade-in">
                      <p className="font-semibold">✓ Viewing Request Dispatched</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        The property host has been notified with your contact details.
                      </p>
                    </div>
                  )}
                </form>

              </div>

            </div>

          </div>
        )}
      </motion.div>

      {/* Fullscreen Lightbox Gallery Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8">
          {/* Header */}
          <div className="w-full flex items-center justify-between text-white/80 pb-4">
            <span className="text-xs uppercase tracking-[0.2em] font-medium">
              Residence Gallery — {lightboxIdx + 1} of {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close gallery"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Large Image */}
          <div className="relative max-w-6xl max-h-[75vh] w-full h-[65vh] my-auto">
            <Image
              src={images[lightboxIdx]}
              alt={`${property.title} - View ${lightboxIdx + 1}`}
              fill
              className="object-contain"
              unoptimized
            />

            {/* Left / Right Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setLightboxIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-3 max-w-xl">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  className={`relative w-16 h-12 shrink-0 border-2 overflow-hidden rounded-[2px] transition-all cursor-pointer ${
                    lightboxIdx === idx ? "border-[var(--accent-earth)] opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
