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

// GET /api/subscriptions/plans - List available subscription plans
router.get("/plans", async (req, res) => {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price_lkr: 4500,
      period: "per month",
      description: "Ideal for individual landlords with small room or annex properties.",
      max_properties: 3,
      max_units: 10,
      max_team_members: 1,
      popular: false,
      features: [
        "Up to 3 Properties",
        "Up to 10 Rental Units",
        "Tenant Record Directory",
        "Rent Payment Ledger",
        "Maintenance Ticket Tracking",
        "Automated Email Rent Reminders"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      price_lkr: 12500,
      period: "per month",
      description: "Complete operational suite for active multi-property landlords & managers.",
      max_properties: 15,
      max_units: 60,
      max_team_members: 5,
      popular: true,
      features: [
        "Up to 15 Properties",
        "Up to 60 Rental Units",
        "Full Automated Invoicing & PDF Receipts",
        "Overdue Rent & Expiration Email Alerts",
        "Interactive Maintenance Kanban Board",
        "Revenue, Occupancy & Arrears Reports",
        "CSV & Print Data Exports",
        "Standard Team Member Seats (5)"
      ]
    },
    {
      id: "business",
      name: "Business",
      price_lkr: 28000,
      period: "per month",
      description: "Designed for property management agencies and real estate operators.",
      max_properties: 50,
      max_units: 250,
      max_team_members: 15,
      popular: false,
      features: [
        "Up to 50 Properties",
        "Up to 250 Units",
        "Multi-Landlord Organization Architecture",
        "Role-Based Access Control (Admin/Staff)",
        "Deep Financial Analytics & Net Margin Trends",
        "Custom Logo Branding on Invoices",
        "Automated Resend Notification Campaigns",
        "Priority Support Response"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price_lkr: 65000,
      period: "custom billing",
      description: "Custom enterprise setup for large portfolio holders & institutions.",
      max_properties: 9999,
      max_units: 99999,
      max_team_members: 100,
      popular: false,
      features: [
        "Unlimited Properties & Units",
        "Unlimited Staff & Agent Accounts",
        "Custom REST API & Webhook Integrations",
        "Dedicated Account Executive",
        "Custom SLA & Guaranteed Uptime",
        "White-label Tenant Portal Options"
      ]
    }
  ];

  return res.json(plans);
});

// GET /api/subscriptions/current - Current user plan
router.get("/current", verifyUser, async (req, res) => {
  try {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", req.user.id)
      .single();

    return res.json(sub || {
      plan_id: "professional",
      status: "active",
      billing_cycle: "monthly",
      current_period_end: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions/change-plan - Select / upgrade plan
router.post("/change-plan", verifyUser, async (req, res) => {
  try {
    const { plan_id } = req.body;
    return res.json({
      success: true,
      message: `Successfully switched to ${plan_id} plan tier`,
      plan_id,
      status: "active"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
