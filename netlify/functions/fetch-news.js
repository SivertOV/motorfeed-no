const SOURCES = [
  { name: "E24 Bil", category: "Bil", url: "https://e24.no/rss2/?seksjon=bil", market: "NO" },
  { name: "InsideEVs", category: "Elbil", url: "https://insideevs.com/rss/news/all/", market: "INT" },
  { name: "Green Car Reports", category: "Elbil", url: "https://feeds.highgearmedia.com/?sites=GreenCarReports&tags=news", market: "INT" },
  { name: "Motor1", category: "Bil", url: "https://www.motor1.com/rss/news/all/", market: "INT" },
  { name: "CarScoops", category: "Bil", url: "https://www.carscoops.com/feed/", market: "INT" },
  { name: "RideApart", category: "MC", url: "https://www.rideapart.com/rss/news/all/", market: "INT" },
  { name: "The Drive", category: "Utstyr", url: "https://www.thedrive.com/feed", market: "INT" }
];

const IMAGE_POOLS = {
  Bil: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1100&q=88"
  ],
  Elbil: [
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1100&q=88"
  ],
  MC: [
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&w=1100&q=88"
  ],
  Teknologi: [
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1100&q=88"
  ],
  Utstyr: [
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1100&q=88"
  ]
};

const BLOCKED_IMAGE_HINTS = ["logo","icon","avatar","profile","author","placeholder","default","1x1","pixel","tracking","sprite","transparent","blank","facebook","twitter","instagram"];
const STOPWORDS = new Set("the a an and or of for to in on with from by is are was were new first official review test this that its it as at into more after before about over under how why what when".split(" "));

function hashString(input = "") {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) - hash) + input.charCodeAt(i);
  return Math.abs(hash);
}
function fallbackImage(category = "Bil", title = "") {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.Bil;
  return pool[hashString(title) % pool.length];
}
function decodeHtml(text = "") {
  return String(text).replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
function stripHtml(text = "") {
  return decodeHtml(text).replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
}
function getTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}
function normalizeUrl(url = "") {
  return decodeHtml(url).trim().replace(/^\/\//, "https://");
}
function isProbablyGoodImage(url = "") {
  const lower = url.toLowerCase();
  if (!lower || !/^https?:\/\//.test(lower)) return false;
  if (BLOCKED_IMAGE_HINTS.some(hint => lower.includes(hint))) return false;
  if (/\.(svg|gif)(\?|$)/i.test(lower)) return false;
  return /(\.jpg|\.jpeg|\.png|\.webp|images\.unsplash|image|media|cdn|wp-content|uploads)/i.test(lower);
}
function getImage(item, description) {
  const candidates = [
    ...item.matchAll(/<media:content[^>]+url=["']([^"']+)["']/gi),
    ...item.matchAll(/<media:thumbnail[^>]+url=["']([^"']+)["']/gi),
    ...item.matchAll(/<enclosure[^>]+url=["']([^"']+)["']/gi),
    ...description.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  ].map(match => normalizeUrl(match[1]));
  return candidates.find(isProbablyGoodImage) || "";
}
function inferCategory(title = "", description = "", sourceCategory = "Bil") {
  const text = `${title} ${description}`.toLowerCase();
  if (/(mc|motorcycle|motorsykkel|bike|kawasaki|yamaha|ducati|harley|honda cb|suzuki gsx|ktm|triumph|ninja|panigale|motogp|superbike)/i.test(text)) return "MC";
  if (/(dashcam|dekk|tyre|tire|wheel|felg|utstyr|gear|helmet|hjelm|detailing|wash|bilpleie|charger|lader|tool|verktøy|takboks|roof box)/i.test(text)) return "Utstyr";
  if (/(ev|electric|elbil|lading|charging|battery|batteri|tesla|polestar|byd|ioniq|id\.|leaf|rivian|lucid|nio|xpeng)/i.test(text)) return "Elbil";
  if (/(ai|software|autonomous|selvkjørende|infotainment|teknologi|tech|adas|carplay|android automotive)/i.test(text)) return "Teknologi";
  return sourceCategory;
}
function isRelevantMotorStory(title = "", description = "", category = "") {
  const text = `${title} ${description} ${category}`.toLowerCase();
  const positive = /(car|cars|auto|vehicle|motor|bil|elbil|ev|tesla|bmw|audi|mercedes|volkswagen|toyota|ford|porsche|polestar|byd|motorcycle|mc|motorsykkel|ducati|yamaha|kawasaki|honda|garage|tyre|tire|dekk|dashcam|charger|road|driving|kjøring|formula 1|f1|motorsport)/i;
  const negative = /(celebrity|movie|music|football|soccer|baseball|basketball|politics|recipe|fashion|beauty|real estate|home decor|hotel|crypto)/i;
  return positive.test(text) && !negative.test(text);
}
function simpleNorwegianSummary(title = "", description = "", category = "Bil") {
  const clean = stripHtml(description || "");
  if (clean && clean.length > 55) return clean.length > 155 ? clean.slice(0, 152).trim() + "..." : clean;
  const c = category || "Bil";
  if (c === "MC") return `Ny MC-sak: ${title}. MotorFeed følger utviklingen for motorsykkel, utstyr og kjøreforhold.`;
  if (c === "Elbil") return `Ny elbilsak: ${title}. Saken handler om utviklingen i elbilmarkedet og ny teknologi.`;
  if (c === "Utstyr") return `Utstyrssak: ${title}. Relevant for bilutstyr, tester, dekk, lading eller bilpleie.`;
  if (c === "Teknologi") return `Teknologisak: ${title}. Programvare, AI og smarte bilfunksjoner får stadig større betydning.`;
  return `Motornyhet: ${title}. Saken er hentet fra en av MotorFeeds kilder.`;
}
function keywordSet(title = "") {
  return new Set(String(title).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w => w.length > 3 && !STOPWORDS.has(w)).slice(0, 12));
}
function isDuplicate(a, b) {
  const A = keywordSet(a.title), B = keywordSet(b.title);
  if (!A.size || !B.size) return false;
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return intersection / union > 0.46;
}
function dedupeSmart(items) {
  const kept = [];
  for (const item of items) {
    if (!kept.some(existing => existing.link === item.link || isDuplicate(existing, item))) kept.push(item);
  }
  return kept;
}
function parseRss(xml, source) {
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return itemMatches.map(raw => {
    const descriptionRaw = getTag(raw, "description") || getTag(raw, "content:encoded") || getTag(raw, "summary");
    const title = stripHtml(getTag(raw, "title"));
    const description = stripHtml(descriptionRaw).slice(0, 240);
    const category = inferCategory(title, description, source.category);
    const feedImage = getImage(raw, descriptionRaw);
    return {
      title,
      link: stripHtml(getTag(raw, "link")),
      description,
      summary: simpleNorwegianSummary(title, description, category),
      pubDate: stripHtml(getTag(raw, "pubDate") || getTag(raw, "dc:date") || getTag(raw, "published")),
      source: source.name,
      category,
      market: source.market,
      image: feedImage || fallbackImage(category, title),
      imageType: feedImage ? "source" : "motor-fallback"
    };
  }).filter(item => item.title && item.link && isRelevantMotorStory(item.title, item.description, item.category));
}
function balance(items) {
  const priority = ["Elbil","Bil","MC","Utstyr","Teknologi"];
  const buckets = Object.fromEntries(priority.map(c => [c, []]));
  for (const item of items) (buckets[item.category] || buckets.Bil).push(item);
  const out = [];
  let added = true;
  while (added) {
    added = false;
    for (const c of priority) {
      const item = buckets[c].shift();
      if (item) { out.push(item); added = true; }
    }
  }
  return out.concat(Object.values(buckets).flat());
}
async function enhanceWithOpenAI(items) {
  if (!process.env.OPENAI_API_KEY || !items.length) return items;
  try {
    const payload = {
      model: "gpt-4o-mini",
      input: `Lag korte norske sammendrag på maks 24 ord for disse motornyhetene. Returner kun JSON-array med {"title":"...","summary":"..."}.\n${JSON.stringify(items.slice(0,12).map(i => ({title:i.title, description:i.description, category:i.category, source:i.source})))}`,
      text: { format: { type: "json_object" } }
    };
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return items;
    const data = await res.json();
    const output = data.output_text || data.output?.flatMap(o => o.content || []).map(c => c.text).join("") || "";
    const parsed = JSON.parse(output);
    const arr = Array.isArray(parsed) ? parsed : (parsed.items || parsed.summaries || []);
    const map = new Map(arr.map(x => [x.title, x.summary]));
    return items.map(item => ({...item, summary: map.get(item.title) || item.summary}));
  } catch {
    return items;
  }
}
exports.handler = async function () {
  const results = await Promise.allSettled(SOURCES.map(async source => {
    const response = await fetch(source.url, {
      headers: { "User-Agent":"MotorFeed.no RSS Reader/1.0", "Accept":"application/rss+xml, application/xml, text/xml" }
    });
    if (!response.ok) throw new Error(`${source.name} svarte med ${response.status}`);
    return parseRss(await response.text(), source);
  }));
  let items = balance(dedupeSmart(results.flatMap(r => r.status === "fulfilled" ? r.value : []).sort((a,b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0)))).slice(0,36);
  items = await enhanceWithOpenAI(items);
  return { statusCode:200, headers:{ "Content-Type":"application/json; charset=utf-8", "Cache-Control":"public, max-age=900" }, body: JSON.stringify({ updatedAt:new Date().toISOString(), items }) };
};
