#!/usr/bin/env bash
# LE VERDICT D'UNE PULL REQUEST, EN UNE LIGNE — 01/10/2026.
#
# Appele par le dernier job de .github/workflows/verification.yml. Il lit le
# resultat des jobs precedents (success, failure, cancelled, skipped) et rend :
#   VERT  = la PR respecte le socle ;
#   ROUGE = quelque chose bloque, et il dit QUOI.
# « skipped » n'est pas un echec : c'est une partie que la PR ne touche pas (la
# chaine pour une PR qui ne touche que l'application, par exemple). Mais le job
# qui DECIDE de ce qui est concerne (QUOI) ne peut pas etre saute : s'il
# n'aboutit pas, rien n'a ete verifie, et le verdict est rouge.
#
# Ecrit a part pour etre eprouve hors de GitHub :
#   QUOI=success CHAINE=failure MOBILE=skipped bash outils/verdict_ci.sh
set -uo pipefail
libelle() { case "$1" in
  success) echo "vert" ;; skipped) echo "non concernée par cette PR" ;;
  failure) echo "ROUGE" ;; cancelled) echo "ANNULÉE" ;; *) echo "INCONNU ($1)" ;; esac; }
bloque=()
[ "${QUOI:-}" = "success" ] || bloque+=("le tri de ce que la PR touche ($(libelle "${QUOI:-absent}"))")
for partie in CHAINE MOBILE; do
  r="${!partie:-absent}"
  case "$r" in success|skipped) ;; *) bloque+=("$( [ $partie = CHAINE ] && echo "la chaîne de publication" || echo "l'application mobile") ($(libelle "$r"))") ;; esac
done
resume="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
{
  echo "## Verdict"
  echo
  echo "| Partie | Résultat |"
  echo "|---|---|"
  echo "| Chaîne de publication (collecte, build, banc, sans publier) | $(libelle "${CHAINE:-absent}") |"
  echo "| Application mobile (types, exports, parcours, même vérité) | $(libelle "${MOBILE:-absent}") |"
  echo
  if [ ${#bloque[@]} -eq 0 ]; then
    echo "**VERT : cette PR respecte le socle.**"
  else
    echo "**ROUGE : ce qui bloque —** $(IFS=';'; echo "${bloque[*]}" | sed 's/;/ ; /g')."
  fi
} >> "$resume"
if [ ${#bloque[@]} -ne 0 ]; then
  echo "::error title=verdict::ce qui bloque : $(IFS=';'; echo "${bloque[*]}" | sed 's/;/ ; /g')"
  exit 1
fi
echo "VERT : cette PR respecte le socle."
