#!/usr/bin/env bash
# Banc du teaser des scrutins : l'etat de publication est decide et annonce
# par outils/teaser_scrutins_etat.sh. Trois cas, chacun prouve par sa sortie :
#   1. teaser produit          -> notice « produit », code 0
#   2. archive absente         -> notice « absente, archive non obtenue », code 0
#   3. archive presente, teaser non produit -> error « production en echec », code 1 (bloquant)
# Ce banc n'accepte aucun cas comme vrai sans que la sortie le dise.
set -euo pipefail
ici=$(cd "$(dirname "$0")" && pwd)
etat="$ici/teaser_scrutins_etat.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
echo "[]" > "$tmp/ref.json"

# Cas 1 : le teaser existe dans le dossier genere.
mkdir -p "$tmp/c1/data" "$tmp/c1/archive"
echo '{"recents":[{"n":1}]}' > "$tmp/c1/data/scrutins-solennels-recents.json"
out1=$(bash "$etat" "$tmp/c1/data" "$tmp/c1/archive")
echo "$out1" | grep -q "::notice::teaser des scrutins produit" || { echo "ECHEC cas 1 : $out1"; exit 1; }

# Cas 2 : pas d'archive (la source officielle n'a pas ete obtenue).
mkdir -p "$tmp/c2/data"
out2=$(bash "$etat" "$tmp/c2/data" "$tmp/c2/archive-absente")
echo "$out2" | grep -q "::notice::teaser des scrutins absent : archive de l'Assemblee non obtenue" || { echo "ECHEC cas 2 : $out2"; exit 1; }

# Cas 3 : archive presente mais teaser non produit : c'est une panne de production.
mkdir -p "$tmp/c3/data" "$tmp/c3/archive"
set +e; out3=$(bash "$etat" "$tmp/c3/data" "$tmp/c3/archive" 2>&1); code3=$?; set -e
echo "$out3" | grep -q "::error::teaser des scrutins absent alors que l'archive" || { echo "ECHEC cas 3 : $out3"; exit 1; }
[ "$code3" -eq 1 ] || { echo "ECHEC cas 3 : code $code3, attendu 1 (panne de production bloquante)"; exit 1; }

echo "teaser des scrutins : 3 cas verifies (produit, archive absente, panne de production bloquee)"
