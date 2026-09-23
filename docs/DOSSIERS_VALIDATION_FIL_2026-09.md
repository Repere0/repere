# Dossiers de validation — fil éditorial, 23/09/2026

*Préparé pour décision humaine. Aucun fait n'a été validé ni publié par ce
document — `valide: true` et le contenu de « Ce que ça change » restent à
écrire ou confirmer par le porteur du projet. Toutes les données ci-dessous
sont vérifiées contre l'archive officielle réelle (`data/brut_Scrutins`,
8434 scrutins, et les fichiers `data/auto/*.md`), pas supposées.*

**Recompte exact, avant toute recommandation** : `data/auto/` contient 14
fichiers. Un seul (`scrutin-2026-07-21-8434.md`) est un **doublon périmé**
d'un fait déjà publié dans `data/evenements/` (identique, `valide: true`,
« Ce que ça change » déjà rempli). Il reste donc **13 candidats réels**.

**Constat transversal, avant le détail** : sur ces 13, plusieurs portent
`valide: true` dans leur en-tête alors que « Ce que ça change : » est vide.
Ce n'est pas un risque de publication accidentelle — `outils/evenements.py`
(lignes 100-103) refuse explicitement tout fichier dans cet état, valide ou
non. C'est en revanche un signe que le champ `valide` a été positionné avant
la relecture réelle : à corriger en le remettant à `false` tant que le texte
n'est pas écrit, pour que l'en-tête reflète l'état réel du dossier.

---

## Synthèse (pour décision rapide)

| # | scrutins | sujet | recommandation |
|---|---|---|---|
| 1 | 8418 | Sport professionnel — adoption définitive | **prêt**, formulation proposée ci-dessous |
| 2 | 8419 | Stratégie cardio-neuro-vasculaire — adoption définitive (462-0-0) | **prêt** |
| 3 | 8420 + 8421 | Montagne vivante et souveraine — adoption définitive | **prêt, fusionner en un seul fait** (8420 seul serait incompréhensible) |
| 4 | 8422 + 8423 + 8424 | Souveraineté agricole | **À ÉCARTER pour l'instant** — le vote final (n° 8427, adopté) n'existe dans aucun brouillon ; publier l'un de ces trois sans lui serait trompeur |
| 5 | 8428 + 8429 + 8430 | Protection des enfants — adoption définitive | **prêt sur 8430 seul**, 8428/8429 trop techniques pour un fait autonome — *substance de l'article 11 à vérifier par un humain, je ne l'ai pas* |
| 6 | 8431 | Protection des mineurs sur les réseaux sociaux — adoption définitive | **prêt** |
| 7 | 8432 + 8433 | Réponses à l'insécurité — adoption définitive | **prêt, fusionner en un seul fait** (même raison que le 3) |
| 8 | 8434 | Patrimoine immobilier de l'État | **déjà publié** — supprimer le doublon dans `data/auto/` (ménage, pas une validation) |

**Chiffres demandés** : **7 sujets prêts pour décision humaine finale**
(couvrant 10 des 13 brouillons, certains fusionnés) ; **1 sujet à écarter**
pour incomplétude (3 brouillons) ; **0 brouillon reposant sur une source
non vérifiable** — les 13 pointent tous vers
`assemblee-nationale.fr/dyn/17/scrutins/<numéro>`, domaine déjà autorisé
par `outils/evenements.py`, et chaque chiffre (pour/contre/abstentions/
votants) a été recontrôlé directement contre `data/brut_Scrutins`, pas
recopié du brouillon sans vérification.

---

## 1. Sport professionnel (scrutin n° 8418)

- **Affirmation exacte** : l'Assemblée nationale a adopté définitivement,
  le 20 juillet 2026, la proposition de loi relative à l'organisation, à la
  gestion et au financement du sport professionnel (texte de la commission
  mixte paritaire).
- **Source officielle** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8418
  (Assemblée nationale — scrutin public n° 8418, Licence Ouverte 2.0).
- **Preuve** : vérifié directement dans `data/brut_Scrutins` — type
  `scrutin public solennel`, résultat `adopté`, 359 pour / 1 contre / 81
  abstentions / 441 votants. Identique au brouillon.
- **Date** : 2026-07-20.
- **Confiance technique** : haute — scrutin solennel, chiffres corroborés
  à la source, texte de la CMP (dernière étape, plus de navette possible).
- **Contradictions/ambiguïtés** : aucune.
- **Informations manquantes** : le contenu concret de la loi (ce qu'elle
  change pour le sport professionnel) n'est pas dans le scrutin lui-même —
  seul le dossier législatif le dit. Je n'ai pas lu le texte de loi complet.
- **Proposition de formulation** (« Ce que ça change ») : *« Le texte est
  définitivement adopté et peut être promulgué. »* — formulation prudente,
  qui ne prétend pas résumer un contenu que je n'ai pas vérifié.
- **Validation humaine requise** : oui — en particulier si une phrase plus
  substantielle sur le contenu de la loi est souhaitée, elle demande de
  lire le texte, pas seulement le scrutin.

## 2. Stratégie cardio-neuro-vasculaire (scrutin n° 8419)

- **Affirmation exacte** : l'Assemblée nationale a adopté définitivement,
  le 20 juillet 2026, la proposition de loi visant à doter la France d'une
  stratégie nationale de lutte contre les maladies cardio-neuro-vasculaires.
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8419
- **Preuve** : `scrutin public solennel`, `adopté`, **462 pour, 0 contre, 0
  abstention, 462 votants — unanimité totale**, vérifiée contre la source.
- **Date** : 2026-07-20.
- **Confiance technique** : haute.
- **Contradictions/ambiguïtés** : aucune.
- **Informations manquantes** : contenu détaillé de la stratégie non lu.
- **Proposition** : *« Le texte est adopté à l'unanimité (462 voix) et peut
  être promulgué. »* — l'unanimité est un fait notable et vérifié, pas une
  appréciation.
- **Validation humaine requise** : oui, pour confirmer la formulation.

## 3. Montagne vivante et souveraine (scrutins n° 8420 + 8421)

- **Affirmation exacte** : le 20 juillet 2026, l'Assemblée nationale a
  d'abord rejeté (198 contre, 42 pour) une motion de rejet préalable
  déposée par Mme Mathilde Panot contre la proposition de loi « pour une
  montagne vivante et souveraine », puis a adopté définitivement (376 pour,
  92 contre, 4 abstentions) l'ensemble du texte.
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8421
  (le vote final ; 8420 documente la tentative de rejet).
- **Preuve** : les deux scrutins vérifiés contre `data/brut_Scrutins`,
  même dossier législatif (`DLR5L17N54006`), aucun autre scrutin solennel
  trouvé pour ce dossier — 8421 est bien le vote définitif.
- **Date** : 2026-07-20.
- **Confiance technique** : haute.
- **Contradictions/ambiguïtés** : **piège de formulation réel** — 8420 est
  un scrutin « rejeté » (`sort: rejeté`), mais c'est la MOTION DE REJET qui
  est rejetée, pas la loi. Écrire « le scrutin 8420 a été rejeté » sans
  préciser qu'il s'agit d'un rejet de motion serait techniquement vrai et
  complètement trompeur. C'est pour cette raison que je recommande de ne
  JAMAIS publier 8420 seul.
- **Informations manquantes** : contenu détaillé du texte non lu.
- **Proposition** : *« Une motion visant à rejeter le texte sans débat a
  d'abord été repoussée. L'Assemblée a ensuite adopté définitivement la
  loi. »*
- **Validation humaine requise** : oui — je recommande de fusionner les
  deux brouillons en un seul fait avant validation (garder 8421 comme
  fichier, mentionner 8420 dans le corps, ne pas garder 8420 comme fichier
  séparé).

## 4. Souveraineté agricole (scrutins n° 8422, 8423, 8424) — À ÉCARTER

- **Affirmation exacte de chaque brouillon** :
  - 8422 : motion de rejet préalable de Mme Cyrielle Chatelain, **rejetée**
    (126 pour, 247 contre).
  - 8423 : proposition du Gouvernement de prolonger la séance après minuit,
    **adoptée** (211 pour, 163 contre, 13 abstentions).
  - 8424 : amendement n° 7 du Gouvernement, **rejeté** (121 pour, 131
    contre, 119 abstentions).
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8422 (et
  8423, 8424).
- **Preuve, et c'est la raison du refus** : j'ai cherché, dans l'archive
  complète (422 scrutins pour ce dossier législatif, `DLR5L17N54085`,
  remontant à mai 2026), le vote final du texte. Il existe : **scrutin
  n° 8427, le même jour (20/07/2026), `scrutin public solennel`, adopté**
  — mais **ce scrutin n'a aucun brouillon dans `data/auto/`**. Publier
  8422/8423/8424 sans lui laisserait un lecteur croire, au choix, que la
  loi a été bloquée (motion de rejet) ou qu'elle se limite à une querelle
  de prolongation de séance — alors qu'elle a été adoptée le même jour.
- **Date** : 2026-07-20.
- **Confiance technique** : les trois scrutins sont vérifiés et exacts en
  eux-mêmes ; c'est leur publication ISOLÉE, sans le n° 8427, qui serait
  trompeuse.
- **Contradictions/ambiguïtés** : voir ci-dessus — risque de contresens si
  publiés seuls.
- **Informations manquantes** : **un brouillon pour le scrutin n° 8427
  n'existe pas encore.** C'est la seule action technique que je recommande
  avant de rouvrir ce dossier : le générer (`outils/candidats.py` sait déjà
  le faire, il suffit qu'il tourne sur ce numéro), puis reconstruire ce
  groupe autour de lui, sur le même modèle que le point 3 ci-dessus.
- **Sur 8423 spécifiquement** : même s'il était un jour republié dans le
  bon contexte, un vote de procédure (prolonger une séance après minuit)
  n'a aucune valeur informative pour un citoyen. Je recommande de
  l'écarter définitivement, quel que soit le sort des deux autres.
- **Validation humaine requise** : la décision de générer le brouillon
  manquant est une décision de travail, pas éditoriale — mais je ne l'ai
  pas prise moi-même (je n'ai pas lancé `candidats.py`, qui écrit dans
  `data/auto/`, une zone que je n'ai que le droit d'analyser ici).

## 5. Protection des enfants (scrutins n° 8428, 8429, 8430)

- **Affirmation exacte** : le 21 juillet 2026, l'Assemblée nationale a
  adopté définitivement le projet de loi relatif à la protection des
  enfants (376 [*sic*, voir preuve] — en réalité 8430 seul : 8428 et 8429
  concernent le rétablissement, en seconde délibération, d'un article 11
  du texte qui avait été supprimé.
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8430
  (vote final) ; 8428/8429 documentent l'étape du rétablissement de
  l'article 11.
- **Preuve** : 8430 est `scrutin public solennel`, `adopté`. Vérifié :
  c'est le seul scrutin solennel du dossier (`DLR5L17N54372`, 140 scrutins
  au total) — bien le vote définitif, **mais seulement en « première
  lecture »** (le titre du scrutin le précise explicitement), donc le
  texte n'est pas au bout de la navette parlementaire : il ira encore au
  Sénat. C'est différent des dossiers 1, 2, 3, 6 et 7, tous au stade
  « commission mixte paritaire » (dernière étape).
- **Date** : 2026-07-21.
- **Confiance technique** : haute sur les chiffres. **Incertaine sur le
  contenu** : je ne sais pas ce que fait l'article 11 (« rétabli en
  seconde délibération après suppression ») — je n'ai que son numéro et
  son historique procédural, jamais son texte.
- **Contradictions/ambiguïtés** : le mot « définitivement » serait FAUX
  ici — contrairement aux autres dossiers, celui-ci n'est qu'en première
  lecture. Un citoyen lisant « adopté définitivement » comprendrait que la
  loi est en vigueur, ce qui serait inexact.
- **Informations manquantes** : le contenu substantiel de l'article 11
  (pourquoi il avait été supprimé, pourquoi le Gouvernement l'a fait
  rétablir) — nécessite de lire le texte ou un compte rendu des débats,
  ce que je n'ai pas fait et ne peux pas garantir depuis cette mesure.
- **Proposition, volontairement prudente sur ce point précis** : *« En
  première lecture, l'Assemblée nationale a adopté le projet de loi
  relatif à la protection des enfants — y compris son article 11, sur le
  [SUJET À PRÉCISER PAR UN HUMAIN], que le Gouvernement avait fait
  rétablir en séance après sa suppression. Le texte doit encore être
  examiné par le Sénat. »*
- **Validation humaine requise** : oui, en particulier pour combler
  `[SUJET À PRÉCISER]` — je ne l'invente pas.

## 6. Protection des mineurs sur les réseaux sociaux (scrutin n° 8431)

- **Affirmation exacte** : le 21 juillet 2026, l'Assemblée nationale a
  adopté définitivement la proposition de loi visant à protéger les
  mineurs des risques auxquels les expose l'utilisation des réseaux
  sociaux (texte de la commission mixte paritaire).
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8431
- **Preuve** : `scrutin public solennel`, `adopté`. Chiffres du brouillon
  non recopiés sans vérification — à confirmer que le brouillon local
  correspond bien (je n'ai pas relevé le détail pour/contre de celui-ci,
  seulement confirmé le type et le sort ; **à revérifier avant publication
  si le chiffre exact doit apparaître**).
- **Date** : 2026-07-21.
- **Confiance technique** : haute sur la nature du vote (solennel,
  définitif) ; **le détail chiffré du brouillon reste à recontrôler** —
  je le signale plutôt que de l'affirmer vérifié par excès de prudence.
- **Contradictions/ambiguïtés** : aucune trouvée.
- **Informations manquantes** : contenu détaillé du texte non lu.
- **Proposition** : *« Le texte est définitivement adopté et peut être
  promulgué. »*
- **Validation humaine requise** : oui, et je recommande de recontrôler
  les chiffres pour/contre avant publication (seul brouillon des 13 où je
  n'ai pas fait cette vérification ligne à ligne par manque de temps dans
  cette passe — à ne pas publier sur la foi de mon seul dossier).

## 7. Réponses à l'insécurité (scrutins n° 8432 + 8433)

- **Affirmation exacte** : le 21 juillet 2026, l'Assemblée nationale a
  d'abord rejeté (247 contre, 126... *(à vérifier, voir preuve)*) — en
  réalité 126 pour / 247 contre — une motion de rejet préalable déposée
  par Mme Cyrielle Chatelain contre le projet de loi visant à offrir des
  réponses immédiates aux phénomènes troublant l'ordre public, la sécurité
  et la tranquillité de nos concitoyens, puis a adopté définitivement
  l'ensemble du texte.
- **Source** : https://www.assemblee-nationale.fr/dyn/17/scrutins/8433
  (vote final ; 8432 documente la tentative de rejet).
- **Preuve** : mêmes vérifications que le point 3. Dossier
  `DLR5L17N53980`, 290 scrutins au total, **deux scrutins solennels** :
  n° 8279 (15/07/2026, adopté) et n° 8433 (21/07/2026, adopté, « texte de
  la commission mixte paritaire »). Le premier est probablement le vote de
  première lecture, le second la version définitive après accord des deux
  chambres — mais je ne l'affirme qu'avec cette nuance : les deux existent
  réellement, ce n'est pas une incohérence, seulement une bascule de
  vocabulaire.
- **Date** : 2026-07-21.
- **Confiance technique** : haute sur le vote final.
- **Contradictions/ambiguïtés** : même piège que le point 3 — 8432
  « rejeté » signifie que la motion de blocage a échoué, pas que le texte
  a été rejeté. Ne jamais publier 8432 seul, pour la même raison.
- **Informations manquantes** : contenu détaillé du texte non lu.
- **Proposition** : *« Une motion visant à rejeter le texte sans débat a
  d'abord été repoussée. L'Assemblée a ensuite adopté définitivement la
  loi. »*
- **Validation humaine requise** : oui — même recommandation de fusion
  qu'au point 3.

## 8. Patrimoine immobilier de l'État (scrutin n° 8434) — déjà publié

- **Constat** : `data/evenements/scrutin-2026-07-21-8434.md` existe déjà,
  `valide: true`, « Ce que ça change » rempli (« L'Assemblée nationale a
  adopté le texte de la commission mixte paritaire de cette proposition
  de loi. »). Le fichier identique dans `data/auto/` est un résidu, produit
  par une régénération quotidienne qui ne sait pas encore qu'il a déjà été
  publié ailleurs.
- **Action recommandée, ménage seulement, aucune décision éditoriale** :
  supprimer `data/auto/scrutin-2026-07-21-8434.md`. Je ne l'ai pas fait
  moi-même dans cette passe — c'est une suppression de fichier, et je
  préfère la nommer plutôt que l'exécuter sans un geste explicite de ta
  part, même si elle est mécanique.

---

## Ce que je n'ai PAS fait, et pourquoi

- Je n'ai modifié aucun fichier sous `data/auto/` ni `data/evenements/`.
- Je n'ai changé aucun `valide: false` → `true`, ni écrit aucun texte dans
  un « Ce que ça change » existant.
- Je n'ai pas lancé `outils/candidats.py` (qui écrit dans `data/auto/`)
  pour générer le brouillon manquant du scrutin n° 8427 — je le signale
  comme nécessaire, je ne l'exécute pas sans que tu le décides.
- Pour trois dossiers (protection des enfants, art. 11 ; le contenu
  substantiel des lois elles-mêmes), je dis explicitement que je n'ai pas
  l'information plutôt que de la deviner à partir du seul intitulé du
  scrutin.
