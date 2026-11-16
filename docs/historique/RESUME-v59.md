# RÉSUMÉ V59 — AUDIT DATA + INTÉGRATION TOUTES ÉCHELLES (03/11/2026)

Branche : `test/sdk58-expo-go`. Ne pas fusionner `main`.

## Départ (phase 0)

- HEAD `14c5b57` (V55 clos), arbre propre.
- CI sur `14c5b57` : Mobile **succès** ; Épreuve en cours à la lecture.
- Données présentes dans `mono/data` (produites par `scripts/extract-html.js` depuis le HTML mono-fichier) : `deputes.json` (574 mandats ouverts, source AN), `scrutins.json` (12 scrutins solennels), `scrutins/{dep}.json` (positions par département), `departments/` (fiches communes, RNE), `elus-regions/`, `communes-beta.json`, `comptes-regions.json`, `index.json`, `projets/`, `evenements.json`.
- **Absentes** : sénateurs, groupes politiques (`groupes.ts` renvoie « Inconnu »), photos d'élus, conseillers départementaux et régionaux, scrutins complets, élections, marchés, subventions, Mérimée, SRU, SSMSI, GTFS, éducation, santé, DILA, urbanisme.
- **Réseau** : accessibles `github.com`, `api.github.com`, `registry.npmjs.org`. Refusés (403 au CONNECT) : `unpkg.com`, `data.gouv.fr`, `nosdeputes.fr`, `senat.fr`, `data.assemblee-nationale.fr`, `assemblee-nationale.fr`, `geo.api.gouv.fr`, `data.economy.gouv.fr`, `data.culture.gouv.fr`, `elections.interieur.gouv.fr`, `wikidata.org`, `commons.wikimedia.org`. Détail dans BLOCAGES §60.
- **Source assumée** : le découpage administratif vient du paquet npm officiel `@etalab/decoupage-administratif` 6.0.0 (publié le 09/03/2026, Licence Ouverte), et non d'unpkg, refusé. Même paquet, autre hôte. **À confirmer par le porteur.**

## Commits de V59

| Commit | Message | Contenu |
|---|---|---|
| `0adf0d0` | feat(data): découpage administratif IDF complet | 1 266 communes des 8 départements ; `scripts/construire-decoupage-idf.mjs`, `scripts/decoupage-idf.json` (versionné), copie par `extract-html.js`, `chargerDecoupageIdf` (client partagé), `lib/decoupage.ts`, `tests/decoupage.test.mjs`, contrôle d'invariant 4 |
| `bcd9886` | docs(v59) : départ et blocages | ce fichier (phase 0) et BLOCAGES §60 |
| `1ddfa0f` | feat(qui-decide) : nom de l'intercommunalité par le découpage officiel | 401 communes sans nom dans la fiche reçoivent le nom officiel, avec sa source et sa date |

## Ce qui est fait et vérifié

- **1.1 Découpage IDF** : fichier produit, 1 266 communes, EPCI présent pour toutes, population pour toutes, source et date dans le fichier. Test de données (4) et invariants (61/61) OK. Publication via `extract-html.js` contrôlée dans un dossier de test (fichier identique).
- **Intercommunalité** : affichée dans « Qui décide » quand la fiche ne la nomme pas. Vérifiée dans le navigateur (Amillis : « CA Coulommiers Pays de Brie », source Etalab visible, aucune erreur de page).

## Ce qui est partiel

- **Intercommunalité** : nom seulement, pas le président (aucune source accessible). 91 libellés diffèrent par la graphie de ceux du RNE (BLOCAGES §60.4).
- **Ma commune (4.1)** : écran nouveau non construit. Le découpage est ajouté à « Qui décide », pas à un écran à part.
- **5.2 Squelettes** : déjà en place sur les écrans qui chargent ; non audités écran par écran.
- **5.1 Contact élu** : déjà en place (`ui/contact.tsx`), non refait.

## Ce qui n'est pas fait (bloqué par le réseau, BLOCAGES §60.1)

- 1.2 Groupes politiques (AMO30) · 1.3 Sénateurs · 1.4 Scrutins complets · 1.5 Conseillers départementaux et régionaux · 1.6 Photos d'élus.
- 2.1 à 2.10 (P1 data), 3.1 à 3.5 (P2 data).
- 4.2 Scrutin détaillé · 4.3 Élections · 4.4 Marchés.
- 5.3 Timeline vote (parcours des scrutins absent).

## Vérification (sur le commit du découpage et de l'intercommunalité)

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit` (apps/mobile) | 0 erreur |
| Suite partagée (liste de `mobile.yml`, avec le nouveau test) | **300 / 300** |
| Invariants | **61 / 61** |
| `parcours-web` | 225 contrôles, 0 échec |
| R1 / R2 / R3 à 390 × 844 | 411 / 613 / 843 px (inchangé) |
| `commune`, `recherche`, `elections`, `partage-texte`, `onboarding`, `zoom`, `mode`, `partage-story` | 0 échec |
| `meme-verite` | 107 faits, 0 échec |
| Export web (CI) et export natif iOS / Android | OK |

## CI

- `2b68454` (dernier commit de code et de docs) : **Mobile succès**. Épreuve en attente à la rédaction.
- `1ddfa0f` : Mobile annulé, remplacé par le push suivant (pas un échec de code).
- `ff85fe2`, précédent : rouge (invariant 3), corrigé en V55.
