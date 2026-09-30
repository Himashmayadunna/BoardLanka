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

// GET /api/reports/summary - Generate report dataset
router.get("/summary", verifyUser, async (req, res) => {
  try {
    const { type = "revenue", property_id, start_date, end_date } = req.query;

    const dummyReports = {
      revenue: [
        { id: "REV-101", property: "Emerald Villa Annexes", period: "August 2026", gross: 340000, expenses: 45000, net: 295000, status: "Reconciled" },
        { id: "REV-102", property: "Sunset Horizon Suites", period: "August 2026", gross: 280000, expenses: 32000, net: 248000, status: "Reconciled" },
        { id: "REV-103", property: "Lotus View Residences", period: "August 2026", gross: 450000, expenses: 68000, net: 382000, status: "Reconciled" },
        { id: "REV-104", property: "Homagama Campus Annex", period: "August 2026", gross: 120000, expenses: 14000, net: 106000, status: "Reconciled" }
      ],
      occupancy: [
        { property: "Emerald Villa Annexes", totalUnits: 8, occupied: 7, vacant: 1, rate: "87.5%", avgRent: "LKR 42,500" },
        { property: "Sunset Horizon Suites", totalUnits: 6, occupied: 6, vacant: 0, rate: "100%", avgRent: "LKR 46,600" },
        { property: "Lotus View Residences", totalUnits: 12, occupied: 10, vacant: 2, rate: "83.3%", avgRent: "LKR 37,500" },
        { property: "Homagama Campus Annex", totalUnits: 4, occupied: 4, vacant: 0, rate: "100%", avgRent: "LKR 30,000" }
      ],
      arrears: [
        { tenant: "Shenal De Silva", property: "Lotus View Residences", unit: "Unit 3B", overdueDays: 14, amount: 38000, contact: "+94 77 123 4567" },
        { tenant: "Kavindu Perera", property: "Emerald Villa Annexes", unit: "Annex 2", overdueDays: 6, amount: 42000, contact: "+94 71 987 6543" }
      ],
      maintenance: [
        { id: "MNT-401", property: "Lotus View Residences", unit: "Unit 1A", issue: "A/C Gas Refill & Compressor Check", cost: 18500, technician: "CoolTech Lanka", date: "2026-08-14" },
        { id: "MNT-402", property: "Emerald Villa Annexes", unit: "Annex 4", issue: "Plumbing Valve Replacement", cost: 6200, technician: "City Plumbers", date: "2026-08-22" }
      ]
    };

    return res.json({
      reportType: type,
      generatedAt: new Date().toISOString(),
      rows: dummyReports[type] || dummyReports.revenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
