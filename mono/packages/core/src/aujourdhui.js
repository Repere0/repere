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

/* LA SEMAINE AU PARLEMENT, JOUR PAR JOUR — 07/10/2026 (refonte « Aujourd'hui »).
   Sept jours a partir d'aujourd'hui (heure de Paris, comme l'agenda), et pour
   chacun le nombre de seances publiques annoncees, par institution. Rien n'est
   interprete : la categorie « Seance publique » vient des fichiers sources.
   LES VOTES SOLENNELS ANNONCES viennent de l'ordre du jour publie (le titre de la
   seance, ou les points de « Egalement a l'ordre du jour »), mot pour mot : un
   point qui commence par « Vote solennel » est retenu, rien d'autre. Ils passent
   en premier sur l'ecran, et la regle y est ecrite (principe P4).
   Une institution absente (fichier non arrive) n'est comptee nulle part : c'est
   `institutions` qui dit lesquelles ont ete lues. */
export function jourParis(d) {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
/* L'INSTANT PRESENT A L'HEURE DE PARIS, AU FORMAT DES AGENDAS — 07/10/2026.
   Les seances sont publiees a l'heure de Paris (« 2026-10-07T14:00 ») ; elles
   etaient comparees a `toISOString()`, qui est l'heure UTC. A 15 h 30 a Paris
   (13 h 30 UTC), une seance de 14 h passait encore pour « a venir » : deux
   heures de retard l'ete, une l'hiver, sur Aujourd'hui et dans le calendrier.
   Ici, l'heure de Paris, changement d'heure compris, sans dependre du fuseau
   de l'appareil. */
export function minuteParis(d) {
  const p = {};
  for (const x of new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d)) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function semaineParlement({ cal, agendaAN, maintenant }) {
  const now = maintenant instanceof Date ? maintenant : new Date();
  const jours = [];
  for (let i = 0; i < 7; i++) jours.push({ date: jourParis(new Date(now.getTime() + i * 864e5)), seances: 0, parInstitution: {} });
  const premier = jours[0].date, dernier = jours[6].date;
  const institutions = [];
  const votesSolennels = [];
  for (const [inst, donnees] of [["Assemblée nationale", agendaAN], ["Sénat", cal]]) {
    if (!donnees || !Array.isArray(donnees.evenements)) continue;
    institutions.push({ institution: inst, source: donnees.source || {} });
    for (const e of donnees.evenements) {
      const jour = String(e.debut || "").slice(0, 10);
      if (jour < premier || jour > dernier) continue;
      const j = jours.find(x => x.date === jour);
      if (/^Séance publique$/.test(e.categorie || "")) {
        j.seances++;
        j.parInstitution[inst] = (j.parInstitution[inst] || 0) + 1;
      }
      const points = [e.titre, ...String(e.description || "").replace(/^Également à l'ordre du jour\s*:\s*/, "").split(" ; ")]
        .map(t => String(t || "").trim()).filter(Boolean);
      for (const t of points) {
        if (/^Vote solennel\b/.test(t)) votesSolennels.push({ debut: e.debut, institution: inst, texte: t, source: donnees.source || {} });
      }
    }
  }
  votesSolennels.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));
  /* UN JOUR AU-DELA DE L'AGENDA PUBLIE N'EST PAS UN JOUR SANS SEANCE — 07/10/2026
     (doctrine du vide). Si le dernier evenement releve tombe avant la fin de la
     semaine (releve ancien, institution qui publie a courte vue), les jours
     suivants ne sont pas « sans seance » : on ne sait pas. `annonce` vaut true
     tant qu'au moins une institution lue a publie quelque chose a cette date ou
     plus tard ; l'ecran dit l'autre cas autrement. */
  for (const inst of institutions) {
    const donnees = inst.institution === "Sénat" ? cal : agendaAN;
    inst.jusquau = donnees.evenements.reduce((max, e) => {
      const j = String(e.debut || "").slice(0, 10);
      return j > max ? j : max;
    }, "");
  }
  const horizon = institutions.reduce((max, x) => (x.jusquau > max ? x.jusquau : max), "");
  for (const j of jours) j.annonce = j.date <= horizon;
  return { jours, institutions, votesSolennels, total: jours.reduce((n, j) => n + j.seances, 0) };
}

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
  /* LE RAPPORT PORTE SON EXERCICE — 07/10/2026. « Son encours de dette : 16,0 mois
     de recettes » s'affichait sur Aujourd'hui sans l'annee des comptes, alors que
     « Ou va l'argent » dit « comptes 2025 ». L'annee est attachee ICI, a partir du
     meme exercice que le chiffre : un ecran ne peut pas la recalculer, ni l'apparier
     au chiffre d'un autre exercice. Pas d'exercice, pas de rapport.
     NB : malgre son nom, c'est le PREMIER rapport disponible — la dette quand dette
     et recettes existent, sinon le suivant (salaires...). Comportement inchange ;
     l'annee vaut pour lui quel qu'il soit. */
  const rapportDette = rr[0] ? { ...rr[0], an: exercice.an } : undefined;

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
  /* heure de Paris, comme les agendas (minuteParis, 07/10/2026) */
  const maintenant = minuteParis(now);
  const dansSeptJours = minuteParis(new Date(now.getTime() + 7 * 864e5));
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
    semaineParlement: semaineParlement({ cal, agendaAN, maintenant: now }),
    prochain, prochains, prochainsDansLaSemaine: cetteSemaine.length > 0,
    semaineSelectionnee: semaine.length > cetteSemaine.length, semaineTotal: semaine.length,
    srcComptes, srcProjets, srcScrutins, srcCal,
  };
}

