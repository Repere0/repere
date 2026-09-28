/* MESURE DU MOTEUR DE DECOUVERTE — sur ce que la production SERT, pas sur une
 * copie locale.
 *
 *   node mono/scripts/mesure-decouvertes.mjs [url] [AAAA-MM-JJ]
 *
 * Reproduit la regle de lib/faits.js (projet date au 31/12 de son exercice,
 * vote date du scrutin, fait editorial date de sa date ; editorial « france »
 * pour toutes les communes, ou cible par INSEE/departement) et compte, pour
 * chaque commune de la beta Ile-de-France, combien de faits dates tombent dans
 * les 7 / 30 / 90 / 365 derniers jours. Aucun appel a un modele, aucune
 * estimation : des comptes sur des fichiers publies.
 */
const BASE = (process.argv[2] || "https://repereapp.netlify.app").replace(/\/$/, "") + "/data";
const AUJ = process.argv[3] || new Date().toISOString().slice(0, 10);
const IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];
const v = Date.now();
const get = async (p) => { const r = await fetch(`${BASE}/${p}?mesure=${v}`); if (!r.ok) throw new Error(p + " -> " + r.status); return r.json(); };
const jours = (d) => Math.round((Date.parse(AUJ) - Date.parse(d)) / 864e5);

const [catalogue, deputes, evenements, agendaAN, senat, solennels] = await Promise.all([
  get("scrutins.json"), get("deputes.json"), get("evenements.json"),
  get("agenda-an.json"), get("calendrier-senat.json"), get("scrutins-solennels.json"),
]);

const fen = { 7: 0, 30: 0, 90: 0, 365: 0 };
const communesParFen = { 7: 0, 30: 0, 90: 0, 365: 0 };
const parType = { vote: 0, projet: 0, editorial: 0 };
const cov = { communes: 0, maire: 0, circo: 0, depute: 0, votesDepute: 0, projets: 0 };
const dernierFait = {};

for (const dep of IDF) {
  const [paquet, votes, projets] = await Promise.all([
    get(`departments/${dep}.json`), get(`scrutins/${dep}.json`).catch(() => null), get(`projets/${dep}.json`).catch(() => null),
  ]);
  for (const [insee, fiche] of Object.entries(paquet.communes)) {
    cov.communes++;
    if (fiche.maire && fiche.maire.nom) cov.maire++;
    const circos = Array.isArray(fiche.circo) ? fiche.circo : fiche.circo == null ? [] : [fiche.circo];
    if (circos.length) cov.circo++;
    const faits = [];
    let aDepute = false, aVote = false;
    for (const c of circos) {
      const d = deputes.deputes[`${dep}-${c}`];
      if (!d || !d.acteurRef) continue;
      aDepute = true;
      for (const sc of catalogue.scrutins) {
        const pos = votes && votes.positions && votes.positions[sc.n] && votes.positions[sc.n][d.acteurRef];
        if (pos) { aVote = true; faits.push({ t: "vote", d: sc.d }); }
      }
    }
    if (aDepute) cov.depute++;
    if (aVote) cov.votesDepute++;
    const lp = (projets && projets.communes && projets.communes[insee]) || [];
    if (lp.length) cov.projets++;
    for (const p of lp) faits.push({ t: "projet", d: `${p.annee}-12-31` });
    for (const e of evenements.r) {
      if (e.e === "france" || e.insee === insee || e.insee === dep) faits.push({ t: "editorial", d: e.d });
    }
    const ages = faits.map(f => ({ ...f, j: jours(f.d) })).filter(f => f.j >= 0);
    for (const f of ages) parType[f.t]++;
    for (const w of [7, 30, 90, 365]) {
      const n = ages.filter(f => f.j <= w).length;
      fen[w] += n;
      if (n) communesParFen[w]++;
    }
    const plusRecent = ages.reduce((m, f) => (m === null || f.j < m ? f.j : m), null);
    const cle = plusRecent === null ? "aucun" : plusRecent <= 7 ? "<=7j" : plusRecent <= 30 ? "<=30j" : plusRecent <= 90 ? "<=90j" : plusRecent <= 365 ? "<=365j" : ">365j";
    dernierFait[cle] = (dernierFait[cle] || 0) + 1;
  }
}

const aVenir30 = (ev) => (ev.evenements || []).filter(e => { const j = -jours(String(e.debut).slice(0, 10)); return j >= 0 && j <= 30; }).length;
const pc = (a) => `${a} (${Math.round((100 * a) / cov.communes)} %)`;
const dernierSol = solennels.scrutins.map(s => s.date).sort().pop();

console.log(`MESURE au ${AUJ} — ${BASE}`);
console.log(`\nCOUVERTURE (beta IDF, ${cov.communes} communes)`);
console.log(`  maire nomme            : ${pc(cov.maire)}`);
console.log(`  circonscription connue : ${pc(cov.circo)}`);
console.log(`  depute identifie       : ${pc(cov.depute)}`);
console.log(`  votes du depute publies: ${pc(cov.votesDepute)}`);
console.log(`  au moins un projet Etat: ${pc(cov.projets)}`);
console.log(`\nFAITS DATES PAR COMMUNE (somme sur les communes, par type) : vote ${parType.vote}, projet ${parType.projet}, editorial ${parType.editorial}`);
console.log(`\nFENETRES — communes ayant AU MOINS un fait date dans les N derniers jours :`);
for (const w of [7, 30, 90, 365]) console.log(`  ${String(w).padStart(3)} j : ${pc(communesParFen[w])}   (${fen[w]} faits au total)`);
console.log(`\nFAIT LE PLUS RECENT, par commune :`, JSON.stringify(dernierFait));
console.log(`\nNATIONAL (identique pour toutes les communes)`);
console.log(`  faits editoriaux publies : ${evenements.r.length}, le plus recent le ${evenements.r.map(e => e.d).sort().pop()}`);
console.log(`  dernier scrutin solennel : ${dernierSol} (il y a ${jours(dernierSol)} j) ; catalogue des votes par depute : ${catalogue.scrutins.length} scrutins, le plus recent le ${catalogue.scrutins.map(s => s.d).sort().pop()}`);
console.log(`  a venir sous 30 j        : AN ${aVenir30(agendaAN)} seances, Senat ${aVenir30(senat)} evenements (releves le ${agendaAN.source && agendaAN.source.releve_le} / ${senat.source && senat.source.releve_le})`);
