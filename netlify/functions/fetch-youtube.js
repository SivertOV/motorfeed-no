const CHANNELS = [
  { name: "Top Gear", category: "Bil", channelId: "UCjOl2AUblVmg2rA_cRgZkFg", weight: 88 },
  { name: "carwow", category: "Bil", channelId: "UCUhFaUpnq31m6TNX2VKVSVA", weight: 90 },
  { name: "Doug DeMuro", category: "Bil", channelId: "UCsqjHFMB_JYTaEnf_vmTNqg", weight: 84 },
  { name: "Fully Charged Show", category: "Elbil", channelId: "UCzz4CoEgSgWNs9ZAvRMhW2A", weight: 86 },
  { name: "Bjørn Nyland", category: "Elbil", channelId: "UCG1QcV31eoSaX4rE8avQL4A", weight: 92 },
  { name: "FortNine", category: "MC", channelId: "UCNSMdQtn1SuFzCZjfK2C7dQ", weight: 92 }
];

const MOTOR_TERMS = ["car","cars","bmw","tesla","ev","electric","vehicle","drive","review","motorcycle","bike","riding","helmet","adventure","touring","porsche","ferrari","toyota","mercedes","audi","volvo","polestar","range","charging","truck","suv","supercar"];
function getTag(xml,tag){const m=xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,"i"));return m?m[1].replace(/&amp;/g,"&").replace(/&quot;/g,'"').trim():"";}
function getAttr(xml,tag,attr){const m=xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`,"i"));return m?m[1]:"";}
function relevant(title, channel){const t=String(title).toLowerCase();return channel.weight>88 || MOTOR_TERMS.some(x=>t.includes(x));}
function parseFeed(xml,channel){
  const entries=xml.match(/<entry[\s\S]*?<\/entry>/gi)||[];
  return entries.slice(0,3).map(entry=>{
    const videoId=getTag(entry,"yt:videoId");
    const title=getTag(entry,"title");
    const published=getTag(entry,"published");
    const thumbnail=getAttr(entry,"media:thumbnail","url")||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const score=channel.weight+(Date.now()-new Date(published).getTime()<7*24*3600*1000?8:0);
    return {title,channel:channel.name,category:channel.category,published,videoId,thumbnail,url:`https://www.youtube.com/watch?v=${videoId}`,score};
  }).filter(v=>v.videoId&&v.title&&relevant(v.title,channel));
}
exports.handler = async function(){
  const results=await Promise.allSettled(CHANNELS.map(async channel=>{
    const url=`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
    const res=await fetch(url,{headers:{"User-Agent":"MotorFeed.no V5 YouTube Reader/1.0","Accept":"application/xml,text/xml"}});
    if(!res.ok) throw new Error(`${channel.name} svarte med ${res.status}`);
    return parseFeed(await res.text(),channel);
  }));
  const items=results.flatMap(r=>r.status==="fulfilled"?r.value:[])
    .sort((a,b)=>(b.score-a.score)||(new Date(b.published||0)-new Date(a.published||0))).slice(0,12);
  return {statusCode:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=21600"},body:JSON.stringify({version:"V5",updatedAt:new Date().toISOString(),items})};
};