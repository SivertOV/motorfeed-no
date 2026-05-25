exports.handler = async function () {
  const checks = [];
  async function checkEndpoint(label, path) {
    try {
      const started = Date.now();
      const base = process.env.URL || "https://motorfeed.no";
      const res = await fetch(`${base}${path}`, { headers: { "User-Agent": "MotorFeed Health Check/1.0" } });
      checks.push({ label, ok: res.ok, value: `${res.status} · ${Date.now() - started}ms` });
    } catch {
      checks.push({ label, ok: false, value: "feil" });
    }
  }
  await checkEndpoint("RSS-motor", "/.netlify/functions/fetch-news");
  await checkEndpoint("YouTube-feed", "/.netlify/functions/fetch-youtube");
  checks.push({ label: "AI-sammendrag", ok: true, value: process.env.OPENAI_API_KEY ? "OpenAI aktiv" : "fallback aktiv" });
  checks.push({ label: "Kontakt", ok: true, value: "kontakt@motorfeed.no" });
  checks.push({ label: "Bildekontroll", ok: true, value: "motor-fallback aktiv" });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" },
    body: JSON.stringify({ updatedAt: new Date().toISOString(), status: checks.every(c => c.ok) ? "ok" : "warning", checks })
  };
};