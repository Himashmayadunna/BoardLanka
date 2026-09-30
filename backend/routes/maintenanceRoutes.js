const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { sendEmail, getMaintenanceUpdateTemplate } = require("../services/emailService");

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

// GET /api/maintenance - Get maintenance tickets
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status, priority, category } = req.query;
    let query = supabase
      .from("maintenance_requests")
      .select("*, profiles:user_id(first_name, last_name, email, phone), properties(title, location), units(unit_number)");

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (category) query = query.eq("category", category);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.warn("DB query error for maintenance:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/maintenance - Create maintenance request
router.post("/", verifyUser, async (req, res) => {
  try {
    const {
      property_id,
      unit_id,
      property_title,
      category,
      title,
      description,
      priority,
      images,
      estimated_cost
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const { data, error } = await supabase.from("maintenance_requests").insert([{
      user_id: req.user.id,
      landlord_id: req.body.landlord_id || null,
      property_id: property_id || null,
      unit_id: unit_id || null,
      property_title: property_title || null,
      category: category || "general",
      title,
      description,
      priority: priority || "medium",
      status: "open",
      images: images || [],
      estimated_cost: Number(estimated_cost) || 0
    }]).select();

    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/maintenance/:id - Update status / assignment / cost
router.patch("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to, actual_cost, update_message } = req.body;

    const updatePayload = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigned_to !== undefined && { assigned_to }),
      ...(actual_cost !== undefined && { actual_cost: Number(actual_cost) }),
      ...(status === "completed" && { completed_at: new Date().toISOString() }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(updatePayload)
      .eq("id", id)
      .select("*, profiles:user_id(first_name, last_name, email)");

    if (error) throw error;
    const updatedTicket = data[0];

    // Dispatch status update email to tenant
    if (updatedTicket?.profiles?.email && status) {
      sendEmail({
        to: updatedTicket.profiles.email,
        subject: `Update on Maintenance Ticket: ${updatedTicket.title}`,
        html: getMaintenanceUpdateTemplate({
          tenantName: `${updatedTicket.profiles.first_name} ${updatedTicket.profiles.last_name}`,
          ticketTitle: updatedTicket.title,
          status,
          message: update_message || `The status for your ticket has been changed to ${status}.`
        })
      }).catch(e => console.warn("Email dispatch error:", e));
    }

    return res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
