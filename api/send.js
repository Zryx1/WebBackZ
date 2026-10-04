// ===== EDIT SATU BARIS INI SAJA =====
const BACKEND_URL = "https://erine.jkt48node.id:3530";
// Contoh: "http://node1.namahosting.com:2345"
// ====================================

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
    res.status(502).json({ ok: false, error: "Backend tidak terjangkau" });
  }
}
