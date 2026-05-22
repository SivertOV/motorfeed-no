const SOURCES = [
  // Norske / Norge-relevante kilder med tilgjengelige eller stabile RSS-endepunkter
  { name: "E24 Bil", category: "Bil", url: "https://e24.no/rss2/?seksjon=bil", market: "NO" },

  // Elbil og teknologi
  { name: "InsideEVs", category: "Elbil", url: "https://insideevs.com/rss/news/all/", market: "INT" },
  { name: "Green Car Reports", category: "Elbil", url: "https://feeds.highgearmedia.com/?sites=GreenCarReports&tags=news", market: "INT" },

  // Bilnyheter
  { name: "Motor1", category: "Bil", url: "https://www.motor1.com/rss/news/all/", market: "INT" },
  { name: "CarScoops", category: "Bil", url: "https://www.carscoops.com/feed/", market: "INT" },

  // MC / motorsykkel
  { name: "RideApart", category: "MC", url: "https://www.rideapart.com/rss/news/all/", market: "INT" }
];

const FALLBACK_IMAGES = {
  "Elbil": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=82",
  "Bil": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=82",
  "MC": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=82",
  "Teknologi": "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=82"
};

function decodeHtml(text = "") {
  return String(text)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(text = "") {
  return decodeHtml(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1]).trim() : "";
}

function getAtomLink(entry) {
  const match = entry.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : "";
}

function getImage(item, description) {
  const media = item.match(/<media:content[^>]+url=["']([^"']+)["']/i)
    || item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
    || item.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
    || description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return media ? decodeHtml(media[1]) : "";
}

function inferCategory(title = "", description = "", sourceCategory = "Bil") {
  const text = `${title} ${description}`.toLowerCase();

  if (/(mc|motorcycle|motorsykkel|bike|kawasaki|yamaha|ducati|harley|honda cb|suzuki gsx|ktm|triumph)/i.test(text)) {
    return "MC";
  }

  if (/(ev|electric|elbil|lading|charging|battery|batteri|tesla|polestar|byd|ioniq|id\.|leaf)/i.test(text)) {
    return "Elbil";
  }

  if (/(ai|software|autonomous|selvkjørende|infotainment|teknologi|tech)/i.test(text)) {
    return "Teknologi";
  }

  return sourceCategory;
}

function parseRss(xml, source) {
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return itemMatches.map(raw => {
    const descriptionRaw = getTag(raw, "description") || getTag(raw, "content:encoded") || getTag(raw, "summary");
    const title = stripHtml(getTag(raw, "title"));
    const description = stripHtml(descriptionRaw).slice(0, 240);
    const category = inferCategory(title, description, source.category);

    return {
      title,
      link: stripHtml(getTag(raw, "link")),
      description,
      pubDate: stripHtml(getTag(raw, "pubDate") || getTag(raw, "dc:date") || getTag(raw, "published")),
      source: source.name,
      category,
      market: source.market,
      image: getImage(raw, descriptionRaw) || FALLBACK_IMAGES[category] || FALLBACK_IMAGES.Bil
    };
  }).filter(item => item.title && item.link);
}

function parseAtom(xml, source) {
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return entries.map(raw => {
    const descriptionRaw = getTag(raw, "summary") || getTag(raw, "content");
    const title = stripHtml(getTag(raw, "title"));
    const description = stripHtml(descriptionRaw).slice(0, 240);
    const category = inferCategory(title, description, source.category);

    return {
      title,
      link: getAtomLink(raw),
      description,
      pubDate: stripHtml(getTag(raw, "updated") || getTag(raw, "published")),
      source: source.name,
      category,
      market: source.market,
      image: getImage(raw, descriptionRaw) || FALLBACK_IMAGES[category] || FALLBACK_IMAGES.Bil
    };
  }).filter(item => item.title && item.link);
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.link || item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

exports.handler = async function () {
  const results = await Promise.allSettled(SOURCES.map(async source => {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "MotorFeed.no RSS Reader/1.0",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml"
      }
    });

    if (!response.ok) {
      throw new Error(`${source.name} svarte med ${response.status}`);
    }

    const xml = await response.text();
    return xml.includes("<entry") ? parseAtom(xml, source) : parseRss(xml, source);
  }));

  const items = dedupe(
    results.flatMap(result => result.status === "fulfilled" ? result.value : [])
  )
    .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
    .slice(0, 24);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=900"
    },
    body: JSON.stringify({
      updatedAt: new Date().toISOString(),
      sources: SOURCES.map(source => ({ name: source.name, category: source.category, market: source.market })),
      items
    })
  };
};
