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
if [ -s "$genere/scrutins-solennels-recents.json" ]; then
  echo "::notice::teaser des scrutins produit pour cette publication ($(wc -c < "$genere/scrutins-solennels-recents.json") octets)"
elif [ -d "$archive" ]; then
  echo "::warning::teaser des scrutins absent alors que l'archive de l'Assemblee est presente : production en echec, la note d'absence sera publiee"
else
  echo "::notice::teaser des scrutins absent : archive de l'Assemblee non obtenue, la note d'absence sera publiee"
fi
exit 0
