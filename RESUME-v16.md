# RESUME v16 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit de code : `tsc` à 0 erreur, tests partagés à 251/251, parcours navigateur à 222/222, contrôle des invariants à 0 erreur, syntaxe de `outils/pipeline.sh` vérifiée.

## Commits

| Commit | Objet |
|---|---|
| d4773ac | Bloc 0 — invariants 4 et 7 (D27, D28), ADR 0004 et 0005. **Poussé avec CLAUDE.md à 121 lignes (erreur E1)** |
| a6ddbd2 | Correctif : CLAUDE.md sous 120 lignes, sceau régénéré, 0 erreur |
| 620ed09 | Bloc 1 — sites des mairies (annuaire DILA) |
| 04a5c9f | Bloc 2 — photos libres Wikimedia, crédit, initiales en repli |
| (ce commit) | RESUME-v16 |

## Couverture : inconnue, et voici pourquoi

**L'API DILA, Wikidata et Wikimedia Commons sont refusés par le proxy de cette session.** J'ai écrit les deux scripts et vérifié leurs règles hors ligne, mais ils n'ont tourné sur aucune donnée réelle. Je ne peux donc pas donner :

- la part des **574 députés publiés** (dont 97 en Île-de-France) qui auront une photo ;
- la part des maires des **1 262 communes de la bêta** qui auront une photo ;
- le nombre de communes avec un site de mairie déclaré.

Chaque script écrit ces chiffres à son premier passage dans `outils/pipeline.sh` (`couverture` dans `mairies-idf.json`, ligne de bilan des photos). Or cette chaîne ne publie que depuis `main`.

## Ce qui est en place

- **Sites de mairies** : `mono/scripts/collecte-sites-mairies.mjs` produit `data/mairies-idf.json`. Sur l'écran Aujourd'hui, la liste « Aller plus loin » affiche « Site officiel de la mairie » (lien externe) quand l'annuaire donne une adresse. Aucune adresse n'est devinée.
- **Photos** : `mono/scripts/collecte-photos-elus.mjs` produit `data/photos-elus/{dep}.json`. Seules les licences libres sont acceptées, avec un rapprochement double (identifiant ou commune, plus le nom). Les vignettes sont intégrées aux fichiers. Sur la fiche élu : la photo, ou les initiales, et le crédit « Photo : auteur · licence · Wikimedia Commons (recadrée) ».
- **Gardes** : l'invariant 4 autorise les deux nouvelles adresses et exige une source, une licence et une date. Une photo sans auteur ou sous licence NC ou ND fait échouer les tests.

## Écarts avec la brief

1. **Photos servies par département, jamais chargées chez Wikimedia à l'affichage.** Sinon, Wikimedia apprendrait quel élu chaque lecteur regarde (invariant 2). Vérifié : aucune requête vers un tiers à l'ouverture d'une fiche.
2. **Clé des maires** : « M » + code INSEE, car le Répertoire national des élus n'a pas d'identifiant de personne.
3. **Annuaire « Élus » sans photos** : il faudrait charger les photos de tous les départements.
4. **Crédit** : « Photo : … · licence · Wikimedia Commons (recadrée) », plutôt que « © ». CC BY-SA demande l'auteur, la licence, la source et l'indication d'une modification.

## Pour le CEO

1. **Fusionner sur `main`**, ou lancer la chaîne autrement. Sinon, ni les sites, ni les photos, ni les agrégats (V15) n'existent en production.
2. Au premier passage, **lire les deux lignes de bilan** de la chaîne. Si « députés rapprochés 0/574 », la propriété Wikidata P4123 n'est pas la bonne : à corriger dans le script.
3. **Faire valider le droit à l'image** (une licence libre ne le couvre pas).
4. Autoriser `api-lannuaire.service-public.gouv.fr`, `query.wikidata.org` et `commons.wikimedia.org` dans les réglages réseau de Claude permettrait de mesurer la couverture dans une prochaine session.
