# Sites officiels des mairies (Île-de-France)

Date : 30/10/2026. Décision D28, ADR 0005.

## Source

- **Producteur :** DILA, Annuaire de l'administration (Service-Public).
- **Licence :** Licence Ouverte 2.0.
- **API :** `https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration` (point d'export JSON, filtré par département).

## Production

- Script : `mono/scripts/collecte-sites-mairies.mjs`, appelé par `outils/pipeline.sh` à chaque publication. Il est non bloquant : sans réseau ou si l'API change, aucun lien n'est affiché, le reste se publie.
- Sortie : `data/mairies-idf.json`, au format `{ v, genere_le, source, couverture, communes: { "77288": { nom, site } } }`. Seules les communes de la bêta y figurent.
- Règles :
  - seule la mairie principale est retenue (pas les annexes ni les mairies déléguées) ;
  - l'adresse doit commencer par `http(s)://` ;
  - aucune adresse n'est devinée ;
  - si les champs attendus (`pivot`, `code_insee_commune`, `site_internet`) manquent, le script s'arrête sans rien écrire.

## Dans l'application

- Aujourd'hui, liste « Aller plus loin » : une ligne « Site officiel de la mairie » quand l'annuaire donne une adresse. Elle ouvre le navigateur. Rien n'est lu sur le site.
- Un seul fichier pour toute l'Île-de-France : aucune adresse réseau ne porte un code de commune (invariant 2).
- Garde de l'invariant 4 (`mono/tests/invariants.test.mjs`) : adresse autorisée ; le fichier doit porter sa source, sa licence et sa date.

## Non vérifié

- **L'API n'a pas pu être interrogée depuis la session de travail** (connexion refusée par le proxy). Les noms de champs n'ont pas été confirmés sur une vraie réponse. Le tri (mairie principale, annexe écartée, commune sans site) a été vérifié hors ligne sur des fiches construites, qui ne sont pas des données réelles.
- **La couverture est inconnue** : combien des 1 262 communes ont un site déclaré. Le script l'écrit dans `couverture` au premier passage de la chaîne.
- L'affichage du lien a été vérifié dans le navigateur avec un fichier d'essai construit pour Meaux, retiré ensuite et jamais publié.

## Validation par lecture (V18, 30/10/2026)

| Point | Constat | Changement |
|---|---|---|
| 1. `site_internet` | Lu sous trois formes : liste JSON `[{valeur}]` ou `[{url}]`, ou chaîne simple. Une adresse n'est gardée que si elle commence par `http(s)://`. Le nom du champ est confirmé par le porteur. | Aucun |
| 2. Filtre « mairie » | La brief écrit `type_organisme = "mairie"`. Le script lisait `pivot[].type_service_local`. La note DILA du 17/07/2024 nomme le champ `code_type_service_local` (le « code-pivot »). La forme exacte n'a pas été vue sur une vraie réponse. | Le script accepte les trois noms (`code_type_service_local`, `type_service_local`, `type_organisme`), dans `pivot` ou à la racine. Annexes et mairies déléguées écartées par le nom. |
| 3. Pagination | Le script utilise le point d'export (`/exports/json`), qui rend tout sans limite de 100. | Ajout d'un repli sur `/records`, par pages de 100, si l'export est refusé (offset jusqu'à 9 900, limite de l'API, avec un avertissement au-delà). |
| 4. Code INSEE | `code_insee_commune`, **confirmé** par la note DILA du 17/07/2024 (exemple « 31496 »). | Aucun |

Vérifié hors ligne sur des fiches construites (ce ne sont pas des données réelles) :
- type dans `pivot` et dans `code_type_service_local` ;
- annexe écartée ;
- repli paginé sur deux pages quand l'export renvoie HTTP 403.

Lancé en ligne de commande sans réseau : le script s'arrête (code 2) et n'écrit rien.

## Si la collecte retourne 0 site

Vérifier que les noms de champs de l'API correspondent à ce que le script attend. **La liste des champs reçus s'affiche dans le journal de la CI** : si un champ attendu manque, le script s'arrête en l'écrivant (« champs reçus : … »). Si des fiches ont été lues mais qu'aucun site n'a été retenu, il écrit « AUCUN site retenu… ». Corriger alors le nom du champ dans `mono/scripts/collecte-sites-mairies.mjs` (`CLES_TYPE` pour le type, `siteDe` pour le site).

Sources de la vérification :
- note DILA « Base de données locales Service-public.fr, nouvelle API annuaire local », 17/07/2024 : https://echanges.dila.gouv.fr/OPENDATA/ (fichier `DILA-Base-donnees-locales-Service-public-fr-Info-nouvelle-API-annuaire-local-et-comp-geo-20240717.pdf`) ;
- la documentation technique de l'API (pièce jointe du jeu de données) n'a pas pu être lue depuis la session : accès refusé.
