#!/usr/bin/env python3
"""Barrières déterministes pour la boucle Repère ; aucune dépendance externe."""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import PurePosixPath
from typing import Any

ALLOWED_PREFIXES = ("mono/apps/mobile/",)
MAX_ESTIMATED_COST_USD = 0.75
MAX_TURNS = 3
FORBIDDEN_EXACT = {
    "CLAUDE.md", "AGENTS.md", ".gitignore", "app_repere_v18_20.html",
    "mono/apps/mobile/package.json", "mono/apps/mobile/package-lock.json",
    "mono/apps/mobile/app.json", "mono/apps/mobile/eas.json",
}
FORBIDDEN_PREFIXES = (
    ".github/", ".claude/", "data/", "outils/", "mono/scripts/",
    "mono/packages/", "site_donnees/",
)
FORBIDDEN_SUFFIXES = (".env", ".pem", ".key")


def validate_plan(plan: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(plan, dict):
        return ["Le plan doit être un objet JSON."]
    required = {
        "title", "objective", "risk", "allowed_paths",
        "acceptance_criteria", "estimated_cost_usd", "max_turns", "rationale",
    }
    missing = sorted(required - set(plan))
    if missing:
        errors.append("Champs manquants : " + ", ".join(missing))
    if set(plan) - required:
        errors.append("Champs inattendus : " + ", ".join(sorted(set(plan) - required)))
    if plan.get("risk") != "green":
        errors.append("Seules les tâches green sont exécutables en v1.")
    if not isinstance(plan.get("title"), str) or not plan.get("title", "").strip():
        errors.append("Titre absent ou invalide.")
    if not isinstance(plan.get("objective"), str) or len(plan.get("objective", "").strip()) < 20:
        errors.append("Objectif trop court ou absent.")
    paths = plan.get("allowed_paths")
    if not isinstance(paths, list) or not paths:
        errors.append("Le plan doit nommer au moins un chemin autorisé.")
    else:
        for path in paths:
            if not isinstance(path, str):
                errors.append(f"Chemin planifié invalide : {path!r}")
            elif (
                "\\" in path
                or ".." in PurePosixPath(path).parts
                or not path.endswith("/")
                or len(PurePosixPath(path.rstrip("/")).parts) < 4
                or not path.startswith(ALLOWED_PREFIXES)
            ):
                errors.append(f"Chemin planifié trop large ou hors périmètre : {path!r}")
    criteria = plan.get("acceptance_criteria")
    if not isinstance(criteria, list) or not criteria or any(not isinstance(c, str) or len(c.strip()) < 5 for c in criteria):
        errors.append("Critères d'acceptation absents ou invalides.")
    cost = plan.get("estimated_cost_usd")
    if (
        isinstance(cost, bool)
        or not isinstance(cost, (int, float))
        or not math.isfinite(cost)
        or cost < 0
        or cost > MAX_ESTIMATED_COST_USD
    ):
        errors.append(f"Estimation déclarée invalide ou supérieure au seuil de {MAX_ESTIMATED_COST_USD:.2f} USD ; ce seuil ne plafonne pas la facture réelle.")
    turns = plan.get("max_turns")
    if isinstance(turns, bool) or not isinstance(turns, int) or not 1 <= turns <= MAX_TURNS:
        errors.append(f"max_turns doit être compris entre 1 et {MAX_TURNS}.")
    if not isinstance(plan.get("rationale"), str) or len(plan.get("rationale", "").strip()) < 10:
        errors.append("Justification absente ou trop courte.")
    return errors


def validate_paths(
    paths: list[str],
    deleted: list[str] | None = None,
    allowed_prefixes: tuple[str, ...] = ALLOWED_PREFIXES,
) -> list[str]:
    errors: list[str] = []
    for raw in paths:
        path = str(PurePosixPath(raw))
        if path in FORBIDDEN_EXACT:
            errors.append(f"Fichier protégé : {path}")
        elif any(path.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
            errors.append(f"Zone protégée : {path}")
        elif path.endswith(FORBIDDEN_SUFFIXES) or "/.env" in path:
            errors.append(f"Fichier potentiellement secret : {path}")
        elif "\\" in raw or ".." in PurePosixPath(raw).parts or not path.startswith(allowed_prefixes):
            errors.append(f"Chemin hors liste blanche ou hors plan : {path}")
    for path in deleted or []:
        errors.append(f"La suppression de fichier est interdite en v1 : {path}")
    return errors


def changed_paths(base: str, head: str) -> tuple[list[str], list[str]]:
    # On utilise uniquement des références git fixes ; aucun argument de shell.
    diff = subprocess.run(
        ["git", "diff", "--no-renames", "--name-only", "--diff-filter=ACMRT", f"origin/{base}...{head}"],
        check=True, capture_output=True, text=True,
    )
    deleted = subprocess.run(
        ["git", "diff", "--no-renames", "--name-only", "--diff-filter=D", f"origin/{base}...{head}"],
        check=True, capture_output=True, text=True,
    )
    return [p for p in diff.stdout.splitlines() if p], [p for p in deleted.stdout.splitlines() if p]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    plan_parser = sub.add_parser("plan", help="valider un plan JSON avant exécution")
    plan_parser.add_argument("file")
    paths_parser = sub.add_parser("diff", help="valider les chemins modifiés par rapport à origin/main")
    paths_parser.add_argument("--base", default="main")
    paths_parser.add_argument("--head", default="HEAD")
    paths_parser.add_argument("--plan", required=True, help="Plan JSON green validé avant exécution")
    args = parser.parse_args()

    if args.command == "plan":
        try:
            with open(args.file, encoding="utf-8") as handle:
                plan = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            print(f"Plan illisible : {exc}", file=sys.stderr)
            return 2
        errors = validate_plan(plan)
    else:
        try:
            with open(args.plan, encoding="utf-8") as handle:
                plan = json.load(handle)
            plan_errors = validate_plan(plan)
            if plan_errors:
                print("Le plan fourni au contrôle du diff n'est pas autorisé :", file=sys.stderr)
                for error in plan_errors:
                    print(f"- {error}", file=sys.stderr)
                return 2
            paths, deleted = changed_paths(args.base, args.head)
        except (OSError, json.JSONDecodeError) as exc:
            print(f"Plan illisible : {exc}", file=sys.stderr)
            return 2
        except subprocess.CalledProcessError as exc:
            print(f"Impossible de lire le diff Git : {exc.stderr}", file=sys.stderr)
            return 2
        errors = validate_paths(paths, deleted, tuple(plan["allowed_paths"]))
        if not paths and not deleted:
            errors.append("Aucun changement Git détecté : impossible de prouver le périmètre.")

    if errors:
        print("BLOCAGE — la boucle ne doit pas continuer :")
        for error in errors:
            print(f"- {error}")
        return 1
    print("OK — plan et périmètre conformes à la politique v1.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
