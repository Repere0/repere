#!/usr/bin/env bash
# Banc du generateur des scrutins solennels : ses erreurs de production doivent
# etre visibles ET bloquantes, et son absence d'archive doit rester un cas honnete.
# Chaque cas utilise une archive factice dans un dossier temporaire (aucun reseau).
#   G1. archive absente              -> code 0, aucun fichier ecrit, avertissement (cas legitime)
#   G2. archive avec un scrutin solennel -> code 0, deux fichiers ecrits
#   G3. archive sans aucun scrutin retenu -> code 1, aucun teaser ecrit (une liste vide
#       serait lue comme « aucun scrutin », ce qui est faux)
#   G4. archive avec un fichier JSON illisible -> code 1 (pas d'ignorance silencieuse)
#   G5. etat du teaser : archive presente, teaser absent -> code 1, erreur annoncee
set -euo pipefail
ici=$(cd "$(dirname "$0")" && pwd)
gen="$ici/../mono/scripts/scrutins-solennels.mjs"
etat="$ici/teaser_scrutins_etat.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

solennel() { # $1 = numero
  printf '{"scrutin":{"numero":"%s","dateScrutin":"2026-03-01T10:00:00","typeVote":{"libelleTypeVote":"scrutin public solennel"},"titre":"Projet de loi n %s","syntheseVote":{"decompte":{"pour":"10","contre":"2","abstentions":"1"}},"sort":{"libelle":"Adopte"}}}' "$1" "$1"
}
ordinaire() {
  printf '{"scrutin":{"numero":"%s","dateScrutin":"2026-03-02T10:00:00","typeVote":{"libelleTypeVote":"scrutin public ordinaire"},"titre":"Amendement","syntheseVote":{"decompte":{"pour":"3","contre":"4","abstentions":"0"}},"sort":{"libelle":"Rejete"}}}' "$1"
}

# G1 : pas d'archive.
mkdir -p "$tmp/g1/sortie"
set +e; out=$(node "$gen" "$tmp/g1/sortie" "$tmp/g1/absente" 2>&1); code=$?; set -e
[ "$code" -eq 0 ] || { echo "ECHEC G1 : code $code, attendu 0 : $out"; exit 1; }
[ ! -e "$tmp/g1/sortie/scrutins-solennels-recents.json" ] || { echo "ECHEC G1 : un teaser a ete ecrit sans archive"; exit 1; }

# G2 : un scrutin solennel.
mkdir -p "$tmp/g2/entree" "$tmp/g2/sortie"
solennel 1 > "$tmp/g2/entree/a.json"
set +e; out=$(node "$gen" "$tmp/g2/sortie" "$tmp/g2/entree" 2>&1); code=$?; set -e
[ "$code" -eq 0 ] || { echo "ECHEC G2 : code $code, attendu 0 : $out"; exit 1; }
[ -s "$tmp/g2/sortie/scrutins-solennels-recents.json" ] || { echo "ECHEC G2 : teaser non ecrit"; exit 1; }

# G3 : archive presente, aucun scrutin solennel ni motion.
mkdir -p "$tmp/g3/entree" "$tmp/g3/sortie"
ordinaire 2 > "$tmp/g3/entree/a.json"
set +e; out=$(node "$gen" "$tmp/g3/sortie" "$tmp/g3/entree" 2>&1); code=$?; set -e
[ "$code" -ne 0 ] || { echo "ECHEC G3 : code 0 alors qu'aucun scrutin n'est retenu : $out"; exit 1; }
[ ! -e "$tmp/g3/sortie/scrutins-solennels-recents.json" ] || { echo "ECHEC G3 : un teaser vide a ete ecrit"; exit 1; }

# G4 : un fichier illisible a cote d'un scrutin valide.
mkdir -p "$tmp/g4/entree" "$tmp/g4/sortie"
solennel 3 > "$tmp/g4/entree/a.json"
printf '{ceci n est pas du json' > "$tmp/g4/entree/corrompu.json"
set +e; out=$(node "$gen" "$tmp/g4/sortie" "$tmp/g4/entree" 2>&1); code=$?; set -e
[ "$code" -ne 0 ] || { echo "ECHEC G4 : code 0 malgre un fichier illisible : $out"; exit 1; }

# G5 : archive presente mais teaser absent -> erreur annoncee, code 1.
mkdir -p "$tmp/g5/data" "$tmp/g5/archive"
set +e; out5=$(bash "$etat" "$tmp/g5/data" "$tmp/g5/archive" 2>&1); code5=$?; set -e
echo "$out5" | grep -q "::error::teaser des scrutins absent" || { echo "ECHEC G5 : pas d'erreur annoncee : $out5"; exit 1; }
[ "$code5" -eq 1 ] || { echo "ECHEC G5 : code $code5, attendu 1"; exit 1; }

# G6 : le pipeline ne doit pas avaler l'echec du generateur. Garde statique sur la
# ligne d'appel : elle doit sortir en code 1 (pas de « || echo warning »).
appel=$(grep -A2 'node scripts/scrutins-solennels.mjs ./data' "$ici/pipeline.sh" || true)
echo "$appel" | grep -q 'exit 1' || { echo "ECHEC G6 : le generateur des scrutins n'est pas bloquant dans pipeline.sh : $appel"; exit 1; }
echo "$appel" | grep -q '|| echo "::warning::' && { echo "ECHEC G6 : l'echec du generateur est encore un avertissement"; exit 1; }

echo "scrutins solennels, erreurs : 6 cas verifies (G1 absence, G2 produit, G3 aucun retenu bloque, G4 fichier illisible bloque, G5 panne annoncee bloquee, G6 pipeline bloquant)"
