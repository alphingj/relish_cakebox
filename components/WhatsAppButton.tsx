import { waLink } from "@/lib/whatsapp";
export default function WhatsAppButton({message,label="Order on WhatsApp",className=""}:{message:string;label?:string;className?:string}){ return <a href={waLink(message)} target="_blank" rel="noreferrer" className={`btn btn-wa ${className}`}>{label}</a> }
