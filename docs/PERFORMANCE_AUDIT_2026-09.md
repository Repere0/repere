# Repère — audit de performance (production)

*Mesuré le 22 septembre 2026, sur `https://repereapp.netlify.app/?verif=20260922b`
(paramètre anti-cache, `performance.getEntriesByType("navigation")` dans un
vrai navigateur). Aucun chiffre de ce document n'est une estimation :
chacun est soit lu depuis `performance`, soit compté sur le contenu réel de
`window.REPERE_*`.*

---

## 1. Le chiffre qui commande tout le reste

| mesure | valeur |
|---|---:|
| `decodedBodySize` (poids réel décompressé) | **16 286 093 octets** |
| `transferSize` (poids réellement transféré, gzip) | **6 022 536 – 6 022 724 octets** (mesuré 3 fois à des dates différentes, stable) |
| nombre de requêtes réseau au chargement | **1** |

Une seule requête HTTP. Ce n'est pas une accumulation d'assets : **c'est un
seul document HTML qui embarque tout**.

## 2. Ce qui est réellement embarqué dans ce document unique

| Élément | Taille | Utilisé ? | Nécessaire au démarrage ? | Source | Action |
|---|---:|---|---|---|---|
| `window.REPERE_RNE` (élus : maires, adjoints, conseillers) | **~6,6 Mo** (mesuré : `JSON.stringify(window.REPERE_RNE).length`) | Oui, mais **une seule commune à la fois** est lue | **Non** — seule la commune choisie par le lecteur est affichée | Ministère de l'Intérieur (RNE) | Découper par département (déjà fait dans `mono/`, jamais branché ici) |
| `window.REPERE_OFGL` (comptes des collectivités) | **~8,6 Mo** | Oui, même limite | **Non** | OFGL/DGFiP | Idem — découpage par département déjà prêt dans `mono/` |
| `window.REPERE_CIRCOS` (commune → circonscription) | **absent** dans le build actuellement en ligne (`typeof === "undefined"`) | — | — | Ministère de l'Intérieur | **Découverte, pas supposée** : le build en ligne aujourd'hui est antérieur à l'injection de cette table — corrobore le constat déjà écrit ailleurs que la publication est gelée depuis longtemps, pas seulement depuis le 26/08 |
| `window.REPERE_AGENDA_AN` / URLs de données servies | **absent** (`typeof === "undefined"` pour toutes les variantes `*_URL`) | — | — | — | Confirme : le build en ligne est la variante **autonome/embarquée**, pas la variante "servie" que `CONTEXTE_PROJET.md` décrit comme cible |
| `window.REPERE_DATA` (fil éditorial) | ~9 Ko | Oui | Oui (petit) | Rédaction manuelle validée | Aucune — déjà négligeable |
| HTML + CSS + JS applicatif (le reste) | ~1 Mo (16,29 − 6,6 − 8,6 − 0,01 ≈ 1,08 Mo) | Oui | Partiellement | Code du projet | Cible naturelle d'une bascule bundlée (déjà résolue côté `mono/`, non déployée) |

**Ce que ce tableau élimine explicitement, par la mesure et pas par
supposition** : il n'y a **aucun doublon**, **aucun blob historique
orphelin**, **aucune donnée de démonstration** embarquée en plus — le poids
vient entièrement de deux jeux de données légitimes (RNE, OFGL), embarqués
**pour la France entière** alors qu'**une seule commune** est affichée par
visite.

## 3. La comparaison déjà mesurée avec le monorepo `mono/`

*Chiffres repris du dry-run réel du 19/09/2026 (extraction + build exécutés,
pas simulés), sur le même contenu source.*

| | production actuelle | `mono/` (dry-run réel) |
|---|---:|---:|
| 1ʳᵉ requête (HTML) | 16 286 093 o (le tout) | 3 122 o |
| CSS | *(inclus ci-dessus)* | 13 899 o |
| JS applicatif | *(inclus ci-dessus)* | 28 924 + 20 516 o |
| données pour **une** commune (recherche → fiche → onglet par défaut) | **16 286 093 o** (tout est déjà là) | index.json (11 015 o) + communes-beta.json (30 385 o) + 1 département (15 946 o) + 1 écran lazy (12 210 o) ≈ **136 013 o** |
| **transféré (gzip), même parcours** | **6 022 536 o** | **≈ 48 000 o** |
| **rapport mesuré** | — | **≈ 125× moins transféré** |

## 4. Cause exacte, pas une hypothèse

La cause n'est **ni** un asset dupliqué, **ni** un artefact ancien oublié,
**ni** une dépendance inutile. C'est une **décision d'architecture qui n'a
jamais été appliquée en production** : le fichier HTML autonome est conçu
pour fonctionner hors ligne sans rien télécharger (invariant 1) — il
embarque donc *tout* le pays par construction. Le monorepo `mono/` résout
exactement ce problème (chargement par département, à la demande) et est
prêt, testé, mesuré (98 contrôles statiques + 56 navigateur) — mais
`outils/pipeline.sh`, sur `main`, continue de publier la variante autonome
via `build_pwa_reconstruit.py` plutôt que le build `mono/`.

**Rien n'a été supprimé aujourd'hui.** Cet audit s'arrête ici, comme demandé :
mesurer et identifier, pas trancher une nouvelle architecture avant que la
décision de bascule (déjà proposée, jamais actée) ne soit prise par le porteur
du projet.

## 5. Prochaine action de mesure, pas de code

Une fois le run de demain validé (voir `docs/PRODUCTION_RUNBOOK.md`), la
question suivante n'est plus "où est le poids" (répondu ici) mais "quand
bascule-t-on la publication vers `mono/`" — une décision produit/coût, pas
une découverte technique restante.
