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
