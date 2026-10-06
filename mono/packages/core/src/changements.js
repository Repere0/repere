/* @repere/core — CE QUI A CHANGE DEPUIS LA VERSION QUE L'APPAREIL CONNAISSAIT
 * (06/10/2026).
 *
 * LE PRINCIPE : « nouveau » veut dire « absent de la version precedente que ce
 * telephone avait gardee, present dans la publication du jour ». Jamais
 * « nouveau parce que charge », jamais « nouveau parce que recent ». Les deux
 * versions sont des fichiers publics publies par Repere (le cache autorise par
 * l'invariant 2) ; rien d'autre n'est garde, ni date de visite, ni historique.
 *
 * CE QUI PEUT CHANGER POUR UNE COMMUNE, MESURE SUR LES DONNEES DE LA BETA :
 *   - un vote solennel du depute (catalogue de l'Assemblee : nouveau numero) ;
 *   - le maire, le depute (Repertoire national des elus, releve des deputes) ;
 *   - un nouvel exercice de comptes (OFGL, annuel) ;
 *   - un nouveau projet aide par l'Etat (DGCL, annuel).
 * L'agenda du Parlement change chaque jour mais ne concerne pas la commune :
 * il n'est pas une « nouveauté chez vous ».
 *
 * SANS VERSION PRECEDENTE D'UN FICHIER, RIEN N'EST DIT SUR CE QU'IL CONTIENT :
 * premiere visite, cache vide ou efface, reinstallation — l'ecran ne pretend
 * ni « nouveau » ni « rien de nouveau ». */
import { calculerFaits } from "./faits.js";

const cleProjet = p => [p.annee, p.dispositif, p.intitule, p.subvention].join("|");
const nomDepute = d => (d ? [d.prenom, d.nom].filter(Boolean).join(" ") : null);

/* `avant` et `apres` : { fiche, projets, cat, pos, deputes } — chaque champ
   peut manquer. `connus` : les familles pour lesquelles une version precedente
   existait, donc comparees ({ dep, proj, scr, deputes } booleens). */
export function changementsCommune({ commune, dep, avant, apres, connus }) {
  const out = [];
  const fA = avant.fiche, fB = apres.fiche;
  if (!fB) return { compare: false, changements: [] };
  const circos = Array.isArray(fB.circo) ? fB.circo : fB.circo == null ? [] : [fB.circo];

  /* 1. LES VOTES : un numero de scrutin que l'ancien catalogue ne portait pas. */
  if (connus.scr && avant.cat && apres.cat && apres.pos) {
    const deja = new Set((avant.cat.scrutins || []).map(s => s.n));
    const faits = calculerFaits({ dep, fiche: fB, projets: null, commune, cat: apres.cat, pos: apres.pos, deputes: apres.deputes, evenements: null });
    const nouveaux = faits.filter(f => f.type === "vote" && !deja.has(f.sc.n));
    if (circos.length > 1) {
      const n = new Set(nouveaux.map(f => f.sc.n)).size;
      if (n) out.push({ type: "votes", n, quand: nouveaux[0].sc.d });
    } else {
      for (const f of nouveaux) out.push({ type: "vote", fait: f, quand: f.sc.d });
    }
  }

  /* 2. LE MAIRE : deux noms publies, differents. */
  if (connus.dep && fA && fA.maire && fA.maire.nom && fB.maire && fB.maire.nom && fA.maire.nom !== fB.maire.nom) {
    out.push({ type: "maire", avant: fA.maire.nom, apres: fB.maire.nom });
  }

  /* 3. LE DEPUTE : une seule circonscription, deux releves, deux noms. */
  if (connus.deputes && circos.length === 1 && avant.deputes && apres.deputes) {
    const k = dep + "-" + circos[0];
    const a = nomDepute((avant.deputes.deputes || {})[k]), b = nomDepute((apres.deputes.deputes || {})[k]);
    if (a && b && a !== b) out.push({ type: "depute", avant: a, apres: b, circo: circos[0] });
  }

  /* 4. LES COMPTES : une annee publiee qui ne l'etait pas. */
  if (connus.dep && fA && fA.comptes && fB.comptes) {
    for (const an of Object.keys(fB.comptes).filter(an => !(an in fA.comptes)).sort()) out.push({ type: "comptes", an });
  }

  /* 5. LES PROJETS : un projet que l'ancien fichier ne portait pas. */
  if (connus.proj && avant.projets && apres.projets) {
    const liste = x => (x && x.communes && Array.isArray(x.communes[commune]) ? x.communes[commune] : []);
    const deja = new Set(liste(avant.projets).map(cleProjet));
    for (const p of liste(apres.projets).filter(p => !deja.has(cleProjet(p)))) out.push({ type: "projet", p });
  }

  return { compare: Object.values(connus).some(Boolean), changements: out };
}
