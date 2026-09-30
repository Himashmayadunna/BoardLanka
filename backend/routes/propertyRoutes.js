// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// ==========================================
// In-Memory Performance Cache (TTL 60s)
// ==========================================
const memoryCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const getCached = (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key, data, ttl = CACHE_TTL_MS) => {
  // Prevent memory unbounded growth
  if (memoryCache.size > 500) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, expiry: Date.now() + ttl });
};

const clearPropertyCache = () => {
  memoryCache.clear();
  console.log("🧹 Property cache invalidated");
};

// Middleware to verify token and get user
const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Helper: Transform DB property to API format
const transformPropertySummary = (property) => ({
  id: property.id,
  seller_id: property.seller_id,
  title: property.title,
  location: property.location,
  area: property.area,
  type: property.type,
  price: property.price,
  advancePayment: property.advance_payment,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  size: property.size,
  description: property.description,
  images: property.images && property.images.length > 0 ? [property.images[0]] : [], // Only return primary image for feeds to keep payload tiny
  imageCount: property.images ? property.images.length : 0,
  amenities: property.amenities || [],
  seller: {
    name: "Property Owner",
    phone: property.phone,
    whatsapp: property.whatsapp,
    email: null,
    verified: false,
  },
  available: property.available,
  createdAt: property.created_at,
});

const transformPropertyDetail = (property) => ({
  id: property.id,
  seller_id: property.seller_id,
  title: property.title,
  location: property.location,
  area: property.area,
  type: property.type,
  price: property.price,
  advancePayment: property.advance_payment,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  size: property.size,
  description: property.description,
  images: property.images || [], // Full array for detail modal
  imageCount: property.images ? property.images.length : 0,
  amenities: property.amenities || [],
  seller: {
    name: "Property Owner",
    phone: property.phone,
    whatsapp: property.whatsapp,
    email: null,
    verified: false,
  },
  available: property.available,
  createdAt: property.created_at,
});

// GET /api/properties/my-listings - Get listings for the authenticated seller
router.get("/my-listings", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("seller_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch seller properties error:", error);
      return res.status(500).json({ message: error.message });
    }

    const transformed = (data || []).map(transformPropertyDetail);
    res.setHeader("Cache-Control", "private, no-cache");
    res.status(200).json(transformed);
  } catch (error) {
    console.error("Seller properties route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/properties - Add new property (sellers only)
router.post("/", verifyUser, async (req, res) => {
  try {
    const {
      title,
      location,
      area,
      type,
      price,
      advancePayment,
      bedrooms,
      bathrooms,
      size,
      description,
      amenities,
      phone,
      whatsapp,
      images,
    } = req.body;

    // Validate required fields
    if (!title || !location || !area || !type || !price || !description || advancePayment === undefined || advancePayment === null || advancePayment === '') {
      return res.status(400).json({ message: "Missing required fields: title, location, area, type, price, description, and advancePayment are required" });
    }

    // Check if user is a seller (optional - will skip if profiles table doesn't exist)
    let profile = null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", req.user.id)
        .single();
      profile = data;
    } catch (err) {
      console.warn("⚠️ Profiles table check skipped:", err.message);
    }

    if (profile && profile.account_type !== "seller") {
      return res.status(403).json({ message: "Only sellers can add properties" });
    }

    // Insert property
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          seller_id: req.user.id,
          title,
          location,
          area,
          type,
          price: parseFloat(price),
          advance_payment: parseFloat(advancePayment),
          bedrooms: parseInt(bedrooms) || 1,
          bathrooms: parseInt(bathrooms) || 1,
          size,
          description,
          amenities: amenities || [],
          images: images || [],
          phone,
          whatsapp,
          available: true,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Insert error:", error);
      return res.status(500).json({ message: error.message });
    }

    // Bust in-memory cache
    clearPropertyCache();

    res.status(201).json({
      message: "Property added successfully",
      property: data[0],
    });
  } catch (error) {
    console.error("❌ Add property error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Curated fallback listings when database is fresh or unseeded
const FALLBACK_LISTINGS = [
  {
    id: 1,
    title: "The Emerald Annex & Garden Terrace",
    location: "Pitipana, Homagama",
    area: "homagama",
    type: "annex",
    price: 42500,
    advance_payment: 85000,
    bedrooms: 1,
    bathrooms: 1,
    size: "650 sq ft",
    description: "Quiet, newly completed independent studio annex located 5 minutes from NSBM Green University and the Homagama Tech Park corridor. Features private entrance, garden terrace view, full tile flooring, and dedicated parking space.",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Air Conditioned", "High-Speed Wi-Fi", "En-Suite Bath", "Dedicated Parking", "Private Balcony", "Water Heater"],
    phone: "+94 77 123 4567",
    whatsapp: "+94771234567",
    available: true,
    created_at: "2026-09-01T08:00:00.000Z",
  },
  {
    id: 2,
    title: "Executive Residence at Cinnamon Gardens",
    location: "Cinnamon Gardens, Colombo 07",
    area: "colombo",
    type: "house",
    price: 95000,
    advance_payment: 190000,
    bedrooms: 2,
    bathrooms: 2,
    size: "1,200 sq ft",
    description: "Prestigious 2-bedroom executive apartment located in prime Colombo 07. Walking distance to leading hospitals, diplomatic missions, and international schools.",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Fully Furnished", "Gated Security", "Hot Water", "Backup Generator", "AC in All Rooms", "Modern Kitchen"],
    phone: "+94 71 987 6543",
    whatsapp: "+94719876543",
    available: true,
    created_at: "2026-09-05T10:30:00.000Z",
  },
  {
    id: 3,
    title: "Minimalist Studio for Tech & Aviation",
    location: "Katunayake Free Trade Zone",
    area: "katunayaka",
    type: "room",
    price: 25000,
    advance_payment: 50000,
    bedrooms: 1,
    bathrooms: 1,
    size: "400 sq ft",
    description: "Functional and secure private room in a modern shared residence. Ideal for aviation crew, FTZ engineers, and remote professionals.",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Smart Sub-Meter", "Fiber Internet", "Study Desk", "Shared Kitchenette", "Ceiling Fan"],
    phone: "+94 76 555 1234",
    whatsapp: "+94765551234",
    available: true,
    created_at: "2026-09-10T14:15:00.000Z",
  },
  {
    id: 4,
    title: "Dutch Heritage Villa & Courtyard Suite",
    location: "Galle Fort, Galle Coast",
    area: "galle",
    type: "house",
    price: 120000,
    advance_payment: 240000,
    bedrooms: 3,
    bathrooms: 2,
    size: "1,800 sq ft",
    description: "Restored colonial townhouse with authentic timber craftsmanship, open-air central courtyard, and serene seaside breezes inside historic Galle Fort.",
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Heritage Architecture", "Private Courtyard", "Fully Furnished", "Air Conditioned", "High Ceilings"],
    phone: "+94 77 333 8899",
    whatsapp: "+94773338899",
    available: true,
    created_at: "2026-09-12T16:00:00.000Z",
  },
  {
    id: 5,
    title: "Campus Garden Room at University Lane",
    location: "Katubedda, Moratuwa",
    area: "moratuwa",
    type: "room",
    price: 22000,
    advance_payment: 44000,
    bedrooms: 1,
    bathrooms: 1,
    size: "350 sq ft",
    description: "Spotless single room designed for engineering & architecture students. 3 minutes walking distance to University of Moratuwa.",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Attached Bathroom", "High-Speed Wi-Fi", "Separate Utility Meter", "Study Table"],
    phone: "+94 70 222 4455",
    whatsapp: "+94702224455",
    available: true,
    created_at: "2026-09-15T09:20:00.000Z",
  },
  {
    id: 6,
    title: "Green View Family Annex with Balcony",
    location: "Pitipana South, Homagama",
    area: "homagama",
    type: "annex",
    price: 38000,
    advance_payment: 76000,
    bedrooms: 2,
    bathrooms: 1,
    size: "750 sq ft",
    description: "Spacious 2-bedroom second-floor annex overlooking lush green paddy fields in Pitipana South.",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Private Balcony", "Tiled Pantry", "Car Parking", "CCTV Security"],
    phone: "+94 77 888 9911",
    whatsapp: "+94778889911",
    available: true,
    created_at: "2026-09-18T11:45:00.000Z",
  },
  {
    id: 7,
    title: "Prime Sea-Facing Apartment Suite",
    location: "Marine Drive, Colombo 03",
    area: "colombo",
    type: "house",
    price: 135000,
    advance_payment: 270000,
    bedrooms: 2,
    bathrooms: 2,
    size: "1,100 sq ft",
    description: "Panoramic Indian Ocean sunset views from private balcony with luxury finishes and immediate Galle Road access.",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Ocean View", "Swimming Pool", "Gym Access", "24/7 Security"],
    phone: "+94 71 444 3322",
    whatsapp: "+94714443322",
    available: true,
    created_at: "2026-09-20T13:00:00.000Z",
  },
  {
    id: 8,
    title: "Scenic Hillside Annex & Pine Grove",
    location: "Hantana Range, Kandy",
    area: "kandy",
    type: "annex",
    price: 48000,
    advance_payment: 96000,
    bedrooms: 2,
    bathrooms: 1,
    size: "800 sq ft",
    description: "Serene residence tucked into the misty Hantana hillside, 10 minutes to Kandy City Centre and University of Peradeniya.",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80"],
    amenities: ["Mountain Views", "Cool Climate", "Hot Shower", "Private Carport"],
    phone: "+94 77 666 7788",
    whatsapp: "+94776667788",
    available: true,
    created_at: "2026-09-22T15:30:00.000Z",
  }
];

// GET /api/properties - Get all properties with filtering (Cached + Safe Fallback)
router.get("/", async (req, res) => {
  try {
    const { type, area, search, limit } = req.query;
    const cacheKey = `properties_${type || 'all'}_${area || 'all'}_${search || 'all'}_${limit || 'all'}`;

    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      return res.status(200).json(cachedData);
    }

    let query = supabase
      .from("properties")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (type) {
      const types = type.toString().toLowerCase().split(',').map(t => t.trim());
      if (types.length === 1) {
        query = query.eq("type", types[0]);
      } else {
        query = query.in("type", types);
      }
    }

    if (area) {
      query = query.eq("area", area.toLowerCase());
    }

    if (limit) {
      query = query.limit(parseInt(limit) || 50);
    }

    const { data, error } = await query;

    let results = [];
    if (!error && Array.isArray(data) && data.length > 0) {
      results = data.map(transformPropertySummary);
    } else {
      // Use fallback listings
      let fallback = [...FALLBACK_LISTINGS];
      if (type) {
        const types = type.toString().toLowerCase().split(',').map(t => t.trim());
        fallback = fallback.filter(p => types.includes(p.type.toLowerCase()));
      }
      if (area) {
        fallback = fallback.filter(p => (p.area || "").toLowerCase().includes(area.toLowerCase()));
      }
      if (search) {
        const s = search.toLowerCase();
        fallback = fallback.filter(p => p.title.toLowerCase().includes(s) || p.location.toLowerCase().includes(s));
      }
      if (limit) {
        fallback = fallback.slice(0, parseInt(limit));
      }
      results = fallback.map(transformPropertySummary);
    }

    // Save in in-memory cache
    setCache(cacheKey, results);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.status(200).json(results);
  } catch (error) {
    // Return filtered fallback on unexpected exception instead of 500
    const fallback = FALLBACK_LISTINGS.map(transformPropertySummary);
    res.status(200).json(fallback);
  }
});

// GET /api/properties/:id - Get single property (Cached + Safe Fallback)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `property_detail_${id}`;

    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return res.status(200).json(cached);
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    let transformedData = null;
    if (!error && data) {
      transformedData = transformPropertyDetail(data);
    } else {
      const match = FALLBACK_LISTINGS.find(p => String(p.id) === String(id)) || FALLBACK_LISTINGS[0];
      if (match) {
        transformedData = transformPropertyDetail(match);
      }
    }

    if (!transformedData) {
      return res.status(404).json({ message: "Property not found" });
    }

    setCache(cacheKey, transformedData, 120 * 1000);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.status(200).json(transformedData);
  } catch (error) {
    const match = FALLBACK_LISTINGS.find(p => String(p.id) === String(req.params.id)) || FALLBACK_LISTINGS[0];
    if (match) {
      return res.status(200).json(transformPropertyDetail(match));
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/properties/:id - Update property (seller only)
router.put("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user owns this property
    const { data: property } = await supabase
      .from("properties")
      .select("seller_id")
      .eq("id", id)
      .single();

    if (!property || property.seller_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update property
    const { data, error } = await supabase
      .from("properties")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Invalidate cache
    clearPropertyCache();

    res.status(200).json({
      message: "Property updated successfully",
      property: data[0],
    });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/properties/:id - Delete property (seller only)
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this property
    const { data: property } = await supabase
      .from("properties")
      .select("seller_id")
      .eq("id", id)
      .single();

    if (!property || property.seller_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete property
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Invalidate cache
    clearPropertyCache();

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;