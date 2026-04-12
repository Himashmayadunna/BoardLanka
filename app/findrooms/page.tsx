"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Room {
  id: number;
  title: string;
  location: string;
  area: string; // Added area field for filtering
  price: number;
  advancePayment: number;
  capacity: number;
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

// Sample room data - In production, this would come from an API/database
const roomsData: Room[] = [
  // Colombo Rooms
  {
    id: 1,
    title: "Cozy Single Room in Colombo 7",
    location: "Colombo 7, Near Cinnamon Gardens",
    area: "colombo",
    price: 15000,
    advancePayment: 30000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom", "Hot Water"],
    description: "A comfortable single room perfect for working professionals. Close to public transport and shopping areas.",
    seller: {
      name: "Mr. Kamal Perera",
      phone: "+94 77 123 4567",
      whatsapp: "+94771234567",
      email: "kamal@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 2,
    title: "Luxury Room in Colombo 3",
    location: "Colombo 3, Kollupitiya",
    area: "colombo",
    price: 25000,
    advancePayment: 50000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom", "Hot Water", "Sea View", "Gym Access"],
    description: "Premium room with ocean views in the heart of Colombo.",
    seller: {
      name: "Mr. Ashan De Silva",
      phone: "+94 77 111 2222",
      whatsapp: "+94771112222",
      email: "ashan@example.com",
      verified: true,
    },
    available: true,
  },
  // Homagama Rooms
  {
    id: 3,
    title: "Budget Friendly Room in Homagama",
    location: "Homagama, Near SLIIT",
    area: "homagama",
    price: 8000,
    advancePayment: 16000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
    ],
    amenities: ["WiFi", "Fan", "Shared Bathroom"],
    description: "Ideal for university students. Walking distance to SLIIT and bus routes.",
    seller: {
      name: "Mrs. Nimali Silva",
      phone: "+94 71 234 5678",
      whatsapp: "+94712345678",
      email: "nimali@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 4,
    title: "Student Room Near NSBM",
    location: "Homagama, Pitipana",
    area: "homagama",
    price: 7500,
    advancePayment: 15000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    ],
    amenities: ["WiFi", "Fan", "Shared Bathroom", "Study Table"],
    description: "Perfect for NSBM students. Quiet environment for studying.",
    seller: {
      name: "Mr. Chaminda Rathnayake",
      phone: "+94 71 333 4444",
      whatsapp: "+94713334444",
      email: "chaminda@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 5,
    title: "Sharing Room for 2 in Homagama",
    location: "Homagama, Town Area",
    area: "homagama",
    price: 12000,
    advancePayment: 24000,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom", "Kitchen Access"],
    description: "Spacious room for 2 people with modern facilities.",
    seller: {
      name: "Mrs. Lakshmi Fernando",
      phone: "+94 76 555 6666",
      whatsapp: "+94765556666",
      email: "lakshmi@example.com",
      verified: true,
    },
    available: true,
  },
  // Biyagama Rooms
  {
    id: 6,
    title: "Factory Worker Room in Biyagama",
    location: "Biyagama, Near BOI Zone",
    area: "biyagama",
    price: 6000,
    advancePayment: 12000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    amenities: ["Fan", "Shared Bathroom", "Common Kitchen"],
    description: "Affordable room for factory workers. Close to the industrial zone.",
    seller: {
      name: "Mr. Jayantha Kumara",
      phone: "+94 77 777 8888",
      whatsapp: "+94777778888",
      email: "jayantha@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 7,
    title: "Clean Room Near Biyagama Junction",
    location: "Biyagama, Main Road",
    area: "biyagama",
    price: 9000,
    advancePayment: 18000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    ],
    amenities: ["WiFi", "Fan", "Attached Bathroom"],
    description: "Well-maintained room with easy access to public transport.",
    seller: {
      name: "Mrs. Malini Jayasinghe",
      phone: "+94 70 999 0000",
      whatsapp: "+94709990000",
      email: "malini@example.com",
      verified: false,
    },
    available: true,
  },
  // Katunayaka Rooms
  {
    id: 8,
    title: "Room Near Airport Zone",
    location: "Katunayaka, Near Airport",
    area: "katunayaka",
    price: 10000,
    advancePayment: 20000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom"],
    description: "Convenient for airport and free zone workers.",
    seller: {
      name: "Mr. Prasanna Wickrama",
      phone: "+94 77 123 9999",
      whatsapp: "+94771239999",
      email: "prasanna@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 9,
    title: "Group Room in Katunayaka",
    location: "Katunayaka, Seeduwa",
    area: "katunayaka",
    price: 24000,
    advancePayment: 48000,
    capacity: 4,
    images: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    amenities: ["WiFi", "AC", "2 Bathrooms", "Kitchen", "Parking"],
    description: "Large room suitable for group of workers or friends.",
    seller: {
      name: "Mr. Ranjan Perera",
      phone: "+94 71 888 7777",
      whatsapp: "+94718887777",
      email: "ranjan@example.com",
      verified: true,
    },
    available: true,
  },
  // Galle Rooms
  {
    id: 10,
    title: "Beach Side Room in Galle",
    location: "Galle, Unawatuna",
    area: "galle",
    price: 15000,
    advancePayment: 30000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    ],
    amenities: ["WiFi", "Fan", "Attached Bathroom", "Beach Access"],
    description: "Beautiful room with beach vibes in Unawatuna.",
    seller: {
      name: "Mr. Sisira Kumara",
      phone: "+94 77 444 5555",
      whatsapp: "+94774445555",
      email: "sisira@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 11,
    title: "Room Near Galle Fort",
    location: "Galle, Fort Area",
    area: "galle",
    price: 18000,
    advancePayment: 36000,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom", "Heritage View"],
    description: "Historic charm with modern comfort near Galle Fort.",
    seller: {
      name: "Mrs. Chandrika Dias",
      phone: "+94 76 222 3333",
      whatsapp: "+94762223333",
      email: "chandrika@example.com",
      verified: true,
    },
    available: true,
  },
  // Jaffna Rooms
  {
    id: 12,
    title: "Room in Jaffna Town",
    location: "Jaffna, Hospital Road",
    area: "jaffna",
    price: 8000,
    advancePayment: 16000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
    ],
    amenities: ["WiFi", "Fan", "Attached Bathroom"],
    description: "Central location in Jaffna, close to all amenities.",
    seller: {
      name: "Mr. Thiru Selvan",
      phone: "+94 77 666 7777",
      whatsapp: "+94776667777",
      email: "thiru@example.com",
      verified: true,
    },
    available: true,
  },
  {
    id: 13,
    title: "Student Room Near Jaffna University",
    location: "Jaffna, Thirunelvely",
    area: "jaffna",
    price: 7000,
    advancePayment: 14000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    ],
    amenities: ["WiFi", "Fan", "Shared Bathroom", "Study Area"],
    description: "Perfect for university students. Quiet study environment.",
    seller: {
      name: "Mrs. Vani Krishnan",
      phone: "+94 71 555 4444",
      whatsapp: "+94715554444",
      email: "vani@example.com",
      verified: true,
    },
    available: true,
  },
  // Other areas
  {
    id: 14,
    title: "Modern Room with Balcony",
    location: "Dehiwala, Near Beach",
    area: "colombo",
    price: 12000,
    advancePayment: 24000,
    capacity: 1,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    amenities: ["WiFi", "AC", "Balcony", "Attached Bathroom", "Kitchen Access"],
    description: "Beautiful room with sea breeze. Perfect for those who love the beach.",
    seller: {
      name: "Mr. Ruwan Fernando",
      phone: "+94 76 345 6789",
      whatsapp: "+94763456789",
      email: "ruwan@example.com",
      verified: false,
    },
    available: true,
  },
  {
    id: 15,
    title: "Spacious Double Room in Nugegoda",
    location: "Nugegoda, Near Supermarket",
    area: "colombo",
    price: 18000,
    advancePayment: 36000,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
    ],
    amenities: ["WiFi", "AC", "Attached Bathroom", "Hot Water", "Parking"],
    description: "Large room suitable for couples or 2 friends. Very quiet neighborhood.",
    seller: {
      name: "Mr. Sunil Jayawardena",
      phone: "+94 77 456 7890",
      whatsapp: "+94774567890",
      email: "sunil@example.com",
      verified: true,
    },
    available: true,
  },
];

const capacityOptions = [
  { value: 0, label: "All Rooms", icon: "🏠" },
  { value: 1, label: "1 Person", icon: "👤" },
  { value: 2, label: "2 Persons", icon: "👥" },
  { value: 4, label: "4 Persons", icon: "👨‍👩‍👧‍👦" },
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

function FindRoomsContent() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>(roomsData);
  const [selectedCapacity, setSelectedCapacity] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/properties");
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const capacityParam = searchParams.get("capacity");
    const locationParam = searchParams.get("location");
    
    if (capacityParam) {
      setSelectedCapacity(parseInt(capacityParam));
    }
    if (locationParam) {
      setSelectedLocation(locationParam.toLowerCase());
    }
  }, [searchParams]);

  // Filter rooms based on capacity and location
  const filteredRooms = rooms.filter(room => {
    const matchesCapacity = selectedCapacity === 0 || room.capacity === selectedCapacity;
    const matchesLocation = selectedLocation === "" || room.area === selectedLocation;
    return matchesCapacity && matchesLocation;
  });

  const openRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
    setShowContactModal(false);
  };

  const nextImage = () => {
    if (selectedRoom) {
      setCurrentImageIndex((prev) => 
        prev === selectedRoom.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedRoom.images.length - 1 : prev - 1
      );
    }
  };

  // Get current location name for display
  const currentLocationName = locationOptions.find(loc => loc.value === selectedLocation)?.label || "All Locations";

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
            Find Your Perfect Room
            {selectedLocation && (
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-2xl mt-2">
                in {currentLocationName}
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-center text-lg">
            Browse through verified rooms across Sri Lanka
          </p>
        </div>
      </div>

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

        {/* Capacity Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Select Room Capacity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {capacityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedCapacity(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedCapacity === option.value
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

        {/* Active Filters Display */}
        {(selectedCapacity > 0 || selectedLocation) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-gray-600">Active Filters:</span>
            {selectedLocation && (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                📍 {currentLocationName}
                <button
                  onClick={() => setSelectedLocation("")}
                  className="ml-1 hover:text-emerald-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCapacity > 0 && (
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                👥 {selectedCapacity} Person{selectedCapacity > 1 ? 's' : ''}
                <button
                  onClick={() => setSelectedCapacity(0)}
                  className="ml-1 hover:text-teal-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedLocation("");
                setSelectedCapacity(0);
              }}
              className="text-red-500 hover:text-red-700 text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          Showing <span className="font-semibold text-emerald-400">{filteredRooms.length}</span> rooms
          {selectedLocation && ` in ${currentLocationName}`}
          {selectedCapacity > 0 && ` for ${selectedCapacity} person${selectedCapacity > 1 ? 's' : ''}`}
        </p>

        {/* Room Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => openRoomDetails(room)}
            >
              {/* Room Image */}
              <div className="relative h-48">
                <Image
                  src={room.images[0]}
                  alt={room.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {room.seller.verified && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                  {room.capacity} Person{room.capacity > 1 ? 's' : ''}
                </div>
              </div>

              {/* Room Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                  {room.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {room.location}
                </p>

                {/* Amenities Preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                      +{room.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Rs. {room.price.toLocaleString()}
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
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏠</span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No rooms found
            </h3>
            <p className="text-gray-400">
              Try selecting a different capacity option
            </p>
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeRoomDetails}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Gallery */}
            <div className="relative h-64 md:h-96">
              <Image
                src={selectedRoom.images[currentImageIndex]}
                alt={selectedRoom.title}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Image Navigation */}
              {selectedRoom.images.length > 1 && (
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
                {selectedRoom.images.map((_, index) => (
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
                {selectedRoom.seller.verified && (
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Seller
                  </div>
                )}
                <div className="bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                  {selectedRoom.capacity} Person{selectedRoom.capacity > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Room Details Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedRoom.title}
              </h2>
              <p className="text-gray-400 flex items-center gap-1 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedRoom.location}
              </p>

              {/* Price & Advance Payment */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-emerald-400 font-medium mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    Rs. {selectedRoom.price.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-sm text-orange-400 font-medium mb-1">Advance Payment</p>
                  <p className="text-3xl font-bold text-orange-400">
                    Rs. {selectedRoom.advancePayment.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-400/70 mt-1">
                    ({selectedRoom.advancePayment / selectedRoom.price} months advance)
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400">{selectedRoom.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.amenities.map((amenity) => (
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
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {selectedRoom.seller.name}
                          {selectedRoom.seller.verified && (
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
                      <a
                        href={`tel:${selectedRoom.seller.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg hover:bg-emerald-500/10 transition-colors border border-gray-700/50"
                      >
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-white">{selectedRoom.seller.phone}</p>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${selectedRoom.seller.whatsapp}`}
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

                      {/* Email */}
                      <a
                        href={`mailto:${selectedRoom.seller.email}`}
                        className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg hover:bg-blue-500/10 transition-colors border border-gray-700/50"
                      >
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-white">{selectedRoom.seller.email}</p>
                        </div>
                      </a>
                    </div>

                    {/* Safety Warning */}
                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          <strong>Safety Tip:</strong> Always visit the property in person before making any payment. Never transfer money without seeing the room first.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={closeRoomDetails}
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
function FindRoomsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-white/20 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded-lg w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindRoomsPage() {
  return (
    <Suspense fallback={<FindRoomsLoading />}>
      <FindRoomsContent />
    </Suspense>
  );
}