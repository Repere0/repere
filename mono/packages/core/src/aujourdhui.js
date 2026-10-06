/* @repere/core — « AUJOURD'HUI », DERIVE SANS INTERFACE (29/09/2026).
 *
 * Deplace depuis apps/web/src/lib/useAujourdhui.js : le crochet React du web
 * CHARGE les fichiers ; cette fonction DERIVE, a partir de ce qui a ete charge,
 * tout ce que l'ecran « Aujourd'hui » affiche. L'application mobile appelle la
 * meme fonction : la reponse a « que s'est-il decide pres de chez vous ? » ne
 * peut pas differer selon l'appareil.
 *
 * `maintenant` (Date, facultatif) sert aux tests : par defaut, l'instant present.
 * `rapports` du resultat est la version TEXTE (voir comptes.js) ; le web la
 * remplace par sa version habillee. */
import { calculerFaits } from "./faits.js";
import { rapports, dernierExercice } from "./comptes.js";
import { dateFr } from "./format.js";

export function deriverAujourdhui({ fiche, commune, dep, index, projets, cat, pos, deputes, cal, agendaAN, evenements, maintenant: instant }) {
  const now = instant instanceof Date ? instant : new Date();
  const nomCommune = fiche.nom || "";
  const faits = calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes, evenements });
  const base = (cat && cat.url_scrutin) || "";
  const dernierVote = faits.find(f => f.type === "vote" && f.position);
  const dernierFait = faits[0];

  const agregats = (index && index.agregats) || [];
  const srcComptes = index && index.sources ? index.sources.comptes : null;
  const srcProjets = (index && index.sources && index.sources.projets) || null;
  const srcScrutins = (cat && cat.source) || null;
  const exercice = dernierExercice(fiche, agregats);
  const rr = exercice ? rapports(exercice.ex) : [];
  const rapportDette = rr[0];

  /* CE QUI ARRIVE : SENAT ET ASSEMBLEE, PAS LE SENAT SEUL — 28/09/2026.
   * Mesure en production ce jour-la : « Qu'est-ce qui arrive ? » n'affichait
   * qu'une audition de commission du Senat, parce que ce hook ne chargeait
   * que le calendrier du Senat. Les 30 seances publiques de l'Assemblee des
   * 30 jours suivants — dont l'ouverture de la session ordinaire — etaient
   * invisibles sur l'ecran qui pose la question. Meme fusion que
   * Calendrier.jsx : chaque evenement porte son institution et sa source,
   * posees ici, jamais dans le fichier de l'autre institution.
   * `prochain` et `srcCal` restent exposes pour les deux prototypes
   * (AujourdhuiJournal, AujourdhuiTerritoire), qui n'en lisent qu'un. */
  const maintenant = now.toISOString().slice(0, 16);
  const dansSeptJours = new Date(now.getTime() + 7 * 864e5).toISOString().slice(0, 16);
  const aVenir = [];
  for (const [inst, donnees] of [["Sénat", cal], ["Assemblée nationale", agendaAN]]) {
    if (!donnees || !Array.isArray(donnees.evenements)) continue;
    for (const e of donnees.evenements) {
      if (e.debut + ":00" >= maintenant + ":00") aVenir.push({ ...e, institution: inst, source: donnees.source || {} });
    }
  }
  aVenir.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));
  /* LES SEANCES PUBLIQUES D'ABORD — 28/09/2026. Mesure : la semaine du 28/09
     affichait trois auditions de commission du Senat, et l'ouverture de la
     session de l'Assemblee (jeudi) etait coupee par la limite de trois. La
     categorie vient des deux fichiers sources, rien n'est interprete ; l'ecran
     ecrit la regle (principe P4), et les trois retenus restent dans l'ordre
     du calendrier. */
  const semaine = aVenir.filter(e => e.debut <= dansSeptJours);
  const estSeance = e => /^Séance publique$/.test(e.categorie || "");
  const cetteSemaine = [...semaine.filter(estSeance), ...semaine.filter(e => !estSeance(e))]
    .slice(0, 3)
    .sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));
  const prochains = cetteSemaine.length ? cetteSemaine : aVenir.slice(0, 1);
  const prochain = aVenir[0];
  const srcCal = (prochain && prochain.source) || (cal && cal.source) || {};

  /* POUR DIRE QUI, ET POURQUOI CE VOTE ME CONCERNE — 28/09/2026. Mesure en
     production : la reponse a « Que s'est-il decide pres de chez vous ? » est
     un vote national du depute pour 1 257 communes sur 1 262, sans que l'ecran
     dise que c'est LE depute de la circonscription du lecteur ; et le projet
     finance par l'Etat DANS la commune, seul fait reellement local, n'etait
     montre que pour 2 des 778 communes qui en ont un. Rien de nouveau n'est
     calcule ici : le nombre de circonscriptions vient de la fiche, le nom du
     departement de l'index, le projet de lib/faits.js. */
  const nbCircos = Array.isArray(fiche.circo) ? fiche.circo.length : (fiche.circo == null ? 0 : 1);
  const depIndex = index && Array.isArray(index.departements) ? index.departements.find(x => x.code === dep) : null;
  const nomDep = depIndex ? depIndex.nom : "";
  const dernierProjet = faits.find(f => f.type === "projet");

  return {
    pret: true, fiche, nomCommune, dep, base, faits, nbCircos, nomDep, dernierProjet,
    dernierVote, dernierFait, exercice, rapportsComptes: rr, rapportDette,
    prochain, prochains, prochainsDansLaSemaine: cetteSemaine.length > 0,
    semaineSelectionnee: semaine.length > cetteSemaine.length, semaineTotal: semaine.length,
    seancesMontrees: cetteSemaine.filter(estSeance).length,
    srcComptes, srcProjets, srcScrutins, srcCal,
  };
}

/* CE QUE L'ECRAN « AU PARLEMENT » MONTRE, DIT TEL QUEL — 06/10/2026.
 * L'application mobile ecrivait « voici les séances publiques » des que la
 * semaine comptait plus de trois rendez-vous. Or quand la semaine a moins de
 * trois seances, la selection est completee par des commissions : la phrase
 * nommait « séances publiques » des reunions qui n'en sont pas. La phrase se
 * calcule maintenant sur ce qui est reellement montre. « Séance publique » est
 * la categorie ecrite par l'Assemblee et le Senat dans leurs agendas : la
 * phrase le leur attribue, Repere ne classe rien lui-meme. */
export function phraseSemaineParlement(d) {
  if (!d || !d.prochainsDansLaSemaine) return "Le prochain rendez-vous annoncé au Parlement :";
  const n = d.prochains.length;
  const k = d.seancesMontrees || 0;
  const total = `${d.semaineTotal} rendez-vous annoncé${d.semaineTotal > 1 ? "s" : ""} au Parlement cette semaine`;
  if (!d.semaineSelectionnee) return `${total}.`;
  if (k === n) return `${total}. Voici les ${n} premiers que l'Assemblée nationale et le Sénat classent en séance publique.`;
  if (k === 0) return `${total}. Aucun n'est classé en séance publique par l'Assemblée nationale ou le Sénat ; voici les ${n} premiers.`;
  return `${total}. Voici ${k === 1 ? "le seul" : `les ${k}`} que l'Assemblée nationale et le Sénat classent en séance publique, puis ${n - k === 1 ? "le premier autre rendez-vous" : `les ${n - k} premiers autres rendez-vous`}.`;
}


/* UN CALENDRIER QUI N'EST PLUS RELEVE (06/10/2026). L'agenda de l'Assemblee
 * et celui du Senat sont releves chaque jour par la chaine. Si la collecte
 * s'arrete, l'ecran continuerait de compter « cette semaine » sur un releve
 * perime, sans le dire (la date n'etait que dans la feuille de source). Au-dela
 * de `seuilJours`, la phrase le dit, avec la date ; sans date, rien n'est
 * affirme ici (la feuille de source le dit deja). */
export function releveAncien(releve, maintenant, seuilJours = 2) {
  if (!releve) return null;
  const t = Date.parse(String(releve).slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  const jours = Math.floor((maintenant.getTime() - t) / 864e5);
  if (jours <= seuilJours) return null;
  return `Calendrier relevé le ${dateFr(String(releve).slice(0, 10))} : des séances ont pu être ajoutées, déplacées ou annulées depuis.`;
}
