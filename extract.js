// routes/extract.js
// POST /api/extract
// Accepts a URL, parses it, and returns the raw item name, type, and base price.

const express = require("express");
const router  = express.Router();
const { detectType, extractRawName }   = require("../utils/parser");
const { generateBasePrice }            = require("../utils/priceSimulator");

router.post("/", (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || url.trim().length < 5) {
    return res.status(400).json({ success: false, error: "A valid URL is required." });
  }

  const trimmed  = url.trim();
  const type     = detectType(trimmed);
  const rawName  = extractRawName(trimmed);
  const basePrice = generateBasePrice(rawName, type);

  return res.json({
    success: true,
    data: {
      rawName,
      type,
      basePrice,
    },
  });
});

module.exports = router;
