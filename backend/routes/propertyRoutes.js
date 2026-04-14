// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

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

// POST /api/properties - Add new property (sellers only)
router.post("/", verifyUser, async (req, res) => {
  try {
    console.log("📝 POST /api/properties called");
    console.log("User ID:", req.user?.id);
    
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

    console.log("Received data:", {
      title, location, area, type, price, advancePayment, size, description
    });

    // Validate required fields
    if (!title || !location || !area || !type || !price || !description || advancePayment === undefined || advancePayment === null || advancePayment === '') {
      console.log("❌ Validation failed - missing required fields");
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
      console.log("❌ User is not a seller");
      return res.status(403).json({ message: "Only sellers can add properties" });
    }

    console.log("📤 Inserting property into Supabase...");
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

    console.log("✅ Property inserted successfully:", data[0]?.id);
    res.status(201).json({
      message: "Property added successfully",
      property: data[0],
    });
  } catch (error) {
    console.error("❌ Add property error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/properties - Get all properties with filtering
router.get("/", async (req, res) => {
  try {
    console.log("📍 GET /api/properties called");
    console.log("Query params:", req.query);
    
    const { type, area, search } = req.query;

    let query = supabase
      .from("properties")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    // Apply type filter - handle comma-separated types
    if (type) {
      const types = type.toString().toLowerCase().split(',').map(t => t.trim());
      console.log("📌 Filtering by types:", types);
      if (types.length === 1) {
        query = query.eq("type", types[0]);
      } else {
        // For multiple types, use 'in' filter
        query = query.in("type", types);
      }
    }

    if (area) {
      query = query.eq("area", area.toLowerCase());
    }

    console.log("🔍 Executing Supabase query...");
    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return res.status(500).json({ message: error.message });
    }

    console.log("✅ Fetched properties:", data?.length || 0);

    // Transform data to match frontend expectations
    const transformedData = (data || []).map((property) => ({
      id: property.id,
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
      images: property.images && property.images.length > 0 ? [property.images[0]] : [], // Return only first image to reduce payload
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
    }));

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/properties/:id - Get single property
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Property not found" });
    }

    const transformedData = {
      id: data.id,
      title: data.title,
      location: data.location,
      area: data.area,
      type: data.type,
      price: data.price,
      advancePayment: data.advance_payment,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      size: data.size,
      description: data.description,
      images: data.images || [], // Return all images for single property view
      amenities: data.amenities || [],
      seller: {
        name: "Property Owner",
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: null,
        verified: false,
      },
      available: data.available,
      createdAt: data.created_at,
    };

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

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;