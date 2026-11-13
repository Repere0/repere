# Paris et ses arrondissements

Date : 13/11/2026 (décision du porteur : voir Paris en entier ET choisir un arrondissement).

## Ce qui est fait
- Paris reste une seule commune (75056) : budget, maire, projets sont ceux de la Ville entière.
- La page de Paris affiche une carte « Votre arrondissement » (`ui/arrondissement-paris.tsx`) : « Tout Paris » ou un
  arrondissement de 1 à 20. Le choix dit la mairie de proximité (`packages/core/src/paris.js`) : « Paris Centre » pour
  les 1er, 2e, 3e et 4e (un seul secteur depuis juillet 2020, source : paris.fr), sinon la mairie de l'arrondissement.
- Chercher Paris par un code postal (« 75011 ») ouvre Paris avec l'arrondissement déjà choisi. L'arrondissement est lu
  dans `codes-postaux.json` (champ `arrondissements`, produit par `collecte-codes-postaux.mjs` à partir des codes INSEE
  75101 à 75120 de La Poste). Il n'est jamais déduit du code postal lui-même.
- Le choix vit en mémoire seulement (`lib/arrondissement.ts`) : rien n'est écrit sur l'appareil (invariant 2) ; il
  s'oublie à la fermeture.

## Ce qui n'est PAS fait, et pourquoi il n'y a pas de données d'essai
Le porteur autorisait des données d'essai. Elles n'ont pas été posées : un faux nom de maire d'arrondissement ou un
faux député sur un écran civique serait pris pour vrai (invariants 4 et 5). À la place, la carte dit en une phrase ce
que Repère ne publie pas encore.

| donnée manquante | source à brancher | remarque |
|---|---|---|
| maire d'arrondissement (17 maires de secteur ou d'arrondissement) | Répertoire national des élus, fichier des conseillers d'arrondissement (ministère de l'Intérieur, data.gouv.fr) | à décrire sur le runner avant de coder (`ingerer-une-source`) : nom du fichier et colonnes non vérifiés |
| député par arrondissement | table des circonscriptions du ministère de l'Intérieur (`data/circos_ministere.xlsx`, déjà collectée) | plusieurs arrondissements sont partagés entre deux circonscriptions : l'adresse reste nécessaire, l'arrondissement ne fera que réduire la liste |
| budget par arrondissement | aucune : les états spéciaux d'arrondissement ne sont pas dans les comptes OFGL | à ne pas promettre |

Aucun appel réseau n'est ajouté dans l'application : ces données passeront par la chaîne de collecte, puis par un
fichier publié (par exemple `paris-arrondissements.json`, lu comme `codes-postaux.json`).
