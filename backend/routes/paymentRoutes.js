const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { sendEmail, getRentReminderTemplate, getOverduePaymentTemplate } = require("../services/emailService");

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

// GET /api/payments - Get payments list
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = supabase
      .from("payments")
      .select("*, tenants(first_name, last_name, email, phone), properties(title, location), units(unit_number)")
      .eq("landlord_id", req.user.id);

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("due_date", { ascending: false });
    if (error) {
      console.warn("DB query error for payments:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments - Record a payment
router.post("/", verifyUser, async (req, res) => {
  try {
    const {
      tenant_id,
      property_id,
      unit_id,
      lease_id,
      amount,
      due_date,
      payment_date,
      payment_method,
      status,
      reference_number,
      receipt_url,
      notes
    } = req.body;

    if (!tenant_id || !property_id || !amount || !due_date) {
      return res.status(400).json({ message: "tenant_id, property_id, amount, and due_date are required." });
    }

    const { data, error } = await supabase.from("payments").insert([{
      landlord_id: req.user.id,
      tenant_id,
      property_id,
      unit_id: unit_id || null,
      lease_id: lease_id || null,
      amount: Number(amount),
      due_date,
      payment_date: payment_date || (status === 'paid' ? new Date().toISOString().split('T')[0] : null),
      payment_method: payment_method || 'bank_transfer',
      status: status || 'pending',
      reference_number: reference_number || null,
      receipt_url: receipt_url || null,
      notes: notes || null
    }]).select();

    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/:id/remind - Send rent reminder email via Resend
router.post("/:id/remind", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { isOverdue } = req.body;

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*, tenants(first_name, last_name, email), properties(title), units(unit_number)")
      .eq("id", id)
      .single();

    if (error || !payment) return res.status(404).json({ message: "Payment not found" });

    const tenantEmail = payment.tenants?.email;
    const tenantName = payment.tenants ? `${payment.tenants.first_name} ${payment.tenants.last_name}` : "Tenant";
    const propertyTitle = payment.properties?.title || "Property";
    const unitNumber = payment.units?.unit_number;

    if (tenantEmail) {
      if (isOverdue || payment.status === 'overdue') {
        const daysOverdue = Math.max(1, Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24)));
        await sendEmail({
          to: tenantEmail,
          subject: `OVERDUE NOTICE: Rent for ${propertyTitle}`,
          html: getOverduePaymentTemplate({
            tenantName,
            propertyTitle,
            unitNumber,
            amount: payment.amount,
            daysOverdue
          })
        });
      } else {
        await sendEmail({
          to: tenantEmail,
          subject: `Rent Reminder: ${propertyTitle}`,
          html: getRentReminderTemplate({
            tenantName,
            propertyTitle,
            unitNumber,
            amount: payment.amount,
            dueDate: payment.due_date
          })
        });
      }
    }

    return res.json({ success: true, message: "Reminder email dispatched successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/payments/:id - Update status
router.patch("/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("payments")
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

module.exports = router;
