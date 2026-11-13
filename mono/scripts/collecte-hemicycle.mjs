#!/usr/bin/env node
/* LE PLAN DE L'HEMICYCLE (13/11/2026, decision du porteur : « je te donne une source, extrait les datas
 * pertinentes https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle »).
 *
 * Usage : node scripts/collecte-hemicycle.mjs <dossier de sortie> [<fichier HTML local>]
 *   ex. : node scripts/collecte-hemicycle.mjs ./data
 *
 * POURQUOI CETTE SOURCE. La place de chaque depute dans la salle n'est PAS exploitable depuis l'archive
 * AMO30 : echantillon du 13/11/2026 sur le runner, « placeHemicycle renseignee : 4/401 ». Le plan publie
 * par l'Assemblee, lui, porte les deux faits qu'il faut : la geometrie de chaque siege et le depute qui
 * l'occupe.
 *
 * FORME DE LA SOURCE (echantillon du runner, 13/11/2026, HTTP 200, 388 024 caracteres) :
 *   - un <svg viewBox="0 0 237 164"> qui contient 587 <path>, dont les sieges :
 *         <path transform="matrix(0.28,0,0,0.28,0,0)" d="M384.657 247.488l-7.872 1.863..." class="place" id="p331"/>
 *     les autres paths sont le decor (« Bancs des commissions », le perchoir...) : ils n'ont pas class="place".
 *   - un attribut data-siegeData, du JSON echappe en HTML :
 *         {"410":{"couleur":"<une couleur de groupe, publiee par l-Assemblee>","tooltipUrl":"\/dyn\/embed\/acteur-presentation\/PA1008"}, ...}
 *     numero de siege -> depute (PAxxxx). La couleur publiee par l'Assemblee est LUE ET JETEE : les
 *     couleurs de Repere sont celles de palette.ts (invariant 7), et elles ne viennent jamais d'ailleurs.
 *
 * CE QUI EST PUBLIE : des coordonnees, rien d'autre. Pas le dessin de l'Assemblee, pas ses couleurs,
 * pas de nom (le nom du depute vient deja de deputes-groupes.json).
 *
 * REFUSER PLUTOT QU'ECRASER (skill ingerer-une-source) : sous SIEGES_MIN sieges, ou si moins de
 * PART_OCCUPES d'entre eux portent un depute, le script sort en erreur et n'ecrit rien ; le fichier de
 * la veille reste en place avec sa propre date. Une page qui change de forme rend donc la chaine
 * bruyante, jamais muette.
 *
 * NON VERIFIE SUR LA PAGE REELLE DANS LA SESSION QUI L'A ECRIT : le conteneur ne joint pas
 * assemblee-nationale.fr. Le parseur est eprouve sur un extrait recopie de l'echantillon
 * (tests/hemicycle-plan.test.mjs) ; les seuils ci-dessus protegent si la page change. */
import fs from "node:fs";
import path from "node:path";

export const SOURCE = "https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle";
export const SIEGES_MIN = 500;
export const PART_OCCUPES = 0.9;

/* Les nombres d'un attribut d (SVG), avec leur commande. */
const COMMANDES = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
const nombres = s => (String(s).match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);

/* LE CENTRE D'UN SIEGE. Un siege est un petit polygone ferme ; son centre est la moyenne de ses sommets.
 * Les commandes relatives (l, h, v, c...) obligent a suivre le point courant : un « d » lu de travers
 * placerait des points n'importe ou, en silence. Rend null si le trace n'a aucun sommet. */
export function centreDuTrace(d) {
  let x = 0, y = 0, debutX = 0, debutY = 0, n = 0, sx = 0, sy = 0;
  const point = (px, py) => { sx += px; sy += py; n++; };
  for (const [, cmd, suite] of String(d || "").matchAll(COMMANDES)) {
    const v = nombres(suite), relatif = cmd === cmd.toLowerCase(), c = cmd.toUpperCase();
    if (c === "Z") { x = debutX; y = debutY; continue; }
    if (c === "H" || c === "V") {
      for (const a of v) { if (c === "H") x = relatif ? x + a : a; else y = relatif ? y + a : a; point(x, y); }
      continue;
    }
    /* M/L/T prennent 2 nombres, S/Q 4, C 6, A 7 : seul le dernier couple est le point d'arrivee. */
    const pas = c === "C" ? 6 : c === "S" || c === "Q" ? 4 : c === "A" ? 7 : 2;
    for (let i = 0; i + pas <= v.length; i += pas) {
      const ax = v[i + pas - 2], ay = v[i + pas - 1];
      x = relatif ? x + ax : ax; y = relatif ? y + ay : ay;
      if (c === "M" && i === 0) { debutX = x; debutY = y; }
      point(x, y);
    }
  }
  return n ? { x: sx / n, y: sy / n } : null;
}

/* matrix(a,b,c,d,e,f) applique a un point. Les autres transformations ne sont pas gerees : si la page
 * en introduit une, le siege est ecarte plutot que mal place. */
export function appliquerTransform(t, p) {
  if (!t) return p;
  const m = /matrix\(([^)]*)\)/.exec(String(t));
  if (!m) return null;
  const [a, b, c, d, e, f] = nombres(m[1]);
  if ([a, b, c, d, e, f].some(v => !Number.isFinite(v))) return null;
  return { x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f };
}

const deHtml = s => String(s).replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/* numero de siege -> reference d'acteur (PAxxxx). La couleur de la page est ignoree (invariant 7). */
export function occupantsDuPlan(html) {
  const m = /data-siegeData\s*=\s*"([^"]*)"/i.exec(String(html));
  if (!m) return {};
  let brut;
  try { brut = JSON.parse(deHtml(m[1])); } catch { return {}; }
  const out = {};
  for (const [siege, v] of Object.entries(brut || {})) {
    const ref = /\/(PA\d+)\b/.exec(String((v && v.tooltipUrl) || ""));
    if (ref) out[String(siege)] = ref[1];
  }
  return out;
}

/* Les sieges du plan : [{ n, x, y }] en coordonnees de la page (avant normalisation). */
export function siegesDuPlan(html) {
  const sieges = [];
  for (const [, attrs] of String(html).matchAll(/<path\b([^>]*)\/?>/gi)) {
    if (!/class\s*=\s*"[^"]*\bplace\b/i.test(attrs)) continue;
    const id = /\bid\s*=\s*"p(\d+)"/i.exec(attrs);
    const d = /\bd\s*=\s*"([^"]*)"/i.exec(attrs);
    if (!id || !d) continue;
    const centre = centreDuTrace(d[1]);
    if (!centre) continue;
    const t = /\btransform\s*=\s*"([^"]*)"/i.exec(attrs);
    const p = appliquerTransform(t && t[1], centre);
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    sieges.push({ n: Number(id[1]), x: p.x, y: p.y });
  }
  return sieges;
}

/* LE PLAN NORMALISE. x de -1 (extreme gauche de la salle, vue du perchoir) a 1, y de 0 (bas, cote
 * perchoir) a 1 (haut des gradins) : le meme repere que siegesHemicycle, pour que l'ecran dessine
 * l'un ou l'autre sans rien changer. Les bornes viennent des sieges eux-memes : le creux du perchoir
 * et la forme reelle de la salle sont donc conserves tels quels, sans rien supposer du viewBox. */
export function planNormalise(html) {
  const bruts = siegesDuPlan(html);
  if (!bruts.length) return null;
  const occupants = occupantsDuPlan(html);
  const xs = bruts.map(s => s.x), ys = bruts.map(s => s.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const demi = Math.max((x1 - x0) / 2, 1e-9), haut = Math.max(y1 - y0, 1e-9), milieu = (x0 + x1) / 2;
  const arrondi = v => Math.round(v * 1e4) / 1e4;
  const sieges = bruts
    .sort((a, b) => a.n - b.n)
    .map(s => {
      const o = { n: s.n, x: arrondi((s.x - milieu) / demi), y: arrondi((y1 - s.y) / haut) };
      if (occupants[String(s.n)]) o.acteur = occupants[String(s.n)];
      return o;
    });
  return { sieges, occupes: sieges.filter(s => s.acteur).length };
}

export async function collecter(sortie, htmlLocal) {
  const html = htmlLocal != null ? htmlLocal : await (async () => {
    const r = await fetch(SOURCE, { headers: { "user-agent": "Repere/1.0 (application civique ; contact via le depot)" } });
    if (!r.ok) throw new Error(`plan de l'hemicycle : HTTP ${r.status}`);
    return r.text();
  })();
  const plan = planNormalise(html);
  if (!plan) throw new Error("plan de l'hemicycle : aucun siege lu (la page a change de forme) ; rien n'est ecrit");
  if (plan.sieges.length < SIEGES_MIN) throw new Error(`plan de l'hemicycle : ${plan.sieges.length} sieges lus, moins de ${SIEGES_MIN} ; rien n'est ecrit`);
  const part = plan.occupes / plan.sieges.length;
  if (part < PART_OCCUPES) throw new Error(`plan de l'hemicycle : ${plan.occupes}/${plan.sieges.length} sieges rattaches a un depute (moins de ${Math.round(PART_OCCUPES * 100)} %) ; rien n'est ecrit`);
  const fichier = {
    v: 1,
    genere_le: new Date().toISOString().slice(0, 10),
    source: {
      producteur: "Assemblée nationale",
      licence: "Licence Ouverte 2.0",
      url: SOURCE,
      /* Seules les coordonnees des sieges et le depute de chaque siege sont reprises. */
      note: "Position réelle de chaque siège dans l'hémicycle, relevée sur le plan publié par l'Assemblée nationale.",
    },
    sieges: plan.sieges,
  };
  if (sortie) {
    fs.mkdirSync(sortie, { recursive: true });
    fs.writeFileSync(path.join(sortie, "hemicycle-plan.json"), JSON.stringify(fichier) + "\n");
  }
  return fichier;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const sortie = process.argv[2] || "./data";
  const local = process.argv[3] ? fs.readFileSync(process.argv[3], "utf8") : undefined;
  const f = await collecter(sortie, local);
  console.log(`hemicycle-plan.json : ${f.sieges.length} sieges, ${f.sieges.filter(s => s.acteur).length} rattaches a un depute (source ${f.source.producteur}, ${f.source.licence})`);
}
