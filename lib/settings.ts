export type SiteSettings = {
  site: { name:string; tagline:string; phoneDisplay:string; instagram:string; facebook:string; mapsUrl:string; fssai:string; address:string; malayalamLine:string };
  home: { heroTitle:string; heroSubtitle:string; heroImage:string; carousel:{url:string;caption:string}[]; howTitle:string; steps:{title:string;text:string}[]; deliveryTitle:string; deliveryText:string };
  gallery: { title:string; subtitle:string };
  designer: { title:string; subtitle:string; occasions:string[]; colours:string[]; sizes:{kg:number;shapes:string;serves:string}[] };
  tableSets: { title:string; intro:string; image:string; inclusions:string[]; cta:string };
  about: { title:string; intro:string; faq:{q:string;a:string}[] };
  footer: { text:string };
};
export const DEFAULT_SETTINGS: SiteSettings = {
  site:{ name:"Relish Cakebox", tagline:"Custom cakes baked with love in Marangattupilly", phoneDisplay:"+91 92078 43867", instagram:"https://www.instagram.com/relish_cakebox/", facebook:"https://www.facebook.com/relishcakebox", mapsUrl:"https://google.com/maps/place/Relish+Cakebox/@9.7270354,76.5956257,14.89z/data=!4m6!3m5!1s0x3b07d1862ca2bbf5:0x3cc064c010d4a65c!8m2!3d9.7298125!4d76.6058125!16s%2Fg%2F11td9736b8", fssai:"21320166000450", address:"Pala, Marangattupilly, Kottayam – 686635, Kerala", malayalamLine:"സ്നേഹത്തോടെ ബേക്ക് ചെയ്തത് — baked with love" },
  home:{ heroTitle:"Relish Cakebox", heroSubtitle:"Custom cakes baked with love in Marangattupilly", heroImage:"", carousel:[], howTitle:"How it works", steps:[{title:"1. Design or pick",text:"Choose a gallery cake or build your own in the Designer."},{title:"2. See estimate",text:"Fixed price for standard cakes, or a clear range with breakdown for custom builds."},{title:"3. Send on WhatsApp",text:"Your full design opens in WhatsApp. Owner confirms final price."}], deliveryTitle:"Delivery areas", deliveryText:"Marangattupilly, Pala, Cherpunkal, Kadaplamattom, Kidangoor and nearby. Custom orders need advance booking." },
  gallery:{ title:"Gallery — cakes we have made", subtitle:"Real cakes from Relish Cakebox. Tap a cake to order it on WhatsApp." },
  designer:{ title:"Design Your Cake", subtitle:"Five quick steps. Send it on WhatsApp in under 2 minutes.", occasions:["Birthday","Wedding / Engagement","Anniversary","Baptism / First Holy Communion","Baby Shower","Other"], colours:["Terracotta","White and Gold","Chocolate","Pink","Pastel","Custom"], sizes:[{kg:0.5,shapes:"Round",serves:"4-6"},{kg:1,shapes:"Round / Square / Heart",serves:"8-10"},{kg:1.5,shapes:"Round / Square / Heart",serves:"12-15"},{kg:2,shapes:"Round / Square",serves:"18-22"},{kg:3,shapes:"Round / 2-Tier",serves:"28-32"},{kg:4,shapes:"2-Tier",serves:"38-42"},{kg:5,shapes:"2-Tier / 3-Tier",serves:"50+"}] },
  tableSets:{ title:"Table Sets", intro:"A full table for your event: one main cake plus cupcakes, chocolates and cookies, matched to your theme. Popular for Baptism, First Holy Communion and birthdays.", image:"", inclusions:["Main custom cake (your flavour, size and theme)","Cupcakes matched to the cake","Homemade chocolates","Cookies"], cta:"Design your table set cake" },
  about:{ title:"About Relish Cakebox", intro:"Relish Cakebox bakes customised cakes and table sets for all occasions in Marangattupilly, near Pala, Kottayam. Cakes baked with love, made to order — advance booking needed.", faq:[{q:"How do I order a cake?",a:"Design your cake on this site or pick one from the Gallery, then send it on WhatsApp. The owner confirms final price and availability. No online payment."},{q:"How much does a 1 kg cake cost?",a:"Standard 1 kg cakes are fixed price (for example Chocolate Truffle Rs 950). Custom cakes show an estimated range with a full breakdown in the Designer."},{q:"Do you deliver?",a:"Yes, delivery is available in Marangattupilly, Pala, Cherpunkal, Kadaplamattom and Kidangoor. Custom orders need advance booking."}] },
  footer:{ text:"FSSAI Registered · Cakes baked with love" },
};
export const SETTINGS_KEY = "relish_settings_v1";
export function mergeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!raw) return DEFAULT_SETTINGS;
  return { site:{...DEFAULT_SETTINGS.site,...raw.site}, home:{...DEFAULT_SETTINGS.home,...raw.home}, gallery:{...DEFAULT_SETTINGS.gallery,...raw.gallery}, designer:{...DEFAULT_SETTINGS.designer,...raw.designer}, tableSets:{...DEFAULT_SETTINGS.tableSets,...raw.tableSets}, about:{...DEFAULT_SETTINGS.about,...raw.about}, footer:{...DEFAULT_SETTINGS.footer,...raw.footer} };
}
export function isUploadedImage(url: string) { return !!url && (url.startsWith("https://") || url.startsWith("http://") || url.startsWith("data:image/")); }
