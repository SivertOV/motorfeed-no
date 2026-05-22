const SOURCES = [
  { name: "InsideEVs", category: "Elbil", url: "https://insideevs.com/rss/news/all/" },
  { name: "Motor1", category: "Bil", url: "https://de.motor1.com/rss/news/all/" },
  { name: "Green Car Reports", category: "Elbil", url: "https://feeds.highgearmedia.com/?sites=GreenCarReports&tags=news" },
  { name: "RideApart", category: "MC", url: "https://www.rideapart.com/rss/news/all/" }
];
function decodeHtml(t=""){return t.replace(/<!\[CDATA\[(.*?)\]\]>/gs,"$1").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">")}
function stripHtml(t=""){return decodeHtml(t).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
function getTag(item,tag){const m=item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,`i`));return m?decodeHtml(m[1]).trim():""}
function getImage(item,desc){const m=item.match(/<media:content[^>]+url=["']([^"']+)["']/i)||item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)||item.match(/<enclosure[^>]+url=["']([^"']+)["']/i)||desc.match(/<img[^>]+src=["']([^"']+)["']/i);return m?m[1]:""}
function parseRss(xml,source){const items=xml.match(/<item[\s\S]*?<\/item>/gi)||[];return items.slice(0,8).map(raw=>{const desc=getTag(raw,"description")||getTag(raw,"content:encoded");return{title:stripHtml(getTag(raw,"title")),link:stripHtml(getTag(raw,"link")),description:stripHtml(desc).slice(0,260),pubDate:stripHtml(getTag(raw,"pubDate")||getTag(raw,"dc:date")),source:source.name,category:source.category,image:getImage(raw,desc)}}).filter(i=>i.title&&i.link)}
exports.handler=async function(){const results=await Promise.allSettled(SOURCES.map(async s=>{const r=await fetch(s.url,{headers:{"User-Agent":"MotorFeed.no RSS Reader/1.0","Accept":"application/rss+xml, application/xml, text/xml"}});if(!r.ok)throw new Error(`${s.name} svarte med ${r.status}`);return parseRss(await r.text(),s)}));const items=results.flatMap(r=>r.status==="fulfilled"?r.value:[]).sort((a,b)=>new Date(b.pubDate||0)-new Date(a.pubDate||0)).slice(0,18);return{statusCode:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=900"},body:JSON.stringify({updatedAt:new Date().toISOString(),items})}}
