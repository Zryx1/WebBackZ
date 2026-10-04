export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const { backend, name, message } = req.body || {};
  if (!backend || !/^https?:\/\//.test(backend)) {
    return res.status(400).json({ ok: false, error: "Alamat backend tidak valid" });
  }
  try {
    const r = await fetch(backend.replace(/\/+$/, "") + "/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message })
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(502).json({ ok: false, error: "Backend tidak terjangkau: " + e.message });
  }
}
