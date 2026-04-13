"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Property {
  id: string | number;
  title: string;
  location: string;
  area?: string;
  price: number;
  advancePayment?: number;
  bedrooms: number;
  bathrooms?: number;
  size?: number;
  type: string;
  images: string[];
  amenities: string[];
  description: string;
  seller: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    verified: boolean;
  };
  available: boolean;
  createdAt?: string;
}

const bedroomOptions = [
  { value: 0, label: "All Bedrooms", icon: "🏠" },
  { value: 1, label: "1 Bedroom", icon: "🛏️" },
  { value: 2, label: "2 Bedrooms", icon: "🛏️🛏️" },
  { value: 3, label: "3+ Bedrooms", icon: "👨‍👩‍👧‍👦" },
];

const priceRanges = [
  { min: 50000, max: 100000, label: "Rs. 50K - 100K", icon: "💰" },
  { min: 100000, max: 200000, label: "Rs. 100K - 200K", icon: "💵" },
  { min: 200000, max: 350000, label: "Rs. 200K - 350K", icon: "💴" },
  { min: 350000, max: 500000, label: "Rs. 350K - 500K", icon: "💷" },
];

const locationOptions = [
  { value: "", label: "All Locations", icon: "🌍" },
  { value: "colombo", label: "Colombo", icon: "🏙️" },
  { value: "homagama", label: "Homagama", icon: "🎓" },
  { value: "biyagama", label: "Biyagama", icon: "🏭" },
  { value: "katunayaka", label: "Katunayaka", icon: "✈️" },
  { value: "galle", label: "Galle", icon: "🏖️" },
  { value: "jaffna", label: "Jaffna", icon: "🏝️" },
];

function AnnexesHousesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/properties?type=annex,house`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch properties: ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data && typeof data === "object") {
          // Handle case where API returns data in a wrapper object
          const propertiesList = data.properties || data.data || [];
          if (Array.isArray(propertiesList)) {
            setProperties(propertiesList);
          }
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(err instanceof Error ? err.message : "Failed to load properties. Please try again.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const bedroomsParam = searchParams.get("bedrooms");
    const locationParam = searchParams.get("location");
    
    if (bedroomsParam) {
      setSelectedBedrooms(parseInt(bedroomsParam));
    }
    if (locationParam) {
      setSelectedLocation(locationParam.toLowerCase());
    }
  }, [searchParams]);

  // Filter properties based on all criteria
  const filteredProperties = properties.filter(property => {
    // Filter by bedrooms
    const matchesBedrooms = selectedBedrooms === 0 || 
      (selectedBedrooms === 3 ? property.bedrooms >= 3 : property.bedrooms === selectedBedrooms);
    
    // Filter by location (use area field or extract from coordinates)
    const matchesLocation = selectedLocation === "" || 
      property.area?.toLowerCase() === selectedLocation.toLowerCase();
    
    // Filter by price range
    const matchesPrice = !selectedPriceRange || 
      (property.price >= selectedPriceRange.min && property.price <= selectedPriceRange.max);
    
    // Only show available properties
    const isAvailable = property.available !== false;
    
    return matchesBedrooms && matchesLocation && matchesPrice && isAvailable;
  });

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
    setShowContactModal(false);
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.images && selectedProperty.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Get current location name for display
  const currentLocationName = locationOptions.find(loc => loc.value === selectedLocation)?.label || "All Locations";

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="relative py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Find Your Perfect Annex or House
            {selectedLocation && (
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-2xl mt-2">
                in {currentLocationName}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-center text-lg">
            Browse through verified annexes and houses across Sri Lanka
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="font-medium">Error loading properties</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Select Location
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {locationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedLocation(option.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedLocation === option.value
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="text-2xl block mb-1">{option.icon}</span>
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Select Bedrooms
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bedroomOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedBedrooms(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedBedrooms === option.value
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="text-3xl block mb-2">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Select Price Range
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedPriceRange(null)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedPriceRange === null
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                  : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 text-gray-300"
              }`}
            >
              <span className="text-3xl block mb-2">ðŸ’°</span>
              <span className="font-medium">All Prices</span>
            </button>
            {priceRanges.map((range, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPriceRange(range)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 text-gray-300"
                }`}
              >
                <span className="text-3xl block mb-2">{range.icon}</span>
                <span className="font-medium text-sm">{range.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedBedrooms > 0 || selectedLocation || selectedPriceRange) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-gray-600">Active Filters:</span>
            {selectedLocation && (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                ðŸ“ {currentLocationName}
                <button
                  onClick={() => setSelectedLocation("")}
                  className="ml-1 hover:text-emerald-900"
                >
                  Ã—
                </button>
              </span>
            )}
            {selectedBedrooms > 0 && (
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                ðŸ›ï¸ {selectedBedrooms === 3 ? "3+ Bedrooms" : `${selectedBedrooms} Bedroom${selectedBedrooms > 1 ? 's' : ''}`}
                <button
                  onClick={() => setSelectedBedrooms(0)}
                  className="ml-1 hover:text-teal-900"
                >
                  Ã—
                </button>
              </span>
            )}
            {selectedPriceRange && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                💲 {priceRanges.find(r => r.min === selectedPriceRange.min && r.max === selectedPriceRange.max)?.label || 'Custom Range'}
                <button
                  onClick={() => setSelectedPriceRange(null)}
                  className="ml-1 hover:text-orange-900"
                >
                  Ã—
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedLocation("");
                setSelectedBedrooms(0);
                setSelectedPriceRange(null);
              }}
              className="text-red-500 hover:text-red-700 text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          Showing <span className="font-semibold text-emerald-400">{filteredProperties.length}</span> properties
          {selectedLocation && ` in ${currentLocationName}`}
          {selectedBedrooms > 0 && ` with ${selectedBedrooms === 3 ? "3+" : selectedBedrooms} bedroom${selectedBedrooms > 1 ? 's' : ''}`}
          {selectedPriceRange && ` from Rs. ${selectedPriceRange.min.toLocaleString()} to Rs. ${selectedPriceRange.max === Infinity ? "âˆž" : selectedPriceRange.max.toLocaleString()}`}
        </p>

        {/* Property Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties?.map((property) => (
            <div
              key={property.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => openPropertyDetails(property)}
            >
              {/* Property Image */}
              <div className="relative h-48">
                <Image
                  src={property.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45a003537e1c?w=800"}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {property.seller?.verified && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                  {property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}
                </div>
              </div>

              {/* Property Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>

                {/* Amenities Preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities?.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {property.amenities && property.amenities.length > 3 && (
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Rs. {property.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">ðŸ˜ï¸</span>
            <h3 className="text-xl font-semibold text-white mb-2">
              {properties.length === 0 ? "No properties available" : "No properties match your filters"}
            </h3>
            <p className="text-gray-400">
              {properties.length === 0 
                ? "Check back soon for new listings" 
                : "Try adjusting your search criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closePropertyDetails}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Gallery */}
            <div className="relative h-64 md:h-96">
              <Image
                src={selectedProperty.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1570129477492-45a003537e1c?w=800"}
                alt={selectedProperty.title}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Image Navigation */}
              {selectedProperty.images && selectedProperty.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {selectedProperty.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {selectedProperty.seller?.verified && (
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Seller
                  </div>
                )}
                <div className="bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                  {selectedProperty.bedrooms} Bed{selectedProperty.bedrooms > 1 ? 's' : ''} {selectedProperty.bathrooms && `â€¢ ${selectedProperty.bathrooms} Bath`}
                </div>
              </div>
            </div>

            {/* Property Details Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedProperty.title}
              </h2>
              <p className="text-gray-400 flex items-center gap-1 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedProperty.location}
              </p>

              {/* Property Stats */}
              {(selectedProperty.bedrooms || selectedProperty.bathrooms || selectedProperty.size) && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {selectedProperty.bedrooms && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.bedrooms}</p>
                      <p className="text-gray-400 text-xs">Bedroom{selectedProperty.bedrooms > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.bathrooms}</p>
                      <p className="text-gray-400 text-xs">Bathroom{selectedProperty.bathrooms > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  {selectedProperty.size && (
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
                      <p className="text-emerald-400 font-semibold text-lg">{selectedProperty.size}</p>
                      <p className="text-gray-400 text-xs">Sq. Ft.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Price & Advance Payment */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-emerald-400 font-medium mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    Rs. {selectedProperty.price.toLocaleString()}
                  </p>
                </div>
                {selectedProperty.advancePayment && (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                    <p className="text-sm text-orange-400 font-medium mb-1">Advance Payment</p>
                    <p className="text-3xl font-bold text-orange-400">
                      Rs. {selectedProperty.advancePayment.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-400/70 mt-1">
                      ({(selectedProperty.advancePayment / selectedProperty.price).toFixed(1)} months advance)
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400">{selectedProperty.description || "No description available"}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities?.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-gray-700"
                    >
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seller Contact Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Seller
                </h3>

                {!showContactModal ? (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Seller Contact Details
                  </button>
                ) : (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">ðŸ‘¤</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {selectedProperty.seller?.name || "Contact Owner"}
                          {selectedProperty.seller?.verified && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-400 text-sm">Property Owner</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Phone */}
                      {selectedProperty.seller?.phone && (
                      <a
                        href={`tel:${selectedProperty.seller.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg hover:bg-emerald-500/10 transition-colors border border-gray-700/50"
                      >
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-white">{selectedProperty.seller.phone}</p>
                        </div>
                      </a>
                      )}

                      {/* WhatsApp */}
                      {selectedProperty.seller?.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedProperty.seller.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg hover:bg-green-500/10 transition-colors border border-gray-700/50"
                      >
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <p className="font-medium text-white">Chat on WhatsApp</p>
                        </div>
                      </a>
                      )}

                      {/* Email */}
                      {selectedProperty.seller?.email && (
                      <a
                        href={`mailto:${selectedProperty.seller.email}`}
                        className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg hover:bg-blue-500/10 transition-colors border border-gray-700/50"
                      >
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-white">{selectedProperty.seller.email}</p>
                        </div>
                      </a>
                      )}
                    </div>

                    {/* Safety Warning */}
                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          <strong>Safety Tip:</strong> Always visit the property in person before making any payment. Never transfer money without seeing the property first.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={closePropertyDetails}
                className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function AnnexesHousesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <div className="relative py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="h-10 bg-gray-700/50 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-700/50 rounded-lg w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 mb-6 animate-pulse">
          <div className="h-6 bg-gray-700/50 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnexesHousesPage() {
  return (
    <Suspense fallback={<AnnexesHousesLoading />}>
      <AnnexesHousesContent />
    </Suspense>
  );
}