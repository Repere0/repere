# Inventaire exhaustif de l'état actuel (V36, bloc 6)

Date : 31/10/2026. Branche `test/sdk58-expo-go` (HEAD au moment de l'écriture : `aae2929`, le commit de ce document suit). Chaque chiffre est mesuré dans le dépôt à cette date. Ce qui ne l'est pas est écrit comme tel.

**Écart avec le brief** : le brief parle de 18 écrans. Il y a **23 fichiers d'écran** dans `mono/apps/mobile/src/app/` (hors mises en page `_layout.tsx`). Les 23 sont listés ci-dessous, sans en retirer.

---

## A) Écrans

Lignes = nombre de lignes du fichier. « Tests » = nombre de fichiers de test qui citent la route (recherche textuelle, approximative : une route très courte comme `/` est citée partout). État :
- **complet** : affiche des données réelles et tient son rôle de bout en bout ;
- **partiel** : fonctionne mais avec une limite nommée dans le fichier ou dans la doc ;
- **placeholder** : aucun ou presque aucun contenu réel.

| # | Route | Fichier | Description (en-tête du fichier) | Lignes | Tests | État |
|---|---|---|---|---|---|---|
| 1 | `/` | `index.tsx` | Ouverture et choix de la commune (« une question, un champ ») ; fond toujours sombre | 643 | 13 | complet (fond sombre imposé, voir WCAG) |
| 2 | `/a-venir` (onglet Calendrier) | `(onglets)/a-venir.tsx` | Agenda national de l'Assemblée et du Sénat, semaine et mois | 312 | 0 (testé par libellé) | partiel : agenda national, dit à l'écran |
| 3 | `/chez-vous` (onglet Aujourd'hui) | `(onglets)/chez-vous.tsx` | Les réponses du jour pour la commune | 218 | 2 | partiel (dépend des données de commune) |
| 4 | `/elus` (onglet Élus) | `(onglets)/elus.tsx` | Annuaire des élus publiés, France entière | 168 | 1 | complet pour les députés ; sénateurs absents |
| 5 | `/qui-decide` (onglet Qui décide) | `(onglets)/qui-decide.tsx` | Chaîne de décision de la commune, du plus proche au plus lointain | 129 | 4 | complet pour la commune retenue ; groupes absents |
| 6 | `/mes-elus` | `mes-elus.tsx` | Vue compacte des élus de la commune | 108 | 1 | complet |
| 7 | `/actus` | `actus.tsx` | Événements nationaux publiés (`evenements.json`), plus récent d'abord | 97 | 1 | partiel : nationaux seulement, aucune actu locale |
| 8 | `/argent` | `argent.tsx` | « Où va l'argent de … ? » : budget communal, chiffres clés | 287 | 0 | complet (données OFGL 2025) |
| 9 | `/bienvenue` | `bienvenue.tsx` | Quatre questions au premier lancement | 141 | 0 | complet (testé en onboarding-web) |
| 10 | `/confidentialite` | `confidentialite.tsx` | Politique de confidentialité, même texte que `docs/privacy-policy.md` | 54 | 1 | complet (texte juridique, non revu) |
| 11 | `/confort-lecture` | `confort-lecture.tsx` | Réglages de lecture gardés dans le profil ; ceux sans effet sont listés | 75 | 0 | complet |
| 12 | `/dictionnaire` | `dictionnaire.tsx` | Dictionnaire citoyen (table partagée avec le web) | 104 | 1 | complet |
| 13 | `/elu` | `elu.tsx` | Fiche d'un élu : synthèse d'abord, votes ensuite | 348 | 1 | complet pour les votes ; photo selon licence |
| 14 | `/vote` | `vote.tsx` | « Qu'a voté votre député ? » : position, puis répartition du scrutin | 139 | 0 | complet |
| 15 | `/annuaire-fiche` | `annuaire-fiche.tsx` | Fiche d'un élu de l'annuaire : identité, fonction, source | 58 | 0 | partiel : pas de vote ici, dit à l'écran |
| 16 | `/partager` | `partager.tsx` | Partager un vote : cartes et message | 228 | 0 | complet (vérifié en partage-story-web) |
| 17 | `/faq` | `faq.tsx` | Huit questions fréquentes | 91 | 0 | complet |
| 18 | `/pour-vous` | `pour-vous.tsx` | Fil chronologique filtré par la vue | 221 | 0 | partiel : dépend des données publiées |
| 19 | `/procedure` | `procedure.tsx` | « Comment une loi devient loi » (étapes de `@repere/core`) | 90 | 0 | complet (étapes fixes, non rattachées à un texte réel) |
| 20 | `/scrutins` | `scrutins.tsx` | Explorer les scrutins : lecture, puis détail | 461 | 1 | partiel : 12 scrutins retenus dans `scrutins.json` |
| 21 | `/sources` | `sources.tsx` | D'où viennent les informations, date de chaque source | 60 | 0 | complet |
| 22 | `/voter` | `voter.tsx` | Agenda des élections nationales et guide du vote | 87 | 0 | partiel : dates vérifiées le 30/10, non datées au-delà |
| 23 | `/a-propos` | `a-propos.tsx` | Ce qu'est Repère ; le contact n'apparaît que si `EXPO_PUBLIC_CONTACT_EMAIL` est défini | 36 | 0 | partiel : contact masqué tant que la variable est absente (BLOCAGES §39) |

Les écrans 13 à 16 ont besoin d'un paramètre d'URL pour s'afficher ; ils n'ont pas été rendus dans l'inventaire visuel de cette session.

---

## B) Données (`mono/data/` et `data/`)

Dates = celles enregistrées dans les fichiers. Les dates en ligne ne sont pas vérifiées (voir `docs/audit-data.md`).

| Fichier | Taille | Date (dans le fichier) | Entrées | Couverture | Écrans | Fraîcheur |
|---|---|---|---|---|---|---|
| `deputes.json` | 54 Ko | relevé 28/10/2026 | 574 députés | 574 / 577 | Élus, Qui décide, Mes élus, Fiche | 3 jours |
| `departments/*.json` (104 fichiers) | 19,4 Mo | RNE 11/08/2026 ; OFGL 29/07/2026 | 34 637 communes | budget : 34 570 ; 2025 : 34 474 ; maires : 34 637 | Qui décide, Argent, Chez vous, Mes élus | RNE : 81 jours ; OFGL : 95 jours |
| `communes-beta.json` | 30 Ko | Etalab (date non relevée) | 1 262 (IDF) | IDF seulement | Accueil (choix de commune) | — |
| `comptes-regions.json` | 25 Ko | OFGL 29/07/2026 | 17 régions | régions | Argent (régional) | 95 jours |
| `agregats-regionaux.json` | 4 Ko | OFGL 29/07/2026 | 17 régions | régions | Argent | 95 jours |
| `elus-regions/*.json` | 150 Ko | non relevée | 14 régions | 14 / 18 | Élus régionaux | inconnue |
| `evenements.json` | 15 Ko | 28/10/2026 | 8 événements | national | Actus | 3 jours |
| `scrutins/*.json` (107 fichiers) | 107 Ko | 28/10/2026 | positions par département | — | Vote, Élus | 3 jours |
| `projets/*.json` (8 fichiers, IDF) | 254 Ko | DGCL, date non relevée | 8 départements | IDF seulement | Argent (projets) | inconnue |
| `index.json` | 18 Ko | généré 30/10/2026 | sources et santé de la chaîne | — | toutes les sources | 1 jour |
| `../data/actus-hebdo.json` | 312 o | semaine 2026-W45 | 3 communes pilotes | **vide** | Chez vous (actualité locale) | — |
| `photos-elus/` | — | — | **absent de cette copie** (produit par la chaîne) | non mesuré | Fiche élu | — |
| `deputes-groupes.json` | — | — | **absent** (B2, script branché, non exécuté) | — | Qui décide (non branché) | — |
| sénateurs, textes de loi, amendements | — | — | **absents** | — | — | — |

---

## C) Fonctionnalités

État : **fait** (en production sur `main`), **partiel**, **codé non déployé** (sur la branche de test seulement), **absent**.

| Fonctionnalité | État | Commit de référence | Test | Blocage |
|---|---|---|---|---|
| Choix de commune et commune gardée (V32) | fait | V32 (sans commit relevé ici) | `apps/mobile/tests/commune-web.mjs` (15 vérifications, passent le 31/10) | — |
| Onboarding en quatre questions | fait | V34 bloc 3 | `onboarding-web.mjs` (passe le 31/10) | — |
| Zoom et taille du texte | fait | V26–V34 | `zoom-web.mjs` (passe le 31/10) | — |
| Mode d'affichage gardé (auto, clair, sombre) | codé non déployé | `3e5c81d` (D67) | `mode-web.mjs` (passe le 31/10) | Accueil ignore le mode clair (WCAG, BLOCAGES) |
| Calendrier groupé par jour | codé non déployé | `dd743ff` (M1) | `mesure-cal` en scratch ; pas de test automatisé | cible 18 au lieu de 15 : décision produit |
| Graisse du texte (règle D69) | codé non déployé | `0a3005e` | mesure sonde (`audit-final-visuel.md`) | — |
| Fiche élu avec photo (licence libre) | partiel | ADR 0004, `792e54e` | `photos-licences.test.mjs` (4 cas) | couverture non mesurée ; photos non vérifiées sur appareil |
| Groupe politique du député | partiel | `1dec22e` (B2) | `collecte-groupes.test.mjs` (8 cas) | archive AMO30 non lue ici (BLOCAGES §38) ; pas encore affiché |
| Actualité locale hebdomadaire | absent (volontaire) | `b454166` (gabarit) | — | aucune actu rédigée (décision CEO, D35) |
| Partage d'un vote (image) | fait | — | `partage-story-web.mjs` | — |
| Contact et signalement d'erreur | codé, masqué | — | — | `EXPO_PUBLIC_CONTACT_EMAIL` absente en production (BLOCAGES §39) |
| Sénateurs | absent | — | — | pas de source intégrée |
| Régionaux (4 régions manquantes) | partiel | — | — | 14 régions sur 18 |
| Textes de loi et amendements | absent | — | — | pas de source intégrée |
| Impact sur la vie (champ `impact_citoyen`) | absent | — | — | pas de champ dans le code (`grep` sans résultat) |
| Agenda des élections datées | fait | V30 bloc 2 | — | dates vérifiées le 30/10 |
| Thèmes d'intérêt | partiel | D57 | — | à confirmer par le CEO (BLOCAGES §33) |
| Publication automatique (Netlify) | **en panne** | — | `collecte.yml` | jeton refusé, HTTP 401 (BLOCAGES §37) |

---

## D) Dette technique

- **TODO / FIXME** : 2 occurrences dans `mono/apps`, `mono/packages`, `mono/scripts`, `mono/tests`, `outils` (hors `node_modules`).
- **Tests sautés** (`skip`) : 0.
- **Fichiers de plus de 500 lignes** : `mono/tests/runtime.test.mjs` (2 801), `mono/tests/invariants.test.mjs` (1 685), `mono/scripts/extract-html.js` (1 649), `mono/tests/core.test.mjs` (784), `mono/apps/mobile/src/app/index.tsx` (643), `mono/packages/data-utils/src/client.js` (636), `mono/apps/mobile/tests/parcours-web.mjs` (613).
- **Dépendances obsolètes** (`npm outdated`, appli mobile, 31/10/2026) : 9 paquets. Les plus notables : `typescript` 6.0.3 → 7.0.2, `@types/node` 22.20.5 → 26.6.6 (majeure), `expo` 58.0.21 → 58.0.22, `expo-router` 58.0.28 → 58.0.29, `react` et `react-dom` 19.3.0 → 19.3.1. Non mis à jour : hors périmètre de ce bloc.
- **Blocages documentés** : 42 sections numérotées dans `BLOCAGES.md`, dont 38 à 41 ajoutées en V36.
- **Test non exécuté dans cette passe** : `runtime.test.mjs` (exige `apps/web/dist`, absent de cette copie).

---

## E) CI / CD

Workflows présents dans `.github/workflows/` : `mobile.yml`, `collecte.yml`, `epreuve.yml`, `test-mono-pipeline.yml`. **Il n'existe pas de fichier `verification.yml`** : les exécutions titrées « verification » viennent de branches de test (`test/verif-*`).

| Workflow | Dernière exécution (sur `main` sauf mention) | Cause | Lecture |
|---|---|---|---|
| `collecte.yml` (quotidienne, 05 h 47 UTC) | **échec** le 31/10 à 11 h 14, échec le 31/10 à 00 h 55, échec le 30/10 à 11 h 40 | Étape « Publier sur Netlify » : HTTP 401, jeton refusé (BLOCAGES §37). Pour le run du 31/10 à 11 h 14, l'API ne donne que l'étape d'alerte finale ; **cause non relue dans cette session**. | rouge depuis le 25/10 |
| `mobile.yml` | aucune exécution sur `main` ; sur `test/sdk58-expo-go` : des exécutions en file et annulées le 31/10 à 12 h 09 et 12 h 12 | annulées par la concurrence de branche, pas un échec | non mesurable tant que la file n'est pas finie |
| `epreuve.yml` | **succès** le 29/09/2026 sur `main` ; exécutions en attente sur la branche de test le 31/10 | — | dernière réussite à un mois |
| `test-mono-pipeline.yml` | annulée sur `main` le 22/09 ; sur `ci-test-mono-pipeline` : échec puis succès le 22/09 | — | non relancée depuis |

Les exécutions annulées par la concurrence (plusieurs push successifs sur la même branche) ne sont pas des échecs. Elles ne prouvent rien non plus : seule une exécution terminée en succès compte.
