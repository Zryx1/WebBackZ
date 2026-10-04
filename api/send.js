// Vercel Serverless Function: meneruskan request ke panel
// (menghindari error mixed content HTTPS -> HTTP)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  try {
    const r = await fetch(process.env.BACKEND_URL + "/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": process.env.API_SECRET || ""
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ ok: false, error: "Backend tidak terjangkau" });
  }
}
