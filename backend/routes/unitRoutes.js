const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/units - Get units (filterable by property_id, status)
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = supabase.from("units").select("*, properties(id, title, location, seller_id)");

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.warn("DB query error for units:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    console.error("Units fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/units - Create new unit
router.post("/", verifyUser, async (req, res) => {
  try {
    const { property_id, unit_number, unit_type, bedrooms, bathrooms, monthly_rent, security_deposit, size_sqft, status, amenities, notes } = req.body;
    if (!property_id || !unit_number || !monthly_rent) {
      return res.status(400).json({ message: "property_id, unit_number, and monthly_rent are required." });
    }

    const { data, error } = await supabase.from("units").insert([{
      property_id,
      unit_number,
      unit_type: unit_type || "Standard",
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      monthly_rent: Number(monthly_rent),
      security_deposit: Number(security_deposit) || 0,
      size_sqft: Number(size_sqft) || 350,
      status: status || "available",
      amenities: amenities || [],
      notes: notes || ""
    }]).select();

    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    console.error("Unit create error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/units/:id - Update unit
router.patch("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("units")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/units/:id
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (error) throw error;
    return res.json({ success: true, message: "Unit deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
