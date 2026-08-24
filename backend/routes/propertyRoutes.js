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

// GET /api/properties - Get all properties with filtering (Cached)
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

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return res.status(500).json({ message: error.message });
    }

    const transformedData = (data || []).map(transformPropertySummary);

    // Save in in-memory cache
    setCache(cacheKey, transformedData);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/properties/:id - Get single property (Cached)
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

    if (error || !data) {
      return res.status(404).json({ message: "Property not found" });
    }

    const transformedData = transformPropertyDetail(data);

    setCache(cacheKey, transformedData, 120 * 1000);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Get property error:", error);
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