// ===== ISI SATU KALI DI SINI =====
const BACKEND_URL = "http://IP_PANEL:PORT";   // contoh: "http://123.45.67.89:3530"
// =================================

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  try {
    const r = await fetch(BACKEND_URL + "/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(502).json({ ok: false, error: "Backend tidak terjangkau. Pastikan panel sudah di-Start." });
  }
}
