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

// GET /api/tenants - Get all tenants for landlord
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = supabase
      .from("tenants")
      .select("*, properties(id, title, location), units(id, unit_number, monthly_rent)")
      .eq("landlord_id", req.user.id);

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.warn("DB query error for tenants:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenants - Create new tenant
router.post("/", verifyUser, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, property_id, unit_id, nic_or_passport, emergency_contact, emergency_phone, occupation } = req.body;
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ message: "First name, last name, email, and phone are required." });
    }

    const { data, error } = await supabase.from("tenants").insert([{
      landlord_id: req.user.id,
      first_name,
      last_name,
      email,
      phone,
      property_id: property_id || null,
      unit_id: unit_id || null,
      nic_or_passport: nic_or_passport || null,
      emergency_contact: emergency_contact || null,
      emergency_phone: emergency_phone || null,
      occupation: occupation || null,
      status: "active"
    }]).select();

    if (error) throw error;

    // If unit was assigned, update unit status to occupied
    if (unit_id) {
      await supabase.from("units").update({ status: "occupied" }).eq("id", unit_id);
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tenants/:id
router.patch("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("tenants")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("landlord_id", req.user.id)
      .select();

    if (error) throw error;
    return res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tenants/:id
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("tenants").delete().eq("id", id).eq("landlord_id", req.user.id);
    if (error) throw error;
    return res.json({ success: true, message: "Tenant removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
