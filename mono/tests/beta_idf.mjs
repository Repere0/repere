/* LA BETA ILE-DE-FRANCE, PARCOURUE EN ENTIER — huit departements, une commune
 * reelle dans chacun, les trois ecrans.
 *
 * CE N'EST PAS UN BANC : il ne dit pas oui ou non, il imprime un tableau qu'un
 * humain relit. C'est volontaire. Les defauts les plus couteux de ce projet ont
 * tous ete trouves a l'oeil sur capture, jamais par une assertion — le nom de
 * commune mal orthographie, Paris sans depute, l'ecran Sources qui oubliait un
 * producteur. Les assertions gardent ce qu'on sait deja ; ce script sert a voir
 * ce qu'on ne sait pas encore.
 *
 * Ce qu'il releve par departement : le nombre de deputes nommes, la presence du
 * maire, les trous de l'ecran « Ou va l'argent », la source de l'Assemblee, et
 * toute erreur JavaScript. Les captures des departements 77 et 91 sont ecrites
 * dans /tmp pour etre relues.
 *
 * Usage :  node tests/beta_idf.mjs apps/web/dist
 */
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const RAC=process.argv[2];
const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json"};
const sv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split("?")[0]);if(u==="/")u="/index.html";const f=path.join(RAC,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end("non");}
 const d=fs.readFileSync(f);r.writeHead(200,{"content-type":T[path.extname(f)]||"application/octet-stream","content-length":d.length});r.end(d);});
await new Promise(r=>sv.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+sv.address().port+"/";
const CAS=[["75","Paris","Paris"],["77","Seine-et-Marne","Meaux"],["78","Yvelines","Versailles"],
 ["91","Essonne","Évry-Courcouronnes"],["92","Hauts-de-Seine","Nanterre"],["93","Seine-Saint-Denis","Saint-Denis"],
 ["94","Val-de-Marne","Créteil"],["95","Val-d'Oise","Cergy"]];
const nav=await chromium.launch();
for (const [dep,nomdep,commune] of CAS){
  const ctx=await nav.newContext({viewport:{width:390,height:1400}});
  const page=await ctx.newPage(); const err=[];
  page.on("pageerror",e=>err.push(String(e)));
  page.on("console",m=>{if(m.type()==="error")err.push("console: "+m.text().slice(0,120));});
  await page.goto(base,{waitUntil:"networkidle"});
  await page.getByLabel(/Votre département/).fill(nomdep);
  const b=page.getByRole("button",{name:new RegExp("^"+dep+" ")});
  if(!await b.count()){console.log(`${dep} ECHEC : departement introuvable dans la recherche « ${nomdep} »`);await ctx.close();continue;}
  await b.click();
  await page.getByLabel(/Votre commune/).fill(commune);
  const c=page.getByRole("button",{name:commune,exact:true});
  if(!await c.count()){console.log(`${dep} ECHEC : commune « ${commune} » introuvable`);await ctx.close();continue;}
  await c.click(); await page.waitForTimeout(700);
  const nbDep=await page.getByRole("button",{name:/Comment .* a voté/}).count();
  const txtQD=await page.evaluate(()=>document.body.innerText);
  const maire=/Maire\s*\n?\s*\S/.test(txtQD)|| txtQD.includes("Maire");
  await page.getByRole("button",{name:"Où va l'argent"}).click(); await page.waitForTimeout(700);
  const txtA=await page.evaluate(()=>document.body.innerText);
  const vides=(txtA.match(/ne porte pas|n'a pas|indisponible|manquant/gi)||[]).length;
  await page.getByRole("button",{name:"Sources"}).click(); await page.waitForTimeout(500);
  const txtS=await page.evaluate(()=>document.body.innerText);
  const srcScrutins=/Assemblée nationale/.test(txtS);
  console.log(`${dep} ${commune.padEnd(22)} deputes:${String(nbDep).padStart(2)}  maire:${maire?"oui":"NON"}  argent-vides:${vides}  source-AN:${srcScrutins?"oui":"NON"}  erreursJS:${err.length}${err.length?" -> "+err[0]:""}`);
  if(dep==="91"||dep==="77") await page.screenshot({path:`/tmp/idf-${dep}.png`,fullPage:true});
  await ctx.close();
}
await nav.close(); sv.close();
