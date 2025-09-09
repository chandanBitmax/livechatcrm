// utils/ipLocation.js
import geoip from "geoip-lite";

// Client IP nikalna
export function getClientIp(req) {
  let ip =
    req.headers["cf-connecting-ip"] || // Cloudflare
    req.headers["x-forwarded-for"]?.split(",")[0] || // Proxy chain
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;

  // "::ffff:" cleanup
  ip = ip?.replace("::ffff:", "").trim();

  // Agar local testing ho rahi hai
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    ip = "182.72.118.194"; // Example: India ka ek public IP
  }

  return ip;
}

// Location fetch karna
export function getLocation(ip) {
  try {
    const data = geoip.lookup(ip);

    if (!data) {
      return {
        ip,
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        latitude: null,
        longitude: null,
      };
    }

    return {
      ip,
      country: data.country || "Unknown",
      region: data.region || "Unknown",
      city: data.city || "Unknown",
      latitude: data.ll?.[0] || null,
      longitude: data.ll?.[1] || null,
    };
  } catch (err) {
    return {
      ip,
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      latitude: null,
      longitude: null,
    };
  }
}
