---
name: modifier-repere
description: Toute modification du code ou des données de Repère (mono/, outils/, app_repere_v18_20.html). À suivre avant d'écrire la première ligne.
---

# Modifier Repère

## Avant d'écrire
1. Lire l'existant par lectures ciblées (`grep`, plages de lignes). Ne jamais charger
   `app_repere_v18_20.html` en entier (17 Mo).
2. Écrire en une phrase **ce que le citoyen verra de différent**. Si la réponse est
   « rien », se demander si le changement mérite d'exister.
3. Vérifier qu'aucun invariant de `CLAUDE.md` n'est touché. Si un l'est : s'arrêter
   et le dire au porteur **avant** d'écrire.

## Écrire
- Une branche par sujet (`feat/…`, `fix/…`, `docs/…`, `data/…`), jamais `main`.
- Dans `mono/` : code normal, une seule fonction pour une règle (deux endroits qui
  dérivent la même règle finissent par diverger — CONTEXTE_PROJET § 9). Déplacer
  une fonction partagée, ne jamais la recopier.
- Dans le fichier autonome : patch Python à assertions, `assert src.count(ancre) == 1`
  sur chaque ancre **avant** d'écrire ; ancre introuvable = re-dériver par `grep`,
  jamais deviner. Apostrophes ASCII seulement dans les ancres.
- Texte affiché : accents obligatoires, dates écrites en toutes lettres comme
  ailleurs dans l'app (« jeudi 1er octobre 2026 »).

## Prouver
- Chaque nouveau comportement a un contrôle, vu **rouge** puis vert (skill
  `prouver-une-garde`).
- Lancer le banc (ordre de la fin de `outils/pipeline.sh`). `rm -rf mono/apps/web/dist`
  avant toute mesure de poids : `pnpm build` ne nettoie pas `dist/`.
- Relire les captures d'écran à l'œil : la moitié des défauts réels ont été vus,
  pas assertés. Un banc vert sur une page cassée reste un banc vert.
- Mesurer le poids ajouté au premier écran (plafond 120 Ko).

## Livrer
- Message de commit : ce qui était faux **mesuré**, le correctif, la preuve
  (contrôles ajoutés, garde cassée), le poids. Pas de résumé flatteur.
- Pousser la branche, ouvrir une PR vers `main`, **ne jamais la fusionner** sans le
  porteur. Une PR dont l'épreuve est rouge ne se fusionne pas.
- Si le changement rend faux une ligne de `CLAUDE.md` ou de `CONTEXTE_PROJET.md`,
  la corriger dans la même PR.
