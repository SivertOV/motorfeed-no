const CHANNELS = [
  { name: "Top Gear", category: "Bil", channelId: "UCjOl2AUblVmg2rA_cRgZkFg" },
  { name: "carwow", category: "Bil", channelId: "UCUhFaUpnq31m6TNX2VKVSVA" },
  { name: "Doug DeMuro", category: "Bil", channelId: "UCsqjHFMB_JYTaEnf_vmTNqg" },
  { name: "Fully Charged Show", category: "Elbil", channelId: "UCzz4CoEgSgWNs9ZAvRMhW2A" },
  { name: "Bjørn Nyland", category: "Elbil", channelId: "UCG1QcV31eoSaX4rE8avQL4A" },
  { name: "FortNine", category: "MC", channelId: "UCNSMdQtn1SuFzCZjfK2C7dQ" }
];

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim() : "";
}
function getAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? match[1] : "";
}
function parseFeed(xml, channel) {
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return entries.slice(0, 2).map(entry => {
    const videoId = getTag(entry, "yt:videoId");
    const title = getTag(entry, "title");
    const published = getTag(entry, "published");
    const thumbnail = getAttr(entry, "media:thumbnail", "url") || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return {
      title,
      channel: channel.name,
      category: channel.category,
      published,
      videoId,
      thumbnail,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }).filter(v => v.videoId && v.title);
}

exports.handler = async function () {
  const results = await Promise.allSettled(CHANNELS.map(async channel => {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
    const res = await fetch(url, { headers: { "User-Agent":"MotorFeed.no YouTube Reader/1.0", "Accept":"application/xml,text/xml" } });
    if (!res.ok) throw new Error(`${channel.name} svarte med ${res.status}`);
    return parseFeed(await res.text(), channel);
  }));

  const items = results.flatMap(r => r.status === "fulfilled" ? r.value : [])
    .sort((a,b) => new Date(b.published || 0) - new Date(a.published || 0))
    .slice(0, 12);

  return {
    statusCode: 200,
    headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"public, max-age=21600" },
    body: JSON.stringify({ updatedAt:new Date().toISOString(), items })
  };
};
