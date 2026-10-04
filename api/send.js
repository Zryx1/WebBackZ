// ===== KONFIG =====
const BACKEND_URL = "http://IP_PANEL:PORT".replace(/\/+$/, "");
const BACKEND_SECRET = "GANTI_DENGAN_STRING_RAHASIA_LU"; // opsional
// ==================

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // ────────────────────────────────────────
    // 1. AMBIL IP REAL USER
    // ────────────────────────────────────────
    // Vercel overwrite X-Forwarded-For — entry pertama = IP asli client
    const xff = req.headers["x-forwarded-for"] || "";
    const ip = xff.split(",")[0].trim()
            || req.headers["x-real-ip"]
            || req.socket?.remoteAddress
            || "unknown";

    // ────────────────────────────────────────
    // 2. AMBIL GEO DARI VERCEL EDGE
    // ────────────────────────────────────────
    // Vercel auto-inject header geo — gratis, tanpa API call
    const country = req.headers["x-vercel-ip-country"] || "-";
    const countryRegion = req.headers["x-vercel-ip-country-region"] || "-";
    const city = decodeURIComponent(req.headers["x-vercel-ip-city"] || "-");
    const lat = req.headers["x-vercel-ip-latitude"] || "-";
    const lon = req.headers["x-vercel-ip-longitude"] || "-";
    const timezone = req.headers["x-vercel-ip-timezone"] || "-";
    const postalCode = req.headers["x-vercel-ip-postal-code"] || "-";

    // ────────────────────────────────────────
    // 3. AMBIL HEADER LAIN
    // ────────────────────────────────────────
    const ua = req.headers["user-agent"] || "-";
    const acceptLang = req.headers["accept-language"] || "-";
    const referer = req.headers["referer"] || "-";
    const origin = req.headers["origin"] || "-";

    // ────────────────────────────────────────
    // 4. PAYLOAD DARI BROWSER
    // ────────────────────────────────────────
    const body = req.body || {};

    // ────────────────────────────────────────
    // 5. SUSUN DATA FINAL
    // ────────────────────────────────────────
    const enriched = {
      // === Data dari browser ===
      type: body.type || "unknown",
      choice: body.choice || null,
      sentAt: body.sentAt || new Date().toISOString(),
      ua: body.ua || ua,
      lang: body.lang || acceptLang,
      platform: body.platform || "-",
      screen: body.screen || "-",
      viewport: body.viewport || "-",
      tz: body.tz || timezone,
      referrer: body.referrer || referer,
      path: body.path || "-",
      cores: body.cores || "-",
      memory: body.memory || "-",
      online: body.online ?? "-",
      conn: body.conn || "-",

      // === Data dari Vercel (server-side) ===
      server: {
        ip,
        geo: {
          country,
          region: countryRegion,
          city,
          lat,
          lon,
          timezone,
          postalCode
        },
        headers: {
          ua,
          acceptLang,
          referer,
          origin
        },
        receivedAt: new Date().toISOString(),
        vercelRegion: process.env.VERCEL_REGION || "-",
        vercelUrl: process.env.VERCEL_URL || "-"
      }
    };

    // ────────────────────────────────────────
    // 6. TERUSKAN KE PANEL
    // ────────────────────────────────────────
    const backendRes = await fetch(`${BACKEND_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Secret": BACKEND_SECRET,
        "X-Forwarded-From": "vercel"
      },
      body: JSON.stringify(enriched)
    });

    if (!backendRes.ok) {
      throw new Error(`Backend status ${backendRes.status}`);
    }

    const backendJson = await backendRes.json();

    // ────────────────────────────────────────
    // 7. BALIKIN KE BROWSER
    // ────────────────────────────────────────
    return res.status(200).json({
      ok: true,
      ip: enriched.server.geo.city !== "-"
        ? `${enriched.server.geo.city}, ${enriched.server.geo.country}`
        : country,
      location: enriched.server.geo.city !== "-"
        ? `${enriched.server.geo.city}, ${enriched.server.geo.region}, ${enriched.server.geo.country}`
        : `${country}`,
      isp: backendJson.isp || "-",
      coords: `${lat}, ${lon}`,
      timezone,
      serverTime: enriched.server.receivedAt
    });

  } catch (err) {
    console.error("[Vercel] Error:", err.message);
    return res.status(502).json({
      ok: false,
      error: "Backend tidak terjangkau",
      detail: err.message
    });
  }
}
