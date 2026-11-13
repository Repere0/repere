#!/usr/bin/env node
/* DECRIRE AVANT DE DEVINER (skill ingerer-une-source) — 13/11/2026.
 * Le conteneur des agents ne joint ni assemblee-nationale.fr ni senat.fr. Ce script tourne sur le runner et ECRIT
 * DANS LE JOURNAL la forme de trois sources, pour que le code qui les lit ne suppose rien :
 *   1. le plan de l'hemicycle de l'Assemblee (place de chaque depute) ;
 *   2. la place de l'hemicycle dans l'archive AMO30 deja telechargee ;
 *   3. la liste des senateurs publiee par le Senat.
 * Il n'ecrit aucun fichier et ne fait jamais echouer la chaine. */
import fs from "node:fs";
import path from "node:path";
const UA = "Repere/1.0 (application civique ; donnees publiques ; https://repereapp.netlify.app)";
const lire = async url => { const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(45000) }); return { ok: r.ok, statut: r.status, type: r.headers.get("content-type"), texte: await r.text() }; };
const titre = t => console.log("\n===== ECHANTILLON : " + t + " =====");

async function hemicycle() {
  titre("plan de l'hemicycle (assemblee-nationale.fr/dyn/vos-deputes/hemicycle)");
  const r = await lire("https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle");
  const h = r.texte;
  console.log(`HTTP ${r.statut}, ${r.type}, ${h.length} caracteres ; <svg : ${(h.match(/<svg/g) || []).length} ; <path : ${(h.match(/<path/g) || []).length} ; <circle : ${(h.match(/<circle/g) || []).length} ; <a  : ${(h.match(/<a /g) || []).length}`);
  const attrs = new Map();
  for (const m of h.matchAll(/\s(data-[a-z0-9-]+)=/gi)) attrs.set(m[1], (attrs.get(m[1]) || 0) + 1);
  console.log("attributs data-* : " + JSON.stringify([...attrs].sort((a, b) => b[1] - a[1]).slice(0, 30)));
  for (const motif of [/<svg[^>]*>/i, /data-place[^>]*>/i, /id="p\d+/i, /hemicycle[^"']*\.(svg|json|js)/i, /PA\d{3,}/]) {
    const m = h.match(motif);
    console.log(`motif ${motif} : ` + (m ? JSON.stringify(h.slice(Math.max(0, m.index - 300), m.index + 900)) : "ABSENT"));
  }
  const scripts = [...h.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(s => /hemi|depute|plan/i.test(s));
  console.log("scripts lies au plan : " + JSON.stringify(scripts.slice(0, 10)));
  const json = [...h.matchAll(/["'](\/[^"']*(?:hemicycle|places?)[^"']*)["']/gi)].map(m => m[1]);
  console.log("adresses contenant hemicycle/place : " + JSON.stringify([...new Set(json)].slice(0, 20)));
}

function amo() {
  titre("place de l'hemicycle dans AMO30 (data/brut_AMO30)");
  const racine = "data/brut_AMO30";
  if (!fs.existsSync(racine)) { console.log("archive absente : " + racine); return; }
  const fichiers = [];
  const parcourir = d => { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) parcourir(f); else if (/PA\d+\.json$/.test(n)) fichiers.push(f); if (fichiers.length > 400) return; } };
  parcourir(racine);
  console.log(fichiers.length + " fichiers d'acteurs lus (plafond 400) ; exemple : " + fichiers[0]);
  let vus = 0, avecPlace = 0, exemple = null;
  for (const f of fichiers) {
    const t = fs.readFileSync(f, "utf8"); vus++;
    const m = t.match(/"placeHemicycle"\s*:\s*("?[^,}\n]*)/);
    if (m && !/null/.test(m[1])) { avecPlace++; if (!exemple) { const i = t.indexOf('"placeHemicycle"'); exemple = f + " : " + t.slice(Math.max(0, i - 500), i + 200).replace(/\s+/g, " "); } }
  }
  console.log(`placeHemicycle renseignee : ${avecPlace}/${vus}`);
  console.log("exemple : " + exemple);
}

async function senat() {
  for (const url of ["https://www.senat.fr/api-senat/senateurs.json", "https://data.senat.fr/data/senateurs/ODSEN_GENERAL.json", "https://data.senat.fr/les-senateurs/"]) {
    titre("Senat : " + url);
    try {
      const r = await lire(url);
      console.log(`HTTP ${r.statut}, ${r.type}, ${r.texte.length} caracteres`);
      if (/json/.test(r.type || "") || /^\s*[\[{]/.test(r.texte)) {
        const j = JSON.parse(r.texte); const liste = Array.isArray(j) ? j : (j.results || j.senateurs || Object.values(j)[0]);
        console.log("forme : " + (Array.isArray(j) ? "tableau de " + j.length : "objet, cles " + JSON.stringify(Object.keys(j).slice(0, 12))));
        if (Array.isArray(liste)) {
          console.log("premier element : " + JSON.stringify(liste[0]).slice(0, 1500));
          const g = new Map(); for (const s of liste) { const k = JSON.stringify(s.groupe ?? s.Groupe_politique ?? null); g.set(k, (g.get(k) || 0) + 1); }
          console.log("groupes : " + JSON.stringify([...g]).slice(0, 2500));
        }
      } else console.log("debut : " + JSON.stringify(r.texte.slice(0, 1200)) + "\nliens .csv/.json : " + JSON.stringify([...new Set([...r.texte.matchAll(/href="([^"]+\.(?:csv|json|zip))"/g)].map(m => m[1]))].slice(0, 25)));
    } catch (e) { console.log("ECHEC : " + e.message); }
  }
  titre("Senat : plan de l'hemicycle (senat.fr)");
  try { const r = await lire("https://www.senat.fr/senateurs/hemicycle.html"); console.log(`HTTP ${r.statut}, ${r.texte.length} caracteres ; <svg : ${(r.texte.match(/<svg/g) || []).length} ; area : ${(r.texte.match(/<area/g) || []).length}`); const m = r.texte.match(/<area[^>]*>/i) || r.texte.match(/<svg[^>]*>/i); console.log(m ? JSON.stringify(r.texte.slice(m.index, m.index + 900)) : "ni <area ni <svg"); } catch (e) { console.log("ECHEC : " + e.message); }
}

for (const f of [hemicycle, amo, senat]) { try { await f(); } catch (e) { console.log("ECHANTILLON EN ECHEC (" + f.name + ") : " + e.message); } }
