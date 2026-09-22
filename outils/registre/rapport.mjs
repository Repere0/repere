#!/usr/bin/env node
/* RAPPORT DE COUVERTURE DES DONNEES — pose le 22/09/2026, objectif 8.
 *
 * Assemble trois fichiers deja produits par ce chantier — sources.json (le
 * registre), data/journal_sante_sources.json (le dernier controle de sante),
 * data/couverture_territoriale.json (la derniere mesure IDF) — en un rapport
 * qui repond a « de quelles donnees publiques Repere dispose-t-il
 * reellement ? ». Il ne mesure rien lui-meme : verifier_sources.mjs et
 * couverture.mjs doivent avoir tourne avant. S'ils ne l'ont pas fait, ce
 * script le dit et s'arrete plutot que d'ecrire un rapport avec des trous
 * silencieux.
 *
 * Usage : node outils/registre/rapport.mjs
 * Sortie : data/rapport_couverture.json + data/rapport_couverture.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..", "..");
const chemin = (...p) => path.join(RACINE, ...p);

function lireSiPresent(p, nomLisible) {
  if (!fs.existsSync(p)) {
    console.error("::error::" + nomLisible + " absent (" + path.relative(RACINE, p)
      + "). Lance d'abord le script qui le produit.");
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const registre = lireSiPresent(chemin("outils", "registre", "sources.json"), "le registre des sources");
  const sante = lireSiPresent(chemin("data", "journal_sante_sources.json"), "le journal de sante");
  const couverture = lireSiPresent(chemin("data", "couverture_territoriale.json"), "la mesure de couverture territoriale");
  if (!registre || !sante) {
    console.error("::error::rapport non genere — fichiers manquants.");
    process.exit(2);
  }

  const parId = new Map(sante.resultats.map(r => [r.id, r]));
  const actives = [];
  const enErreur = [];
  const modifiees = [];

  for (const s of registre.sources) {
    const controle = parId.get(s.id);
    if (!controle) continue;
    if (controle.status === "SOURCE_UNAVAILABLE") {
      enErreur.push({ id: s.id, nom: s.nom, erreur: (controle.errors || []).join("; "),
        dernier_succes: s.derniere_collecte_repere || "inconnu" });
    } else {
      actives.push({
        id: s.id, nom: s.nom, producteur: s.producteur, categorie: s.categorie,
        fraicheur_source: controle.last_source_update || s.derniere_maj_connue || "non mesuree",
        derniere_collecte_repere: s.derniere_collecte_repere || "jamais",
        statut: controle.status,
      });
    }
    if ((controle.warnings || []).some(w => w.startsWith("la source a ete mise a jour"))) {
      modifiees.push({ id: s.id, nom: s.nom,
        constat: controle.warnings.find(w => w.startsWith("la source a ete mise a jour")) });
    }
  }

  const nouvelles = (registre.candidates_non_integres || []).map(c => ({
    id: c.id, nom: c.nom, statut_cycle: c.statut_cycle, verifie_le: c.verifie_le,
  }));

  const domaines = {};
  for (const s of registre.sources) {
    domaines[s.categorie] = domaines[s.categorie] || [];
    domaines[s.categorie].push(s.id);
  }

  const rapport = {
    genere_le: new Date().toISOString(),
    territoire_cible: couverture ? {
      departements: couverture.departements,
      communes_attendues: couverture.communes_attendues,
      reference: couverture.reference,
    } : "non mesure — lancer outils/registre/couverture.mjs",
    sources_actives: actives,
    sources_en_erreur: enErreur,
    sources_nouvelles_non_integrees: nouvelles,
    sources_modifiees_depuis_le_registre: modifiees,
    couverture_territoriale: couverture ? couverture.sources : "non mesuree",
    homonymes_detectes: couverture ? couverture.homonymes : [],
    donnees_disponibles_par_domaine: domaines,
  };

  fs.writeFileSync(chemin("data", "rapport_couverture.json"), JSON.stringify(rapport, null, 1));

  const md = [];
  md.push("# Repère — rapport de couverture des données");
  md.push("");
  md.push("*Généré le " + rapport.genere_le + ". Chaque chiffre vient d'un fichier mesuré, jamais d'une estimation.*");
  md.push("");
  md.push("## Territoire cible");
  if (couverture) {
    md.push("Île-de-France, " + couverture.departements.join(", ") + " — "
      + couverture.communes_attendues + " communes de référence (`" + couverture.reference + "`).");
  } else {
    md.push("**Non mesuré** — lancer `node outils/registre/couverture.mjs`.");
  }
  md.push("");
  md.push("## Sources actives (" + actives.length + ")");
  md.push("");
  md.push("| source | producteur | catégorie | fraîcheur source | dernière collecte Repère |");
  md.push("|---|---|---|---|---|");
  for (const a of actives) {
    md.push("| " + a.id + " | " + a.producteur + " | " + a.categorie + " | " + a.fraicheur_source
      + " | " + a.derniere_collecte_repere + " |");
  }
  md.push("");
  md.push("## Sources en erreur (" + enErreur.length + ")");
  md.push("");
  if (enErreur.length) {
    md.push("| source | erreur | dernier succès connu |");
    md.push("|---|---|---|");
    for (const e of enErreur) md.push("| " + e.id + " | " + e.erreur + " | " + e.dernier_succes + " |");
  } else {
    md.push("Aucune, au dernier contrôle (" + sante.execute_le + ").");
  }
  md.push("");
  md.push("## Sources modifiées depuis le registre (" + modifiees.length + ")");
  md.push("");
  if (modifiees.length) {
    for (const m of modifiees) md.push("- **" + m.id + "** — " + m.constat);
  } else {
    md.push("Aucune source n'a changé depuis la dernière vérification enregistrée.");
  }
  md.push("");
  md.push("## Sources découvertes, non encore intégrées (" + nouvelles.length + ")");
  md.push("");
  md.push("| source | stade | vérifiée le |");
  md.push("|---|---|---|");
  for (const n of nouvelles) md.push("| " + n.id + " | " + n.statut_cycle + " | " + n.verifie_le + " |");
  md.push("");
  md.push("## Couverture territoriale");
  md.push("");
  if (couverture) {
    md.push("| source | trouvées | attendues | taux |");
    md.push("|---|---:|---:|---:|");
    for (const [id, m] of Object.entries(couverture.sources)) {
      md.push("| " + id + " | " + m.trouvees + " | " + m.attendues + " | " + m.taux_couverture + "% |");
    }
    if (couverture.homonymes.length) {
      md.push("");
      md.push("**Homonymes détectés** (deux communes IDF portant le même nom, jamais rapprochées "
        + "par le nom seul dans le produit) : " + couverture.homonymes.map(h => h.nom).join(", ") + ".");
    }
  } else {
    md.push("Non mesurée.");
  }
  md.push("");
  md.push("## Données disponibles par domaine");
  md.push("");
  for (const [dom, ids] of Object.entries(domaines)) {
    md.push("- **" + dom + "** : " + ids.join(", "));
  }
  md.push("");

  fs.writeFileSync(chemin("data", "rapport_couverture.md"), md.join("\n"));

  console.log("rapport ecrit : data/rapport_couverture.json et data/rapport_couverture.md");
  console.log(actives.length + " source(s) active(s), " + enErreur.length + " en erreur, "
    + nouvelles.length + " decouverte(s) non integree(s), " + modifiees.length + " modifiee(s).");
}

main();
