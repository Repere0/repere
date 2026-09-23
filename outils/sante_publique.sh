#!/usr/bin/env bash
# =============================================================================
# ETAT DE SANTE VISIBLE — le trou qui a laisse la prod figee 29 jours.
#
# POURQUOI CE SCRIPT EXISTE. Entre le 13/09 et le 22/09/2026, collecte.yml a
# echoue CHAQUE JOUR, en silence : rien ne le disait sans aller lire les
# Actions a la main. Le site en ligne a servi une version vieille de pres
# d'un mois sans qu'aucune alerte ne le signale. Ce script ferme exactement
# ce trou, et rien de plus : une seule issue GitHub, toujours ouverte, dont
# le TITRE seul dit l'etat (visible dans la liste des issues, sans clic, y
# compris depuis un telephone) et dont le CORPS dit la preuve.
#
# DELIBEREMENT SIMPLE, PAS UNE PLATEFORME DE SUPERVISION : une issue, un
# titre, deux etats. Aucune dependance neuve (gh est deja installe sur le
# runner ; aucun secret neuf, GITHUB_TOKEN suffit).
#
# Usage : outils/sante_publique.sh <succes|echec> <sha> <url_run>
# Necessite GH_TOKEN dans l'environnement (voir collecte.yml).
# =============================================================================
set -euo pipefail

ETAT="$1"
SHA="$2"
URL_RUN="$3"
TITRE_BASE="etat de la collecte quotidienne"
URL_SITE="https://repereapp.netlify.app"

NUM=$(gh issue list --search "in:title \"$TITRE_BASE\"" --state all --json number --jq '.[0].number // empty' 2>/dev/null || echo "")

if [ "$ETAT" = "succes" ]; then
  TITRE="[OK] $TITRE_BASE"
  CORPS="RUN OK — $(date -u +%Y-%m-%dT%H:%M:%SZ), commit \`${SHA:0:7}\`.

Run : $URL_RUN"
else
  # MESURE EN DIRECT, PAS SUPPOSEE : la derniere prod saine est ce que le
  # site reellement en ligne affirme lui-meme via sa provenance, pas une
  # valeur portee d'un run a l'autre dans le texte de l'issue - une source
  # qui se corrige seule vaut mieux qu'un etat qu'on doit garder synchronise.
  SONDE=$(curl -s --max-time 10 "$URL_SITE/data/index.json?verif=sante-$(date -u +%s)" 2>/dev/null || echo "")
  if [ -n "$SONDE" ]; then
    DERNIERE=$(node -e "
      try {
        const j = JSON.parse(process.argv[1]);
        const b = j.build || {};
        console.log((b.commit_court || 'inconnu') + ' du ' + (b.construit_le || 'date inconnue'));
      } catch (e) { console.log('index.json illisible depuis le site'); }
    " "$SONDE" 2>/dev/null || echo "indeterminee (sonde illisible)")
  else
    DERNIERE="indeterminee (site injoignable depuis le runner)"
  fi
  TITRE="[ECHEC] $TITRE_BASE"
  CORPS="RUN FAILED — $(date -u +%Y-%m-%dT%H:%M:%SZ).

Derniere prod saine (mesuree en direct sur $URL_SITE au moment de cet echec) : $DERNIERE

Run en echec : $URL_RUN"
fi

if [ -n "$NUM" ]; then
  gh issue edit "$NUM" --title "$TITRE" --body "$CORPS"
  echo "issue #$NUM mise a jour : $TITRE"
else
  gh issue create --title "$TITRE" --body "$CORPS"
  echo "issue creee : $TITRE"
fi
