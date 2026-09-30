# Repère — ce que tout agent doit savoir avant d'agir

Ce fichier est chargé à chaque session : il est **court exprès** (plafond 120
lignes, gardé par `outils/derive_contexte.mjs`). Le détail se lit **à la demande**
(section « Lire à la demande »). `AGENTS.md` en est une copie exacte, pour Codex.

## Le projet

- Application civique française, **neutre**, qui répond à deux questions pour
  une commune : **qui décide chez moi** et **où va mon argent**. Chaque affirmation
  est sourcée, aucune opinion.
- Cap : bêta **Île-de-France** (1 262 communes), utilisable par un banc de
  **10 testeurs en décembre 2026** ; présidentielle d'avril 2027 en toile de fond.
- Un seul développeur, budget quasi nul : **aucune dépense sans la signaler et la
  justifier d'abord**.
- Repère est une **interface citoyenne** : ni média, ni réseau social, ni
  classement, ni jeu politique. Donner une information n'est pas dire quoi penser.
  Promesse ≠ position ≠ vote ≠ action.

## Ce que le porteur du projet demande, mot pour mot

> « Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse
> une règle du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie
> plutôt que de supposer, et quand tu ne peux pas vérifier, écris-le au lieu de
> l'arrondir. »

## Les invariants — lecture seule

Un agent ne les modifie **jamais** de sa propre initiative. Seule une décision
explicite du porteur les change ; la PR qui l'applique met alors à jour
`.claude/invariants.sha256` (sinon `outils/derive_contexte.mjs` échoue).

<!-- INVARIANTS:DEBUT -->
1. **Autonomie.** L'application fonctionne hors ligne, sans serveur applicatif.
2. **Une seule clé de stockage local** (`repere.departement` dans `mono/`, qui porte
   `{d, v}` depuis le 23/09/2026). Aucun compte, email, traceur, cookie. Le
   magasin de données (IndexedDB sur le site, dossier cache de l'application sur
   le téléphone — décision du 30/09/2026) ne garde que les fichiers publics
   publiés par Repère, sous une garde unique (`store.js`) : aucune adresse,
   aucun identifiant, aucune trace du lecteur. La commune choisie reste la seule
   donnée propre au lecteur. Aucune adresse réseau ne porte un code de commune :
   données découpées **par département**.
3. **Aucun classement**, score, ou tri numérique de personnes, de partis ou de
   territoires.
4. **Chaque chiffre porte sa source officielle et sa date** (producteur, licence,
   mise à jour, URL). Un calcul dérivé s'annonce comme un calcul.
5. **Doctrine du vide.** Une absence de donnée produit une phrase vraie et un lien,
   jamais une forme vide, un zéro ou une barre minuscule.
6. **Rien qui gamifie le vote ou l'opinion.**
7. **Cinq couleurs d'échelon gelées** ; aucune autre couleur ne dépasse une
   amplitude de 24 sur les canaux RGB.
8. **Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence.**
9. **Fraîcheur** (décision du porteur, 30/09/2026). Une donnée gardée sur
   l'appareil peut être affichée pour préserver l'accès hors ligne, mais jamais
   présentée comme actuelle si elle ne l'est pas. Trois états, toujours
   distinguables à l'écran : **actuelle** (publication courante, vérifiée),
   **publication précédente** (le lecteur le comprend immédiatement), **impossible
   à vérifier** (on ne prétend pas que c'est à jour). La confiance passe avant
   l'impression de fluidité.
<!-- INVARIANTS:FIN -->

## Où vit quoi (état du 29/09/2026)

- **Production** : `mono/` (React/Vite, sortie statique). `outils/pipeline.sh` la
  construit et l'éprouve ; `.github/workflows/collecte.yml` la publie chaque matin
  sur Netlify. Cloudflare Pages est la cible décidée, **non commencée**.
- **Source des données** : les blocs `REPERE_*` de `app_repere_v18_20.html`, lus
  par `mono/scripts/extract-html.js`. Ne jamais éditer un bloc à la main.
- **Fil éditorial** : `data/evenements/*.md` (validés par le porteur) ;
  `data/auto/*.md` = brouillons machine, jamais affichés.
- **`main` est protégée** : tout passe par une pull request, vérifiée par
  `.github/workflows/verification.yml` (chaîne sans publier + application
  mobile) ; son job **Verdict** dit VERT ou ROUGE, et ce qui bloque. Ne jamais
  fusionner ni pousser sur `main` sans l'accord du porteur.
- **Banc** : l'ordre exact est celui de la fin de `outils/pipeline.sh` (build de
  `mono/`, puis `pnpm test`, puis `test_repere.mjs` sur le fichier autonome).
  Jamais `playwright install` dans le conteneur (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
  Poids du premier écran : plafond 120 Ko, gardé par `mono/tests/runtime.test.mjs`.
- **Réseau** : le conteneur cloud ne joint pas les sources françaises
  (data.gouv.fr, data.assemblee-nationale.fr) ; seul le runner GitHub télécharge.

## Lire à la demande — ne pas charger d'office

| besoin | fichier |
|---|---|
| pièges déjà rencontrés | `CONTEXTE_PROJET.md` § 9 |
| ce qui a été refusé, et pourquoi | `CONTEXTE_PROJET.md` § 10 |
| architecture du monorepo, décisions | `CONTEXTE_PROJET.md` § 14 |
| histoire de l'ère mono-fichier (avant le 23/09) | `CONTEXTE_PROJET.md` § 4 à 8 et 12 |
| carte produit, questions citoyennes | `docs/PRODUCT_MAP_V1_2026-09-23.md` |
| retour arrière de la production | `docs/MONO_PRODUCTION_ROLLBACK.md` |
| couche éditoriale | `docs/COUCHE_EDITORIALE.md` |

## Procédures — skills de `.claude/skills/`

- `modifier-repere` : toute modification du code ou des données.
- `prouver-une-garde` : écrire un contrôle et le voir échouer avant de s'y fier.
- `ingerer-une-source` : brancher une donnée publique avec sa provenance.
- `valider-un-fait` : préparer un fait du fil pour la validation du porteur.
- `rapport-de-session` : terminer une session et laisser le contexte vrai.
- `consolider-le-contexte` : relecture hebdomadaire hors session (« dreaming »).

## Règles courtes

- Mesurer plutôt que supposer ; un chiffre non mesuré s'écrit comme non mesuré.
- Un garde-fou se prouve en le cassant.
- Apostrophe typographique `’` interdite dans le code ; accents obligatoires dans
  tout texte affiché.
- Un fait durable va dans `CONTEXTE_PROJET.md`, une procédure dans une skill,
  jamais dans ce fichier.
- Avant toute PR qui touche ce fichier, `AGENTS.md`, une skill ou
  `CONTEXTE_PROJET.md` : `node outils/derive_contexte.mjs`.
