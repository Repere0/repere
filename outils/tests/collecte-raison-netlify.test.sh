#!/usr/bin/env bash
# Garde : l'annotation « Netlify refuse la publication » doit sortir meme quand
# netlify-cli n'imprime aucun message JSON. Le test lit les DEUX lignes reelles du
# workflow (RAISON= et HTTP=) et les rejoue sous le shell de GitHub
# (« bash -eo pipefail »). Usage : outils/tests/collecte-raison-netlify.test.sh [workflow]
set -u
WF="${1:-.github/workflows/collecte.yml}"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

# 1. les deux lignes du workflow, telles qu'elles sont
grep -E '^ +(RAISON|HTTP)=\$\(' "$WF" | sed 's/^ *//' > "$tmp/lignes.sh"
if [ "$(wc -l < "$tmp/lignes.sh")" -ne 2 ]; then echo "ECHEC : lignes RAISON/HTTP introuvables dans $WF"; exit 1; fi

# 2. sortie de netlify-cli SANS message JSON (cas du 09 au 13/10)
printf 'Error: deploy failed without JSON\n' > "$tmp/sortie.txt"
cat > "$tmp/bloc.sh" <<EOB
RUNNER_TEMP="$tmp"; CODE_DEPLOI=1
if [ "\$CODE_DEPLOI" != "0" ]; then
  $(cat "$tmp/lignes.sh")
  echo "::error title=Netlify refuse la publication::\${HTTP:-code \$CODE_DEPLOI} \${RAISON:-(aucun message)}"
fi
echo "FIN-ATTEINTE"
EOB
sed -i "s#\"\$RUNNER_TEMP/deploiement-netlify.txt\"#\"$tmp/sortie.txt\"#g" "$tmp/bloc.sh"
out=$(bash --noprofile --norc -eo pipefail "$tmp/bloc.sh" 2>&1); code=$?
if printf '%s' "$out" | grep -q "FIN-ATTEINTE" && printf '%s' "$out" | grep -q "::error title=Netlify refuse la publication::"; then
  echo "OK : l'annotation de raison sort sans message JSON"; exit 0
fi
echo "ECHEC : l'etape s'arrete avant l'annotation (code $code) : $out"; exit 1
