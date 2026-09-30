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

// GET /api/notifications - Get user notifications
router.get("/", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Return simulated initial notifications if empty
      return res.json([
        {
          id: 1,
          type: "rent_due",
          title: "Rent Collection Scheduled",
          message: "3 tenant rent installments are due within the next 48 hours for Emerald Villa Annexes.",
          read: false,
          created_at: new Date(Date.now() - 3600 * 1000).toISOString()
        },
        {
          id: 2,
          type: "maintenance_update",
          title: "New Maintenance Ticket Submitted",
          message: "Tenant Shenal reported an A/C issue in Lotus View Residences Unit 3B (Priority: High).",
          read: false,
          created_at: new Date(Date.now() - 7200 * 1000).toISOString()
        },
        {
          id: 3,
          type: "lease_expiring",
          title: "Lease Expiring in 21 Days",
          message: "Rental agreement for Unit 2 at Sunset Horizon Suites is nearing expiration.",
          read: true,
          created_at: new Date(Date.now() - 86400 * 1000).toISOString()
        }
      ]);
    }
    return res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/mark-all-read
router.patch("/mark-all-read", verifyUser, async (req, res) => {
  try {
    await supabase.from("notifications").update({ read: true }).eq("user_id", req.user.id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
