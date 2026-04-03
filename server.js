// server.js — SmartPriceCompare Backend
// ─────────────────────────────────────────────────────────────────────────────
// Setup:  npm install
// Dev:    npm run dev    (nodemon, auto-reload)
// Prod:   npm start
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const extractRoute = require("./routes/extract");
const compareRoute = require("./routes/compare");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ── Request logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/extract", extractRoute);
app.use("/api/compare", compareRoute);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: `${process.uptime().toFixed(1)}s` });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SmartPriceCompare API  →  http://localhost:${PORT}`);
  console.log(`Health check           →  http://localhost:${PORT}/api/health`);
});
