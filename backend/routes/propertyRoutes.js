// routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// add property
router.post("/", async (req, res) => {
  const { title, price, location, type } = req.body;

  const { data, error } = await supabase
    .from("properties")
    .insert([{ title, price, location, type }]);

  if (error) return res.status(500).json(error);

  res.json(data);
});

// get properties
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*");

  if (error) {
    console.error("Supabase fetch error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;