// utils/parser.js
// Parses a URL string to extract a human-readable item name and detect platform type.
// FUTURE UPGRADE: Replace detectType() with a live platform registry lookup.

/**
 * Detect whether the link is food/grocery, a ride, or a generic product.
 * @param {string} url
 * @returns {"food"|"ride"|"product"}
 */
function detectType(url) {
  const u = url.toLowerCase();
  if (/swiggy|zomato|blinkit|zepto|dunzo|instamart|grofer/.test(u)) return "food";
  if (/ola\.|uber\.|rapido|namma/.test(u)) return "ride";
  return "product";
}

/**
 * Pull the most descriptive path segment from a URL and humanise it.
 * @param {string} url
 * @returns {string} e.g. "Butter Chicken Masala"
 */
function extractRawName(url) {
  const SKIP = /^(order|cart|menu|city|product|item|p|dp|home|search|list|category|shop|store|app)$/i;
  try {
    const obj  = new URL(url.startsWith("http") ? url : "https://" + url);
    const segs = obj.pathname.split("/").filter(Boolean);

    // Prefer long, non-numeric, non-keyword segments
    const best =
      segs
        .filter(s => s.length > 3 && !/^\d+$/.test(s) && !SKIP.test(s))
        .sort((a, b) => b.length - a.length)[0] ||
      segs.slice().reverse()[0] || "";

    return best
      .replace(/[-_+]/g, " ")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "Unknown Item";
  } catch {
    // Fallback: scrape words straight from the raw URL string
    const words = url
      .replace(/https?:\/\/[^/]+/, "")
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !SKIP.test(w));
    return words.slice(0, 5).join(" ") || "Product";
  }
}

module.exports = { detectType, extractRawName };
