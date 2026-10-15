#!/usr/bin/env bash
# Etat, en lecture seule, de la pile de PR de Repère : base, taille, fusion et CI.
# Aucune ecriture sur le depot distant : uniquement des GET via gh api.
#
# Usage : outils/etat_pile_pr.sh [numero ...]
#         sans argument, toutes les PR ouvertes.
# Prerequis : gh authentifie. Les journaux de job ne sont pas lus ici
# (ils sont hors d'acces pour certains environnements) : seules les annotations
# et les conclusions des check-runs sont affichees.
set -euo pipefail

REPO="${REPO:-Repere0/repere}"

if [ "$#" -eq 0 ]; then
  numeros=$(gh api "repos/$REPO/pulls?state=open&per_page=100" --jq '.[].number')
else
  numeros="$*"
fi

echo "| PR | brouillon | branche -> base | commits | fichiers | +/- | fusion | CI (check-runs) |"
echo "|---|---|---|---|---|---|---|---|"
for n in $numeros; do
  ligne=$(gh api "repos/$REPO/pulls/$n" --jq '"| #\(.number) | \(if .draft then "oui" else "non" end) | \(.head.ref) -> \(.base.ref) | \(.commits) | \(.changed_files) | +\(.additions)/-\(.deletions) | \(.mergeable_state) | "')
  sha=$(gh api "repos/$REPO/pulls/$n" --jq '.head.sha')
  ci=$(gh api "repos/$REPO/commits/$sha/check-runs" --jq '[.check_runs[] | "\(.name)=\(.conclusion // .status)"] | join(", ")')
  echo "${ligne}${ci} |"
done
