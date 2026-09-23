#!/bin/sh
# Branche les gardes de ce depot. A relancer apres un clone : git ne versionne
# pas .git/hooks, mais il versionne core.hooksPath.
cd "$(dirname "$0")/../.." || exit 1
git config core.hooksPath outils/gardes
chmod +x outils/gardes/pre-commit outils/gardes/pre-push 2>/dev/null
echo "gardes branchees : $(git config core.hooksPath)"
echo "verification :"
git config --get core.hooksPath
