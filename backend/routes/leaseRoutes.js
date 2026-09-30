const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { sendEmail, getLeaseExpirationTemplate } = require("../services/emailService");

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

// GET /api/leases - Get all leases
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = supabase
      .from("leases")
      .select("*, tenants(first_name, last_name, email, phone), properties(title, location), units(unit_number)")
      .eq("landlord_id", req.user.id);

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("end_date", { ascending: true });
    if (error) {
      console.warn("DB query error for leases:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leases - Create new lease
router.post("/", verifyUser, async (req, res) => {
  try {
    const { tenant_id, property_id, unit_id, start_date, end_date, monthly_rent, security_deposit, terms, document_url } = req.body;
    if (!tenant_id || !property_id || !start_date || !end_date || !monthly_rent) {
      return res.status(400).json({ message: "tenant_id, property_id, start_date, end_date, and monthly_rent are required." });
    }

    const { data, error } = await supabase.from("leases").insert([{
      landlord_id: req.user.id,
      tenant_id,
      property_id,
      unit_id: unit_id || null,
      start_date,
      end_date,
      monthly_rent: Number(monthly_rent),
      security_deposit: Number(security_deposit) || 0,
      terms: terms || "",
      document_url: document_url || null,
      status: "active"
    }]).select();

    if (error) throw error;

    // Link tenant to property and unit
    await supabase.from("tenants").update({ property_id, unit_id }).eq("id", tenant_id);
    if (unit_id) {
      await supabase.from("units").update({ status: "occupied" }).eq("id", unit_id);
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leases/:id/notify-expiration - Trigger email reminder via Resend
router.post("/:id/notify-expiration", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: lease, error } = await supabase
      .from("leases")
      .select("*, tenants(first_name, last_name, email), properties(title)")
      .eq("id", id)
      .single();

    if (error || !lease) return res.status(404).json({ message: "Lease not found" });

    const tenantName = lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "Tenant";
    const tenantEmail = lease.tenants?.email;
    const propertyTitle = lease.properties?.title || "Property";

    if (tenantEmail) {
      await sendEmail({
        to: tenantEmail,
        subject: `Lease Expiration Notice - ${propertyTitle}`,
        html: getLeaseExpirationTemplate({
          tenantName,
          propertyTitle,
          expiryDate: lease.end_date,
          landlordName: req.user.email
        })
      });
    }

    return res.json({ success: true, message: "Lease expiration notice sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/leases/:id/status
router.patch("/:id/status", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, end_date } = req.body;
    const updateData = { status, updated_at: new Date().toISOString() };
    if (end_date) updateData.end_date = end_date;

    const { data, error } = await supabase
      .from("leases")
      .update(updateData)
      .eq("id", id)
      .eq("landlord_id", req.user.id)
      .select();

    if (error) throw error;
    return res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
