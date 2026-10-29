#!/usr/bin/env bash
# Annonce, dans la CI, l'etat du teaser des scrutins solennels pour cette
# publication. Appele par pipeline.sh apres la generation.
#   $1 : dossier genere (contient scrutins-solennels-recents.json)
#   $2 : dossier de l'archive officielle (brut_Scrutins, depile a l'etape 1)
#
# POURQUOI CE SCRIPT (29/10/2026). Le banc sort sa sortie seulement en cas
# d'echec : une CI verte ne disait donc pas si le contrôle « fichier present »
# avait tourne, ou si le cas « absent » (tolere) l'avait remplace. Ce script
# rend l'etat visible par une annotation, et distingue deux causes d'absence :
#   - l'archive n'a pas ete obtenue (source externe, pas un defaut du code) ;
#   - l'archive est la mais le teaser n'a pas ete produit (panne de production).
# Dans les deux cas la publication continue : le teaser est une donnee
# facultative, et la note d'absence du site dit qu'elle n'est pas disponible.
set -uo pipefail
genere="$1"
archive="$2"
# UN FICHIER PRESENT N'EST PAS UN TEASER VALIDE (29/10/2026). Le site lit
# `recents` (tableau non vide) et, pour chaque entree, `d`, `t` et `url`, plus
# `source.url`. Un JSON qui ne respecte pas ce contrat n'est jamais annonce « produit ».
fichier="$genere/scrutins-solennels-recents.json"
if [ -e "$fichier" ]; then
  if raison=$(node -e '
    const fs = require("fs");
    let d;
    try { d = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); }
    catch (e) { console.log("JSON illisible"); process.exit(1); }
    if (!d || !Array.isArray(d.recents) || d.recents.length === 0) { console.log("recents absent ou vide"); process.exit(1); }
    for (const r of d.recents) {
      if (!r || typeof r.d !== "string" || typeof r.t !== "string" || typeof r.url !== "string") { console.log("entree mal formee"); process.exit(1); }
    }
    if (!d.source || typeof d.source.url !== "string") { console.log("source absente"); process.exit(1); }
    console.log(d.recents.length + " teaser(s)");
  ' "$fichier" 2>&1); then
    echo "::notice::teaser des scrutins produit pour cette publication ($(wc -c < "$fichier") octets, $raison)"
  else
    echo "::error::teaser des scrutins present mais invalide ($raison) : publication bloquee"
    exit 1
  fi
elif [ -d "$archive" ]; then
  # PANNE DE PRODUCTION = ECHEC, PAS AVERTISSEMENT (29/10/2026). L'archive est la,
  # le teaser devait l'etre : publier une note « indisponible » masquerait un
  # defaut de Repere. La publication s'arrete, la publication precedente reste
  # en ligne, et l'ecran le dit (fraicheur, invariant 9).
  echo "::error::teaser des scrutins absent alors que l'archive de l'Assemblee est presente : production en echec, publication bloquee"
  exit 1
else
  echo "::notice::teaser des scrutins absent : archive de l'Assemblee non obtenue, la note d'absence sera publiee"
fi
exit 0
