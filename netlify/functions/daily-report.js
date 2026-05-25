exports.handler = async function(){
  const base = process.env.URL || "https://motorfeed.no";
  let news = [];
  let videos = [];
  try {
    const nr = await fetch(`${base}/.netlify/functions/fetch-news`);
    const nd = await nr.json();
    news = nd.items || [];
  } catch {}
  try {
    const vr = await fetch(`${base}/.netlify/functions/fetch-youtube`);
    const vd = await vr.json();
    videos = vd.items || [];
  } catch {}
  const top = news.slice(0,5).map(i => ({title:i.title, category:i.category, source:i.source, score:i.score}));
  const mc = news.filter(i=>i.category==="MC").slice(0,3).map(i=>i.title);
  const report = {
    date: new Date().toISOString(),
    title: "MotorFeed Daily Report",
    status: news.length ? "ok" : "warning",
    summary: [
      `${news.length} motorrelevante saker funnet etter V5-filter.`,
      `${mc.length} MC-saker fremhevet.`,
      `${videos.length} videoer tilgjengelig i V5-videomotor.`,
      process.env.OPENAI_API_KEY ? "OpenAI-sammendrag er aktivt." : "Gratis fallback-sammendrag er aktivt."
    ],
    topStories: top,
    mcFocus: mc,
    nextActions: [
      "Sjekk om noen irrelevante saker slipper gjennom.",
      "Kontroller at elbil kun brukes på reelle EV-saker.",
      "Følg Analytics for Populært nå og Pulse."
    ]
  };
  return {statusCode:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=1800"},body:JSON.stringify(report)};
};