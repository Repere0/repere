# RÉSUMÉ V59 — AUDIT DATA + INTÉGRATION TOUTES ÉCHELLES (03/11/2026)

Branche : `test/sdk58-expo-go`. Ne pas fusionner `main`.

## Départ (phase 0)

- Dépôt : HEAD `14c5b57` (V55 clos). Arbre propre avant V59.
- CI sur `14c5b57` : Mobile **succès**, Épreuve en cours à la lecture (voir section CI en fin de fichier).
- Données présentes dans `mono/data` (produites par `scripts/extract-html.js` à partir du HTML mono-fichier) : `deputes.json` (574 mandats ouverts, source AN), `scrutins.json` (12 scrutins solennels), `scrutins/{dep}.json` (positions par département), `departments/`, `elus-regions/`, `communes-beta.json`, `comptes-regions.json`, `index.json`, `projets/`, `evenements.json`.
- **Absentes** : `senateurs`, groupes politiques (`groupes.ts` renvoie « Inconnu » : le fichier AMO30 n'existe pas), photos d'élus (`photos-elus/` non produit), conseillers départementaux et régionaux (fichiers absents), scrutins complets (seuls 12 solennels), élections, marchés, subventions, Mérimée, SRU, SSMSI, GTFS, éducation, santé, DILA.
- **Réseau** (session cloud, politique d'egress) : accessibles : `github.com`, `api.github.com`, `registry.npmjs.org`. **Refusés (403 au CONNECT)** : `unpkg.com`, `www.data.gouv.fr`, `static.data.gouv.fr`, `www.nosdeputes.fr`, `www.senat.fr`, `data.assemblee-nationale.fr`, `www.assemblee-nationale.fr`, `geo.api.gouv.fr`, `data.economy.gouv.fr`, `data.culture.gouv.fr`, `elections.interieur.gouv.fr`, `www.wikidata.org`, `commons.wikimedia.org`, `fr.wikipedia.org` (depuis le shell), `tabular-api.data.gouv.fr`.
- Conséquence : toute donnée P0/P1/P2 qui ne vient pas d'un paquet npm officiel ou du HTML déjà présent est **non disponible** dans cette session. Chaque cas va dans BLOCAGES.md (§60).
- Choix de source assumé : le découpage administratif est pris dans le paquet npm officiel `@etalab/decoupage-administratif` 6.0.0 (publié le 09/03/2026), et non sur unpkg, qui est refusé. Même paquet, autre hôte. Le signaler au porteur.
