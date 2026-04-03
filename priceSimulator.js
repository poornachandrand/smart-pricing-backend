// utils/priceSimulator.js
// Generates a realistic base price and per-platform price variations.
// All logic is deterministic (same input → same output) so UI stays stable on reload.
//
// FUTURE UPGRADE: Replace each platform block in generatePlatformPrices() with a
// live API call once partner access is approved:
//   Swiggy  → Swiggy Partner API  (https://partner.swiggy.com)
//   Zomato  → Zomato Developer API (https://developers.zomato.com)
//   Blinkit → Blinkit/Grofers API  (requires enterprise agreement)
//   Zepto   → Zepto Partner API    (https://business.zeptonow.com)
//   Ola     → Ola Developer API    (https://devs.olacabs.com)
//   Uber    → Uber Price Estimates (https://developer.uber.com/docs/riders/references/api/v1.2/estimates-price-get)
//   Rapido  → Rapido Business API  (contact Rapido partnerships)
//   Amazon  → Amazon Product Advertising API v5 (https://webservices.amazon.in/paapi5)
//   Flipkart→ Flipkart Affiliate API (https://affiliate.flipkart.com/api)
//   Meesho  → Meesho Supplier API  (https://supplier.meesho.com)

const PLATFORM_CONFIG = {
  food: [
    { id: "swiggy",  name: "Swiggy",      tagline: "30 min delivery",  mult: [0.95, 1.12], deliveryOptions: [29, 49] },
    { id: "zomato",  name: "Zomato",      tagline: "25 min delivery",  mult: [0.92, 1.15], deliveryOptions: [19, 29] },
    { id: "blinkit", name: "Blinkit",     tagline: "10 min grocery",   mult: [1.05, 1.25], deliveryOptions: [0, 29]  },
    { id: "zepto",   name: "Zepto",       tagline: "10 min delivery",  mult: [1.02, 1.20], deliveryOptions: [0, 39]  },
  ],
  ride: [
    { id: "ola",     name: "Ola",         tagline: "Cab & auto",       mult: [0.90, 1.10], deliveryOptions: [0]      },
    { id: "uber",    name: "Uber",        tagline: "City ride",        mult: [0.95, 1.15], deliveryOptions: [0]      },
    { id: "rapido",  name: "Rapido",      tagline: "Bike & cab",       mult: [0.60, 0.85], deliveryOptions: [0]      },
    { id: "namma",   name: "Namma Yatri", tagline: "Auto service",     mult: [0.75, 0.95], deliveryOptions: [0]      },
  ],
  product: [
    { id: "amazon",   name: "Amazon",     tagline: "Prime delivery",   mult: [0.90, 1.08], deliveryOptions: [0, 40]  },
    { id: "flipkart", name: "Flipkart",   tagline: "Supermart deals",  mult: [0.88, 1.05], deliveryOptions: [0, 40]  },
    { id: "meesho",   name: "Meesho",     tagline: "Free delivery",    mult: [0.75, 0.98], deliveryOptions: [0]      },
    { id: "snapdeal", name: "Snapdeal",   tagline: "Best offers",      mult: [0.80, 1.02], deliveryOptions: [0, 50]  },
  ],
};

/**
 * Generate a deterministic base price for the item based on its name.
 * The seed ensures the same item always returns the same base price.
 */
function generateBasePrice(name, type) {
  const seed   = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  const ranges = { food: [79, 499], ride: [60, 800], product: [149, 9999] };
  const [lo, hi] = (ranges[type] || [99, 999]);
  return Math.round(lo + (seed % (hi - lo)));
}

/**
 * Generate per-platform prices using deterministic pseudo-random variation.
 * @param {string} itemName
 * @param {"food"|"ride"|"product"} type
 * @param {number} basePrice
 * @returns {Array}
 */
function generatePlatformPrices(itemName, type, basePrice) {
  const platforms = PLATFORM_CONFIG[type] || PLATFORM_CONFIG.product;
  const seed      = itemName.length + (itemName.charCodeAt(0) || 0);

  return platforms.map((p, i) => {
    const [lo, hi] = p.mult;
    // Deterministic variation — same item always produces same spread
    const pct      = lo + ((seed * (i + 1) * 6271 + i * 1009) % 10000) / 10000 * (hi - lo);
    const price    = Math.round(basePrice * pct);

    // Delivery fee
    const deliveries = p.deliveryOptions;
    const delivery   = deliveries[(seed + i) % deliveries.length];

    // Discount (product platforms only, alternating items)
    const discount = type === "product" && i % 2 === 0 ? Math.round(price * 0.05) : 0;

    return {
      id:       p.id,
      name:     p.name,
      tagline:  p.tagline,
      price,
      delivery,
      discount,
      total:    price + delivery - discount,
    };
  });
}

module.exports = { generateBasePrice, generatePlatformPrices, PLATFORM_CONFIG };
