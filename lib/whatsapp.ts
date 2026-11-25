export const WHATSAPP_NUMBER = "919207843867";
export const WHATSAPP_DISPLAY = "+91 92078 43867";
export const PHONE_DISPLAY = "+91 92078 43867";
export const FSSAI = "21320166000450";
export const INSTAGRAM = "https://www.instagram.com/relish_cakebox/";
export const MAPS_URL = "https://google.com/maps/place/Relish+Cakebox/@9.7270354,76.5956257,14.89z/data=!4m6!3m5!1s0x3b07d1862ca2bbf5:0x3cc064c010d4a65c!8m2!3d9.7298125!4d76.6058125!16s%2Fg%2F11td9736b8";
export const ADDRESS = "Pala, Marangattupally, Kottayam – 686635, Kerala";
export const GEO = { lat: 9.7298125, lng: 76.6058125 };
export const PLUS_CODE = "PJH4+W8 Pala, Keralam";
export const DELIVERY_AREAS = ["Marangattupilly","Pala","Cherpunkal","Kadaplamattom","Kidangoor","Other"];
export function waLink(message: string) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
export type Design = { occasion:string; kg:number; customKg?:number; shape:string; flavour:string; colour:string; theme:string; cakeText:string; reference:string; date:string; delivery:string; area:string; name:string; phone:string; priceLabel:string; mode:string };
export function buildDesignerMessage(d: Design) {
  return ["Hi Relish Cakebox, I want to order a custom cake.",`Occasion: ${d.occasion}`,`Size: ${d.kg} kg, ${d.shape}`,`Flavour: ${d.flavour}`,`Theme: ${d.theme}, Colour: ${d.colour}, Text: ${d.cakeText || "-"}`,`Reference Photo: ${d.reference || "I will attach my reference photo here"}`,`Date Needed: ${d.date || "-"}, Delivery: ${d.delivery}${d.area ? ", "+d.area : ""}`,`Name: ${d.name || "-"}, Phone: ${d.phone || "-"}`,`Estimated Price: ${d.priceLabel} (${d.mode})`,`FSSAI Lic. No. ${FSSAI} - for reference`,"Please confirm final price and availability. I will attach my reference photo here."].join("\n");
}
export function buildGalleryMessage(name: string, size = "1kg", date = "") {
  return `Hi Relish Cakebox, I want this cake: ${name}. Photo: ${name}. Size I want: ${size}. Date: ${date || "___"}. Please share price and availability.`;
}
