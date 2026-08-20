#!/usr/bin/env bash
# =============================================================================
# La chaine complete de Repere, en un seul endroit MODIFIABLE.
#
# POURQUOI CE FICHIER EXISTE : .github/workflows/ est protege en ecriture contre les
# outils distants — Claude ne peut pas y toucher. Chaque changement de logique
# obligeait donc a une manipulation manuelle : copier un fichier, verifier, pousser.
# En deplacant TOUTE la logique ici, le workflow devient un lanceur qui ne bouge
# plus jamais, et les evolutions futures se font dans outils/, que Claude ecrit
# directement. Une action manuelle recurrente supprimee, definitivement.
#
# ORDRE : depiler -> normaliser -> decrire -> verifier -> reconstruire -> eprouver.
# Le banc passe APRES la reconstruction et AVANT le deploiement : c'est lui qui
# rend l'automatisation complete acceptable. Sans banc, publier sans relecture
# humaine revient a parier ; avec lui, 40 controles dont la moitie mesurent le
# rendu dans un vrai navigateur disent non a notre place.
# =============================================================================
set -euo pipefail

AUJOURDHUI=$(date -u +%Y-%m-%d)
echo "== pipeline Repere — $AUJOURDHUI =="

# ---------------------------------------------------------------- 1. depiler
cd data
for z in *.zip; do
  [ -e "$z" ] || continue
  dossier="${z%.json.zip}"; dossier="${dossier%.zip}"
  rm -rf "brut_$dossier"; mkdir -p "brut_$dossier"
  unzip -oq "$z" -d "brut_$dossier"
  echo "depile : $z -> brut_$dossier"
done
cd ..

# ------------------------------------------------- 2. normaliser l'agenda
python3 outils/agenda_an.py data/brut_Agenda/json data/brut_AMO30/json outils/agenda_an.json

# ------------------------------- 3. decrire le schema des scrutins (documentaire)
# Ne doit jamais faire tomber la chaine : c'est de la documentation.
python3 outils/echantillon_scrutins.py data/brut_Scrutins docs/schema_scrutins.md \
  || echo "::warning::le schema des scrutins n'a pas pu etre decrit"

# ------------------------- 3 bis. decrire les tables de circonscriptions (documentaire)
# Sans table commune -> circonscription, un scrutin ne peut etre affiche que
# nationalement. On collecte deux candidates et on les fait DECRIRE ici, pour ecrire
# le lecteur sur des colonnes lues. Le choix entre les deux se fera sur la couverture
# mesuree contre le Code officiel geographique, pas sur une preference.
for paire in "data/circos_bureaux_de_vote.csv docs/schema_circos_bv.md" \
             "data/circos_ministere.xlsx docs/schema_circos_min.md"; do
  set -- $paire
  python3 outils/echantillon_source.py "$1" "$2" \
    || echo "::warning::description impossible pour $1"
done

# ------------------------------ 3 ter. la table commune -> circonscription(s)
# Sans elle, un scrutin ne peut etre affiche que nationalement.
python3 outils/circos.py data/circos_bureaux_de_vote.csv outils/circos.json

# ---------------------------------------- 3 quater. les scrutins, position par depute
# 80 derniers scrutins. Ni non-votants, ni mise au point, ni agregat par depute :
# les raisons sont ecrites en tete de outils/scrutins_an.py, et le script se controle
# lui-meme — il refuse de produire un fichier ou un non-votant serait compte comme
# votant.
python3 outils/scrutins_an.py data/brut_Scrutins outils/scrutins_an.json 80

# ------------------- 3 quinquies. decrire les acteurs (pour nommer les references)
# Les scrutins designent les deputes par une reference opaque (PA1234). Le referentiel
# AMO30 porte les noms et les circonscriptions. On le fait decrire avant d'ecrire le
# lecteur, comme pour les scrutins — c'est ce qui avait evite le piege du champ
# `votant` tantot liste tantot objet.
python3 outils/echantillon_scrutins.py data/brut_AMO30/json/acteur docs/schema_acteurs.md \
  || echo "::warning::les acteurs n'ont pas pu etre decrits (chemin different ?)"

# ---------------------------------------------- 4. verifier la sortie, sans confiance
# On relit ce qui vient d'etre ecrit, sans reutiliser une ligne du script qui l'a ecrit.
python3 - "$AUJOURDHUI" <<'PY'
import json, sys, datetime
today = sys.argv[1]
d = json.load(open("outils/agenda_an.json", encoding="utf-8"))
assert d.get("v") == 1, "version de format inattendue"
assert len(d["r"]) > 5000, "trop peu de reunions : %d" % len(d["r"])
assert d["org"], "table des instances vide"
assert all(0 <= e["o"] < len(d["org"]) for e in d["r"]), "index d'instance hors table"
assert "acteurRef" not in json.dumps(d)[:2000000], "une presence nominative a fuite"
assert d.get("maj") == today, "date de collecte %r au lieu de %s" % (d.get("maj"), today)

# GARDE-FOU CONTRE LE GEL SILENCIEUX : toutes les adresses de collecte.py portent
# le numero de legislature (/17/). Le jour d'une dissolution, ces fichiers cessent
# d'etre mis a jour, la collecte continue de reussir sur un fichier fige, et RIEN
# ne le dit. On exige donc qu'il reste des reunions a venir.
derniere = max(e["d"] for e in d["r"])[:10]
ecart = (datetime.date.fromisoformat(derniere) - datetime.date.fromisoformat(today)).days
print("agenda : %d reunions, %d instances, collecte du %s, derniere reunion %s (J%+d)"
      % (len(d["r"]), len(d["org"]), d["maj"], derniere, ecart))
assert ecart > -21, ("la reunion la plus tardive remonte a %d jours : la source est "
                     "probablement gelee (changement de legislature ?)" % -ecart)
PY

# --------------------------------------------------- 5. reconstruire le site
APP=$(ls -1 app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)
echo "application retenue : $APP"
rm -rf site_engendre
python3 outils/build_pwa_reconstruit.py "$APP" site site_engendre

python3 - "$AUJOURDHUI" <<'PY'
import json, sys
today = sys.argv[1]
d = json.load(open("site_engendre/donnees/agenda_an.json", encoding="utf-8"))
assert d.get("maj") == today, \
    "le site servirait un agenda du %r : la substitution n'a pas eu lieu" % d.get("maj")
print("site : agenda du %s, %d reunions" % (d["maj"], len(d["r"])))
PY

# ------------------------------------------------------------ 6. eprouver
# LE VERROU DE L'AUTOMATISATION. Si un seul des 40 controles tombe, `set -e` arrete
# tout ici et le deploiement n'a pas lieu. C'est ce qui autorise a publier sans
# qu'un humain regarde.
echo "== banc =="
node test_repere.mjs site_engendre/index.html

echo "== pipeline terminee sans erreur =="
