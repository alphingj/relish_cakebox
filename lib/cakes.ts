export type Cake = { id:string; name:string; occasion:string; price:number; image:string; description:string; sizes:string; visible:boolean };
export const SEED_CAKES: Cake[] = [
 {id:"c1",name:"Just Married Wedding Cake",occasion:"Wedding",price:2200,image:"/cakes/wedding.svg",description:"Two-tier white wedding cake with fresh flowers.",sizes:"2 kg, 3 kg, 5 kg",visible:true},
 {id:"c2",name:"Chocolate Truffle Birthday",occasion:"Birthday",price:950,image:"/cakes/truffle.svg",description:"Rich chocolate truffle with glossy ganache.",sizes:"0.5 kg, 1 kg, 2 kg",visible:true},
 {id:"c3",name:"Red Velvet Square",occasion:"Birthday",price:1050,image:"/cakes/redvelvet.svg",description:"Red velvet square cake with cream cheese frosting.",sizes:"1 kg, 1.5 kg, 2 kg",visible:true},
 {id:"c4",name:"Butterscotch Bottle 70th",occasion:"Birthday",price:1400,image:"/cakes/bottle.svg",description:"Butterscotch bottle celebration cake for a 70th birthday.",sizes:"1 kg, 1.5 kg",visible:true},
 {id:"c5",name:"Baptism Table Set",occasion:"Baptism",price:2500,image:"/cakes/baptism.svg",description:"Baptism cake with cupcakes, chocolates and cookies.",sizes:"1 kg set, 2 kg set",visible:true},
 {id:"c6",name:"Heart Anniversary",occasion:"Anniversary",price:1100,image:"/cakes/heart.svg",description:"Heart-shaped anniversary cake with roses.",sizes:"1 kg, 1.5 kg",visible:true},
 {id:"c7",name:"Mermaid Kids Birthday",occasion:"Kids",price:1200,image:"/cakes/mermaid.svg",description:"Generic mermaid theme kids birthday cake. No licensed characters.",sizes:"1 kg, 2 kg",visible:true},
 {id:"c8",name:"Carrot and Dates Box",occasion:"Table Sets",price:850,image:"/cakes/carrot.svg",description:"Homemade carrot and dates cake, baked fresh.",sizes:"0.5 kg, 1 kg",visible:true},
];
