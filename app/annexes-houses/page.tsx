"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Property {
  id: number;
  title: string;
  location: string;
  area: string;
  type: string;
  price: number;
  advancePayment: number;
  bedrooms: number;
  bathrooms: number;
  size: string;
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
}

// Property data
const propertiesData: Property[] = [
  // Annexes
  {
    id: 1,
    title: "Modern Annex in Colombo 5",
    location: "Colombo 5, Havelock Town",
    area: "colombo",
    type: "annex",
    price: 45000,
    advancePayment: 90000,
    bedrooms: 2,
    bathrooms: 1,
    size: "800 sq ft",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchen", "Parking", "Garden Access"],
    description: "A beautiful modern annex with separate entrance, perfect for small families or couples. Newly renovated with all modern amenities.",
    seller: {
      name: "Mr. Sanjaya Perera",
      phone: "+94 77 111 2233",
      whatsapp: "+94771112233",
      email: "sanjaya@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 2,
    title: "Spacious Annex Near SLIIT",
    location: "Homagama, Malabe",
    area: "homagama",
    type: "annex",
    price: 25000,
    advancePayment: 50000,
    bedrooms: 1,
    bathrooms: 1,
    size: "500 sq ft",
    images: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    ],
    amenities: ["WiFi", "Fan", "Hot Water", "Kitchen", "Parking"],
    description: "Ideal for students or young professionals. Close to SLIIT and public transport.",
    seller: {
      name: "Mrs. Dilani Fernando",
      phone: "+94 71 222 3344",
      whatsapp: "+94712223344",
      email: "dilani@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 3,
    title: "Cozy Annex in Galle Fort Area",
    location: "Galle, Fort",
    area: "galle",
    type: "annex",
    price: 35000,
    advancePayment: 70000,
    bedrooms: 1,
    bathrooms: 1,
    size: "600 sq ft",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchen", "Heritage View"],
    description: "Charming annex with colonial architecture near Galle Fort. Perfect for history lovers.",
    seller: {
      name: "Mr. Roshan Silva",
      phone: "+94 76 333 4455",
      whatsapp: "+94763334455",
      email: "roshan@example.com",
      verified: true,
    },
    available: true,
  },
  // Full Houses
  {
    id: 4,
    title: "Luxury House in Rajagiriya",
    location: "Rajagiriya, Parliament Road",
    area: "colombo",
    type: "house",
    price: 150000,
    advancePayment: 450000,
    bedrooms: 4,
    bathrooms: 3,
    size: "2500 sq ft",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Modern Kitchen", "Parking", "Garden", "Security", "CCTV"],
    description: "Stunning luxury house with modern architecture. Features a swimming pool, large garden, and 24/7 security.",
    seller: {
      name: "Mr. Chaminda Jayawardena",
      phone: "+94 77 444 5566",
      whatsapp: "+94774445566",
      email: "chaminda@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 5,
    title: "Family House in Nugegoda",
    location: "Nugegoda, Pagoda Road",
    area: "colombo",
    type: "house",
    price: 85000,
    advancePayment: 255000,
    bedrooms: 3,
    bathrooms: 2,
    size: "1800 sq ft",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchen", "Parking", "Garden"],
    description: "Perfect family home in a quiet residential area. Close to schools and supermarkets.",
    seller: {
      name: "Mrs. Kumari Dissanayake",
      phone: "+94 71 555 6677",
      whatsapp: "+94715556677",
      email: "kumari@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 6,
    title: "Beach House in Negombo",
    location: "Negombo, Beach Road",
    area: "katunayaka",
    type: "house",
    price: 120000,
    advancePayment: 360000,
    bedrooms: 3,
    bathrooms: 2,
    size: "2000 sq ft",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchen", "Parking", "Beach Access", "Sea View"],
    description: "Beautiful beach house with stunning ocean views. Perfect for those who love the sea.",
    seller: {
      name: "Mr. Anton Perera",
      phone: "+94 76 666 7788",
      whatsapp: "+94766667788",
      email: "anton@example.com",
      verified: false,
    },
    available: true,
  },
  // Apartments
  {
    id: 7,
    title: "Luxury Apartment in Colombo 3",
    location: "Colombo 3, Kollupitiya",
    area: "colombo",
    type: "apartment",
    price: 200000,
    advancePayment: 600000,
    bedrooms: 3,
    bathrooms: 2,
    size: "1500 sq ft",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Modern Kitchen", "Gym", "Pool", "Security", "Parking"],
    description: "Premium apartment in a high-rise building with panoramic city views. Fully furnished with luxury amenities.",
    seller: {
      name: "Prime Properties Ltd",
      phone: "+94 11 234 5678",
      whatsapp: "+94112345678",
      email: "info@primeproperties.lk",
      verified: true,
    },
    available: true,
  },
  {
    id: 8,
    title: "Modern Apartment in Battaramulla",
    location: "Battaramulla, Town Center",
    area: "colombo",
    type: "apartment",
    price: 75000,
    advancePayment: 225000,
    bedrooms: 2,
    bathrooms: 1,
    size: "950 sq ft",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchen", "Parking", "Security"],
    description: "Well-maintained apartment in a prime location. Easy access to highways and government offices.",
    seller: {
      name: "Mr. Kasun Bandara",
      phone: "+94 77 777 8899",
      whatsapp: "+94777778899",
      email: "kasun@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 9,
    title: "Studio Apartment in Dehiwala",
    location: "Dehiwala, Station Road",
    area: "colombo",
    type: "apartment",
    price: 40000,
    advancePayment: 80000,
    bedrooms: 1,
    bathrooms: 1,
    size: "450 sq ft",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
    amenities: ["WiFi", "AC", "Hot Water", "Kitchenette", "Security"],
    description: "Compact studio apartment perfect for singles or couples. Close to train station.",
    seller: {
      name: "Mrs. Nirmala Jayasuriya",
      phone: "+94 71 888 9900",
      whatsapp: "+94718889900",
      email: "nirmala@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 10,
    title: "Annex in Jaffna City",
    location: "Jaffna, Hospital Road",
    area: "jaffna",
    type: "annex",
    price: 20000,
    advancePayment: 40000,
    bedrooms: 2,
    bathrooms: 1,
    size: "700 sq ft",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
    ],
    amenities: ["WiFi", "Fan", "Hot Water", "Kitchen", "Parking"],
    description: "Spacious annex in the heart of Jaffna. Close to hospital and town center.",
    seller: {
      name: "Mr. Theva Kumar",
      phone: "+94 77 999 0011",
      whatsapp: "+94779990011",
      email: "theva@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 11,
    title: "Industrial Area Annex",
    location: "Biyagama, BOI Zone",
    area: "biyagama",
    type: "annex",
    price: 18000,
    advancePayment: 36000,
    bedrooms: 1,
    bathrooms: 1,
    size: "400 sq ft",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    ],
    amenities: ["Fan", "Hot Water", "Kitchen", "Parking"],
    description: "Simple and affordable annex for factory workers. Walking distance to industrial zone.",
    seller: {
      name: "Mr. Pradeep Rathnayake",
      phone: "+94 76 000 1122",
      whatsapp: "+94760001122",
      email: "pradeep@example.com",
      verified: false,
    },
    available: true,
  },
  {
    id: 12,
    title: "Traditional House in Jaffna",
    location: "Jaffna, Nallur",
    area: "jaffna",
    type: "house",
    price: 55000,
    advancePayment: 165000,
    bedrooms: 3,
    bathrooms: 2,
    size: "1600 sq ft",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    amenities: ["Fan", "Hot Water", "Traditional Kitchen", "Large Garden", "Well"],
    description: "Beautiful traditional Jaffna house with large garden and mango trees.",
    seller: {
      name: "Mrs. Saro Devi",
      phone: "+94 71 111 2233",
      whatsapp: "+94711112233",
      email: "saro@example.com",
      verified: true,
    },
    available: true,
  },
];

const typeOptions = [
  { value: "", label: "All Properties", icon: "🏘️" },
  { value: "annex", label: "Annexes", icon: "🏡" },
  { value: "house", label: "Full Houses", icon: "🏠" },
  { value: "apartment", label: "Apartments", icon: "🏢" },
];

const locationOptions = [
  { value: "", label: "All Locations", icon: "🌍" },
  { value: "colombo", label: "Colombo", icon: "🏙️" },
  { value: "homagama", label: "Homagama", icon: "🎓" },
  { value: "biyagama", label: "Biyagama", icon: "🏭" },
  { value: "katunayaka", label: "Katunayaka", icon: "✈️" },
  { value: "galle", label: "Galle", icon: "🏖️" },
  { value: "jaffna", label: "Jaffna", icon: "🛕" },
];

const bedroomOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1 Bed" },
  { value: 2, label: "2 Beds" },
  { value: 3, label: "3 Beds" },
  { value: 4, label: "4+ Beds" },
];

function AnnexesHousesContent() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const locationParam = searchParams.get("location");
    
    if (typeParam) {
      setSelectedType(typeParam.toLowerCase());
    }
    if (locationParam) {
      setSelectedLocation(locationParam.toLowerCase());
    }
  }, [searchParams]);

  // Filter properties
  const filteredProperties = propertiesData.filter((property: Property) => {
    const matchesType = selectedType === "" || property.type === selectedType;
    const matchesLocation = selectedLocation === "" || property.area === selectedLocation;
    const matchesBedrooms = selectedBedrooms === 0 || 
      (selectedBedrooms === 4 ? property.bedrooms >= 4 : property.bedrooms === selectedBedrooms);
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    return matchesType && matchesLocation && matchesBedrooms && matchesPrice;
  });

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setShowContactModal(false);
  };

  const closePropertyDetails = () => {
    setSelectedProperty(null);
    setShowContactModal(false);
  };

  const nextImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const getTypeLabel = (type: string) => {
    return typeOptions.find(opt => opt.value === type)?.label || "Property";
  };

  const getLocationLabel = (location: string) => {
    return locationOptions.find(opt => opt.value === location)?.label || "All Locations";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="relative py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Annexes & Houses
            {selectedType && (
              <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent text-2xl mt-2">
                {getTypeLabel(selectedType)}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-center text-lg">
            Find your perfect annex, house, or apartment across Sri Lanka
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Type Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            Property Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl block mb-2">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location & Bedrooms Filter */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Location Filter */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedLocation(option.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                    selectedLocation === option.value
                      ? "border-teal-500 bg-teal-500/20 text-teal-400"
                      : "border-gray-700 hover:border-teal-500/50 text-gray-300"
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Bedrooms
            </h2>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedBedrooms(option.value)}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    selectedBedrooms === option.value
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-gray-600 hover:border-teal-400 text-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-300 mb-3">Price Range (Rs.)</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ""}
                  onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ""}
                  onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 500000})}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedType || selectedLocation || selectedBedrooms > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-gray-600">Active Filters:</span>
            {selectedType && (
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                🏘️ {getTypeLabel(selectedType)}
                <button onClick={() => setSelectedType("")} className="ml-1 hover:text-teal-900">×</button>
              </span>
            )}
            {selectedLocation && (
              <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                📍 {getLocationLabel(selectedLocation)}
                <button onClick={() => setSelectedLocation("")} className="ml-1 hover:text-cyan-900">×</button>
              </span>
            )}
            {selectedBedrooms > 0 && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                🛏️ {selectedBedrooms === 4 ? "4+" : selectedBedrooms} Bedroom{selectedBedrooms > 1 ? "s" : ""}
                <button onClick={() => setSelectedBedrooms(0)} className="ml-1 hover:text-blue-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedType("");
                setSelectedLocation("");
                setSelectedBedrooms(0);
                setPriceRange({ min: 0, max: 500000 });
              }}
              className="text-red-500 hover:text-red-700 text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          Showing <span className="font-semibold text-teal-400">{filteredProperties.length}</span> properties
          {selectedType && ` in ${getTypeLabel(selectedType)}`}
          {selectedLocation && ` in ${getLocationLabel(selectedLocation)}`}
        </p>

        {/* Property Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => openPropertyDetails(property)}
            >
              {/* Property Image */}
              <div className="relative h-52">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {property.type === "annex" && "🏡 Annex"}
                  {property.type === "house" && "🏠 House"}
                  {property.type === "apartment" && "🏢 Apartment"}
                </div>
                {property.seller.verified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>

                {/* Property Features */}
                <div className="flex gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {property.bedrooms} Beds
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    {property.bathrooms} Baths
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {property.size}
                  </span>
                </div>

                {/* Amenities Preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-teal-600">
                      Rs. {property.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-600 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏘️</span>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closePropertyDetails}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors z-10 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Gallery */}
            <div className="relative h-64 md:h-80">
              <Image
                src={selectedProperty.images[currentImageIndex]}
                alt={selectedProperty.title}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Image Navigation */}
              {selectedProperty.images.length > 1 && (
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
                <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedProperty.type === "annex" && "🏡 Annex"}
                  {selectedProperty.type === "house" && "🏠 Full House"}
                  {selectedProperty.type === "apartment" && "🏢 Apartment"}
                </div>
                {selectedProperty.seller.verified && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Property Details Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedProperty.title}
              </h2>
              <p className="text-gray-500 flex items-center gap-1 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedProperty.location}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-1">🛏️</span>
                  <p className="font-bold text-gray-800">{selectedProperty.bedrooms}</p>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-1">🚿</span>
                  <p className="font-bold text-gray-800">{selectedProperty.bathrooms}</p>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-1">📐</span>
                  <p className="font-bold text-gray-800">{selectedProperty.size}</p>
                  <p className="text-sm text-gray-500">Size</p>
                </div>
              </div>

              {/* Price & Advance Payment */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-sm text-teal-600 font-medium mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-teal-700">
                    Rs. {selectedProperty.price.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-sm text-orange-600 font-medium mb-1">Advance Payment</p>
                  <p className="text-3xl font-bold text-orange-700">
                    Rs. {selectedProperty.advancePayment.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">
                    ({selectedProperty.advancePayment / selectedProperty.price} months advance)
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seller Contact Section */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Owner
                </h3>

                {!showContactModal ? (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Owner Contact Details
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          {selectedProperty.seller.name}
                          {selectedProperty.seller.verified && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-500 text-sm">Property Owner</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Phone */}
                      <a
                        href={`tel:${selectedProperty.seller.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">{selectedProperty.seller.phone}</p>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${selectedProperty.seller.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white p-3 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <p className="font-medium text-gray-800">Chat on WhatsApp</p>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href={`mailto:${selectedProperty.seller.email}`}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{selectedProperty.seller.email}</p>
                        </div>
                      </a>
                    </div>

                    {/* Safety Warning */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          <strong>Safety Tip:</strong> Always visit the property in person before making any payment. Never transfer money without proper documentation.
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

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-white/20 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded-lg w-96 mx-auto animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnexesHousesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AnnexesHousesContent />
    </Suspense>
  );
}