// routes/compare.js
// POST /api/compare
// Accepts itemName, type, and basePrice; returns platform prices + cheapest ID.

const express = require("express");
const router  = express.Router();
const { generatePlatformPrices, PLATFORM_CONFIG } = require("../utils/priceSimulator");

const VALID_TYPES = Object.keys(PLATFORM_CONFIG);

router.post("/", (req, res) => {
  const { itemName, type, basePrice } = req.body;

  if (!itemName || typeof itemName !== "string" || itemName.trim().length === 0) {
    return res.status(400).json({ success: false, error: "itemName is required." });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `type must be one of: ${VALID_TYPES.join(", ")}.`,
    });
  }
  const base = Number(basePrice);
  if (!base || base <= 0) {
    return res.status(400).json({ success: false, error: "basePrice must be a positive number." });
  }

  const platforms  = generatePlatformPrices(itemName.trim(), type, base);
  const cheapestId = platforms.reduce((a, b) => (a.total <= b.total ? a : b)).id;
  const savings    = Math.max(...platforms.map(p => p.total)) - Math.min(...platforms.map(p => p.total));

  return res.json({
    success: true,
    data: {
      platforms,
      cheapestId,
      maxSavings: savings,
    },
  });
});

module.exports = router;
