const SOURCES = [
  { name: "Motor1", category: "Bil", url: "https://www.motor1.com/rss/news/all/", market: "INT", weight: 86 },
  { name: "InsideEVs", category: "Elbil", url: "https://insideevs.com/rss/news/all/", market: "INT", weight: 92 },
  { name: "Green Car Reports", category: "Elbil", url: "https://feeds.highgearmedia.com/?sites=GreenCarReports&tags=news", market: "INT", weight: 84 },
  { name: "CarScoops", category: "Bil", url: "https://www.carscoops.com/feed/", market: "INT", weight: 80 },
  { name: "RideApart", category: "MC", url: "https://www.rideapart.com/rss/news/all/", market: "INT", weight: 82 },
  { name: "The Drive", category: "Utstyr", url: "https://www.thedrive.com/feed", market: "INT", weight: 74 }
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
  Motorsport: [
    "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1100&q=88",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1100&q=88"
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

const CAR_BRANDS = [
  "tesla","bmw","audi","mercedes","mercedes-benz","porsche","toyota","volkswagen","vw","ford","volvo","polestar","byd","nio","xpeng","hyundai","kia","renault","peugeot","citroen","skoda","cupra","seat","mazda","nissan","honda","subaru","ferrari","lamborghini","mclaren","aston martin","bentley","rolls-royce","lotus","jaguar","land rover","range rover","rivian","lucid","stellantis","jeep","dodge","ram","chevrolet","cadillac","lexus","mini","alpine"
];
const MC_BRANDS = ["ducati","yamaha","kawasaki","ktm","harley","harley-davidson","triumph","suzuki","honda","bmw motorrad","aprilia","moto guzzi","indian motorcycle","royal enfield","husqvarna","vespa"];
const MOTOR_TERMS = [
  "car","cars","auto","automotive","vehicle","vehicles","bil","biler","elbil","ev","electric vehicle","hybrid","plug-in","phev","suv","sedan","hatchback","coupe","supercar","hypercar","motor","engine","driving","driver","road","roadster","pickup","truck","charging","charger","fast charging","battery","range","range test","rekkevidde","lading","batteri","autonomous driving","adas","infotainment","motorsport","formula 1","f1","rally","nascar","lemans","motorcycle","motorcycles","mc","motorsykkel","bike","bikes","rider","touring","adventure bike","helmet","hjelm","dekk","tires","tyres","dashcam","car care","detailing"
];
const NEGATIVE_TERMS = [
  "datacenter","data center","cloud","server","crypto","bitcoin","stock market","earnings call","celebrity","movie","music","football","soccer","basketball","baseball","recipe","fashion","beauty","makeup","real estate","home decor","hotel","travel hotel","war","geopolitics","election","gaming","iphone","android phone","laptop","smartphone","ai chip","semiconductor","software update for windows"
];
const EV_REQUIRED = ["tesla","polestar","byd","nio","xpeng","rivian","lucid","electric vehicle","ev "," ev","elbil","charging","charger","battery electric","bev","plug-in","phev","range test","supercharger","fast charging","ioniq","id.","leaf","model y","model 3","model s","model x"];

const BLOCKED_IMAGE_HINTS = ["logo","icon","avatar","profile","author","placeholder","default","1x1","pixel","tracking","sprite","transparent","blank","facebook","twitter","instagram"];
const STOPWORDS = new Set("the a an and or of for to in on with from by is are was were new first official review test this that its it as at into more after before about over under how why what when says will can has have after into over under amid".split(" "));

function hashString(input = "") { let h=0; for(let i=0;i<input.length;i++){h=((h<<5)-h)+input.charCodeAt(i);h|=0;} return Math.abs(h); }
function fallbackImage(category="Bil", title=""){ const pool=IMAGE_POOLS[category]||IMAGE_POOLS.Bil; return pool[hashString(title)%pool.length]; }
function decodeHtml(text=""){ return String(text).replace(/<!\[CDATA\[(.*?)\]\]>/gs,"$1").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");}
function stripHtml(text=""){ return decodeHtml(text).replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}
function getTag(item,tag){ const m=item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,"i")); return m?decodeHtml(m[1]).trim():""; }
function normalizeUrl(url=""){ return decodeHtml(url).trim().replace(/^\/\//,"https://"); }
function containsAny(text, arr){ text = text.toLowerCase(); return arr.some(t => text.includes(t)); }
function countHits(text, arr){ text = text.toLowerCase(); return arr.reduce((n,t)=>n+(text.includes(t)?1:0),0); }

function isProbablyGoodImage(url=""){
  const lower=url.toLowerCase();
  if(!lower || !/^https?:\/\//.test(lower)) return false;
  if(BLOCKED_IMAGE_HINTS.some(h=>lower.includes(h))) return false;
  if(/\.(svg|gif)(\?|$)/i.test(lower)) return false;
  return /(\.jpg|\.jpeg|\.png|\.webp|images\.unsplash|image|media|cdn|wp-content|uploads)/i.test(lower);
}
function getImage(item,description){
  const matches=[
    ...item.matchAll(/<media:content[^>]+url=["']([^"']+)["']/gi),
    ...item.matchAll(/<media:thumbnail[^>]+url=["']([^"']+)["']/gi),
    ...item.matchAll(/<enclosure[^>]+url=["']([^"']+)["']/gi),
    ...description.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  ].map(m=>normalizeUrl(m[1]));
  return matches.find(isProbablyGoodImage)||"";
}

function scoreStory(title="", description="", source){
  const text = `${title} ${description}`.toLowerCase();
  let score = source.weight || 60;

  score += countHits(text, CAR_BRANDS) * 18;
  score += countHits(text, MC_BRANDS) * 20;
  score += countHits(text, MOTOR_TERMS) * 8;
  score -= countHits(text, NEGATIVE_TERMS) * 28;

  if (/review|test|drive|drives|first drive|prøvekjørt|lanserer|launch|unveil|reveals/i.test(text)) score += 10;
  if (/norway|norge|norwegian|norsk|oslo|bergen|trondheim|elbilavgift|bompenge|naf/i.test(text)) score += 16;
  if (/motorcycle|mc|motorsykkel|touring|adventure bike|helmet|hjelm/i.test(text)) score += 10;
  if (/charging|charger|battery|lading|batteri/i.test(text) && !containsAny(text, CAR_BRANDS) && !/vehicle|car|ev|elbil|electric vehicle|tesla|polestar|byd/i.test(text)) score -= 25;
  if (/ai|artificial intelligence|software/i.test(text) && !/car|vehicle|automotive|driver|adas|infotainment|tesla|bmw|mercedes|volvo/i.test(text)) score -= 24;

  return Math.max(0, Math.min(100, score));
}

function inferCategory(title="", description="", sourceCategory="Bil", score=0){
  const text = `${title} ${description}`.toLowerCase();

  if (/(formula 1|f1|rally|motorsport|nascar|lemans|wec|motogp|superbike)/i.test(text)) return "Motorsport";
  if (containsAny(text, MC_BRANDS) || /(motorcycle|motorcycles|motorsykkel|mc | mc|adventure bike|touring bike|helmet|hjelm|rider)/i.test(text)) return "MC";
  if (/(dashcam|dekk|tyre|tire|wheel|felg|utstyr|gear|detailing|wash|bilpleie|takboks|roof box|car care)/i.test(text)) return "Utstyr";
  if (containsAny(text, EV_REQUIRED) && /(car|vehicle|auto|automotive|bil|elbil|ev|electric vehicle|model|tesla|polestar|byd|charging|charger|range|rekkevidde|lading)/i.test(text)) return "Elbil";
  if (/(adas|infotainment|autonomous driving|self-driving|selvkjørende|android automotive|carplay|software-defined vehicle)/i.test(text)) return "Teknologi";
  return sourceCategory === "Elbil" && !containsAny(text, EV_REQUIRED) ? "Bil" : sourceCategory;
}

function isRelevantMotorStory(title="", description="", category="", score=0){
  const text = `${title} ${description} ${category}`.toLowerCase();
  if (score < 58) return false;
  if (containsAny(text, NEGATIVE_TERMS) && score < 72) return false;
  return containsAny(text, CAR_BRANDS) || containsAny(text, MC_BRANDS) || containsAny(text, MOTOR_TERMS);
}

function simpleNorwegianSummary(title="", description="", category="Bil"){
  const clean=stripHtml(description||"");
  if(clean && clean.length>65) return clean.length>150 ? clean.slice(0,147).trim()+"..." : clean;
  if(category==="MC") return `MC-relevant sak om ${title}. MotorFeed prioriterer sesong, utstyr, touring og kjøreforhold.`;
  if(category==="Elbil") return `Elbilrelevant sak om ${title}. Fokus på kjøretøy, lading, rekkevidde eller elbilmarked.`;
  if(category==="Motorsport") return `Motorsport: ${title}. Relevant for racing, F1, rally eller banekjøring.`;
  if(category==="Utstyr") return `Utstyrssak: ${title}. Relevant for bilutstyr, dekk, lading, dashcam eller bilpleie.`;
  if(category==="Teknologi") return `Bilteknologi: ${title}. Relevant for kjøretøy, førerstøtte, infotainment eller programvare.`;
  return `Motornyhet: ${title}. Saken er valgt fordi den er relevant for bil- eller MC-interesserte.`;
}

function keywordSet(title=""){
  return new Set(String(title).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter(w=>w.length>3&&!STOPWORDS.has(w)).slice(0,14));
}
function isDuplicate(a,b){
  const A=keywordSet(a.title), B=keywordSet(b.title);
  if(!A.size||!B.size) return false;
  const intersection=[...A].filter(x=>B.has(x)).length;
  const union=new Set([...A,...B]).size;
  return intersection/union>0.44;
}
function dedupeSmart(items){
  const kept=[];
  for(const item of items){
    if(!kept.some(e=>e.link===item.link || isDuplicate(e,item))) kept.push(item);
  }
  return kept;
}

function parseRss(xml, source){
  const itemMatches=xml.match(/<item[\s\S]*?<\/item>/gi)||[];
  return itemMatches.map(raw=>{
    const descriptionRaw=getTag(raw,"description")||getTag(raw,"content:encoded")||getTag(raw,"summary");
    const title=stripHtml(getTag(raw,"title"));
    const description=stripHtml(descriptionRaw).slice(0,260);
    const score=scoreStory(title,description,source);
    const category=inferCategory(title,description,source.category,score);
    const feedImage=getImage(raw,descriptionRaw);
    return {
      title,
      link: stripHtml(getTag(raw,"link")),
      description,
      summary: simpleNorwegianSummary(title,description,category),
      pubDate: stripHtml(getTag(raw,"pubDate")||getTag(raw,"dc:date")||getTag(raw,"published")),
      source: source.name,
      category,
      market: source.market,
      score,
      image: feedImage || fallbackImage(category,title),
      imageType: feedImage ? "source" : "motor-fallback"
    };
  }).filter(item=>item.title && item.link && isRelevantMotorStory(item.title,item.description,item.category,item.score));
}

function balanceV5(items){
  const cars = items.filter(i => ["Bil","Elbil","Teknologi","Utstyr","Motorsport"].includes(i.category));
  const mc = items.filter(i => i.category === "MC");
  const out = [];
  let ci=0, mi=0;
  while(ci<cars.length || mi<mc.length){
    for(let n=0;n<7 && ci<cars.length;n++) out.push(cars[ci++]);
    for(let n=0;n<3 && mi<mc.length;n++) out.push(mc[mi++]);
  }
  return out;
}

async function enhanceWithOpenAI(items){
  if(!process.env.OPENAI_API_KEY || !items.length) return items;
  try{
    const payload={
      model:"gpt-4o-mini",
      input:`Du er MotorFeed-redaktør. Lag korte norske sammendrag på maks 22 ord. Kun motorrelevante, presise og uten hype. Returner JSON {"items":[{"title":"...","summary":"..."}]}.\n${JSON.stringify(items.slice(0,16).map(i=>({title:i.title,description:i.description,category:i.category,source:i.source,score:i.score})))}`,
      text:{format:{type:"json_object"}}
    };
    const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify(payload)});
    if(!res.ok) return items;
    const data=await res.json();
    const output=data.output_text || data.output?.flatMap(o=>o.content||[]).map(c=>c.text).join("") || "";
    const parsed=JSON.parse(output);
    const arr=Array.isArray(parsed)?parsed:(parsed.items||[]);
    const map=new Map(arr.map(x=>[x.title,x.summary]));
    return items.map(item=>({...item,summary:map.get(item.title)||item.summary}));
  }catch{return items;}
}

exports.handler = async function(){
  const results=await Promise.allSettled(SOURCES.map(async source=>{
    const response=await fetch(source.url,{headers:{"User-Agent":"MotorFeed.no V5 RSS Reader/1.0","Accept":"application/rss+xml, application/xml, text/xml"}});
    if(!response.ok) throw new Error(`${source.name} svarte med ${response.status}`);
    return parseRss(await response.text(),source);
  }));

  let raw = results.flatMap(r=>r.status==="fulfilled"?r.value:[])
    .sort((a,b)=>(b.score-a.score) || (new Date(b.pubDate||0)-new Date(a.pubDate||0)));

  let items = balanceV5(dedupeSmart(raw)).slice(0,40);
  items = await enhanceWithOpenAI(items);

  const stats = {
    total: items.length,
    car: items.filter(i=>i.category!=="MC").length,
    mc: items.filter(i=>i.category==="MC").length,
    avgScore: Math.round(items.reduce((s,i)=>s+(i.score||0),0)/Math.max(1,items.length))
  };

  return {
    statusCode:200,
    headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=900"},
    body:JSON.stringify({version:"V5",updatedAt:new Date().toISOString(),stats,items})
  };
};
