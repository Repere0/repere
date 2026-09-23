/* CE QUE PESE VRAIMENT UNE PREMIERE VISITE, compression comprise.
 *
 * Pas une estimation depuis la taille des fichiers : un vrai navigateur, un vrai
 * serveur qui gzippe, et le parcours d'un Francilien du debut a la fin —
 * ouverture, choix de la commune, votes du depute, argent, sources.
 *
 * A quoi ca sert : pour le banc de decembre, dix personnes ouvriront Repere sur
 * leur telephone, souvent en 4G. Un chiffre mesure vaut mieux qu'une promesse, et
 * le jour ou une dependance reviendra en douce, ce script le dira.
 *
 * Usage :  node tests/poids.mjs apps/web/dist
 */
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
import { chromium } from "playwright";
const RAC=process.argv[2];
const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json"};
let total=0; const detail=[];
const sv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split("?")[0]);if(u==="/")u="/index.html";const f=path.join(RAC,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end("non");}
 let d=fs.readFileSync(f); const t=T[path.extname(f)]||"application/octet-stream";
 const compressible=/text|json|javascript|svg|manifest/.test(t);
 if(compressible) d=zlib.gzipSync(d,{level:9});
 total+=d.length; detail.push([u,d.length]);
 const h={"content-type":t,"content-length":d.length}; if(compressible)h["content-encoding"]="gzip";
 r.writeHead(200,h); r.end(d);});
await new Promise(r=>sv.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+sv.address().port+"/";
const nav=await chromium.launch(); const page=await nav.newPage({viewport:{width:390,height:900}});
await page.goto(base,{waitUntil:"networkidle"});
const apresOuverture=total;
/* Depuis le 13/09/2026 il n'y a plus d'etape « departement » : on tape la
   commune. La mesure porte donc sur le parcours reel, plus court d'un geste. */
await page.getByLabel(/Où habitez-vous/).fill("Bagnolet");
await page.waitForTimeout(300);
await page.getByRole("button",{name:/^Bagnolet\b/}).click();
await page.waitForTimeout(900);
const apresCommune=total;
await page.getByRole("button",{name:/Comment .* a voté/}).click();
await page.waitForTimeout(1200);
const apresVotes=total;
await page.getByRole("button",{name:"Où va l'argent"}).click(); await page.waitForTimeout(700);
await page.getByRole("button",{name:"Sources"}).click(); await page.waitForTimeout(700);
const ko=n=>(n/1024).toFixed(1)+" Ko";
console.log("ouverture de l'application      :",ko(apresOuverture));
console.log("+ choix de la commune (Bagnolet) :",ko(apresCommune-apresOuverture),"  cumul",ko(apresCommune));
console.log("+ les votes du depute           :",ko(apresVotes-apresCommune),"  cumul",ko(apresVotes));
console.log("+ argent et sources             :",ko(total-apresVotes),"  CUMUL PARCOURS COMPLET",ko(total));
console.log("\nles cinq plus lourds :");
detail.sort((a,b)=>b[1]-a[1]);
for(const [u,n] of detail.slice(0,5)) console.log("  ",ko(n).padStart(10),u);
await nav.close(); sv.close();
