# Candidature à l'Accélérateur d'Initiatives Citoyennes (DINUM) : brouillon (V43)

Statut : **brouillon à valider par le CEO**. Rien n'est envoyé. Les chiffres marqués « à chiffrer » et les partenaires « à confirmer » ne sont pas renseignés, parce qu'aucune source du dépôt ne les donne.

## Qu'est-ce que l'Accélérateur d'Initiatives Citoyennes ?

Programme de la DINUM (direction interministérielle du numérique). Vérifié sur les communiqués officiels du programme (catalogue.numerique.gouv.fr, consulté le 31/10/2026) :

- **lancé en 2021** ; saison 1 en 2022 (9 projets) ; saison 2 lancée en **mai 2023** ;
- les lauréats reçoivent un **soutien financier**, un **accompagnement méthodologique, technique, administratif et financier**, **pour une durée d'un an** ;
- il vise les projets de **gestion et de préservation des « ressources d'intérêt commun »** (les communs numériques).

**Non vérifié, à compléter avant tout envoi** (les communiqués ne le disent pas) :

- le nombre de sessions par an (la décision D89 avance mai et septembre : aucun document lu ne le confirme) ;
- le montant du soutien financier ;
- la possibilité de renouveler l'accompagnement ;
- la forme juridique exigée des candidats (association loi 1901 ou autre). **Ne pas la supposer.**
- les dates et le formulaire de l'appel en cours : à relever sur le site du programme.

## Ce que le dépôt ne dit pas

- **Licence AGPL-3.0** : citée par le brief et par la décision D88, mais **absente du dépôt**. Le fichier `LICENSE` n'a pas pu être créé dans cette session (le texte officiel n'est pas accessible d'ici, voir `BLOCAGES.md` §49). Il faut l'ajouter avant de mentionner la licence dans une candidature.
- **Adéquation** : rien dans le dépôt ne dit en quoi Repère relève des « ressources d'intérêt commun ». Les descriptions ci-dessous ne l'affirment pas.
- Les contraintes retenues ici sont celles du brief : une description de **800 caractères maximum**.

## a) Description du projet (800 caractères maximum)

Trois versions, toutes sous la limite. Le CEO en choisit une.

### Version 1 : sobre et factuelle

Repère est une application mobile gratuite, sans compte ni publicité, qui explique pour chaque commune d'Île-de-France qui décide, où va l'argent et ce qu'ont voté les élus. Chaque information renvoie à sa source officielle et indique sa date. Le code est public, et chacun peut vérifier ce qui est affiché. Repère ne collecte aucune donnée personnelle et ne fait aucun suivi publicitaire. Une bêta avec 20 à 30 testeurs en Île-de-France est prévue pour mesurer si l'outil est compris et utile. Le projet vise à rendre les décisions locales lisibles, sans intermédiaire.

*570 caractères, espaces compris.*

### Version 2 : données publiques et reproductibilité

Repère rend lisibles les données publiques locales. Pour chaque commune d'Île-de-France, soit 1 262 fiches à ce jour, l'application présente les comptes publiés par l'OFGL, les élus de la commune et les scrutins de l'Assemblée nationale, avec la source et la date de chaque donnée. Le code est sous licence libre, AGPL-3.0, et le dépôt contient le script de collecte qui produit les chiffres, pour qu'ils puissent être reproduits. Aucun compte, aucun traceur. Une bêta de 20 à 30 testeurs est prévue en Île-de-France.

*517 caractères, espaces compris.*

### Version 3 : la question du citoyen

Savoir qui décide dans sa commune est souvent difficile. Repère répond à trois questions pour chaque commune d'Île-de-France : qui décide, où va l'argent, et ce qu'ont voté les députés. Pas de compte, pas de publicité, pas de traceur. Chaque réponse est sourcée, datée, et renvoie vers la page officielle. Le projet est une application libre (AGPL-3.0). Une bêta avec 20 à 30 habitants testeurs est prévue. Les partenaires locaux sont à confirmer : aucun accord n'est signé à ce jour.

*484 caractères, espaces compris.*

## b) Budget prévisionnel sur un an

Aucun montant n'est écrit ici : le dépôt ne contient aucun devis ni facture.

| Poste | Ce qui est connu du dépôt | Montant sur un an |
|---|---|---|
| Hébergement | application publiée sur Netlify, adresse `repereapp.netlify.app` (`confidentialite.tsx`). Le plan payant ou gratuit n'est pas indiqué. | à chiffrer |
| Nom de domaine | aucun nom de domaine propre aujourd'hui | à chiffrer si décidé |
| Outils de développement | dépôt GitHub, Expo (application). Les conditions tarifaires ne sont pas vérifiées. | à chiffrer |
| Relecture juridique | avis écrit demandé par l'ADR 0007 avant toute publication automatique des flux de mairies | à chiffrer |
| Matériel de test | appareils iPhone et Android : aucun dans la session, à confirmer | à chiffrer |
| Temps du CEO | heures par semaine sur le projet | à renseigner |

## c) Partenaires pressentis

Aucun partenaire n'a confirmé par écrit. Le statut est celui de la documentation du projet, sans plus.

| Partenaire | Statut | Ce qui serait demandé |
|---|---|---|
| Mairie de Melun | pressentie, **aucun contact confirmé** ; Melun est une commune pilote des données | relecture des actualités publiées, accord écrit si le flux est repris |
| Médias locaux | **aucun contact** | relais de la bêta |
| Associations | **aucune identifiée** | relais auprès des testeurs |

## d) Objectifs à un an

Les valeurs d'état sont mesurées dans le dépôt ou dans les données du build. Les cibles sont des **propositions du rédacteur**, à valider.

| Objectif | État aujourd'hui | Cible proposée |
|---|---|---|
| Communes d'Île-de-France avec une fiche | **1 262** (`communes-beta.json`, mesuré le 31/10/2026) | 1 262 maintenues, données mises à jour à chaque collecte |
| Scrutins expliqués, fiches relues par le CEO | 19 fiches, 12 avec impact, **0 relue** (`docs/data/impact-scrutins.md`) | 19 relues, avec une fiche en plus par mois |
| Testeurs ayant fait le parcours complet | 0 (bêta non lancée) | 20 (le minimum du kit testeur) |
| Retours de testeurs lus et classés | 0 | 100 % des retours reçus lus, classés par écran |
| Blocages levés (avis juridique, licence, détails de l'appel) | 3 ouverts | 0 ouvert à six mois |

## e) Licence

AGPL-3.0, selon le brief. **Non encore présente dans le dépôt** : à décider puis à ajouter (`LICENSE`) avant de la mentionner dans la candidature.

## Ce qui n'est pas fait ici

- Aucun montant, aucun partenaire confirmé, aucun chiffre de fréquentation ou de téléchargement n'est inventé.
- Le détail de l'appel en cours (dates, dossier, critères complets) n'a pas été lu : il faut la page officielle du programme.
