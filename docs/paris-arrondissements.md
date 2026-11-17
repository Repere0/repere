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

## Collecte des députés et des maires d'arrondissement (17/11/2026)

`mono/scripts/collecte-paris-arrondissements.mjs`, lancé chaque matin par `outils/pipeline.sh`, écrit
`paris-arrondissements.json` (lu par `chargerParisArrondissements` dans `data-utils/src/client.js`, copié par
`miroir-donnees.mjs`). La carte « Votre arrondissement » en tire, pour l'arrondissement choisi, le ou les députés
(noms lus dans `deputes.json`) et le maire d'arrondissement. Tant que le fichier ou une de ses parties manque, la
carte garde ses phrases « pas encore publié ». **Il n'y a pas de données d'essai** : aucun faux nom n'est publié,
les seules données inventées sont les fixtures de `mono/tests/paris-arrondissements.test.mjs`.

| partie | source exacte | lecture | garde |
|---|---|---|---|
| circonscriptions | `data/circos_bureaux_de_vote.csv`, déjà collecté (`https://www.data.gouv.fr/api/1/datasets/r/ed6c2f24-2b83-4a26-a1a2-14c928b58b0b`, schéma dans `docs/schema_circos_bv.md`) | Paris y est une seule commune (75056) : l'arrondissement d'un bureau est lu dans les deux premiers chiffres de `numeroBureauVote` (« 1104 » = 11e). **Hypothèse non vérifiée ici** (le conteneur ne joint pas data.gouv.fr), annoncée à l'écran comme « Calcul Repère » | rien n'est écrit si un seul bureau parisien ne se lit pas ainsi, ou si un des 20 arrondissements manque |
| maires d'arrondissement | jeu « Répertoire national des élus » : `https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-elus-1/`, ressource dont le titre contient « arrondissement » | colonnes reconnues par mots-clés (comme `outils/rne.py`), fonction commençant par « Maire » (jamais « adjoint »), arrondissement par code INSEE 75101–75120 ou libellé (« Paris 11e », « Paris Centre » = 1er à 4e) | rien n'est écrit si moins de 16 arrondissements ont exactement un maire. **On ne sait pas si cette ressource existe** : le journal du runner liste les titres des ressources et l'entête lue (`::notice title=paris-rne::`) |

Ce qui a été corrigé par rapport à la première version de ce document : `data/circos_ministere.xlsx` ne sert pas pour
Paris. Il découpe Paris par codes de canton fictifs, pas par arrondissement ; la table des bureaux de vote est la seule
qui permette le calcul.

Le runner repart chaque matin du fichier publié la veille : une partie illisible aujourd'hui garde celle d'hier, avec
sa date de relevé (`source.releve_le`), affichée par la carte.

**Lu sur le runner le 17/11/2026** (collectes d'essai 149 et 150, hors de `main`) :
- circonscriptions : 899 bureaux parisiens, tous lus selon l'hypothèse « arrondissement + bureau », les 20
  arrondissements couverts, 13 partagés entre plusieurs circonscriptions ;
- maires : la ressource est `elus-conseillers-darrondissements-ca.csv` (modifiée le 11/08/2026), 503 lignes à Paris,
  code commune 75056, colonne « Libellé du secteur » en « Paris 11Eme Secteur », 17 secteurs (« Paris 1Er Secteur »,
  puis 5e à 20e), et 17 lignes « Maire d'arrondissement », une par secteur. Le 1er secteur est Paris Centre (1er à 4e).
  Le fichier des conseillers municipaux ne porte aucun maire d'arrondissement : il n'est pas lu.

**Reste à vérifier** (bilan « Paris par arrondissement » de la collecte, artefact
`collectes-essai` hors de `main`) : que les 20 arrondissements ont des circonscriptions, que les circonscriptions
lues pour un arrondissement (le 11e par exemple) correspondent à la carte officielle du découpage de 2010, et ce que le
RNE publie réellement.

## Ce qui n'est PAS fait, et pourquoi il n'y a pas de données d'essai
Le porteur autorisait des données d'essai. Elles n'ont pas été posées : un faux nom de maire d'arrondissement ou un
faux député sur un écran civique serait pris pour vrai (invariants 4 et 5). À la place, la carte dit en une phrase ce
que Repère ne publie pas encore.

| donnée manquante | source à brancher | remarque |
|---|---|---|
| maire d'arrondissement (17 maires de secteur ou d'arrondissement) | branché le 17/11/2026 (voir plus haut) | nom de la ressource et colonnes non vérifiés : le script les décrit sur le runner |
| député par arrondissement | branché le 17/11/2026 (voir plus haut), à vérifier sur le runner | plusieurs arrondissements sont partagés entre deux circonscriptions : l'adresse reste nécessaire, l'arrondissement ne fait que réduire la liste |
| budget par arrondissement | aucune : les états spéciaux d'arrondissement ne sont pas dans les comptes OFGL | à ne pas promettre |

Aucun appel réseau n'est ajouté dans l'application : ces données passeront par la chaîne de collecte, puis par un
fichier publié (par exemple `paris-arrondissements.json`, lu comme `codes-postaux.json`).
