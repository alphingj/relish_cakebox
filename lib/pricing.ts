export type FixedPrice = { id:string; cakeName:string; kg:number; price:number; available:boolean };
export type PricingConfig = { basePerKg:number; flavourExtra:Record<string,number>; shapeExtra:Record<string,number>; themeExtra:Record<string,number>; deliveryFee:number; freeDeliveryThreshold:number; variancePct:number; tableSetBase:number };
export const FLAVOURS = ["Chocolate Truffle","Butterscotch","Red Velvet","Ferrero Rocher","Carrot and Dates","Vanilla","Pineapple","Black Forest"];
export const SHAPES = ["Round","Square","Heart","Number","2-Tier","3-Tier"];
export const THEMES = ["Classic Roses","Wedding Floral","Kids Mermaid","Bottle Celebration","Dosa Novelty","Baptism Dove","Heart Anniversary","Photo Cake"];
export const OCCASIONS = ["Birthday","Wedding / Engagement","Anniversary","Baptism / First Holy Communion","Baby Shower","Other"];
export const SIZES = [{kg:0.5,shapes:["Round"],serves:"4-6"},{kg:1,shapes:["Round","Square","Heart"],serves:"8-10"},{kg:1.5,shapes:["Round","Square","Heart"],serves:"12-15"},{kg:2,shapes:["Round","Square"],serves:"18-22"},{kg:3,shapes:["Round","2-Tier"],serves:"28-32"},{kg:4,shapes:["2-Tier"],serves:"38-42"},{kg:5,shapes:["2-Tier","3-Tier"],serves:"50+"}];
export const DEFAULT_PRICING: PricingConfig = { basePerKg:800, flavourExtra:{"Chocolate Truffle":200,"Butterscotch":100,"Red Velvet":250,"Ferrero Rocher":300,"Carrot and Dates":50,"Vanilla":0,"Pineapple":50,"Black Forest":150}, shapeExtra:{Round:0,Square:100,Heart:150,Number:250,"2-Tier":500,"3-Tier":900}, themeExtra:{"Classic Roses":100,"Wedding Floral":300,"Kids Mermaid":200,"Bottle Celebration":250,"Dosa Novelty":400,"Baptism Dove":150,"Heart Anniversary":100,"Photo Cake":200}, deliveryFee:100, freeDeliveryThreshold:2000, variancePct:15, tableSetBase:2500 };
export const DEFAULT_FIXED: FixedPrice[] = [{id:"f1",cakeName:"Chocolate Truffle",kg:1,price:950,available:true},{id:"f2",cakeName:"Butterscotch",kg:1,price:900,available:true},{id:"f3",cakeName:"Red Velvet",kg:1,price:1050,available:true},{id:"f4",cakeName:"Carrot and Dates",kg:1,price:850,available:true},{id:"f5",cakeName:"Wedding White",kg:2,price:2200,available:true}];
export function findFixed(fixed:FixedPrice[], flavour:string, kg:number){ return fixed.find(f=>f.available && f.kg===kg && f.cakeName.toLowerCase()===flavour.toLowerCase()) ?? null; }
export type Breakdown = { label:string; amount:number }[];
export function calcCustom(cfg:PricingConfig, o:{kg:number;flavour:string;shape:string;theme:string;delivery:string}){
  const lines:Breakdown = [{label:`Base ${cfg.basePerKg} x ${o.kg} kg`,amount:cfg.basePerKg*o.kg},{label:`Flavour extra x ${o.kg} kg`,amount:(cfg.flavourExtra[o.flavour]??0)*o.kg},{label:`Shape: ${o.shape}`,amount:cfg.shapeExtra[o.shape]??0},{label:`Theme: ${o.theme}`,amount:cfg.themeExtra[o.theme]??0}];
  const subtotal = lines.reduce((s,l)=>s+l.amount,0);
  const delivery = o.delivery==="Delivery" ? (subtotal>=cfg.freeDeliveryThreshold?0:cfg.deliveryFee) : 0;
  lines.push({label: o.delivery==="Delivery" ? (delivery===0?"Delivery (free)":"Delivery") : "Pickup", amount:delivery});
  const estimate = subtotal+delivery;
  const low = Math.round(estimate*(1-cfg.variancePct/100)); const high = Math.round(estimate*(1+cfg.variancePct/100));
  return { lines, estimate, low, high, range:`Rs ${low.toLocaleString("en-IN")} - Rs ${high.toLocaleString("en-IN")}` };
}
export const inr = (n:number)=>`Rs ${n.toLocaleString("en-IN")}`;
