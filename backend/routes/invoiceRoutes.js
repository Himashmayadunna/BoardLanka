const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { sendEmail, getInvoiceNotificationTemplate } = require("../services/emailService");

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

// GET /api/invoices - Get all invoices
router.get("/", verifyUser, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let query = supabase
      .from("invoices")
      .select("*, tenants(first_name, last_name, email, phone), properties(title, location), units(unit_number)")
      .eq("landlord_id", req.user.id);

    if (property_id) query = query.eq("property_id", property_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("issued_date", { ascending: false });
    if (error) {
      console.warn("DB query error for invoices:", error.message);
      return res.json([]);
    }
    return res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/invoices - Generate a new invoice
router.post("/", verifyUser, async (req, res) => {
  try {
    const {
      tenant_id,
      property_id,
      unit_id,
      subtotal,
      utility_charges,
      tax_amount,
      due_date,
      line_items,
      notes
    } = req.body;

    if (!tenant_id || !property_id || !subtotal || !due_date) {
      return res.status(400).json({ message: "tenant_id, property_id, subtotal, and due_date are required." });
    }

    const invoice_number = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const total_amount = Number(subtotal) + Number(utility_charges || 0) + Number(tax_amount || 0);

    const { data, error } = await supabase.from("invoices").insert([{
      invoice_number,
      landlord_id: req.user.id,
      tenant_id,
      property_id,
      unit_id: unit_id || null,
      subtotal: Number(subtotal),
      utility_charges: Number(utility_charges || 0),
      tax_amount: Number(tax_amount || 0),
      total_amount,
      due_date,
      issued_date: new Date().toISOString().split('T')[0],
      status: 'unpaid',
      line_items: line_items || [{ description: "Monthly Rent", amount: Number(subtotal) }],
      notes: notes || ""
    }]).select("*, tenants(first_name, last_name, email), properties(title)");

    if (error) throw error;
    const createdInvoice = data[0];

    // Dispatch email notification
    if (createdInvoice?.tenants?.email) {
      sendEmail({
        to: createdInvoice.tenants.email,
        subject: `New Rental Invoice ${invoice_number} from BoardLanka`,
        html: getInvoiceNotificationTemplate({
          tenantName: `${createdInvoice.tenants.first_name} ${createdInvoice.tenants.last_name}`,
          invoiceNumber: createdInvoice.invoice_number,
          amount: createdInvoice.total_amount,
          dueDate: createdInvoice.due_date
        })
      }).catch(e => console.warn("Background email send error:", e));
    }

    return res.status(201).json(createdInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/invoices/:id/status - Update invoice status
router.patch("/:id/status", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
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
