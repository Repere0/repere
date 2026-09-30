# Repère — système visuel et infographies mobiles

**Audit et spike de design du 30 septembre 2026.** Branche `feat/mobile-visual-system`,
empilée sur `feat/mobile-ux-revolution` (#53). Rien n'est fusionné.

Toutes les captures sont prises sur Meaux, à 390 × 844 px, avec les données réelles
du 29/09/2026. Chaque chiffre de ce rapport est mesuré ; quand il ne l'est pas, c'est
écrit « non mesuré ».

---

## Ce qu'il faut retenir en dix lignes

1. **Mono Charts n'est pas utilisable dans l'application mobile.** Ce sont des
   démonstrations web (DOM, Tailwind, recharts, motion), avec des données écrites en dur.
   On en garde des idées, zéro ligne de code, zéro dépendance.
2. **Licence MIT vérifiée.** Mais le site web publie déjà du code Amicro recopié
   **sans la mention MIT dans le fichier servi** : les commentaires disparaissent à la
   minification. Risque faible, correction de quinze minutes, à faire hors de cette branche.
3. **Le prototype tient dans +0,36 % de JavaScript web et +0,28 % de paquet iOS**, sans
   aucune dépendance nouvelle et sans `react-native-svg`.
4. **Sources discrètes, oui ; calcul caché, non.** « ⓘ Source » devient
   « ⓘ Calculé par Repère · source » dès que le chiffre est un calcul (invariant 4).
   Un contrôle le vérifie, et il échoue quand on retire le libellé.
5. **La date d'en-tête de #53 était fausse.** « Données publiées le 29 septembre 2026 »
   était la date de construction de Repère, pas celle des sources (RNE : 11 août ;
   OFGL : 29 juillet). Elle devient « Mis à jour par Repère le … ».
6. **Deux défauts d'accessibilité trouvés par un contrôle neuf de contraste sur le rendu.**
   Libellés d'échelon à 3,21:1 et 4,38:1 dans l'application (corrigés) ; ratios du site
   web à 4,11:1 et 4,38:1 (non corrigés ici, hors de la branche).
7. **Sur huit « En clair » prototypés, cinq répétaient ce qui était écrit juste
   au-dessus.** Quatre sont retirés, un est raccourci. Une répétition n'est pas une
   traduction.
8. **Une palette plus riche est largement bloquée par l'invariant 7, et c'est très bien.**
   Je recommande la direction B, « territorial doux » : conforme sans amender
   l'invariant, parce que ses teintes restent sous l'amplitude 24.
9. **Emojis : je recommande de ne pas les activer.** Ils remplacent le seul signal
   coloré qui a un sens (l'échelon) par un signal décoratif, qui s'affiche différemment
   selon le système. La variante sans emojis est construite et capturée.
10. **Premier prototype à tester : « Réponses d'abord ».** Aujourd'hui, le premier écran
    montre une réponse sur cinq, et c'est la moins importante.

---

## 1. État actuel de #53

**Ce que #53 a apporté.** Une question par écran : « Chez vous », « Où va l'argent »,
« Qu'a voté votre député », « Qui décide ». Neuf primitives visuelles écrites en
React Native (`ui/visuels.tsx`), un repli pour chaque explication, le mouvement coupé
quand le système le demande, et le contrôle « même vérité » entre le site et
l'application.

**Ce qui n'allait pas, mesuré sur le rendu de #53 :**

| constat | preuve |
|---|---|
| La date d'en-tête affirmait une publication qui n'a pas eu lieu ce jour-là | « Données publiées le 29 septembre 2026 » = `index.genere_le`, soit la date de construction de Repère. Les élus datent du 11 août, les comptes du 29 juillet. |
| Du jargon affiché | « exercice 2025 » (7 fois sur l'écran argent, 2 fois sur « Chez vous »), « Son encours de dette », « 28 € d'investissement », « Qu'est-ce que la DPV ? » |
| La source pesait autant que l'information | chaque carte finissait par une pastille grise pleine (« Calcul Repère · DGCL · 2026 ») ; l'écran argent affichait en plus la ligne « Source : Observatoire… · Licence Ouverte 2.0 · … » complète. |
| Le chiffre arrivait avant la phrase | « 332 254 € / dépensés par jour » comme première information de l'argent, sans dire de quoi c'est la part. |
| Contraste insuffisant (défaut hérité, pas créé par #53) | « Intercommunalité » en #0891b2 sur le fond : **3,21:1** ; « Département » : **4,38:1**. Le seuil AA pour ce texte de 13 px est 4,5:1. |
| Le premier écran ne montre presque rien | à 390 × 844, on voit l'en-tête, la carte « projet » et le haut du vote. |

## 2. Ce qui doit changer

1. **Résumer avant d'expliquer.** Chaque bloc commence par une phrase qu'on peut lire
   seule : sujet, verbe, chiffre.
2. **Une seule couche de source visible, et elle doit dire « calcul » quand c'en est un.**
3. **Plus un mot de jargon sans traduction immédiate.** Liste en section 11.
4. **« En clair » seulement s'il ajoute quelque chose.** Sinon, rien.
5. **Réordonner « Chez vous ».** « Qui décide » et « l'argent » sont la raison d'être de
   Repère ; le projet DGCL du jour n'est qu'un exemple. Voir la section 13.
6. **Contraste mesuré automatiquement.** C'est fait : c'est désormais un contrôle du parcours.

## 3. Analyse d'Amicro et de Mono Charts

Dépôts publics lus le 30/09/2026 : `Subhan-code/Monocharts`,
`Subhan-code/Amicro--Micro-transitions-`, paquet npm `@subhanhq/amicro`.

| question | réponse mesurée |
|---|---|
| Nature | 29 composants de **démonstration**. Les données sont des constantes écrites dans le fichier (par exemple `BULLET_ITEMS`), pas des propriétés. |
| Dépendances | `recharts` (importé par **21 fichiers sur 29**), `motion`, Tailwind (`@tailwindcss/vite`), `lucide-react`, `react-dom`. |
| Accessibilité | **6 attributs `aria-*` au total** sur les 29 composants ; aucun ne propose d'équivalent texte. |
| Mouvement réduit | respecté par **1 composant sur 29** (`GitHubActivity`, via `useReducedMotion`). |
| Pertinence pour Repère | **Visuelle, oui** : sobriété monochrome, « bullet chart », micro-transitions d'apparition. **Technique, non.** |

**Ce qu'on prend comme inspiration.** La barre « bullet » (une valeur, un repère, une
piste) : c'est déjà `BarrePart` et `Financement`. L'apparition courte des éléments,
qui existe dans `ui/mouvement.ts`, bornée à 520 ms et coupée par le réglage système.
La retenue chromatique.

**Ce qu'on refuse.** Les composants qui n'ont pas de sens pour une donnée publique
française :

- **Candlestick** : c'est un graphique de bourse.
- **GitHubActivity et ActivityHeatmap** : ce sont des cartes d'assiduité, et
  l'invariant 8 interdit toute donnée de présence.
- **Treemap et Sankey.** L'OFGL ne publie pas de flux entre postes ; les liens seraient
  inventés.
- **Pyramid** : un classement visuel, interdit par l'invariant 3.

## 4. Compatibilité React Native

**Aucun des 29 composants ne fonctionne dans l'application mobile.** C'est une
incompatibilité de nature, pas de réglage :

| brique | en React Native |
|---|---|
| `div`, `span`, SVG du DOM | n'existent pas ; il faut `View`, `Text`, et `react-native-svg` pour le SVG |
| `className` Tailwind | ignoré ; il faudrait NativeWind (une chaîne de compilation de plus) |
| `recharts` | dépend du DOM ; aucune version native |
| `motion` (web) | sans objet ; l'équivalent natif est `Animated` (déjà utilisé) ou Reanimated |
| `lucide-react` | il existe `lucide-react-native`, mais c'est un autre paquet |

**Ce qui est web seulement et le reste.** Le site (Preact) utilise déjà une adaptation
d'Amicro (`packages/ui/src/amicro.jsx`, composant `Pile`). L'application mobile a ses
propres primitives (`apps/mobile/src/ui/visuels.tsx`), écrites en `View` et en
`Animated`. **Aucune des deux ne doit importer l'autre.**

**Faut-il `react-native-svg` ?** Pas maintenant. Les exercices publiés sont 2021, 2024
et 2025 : il n'y a pas de série continue, donc pas de courbe honnête à tracer. Tout ce
que Repère montre se dessine avec des rectangles. On l'ajoutera le jour où une donnée
l'exigera (une carte, par exemple), et on mesurera son poids ce jour-là.

## 5. Licence

- **Amicro et Mono Charts : licence MIT, Copyright (c) 2026 Syed Subhan Uddin.**
  L'usage commercial, la modification et la redistribution sont permis, à une
  condition : *la mention de copyright et la notice de permission doivent figurer dans
  toute copie ou partie substantielle du logiciel.*
- **S'inspirer d'une idée** (une barre, un rythme d'apparition) n'impose rien : une
  idée n'est pas protégée.
- **⚠️ Problème réel, trouvé en vérifiant.** `packages/ui/src/amicro.jsx` contient une
  mention MIT **abrégée**, sans la clause « AS IS » d'exclusion de garantie. Et surtout,
  cette mention est un commentaire ordinaire : **elle disparaît à la minification**.
  Mesure : aucun des fichiers de `apps/web/dist/assets/` ne contient « Subhan ». Or
  `Pile` est importé par `QuiDecide.jsx` et `OuVaArgent.jsx` : le code recopié est donc
  publié sur repereapp.netlify.app sans sa licence.
  **Correctif proposé** (hors de cette branche) : le texte MIT complet dans un
  commentaire conservé (`/*! … */`) et un fichier `licences-tierces.txt` publié avec le
  site. Quinze minutes. Je ne suis pas juriste : le risque est faible, mais il existe
  à la lettre de la licence.
- **Le nom « Mono Charts »** n'est pas à reprendre dans Repère : la licence couvre le
  code, pas le nom.

## 6. Le système visuel de Repère

**Ordre de lecture de chaque information** (prototypé dans `ui/resume.tsx`) :

```
phrase humaine  →  chiffre clé  →  visuel  →  « En clair »  →  ⓘ source  →  replis
   niveau 1          niveau 1       niveau 2     niveau 2          niveau 4     niveau 3
```

**Un désaccord avec la consigne, argumenté.** La consigne propose
DONNÉE → VISUALISATION → PHRASE. Je mets la phrase **avant** le visuel, pour trois
raisons :

- une barre sans sa question ne se lit pas ;
- le lecteur d'écran lit dans l'ordre du document ;
- la consigne demande aussi de « résumer avant d'expliquer ».

La phrase *est* le résumé.

**Quatre niveaux :**

1. **Phrase et chiffre.** Toujours visibles, et suffisants seuls.
2. **Visuel et « En clair ».** Toujours visibles.
3. **Replis** : « Ce que ça ne veut pas dire (salaires) », « Détails du calcul ».
   Fermés par défaut.
4. **Feuille de source.** Un geste.

**Règles :** une question par carte ; un seul chiffre en grand par carte ; aucune
couleur qui porte seule une information ; aucun visuel sans phrase équivalente pour le
lecteur d'écran.

## 7. Les primitives

Dix sont codées et en service, une est proposée. Toutes dessinent avec `View` et
`Animated`, sans SVG.

| # | primitive | question du citoyen | règle de donnée | accessibilité | animation | repli texte | donnée absente |
|---|---|---|---|---|---|---|---|
| 1 | **Résumé** (`Resume`) | « En une phrase ? » | phrase issue d'une règle de `@repere/core`, jamais écrite au cas par cas | chiffre et légende lus ensemble (`accessibilityLabel`) | aucune | c'est lui, le repli | le composant n'est pas rendu ; la carte affiche une phrase `Vide` |
| 2 | **Part de 100** (`BarrePart`) | « Sur 100 €, combien pour… ? » | part d'**un même total**, bornée entre 0 et 100, sinon `null` | « Salaires : 47 € sur 100 € dépensés » | la barre se remplit en 520 ms, ou pas du tout si le mouvement est réduit | le libellé et la valeur sont écrits | pas de barre, phrase `comptesInsuffisants` |
| 3 | **Financement** | « Qui paie ce projet ? » | subvention et coût publiés par la DGCL ; le reste n'est attribué à personne | phrase complète | remplissage | « 726 800 € sur 1 533 500 € » et « Reste · 806 700 €, financement non détaillé par la source » | sans coût, « L'État apporte X € » et pas de barre |
| 4 | **Répartition de vote** | « Comment l'Assemblée a voté ? » | décompte publié ; **trois gris**, jamais une couleur de groupe | « 378 députés pour, 7 contre, 173 abstentions » | aucune | légende chiffrée | `VOTE_AUCUN`, `circoInconnue`, `REFUS_APPARIEMENT` |
| 5 | **Cases de mois** (`Mois`) | « Sa dette, c'est beaucoup ? » (sans jugement) | dette ÷ recettes mensuelles ; une case = un mois | « 7,6 mois de recettes » | cases remplies | « Une case = un mois de recettes » | pas de carte |
| 6 | **Compteur** | « Ça fait combien par jour ? » | dépenses ÷ 365, **annoncé comme calcul** | la valeur finale, jamais la valeur animée | montée en 520 ms, valeur finale d'emblée si mouvement réduit (contrôlé) | le nombre | pas de carte |
| 7 | **Deux années** | « Qu'est-ce qui a changé ? » | deux exercices **publiés**, chaque paire à sa propre échelle, écart en euros | valeurs et écart lus | remplissage | les deux montants écrits | `perimetreChange` si la commune a changé de périmètre |
| 8 | **Frise** | « Qu'est-ce qui arrive ? » / « Où en est cette loi ? » | agenda relevé ; étapes de la procédure | un jalon = une phrase | aucune | la liste | `AGENDA_VIDE`, `AGENDA_PAS_ARRIVE` |
| 9 | **Chaîne de décision** | « Qui décide pour moi ? » | cinq échelons, noms issus du RNE, personne inventée | chaque maillon lu en phrase | aucune | liste | « personne n'est nommé » sans source |
| 10 | **Pastille et feuille de source** | « D'où ça vient ? » | producteur, date, usage ou méthode, lien | « D'où vient cette information ? OFGL. Données publiées le … » | glissement de la feuille | la feuille est du texte | pas de pastille sans producteur |
| 11 | **Repli** (`Depli`) | « Qu'est-ce que ça ne veut pas dire ? » | texte de `@repere/core` partagé avec le site | nom distinct, état ouvert ou fermé annoncé | aucune | c'est du texte | non rendu |
| *12* | *Journée par habitant* (proposée) | « Ça me coûte combien par jour ? » | dépenses par habitant ÷ 365 = 5,82 € à Meaux, **calcul annoncé** | phrase | compteur | phrase | pas de carte |

**Les visuels refusés, et pourquoi :**

- **Camembert ou donut.** Les angles se comparent mal, les petites parts deviennent
  illisibles, et les postes publiés ne font pas 100 %.
- **Courbe.** Les exercices ne sont pas contigus (2021, 2024, 2025) : une ligne
  inventerait 2022 et 2023.
- **Carte choroplèthe.** Elle compare des territoires, ce que l'invariant 3 interdit, et
  il n'y a pas de géométrie dans les données.
- **Jauge ou score.** Invariants 3 et 6.
- **Treemap et Sankey.** Illisibles sous 400 px, et les flux n'existent pas dans la source.

## 8. Palette

Quatre directions, rendues avec les chiffres réels de Meaux
(`docs/ux/palettes-2026.html`, capture `captures/spike-08-palettes.jpg`).

| direction | invariant 7 | verdict |
|---|---|---|
| **A · Monochrome + un accent** | conforme | Sobre, mais la couleur ne dit plus l'échelon : on perd le seul code couleur qui a un sens. |
| **B · Territorial doux** | **conforme sans amendement** | **Recommandée.** Chaque carte prend une teinte de l'échelon qui décide. |
| **C · Éditorial contemporain** | conforme | Belle, mais les filets à la place des cartes allongent la lecture et affaiblissent « une question = un bloc ». |
| **D · Expressif désaturé** | **non conforme** | Refusée. Trois teintes sur quatre sont hors règle (amplitude 39 à 78), et le vert, le rose et le bleu ardoise sont proches de codes de partis. |

**Mesures de B.** Les teintes sont obtenues en mélangeant chaque couleur d'échelon avec
le blanc, jusqu'à passer sous une amplitude de 20 :

| teinte | amplitude | encre dessus | couleur d'échelon dessus |
|---|---:|---:|---:|
| ville `#dbeaee` | 19 | 13,6:1 | 4,34:1 (**insuffisant pour du petit texte**) |
| agglo `#e4f3f7` | 19 | 14,8:1 | 3,24:1 (**insuffisant**) |
| dept `#f7ece4` | 19 | 14,5:1 | 4,32:1 (**insuffisant**) |
| région `#efe7fb` | 20 | 14,0:1 | 5,92:1 |

La règle qui en découle : **le texte reste en encre ou en gris sourd. La couleur
d'échelon ne sert qu'aux points, aux barres et au texte de 24 px et plus.**

**Ce qu'il faut savoir honnêtement.** B est un enrichissement modeste. Une palette
vraiment plus riche passe par l'amendement de l'invariant 7, et je le déconseille.
Dans un pays où les partis occupent presque tout le cercle chromatique, un produit
civique neutre se protège en n'ayant qu'un seul code couleur, l'échelon.

**B n'est pas appliquée dans cette branche**, pour que le choix reste le vôtre. C'est un
changement d'une demi-journée.

**Un trou dans la garde de l'invariant 7.** Le contrôle ne lit que les couleurs
`#RRGGBB`. Un `rgba(8,145,178,0.3)`, un `#08c` ou un `hsl()` passeraient sans être vus. À
durcir avant d'introduire des teintes.

## 9. Système typographique

L'échelle en place (`lib/theme.ts`) est gardée : affiche 40, chiffre 44, question 30,
réponse 22, corps 17, note 15, étiquette et micro 13. Le titrage est en Bricolage
Grotesque 600 et 800 (2 × 91 Ko, déjà embarqués), le reste en police système.

**Règles ajoutées par le spike :**

- **Un chiffre d'affiche fait dix caractères au plus.** « 7,6 mois de recettes » tenait
  sur deux lignes à 44 px. Le nombre reste en grand, l'unité passe dans la légende.
- `maxFontSizeMultiplier={1.4}` sur les chiffres. Ils grandissent avec le réglage du
  téléphone, sans casser la mise en page.
- Rien sous 13 px. Les étiquettes en capitales de style sont en gris sourd (4,91:1 sur
  le fond, 5,63:1 sur une carte).
- Une espace insécable devant « ? ! : ; », par une fonction et non à la main.
- **À faire :** chiffres tabulaires (`fontVariant: ["tabular-nums"]`) sur le compteur,
  pour que les largeurs ne sautent pas pendant l'animation. Non fait, non mesuré.

## 10. Modèle de sources

- **À l'écran,** un texte gris de 14 px, sans fond, dans une zone tactile de 48 px :
  « ⓘ Source », ou **« ⓘ Calculé par Repère · source »** quand le chiffre est un calcul.
- **La feuille** s'appelle « D'où vient cette information ? ». Elle contient :
  - le producteur, en clair ;
  - « Données publiées le … », ou « relevées le … » pour l'Assemblée et le Sénat ;
  - « Comment Repère l'utilise », une phrase de méthode ou d'usage ;
  - « Voir la donnée originale ↗ », ou le lien exact du scrutin ;
  - « Détails », avec la ligne complète : licence et date de mise à jour.
- **Le lecteur d'écran** entend le producteur et la date sans ouvrir la feuille.
- **La vérité reste contrôlée.** Le contrôle « même vérité » ouvre désormais chaque
  feuille, une à une (17 pour Meaux), et y retrouve les mêmes lignes de source que le
  site. Preuve par la casse : sans ouvrir les feuilles, **27 échecs**.

Captures : `captures/spike-04-source.jpg`.

## 11. Système de phrases courtes

**Règles :**

- Sujet + verbe + chiffre, quinze mots au plus, une idée.
- Aucun adjectif de jugement : ni « élevé », ni « lourd », ni « bonne nouvelle ».
- Les phrases sont engendrées par `@repere/core` ou par une règle de l'écran, jamais
  rédigées au cas par cas.

**Les parts en mots (`partReperee`).** Une part ne se dit en mots que si elle est à
3 points au plus d'une vraie fraction. Hors des repères, la phrase passe aux euros :
« Pour 100 € de ce projet, 30 € viennent de l'État ».

- 47 % donne « près de la moitié ».
- 31 % donne « près d'un tiers ».
- **30 % ne donne plus « près d'un tiers »** : 30 est à 3,33 points de 33,33. La
  première version du spike comparait à 33 ; le test, réécrit sur les vraies fractions,
  a échoué, puis la règle a été corrigée.

**Lexique :**

| la source dit | Repère écrit |
|---|---|
| exercice 2025 | en 2025 (**reste à faire** dans la phrase partagée des projets : « L'État a engagé 726 800 € à Meaux, exercice 2025. », 5 fois sur l'écran argent de Meaux) |
| encours de dette | « doit encore rembourser 75,8 M€ » |
| frais de personnel | salaires des agents |
| dépenses d'investissement | travaux et équipements (**reste à faire dans `rapports()`** : « 28 € d'investissement » est partagé avec le site) |
| DSIL, DPV | « aide DPV », et un repli « Qu'est-ce que l'aide DPV ? » |
| scrutin public solennel | vote de l'Assemblée |
| Ca Du Pays De Meaux | **non traité** : la donnée elle-même est mal normalisée (voir la section 16) |

**La règle « En clair », apprise sur les captures.** Il n'apparaît que s'il dit ce que
le chiffre et le visuel ne disent pas. Sur huit, cinq répétaient la ligne du dessus :
quatre sont retirés, celui du vote est réduit au résultat et à la date. Un sixième
posait un calcul (la moyenne par jour) sous une source « publiée » : retiré, la
moyenne garde sa propre carte, marquée « Calculé par Repère ». Ceux qui restent
apportent une information nouvelle :

- « Soit 1 327 € par habitant » ;
- « Le texte a été adopté le 21 juillet 2026 » ;
- « Les autres dépenses ne sont pas détaillées par la source ».

## 12. Cinq exemples AVANT → APRÈS (textes relevés sur le rendu)

**1. En-tête de « Chez vous »**

- Avant : « Données publiées le 29 septembre 2026 ». C'est faux : c'est la date de
  construction de Repère.
- Après : « Mis à jour par Repère le 29 septembre 2026 ».

**2. Le projet**

- Avant : « L'État apporte 726 800 € à un projet à Meaux / Construction d'un pole
  medical… · exercice 2025 / ⓘ Calcul Repère · DGCL · 2026 ».
- Après : « L'État finance près de la moitié de ce projet. / Construction d'un pole
  medical au sein du quartier Beauval · 2025 / [barre État 47 %] / ⓘ Calculé par
  Repère · source ».

**3. L'argent, sur « Chez vous »**

- Avant : « 332 254 € / dépensés par jour / En moyenne sur l'exercice 2025 : une façon
  de rendre le total imaginable, pas un rythme réel. / Salaires, sur 100 € dépensés
  47 € / Investissement, sur 100 € dépensés 28 € ».
- Après : « En 2025, Meaux a dépensé 121,3 M€. / **2 123 €** par habitant, sur
  l'année / Salaires 47 € sur 100 € dépensés / Travaux et équipements 28 € sur 100 €
  dépensés / En clair : Les autres dépenses ne sont pas détaillées par la source. »

**4. La dette**

- Avant : « SON ENCOURS DE DETTE / 7,6 mois de recettes ».
- Après : « Meaux doit encore rembourser 75,8 M€. / **7,6 mois** de recettes : le
  temps qu'il faudrait pour rembourser si toutes ses recettes y passaient / [12
  cases] / En clair : Soit 1 327 € par habitant. »

**5. La source**

- Avant : une pastille grise pleine sur chaque carte, et en bas de l'écran argent la
  ligne complète « Source : Observatoire des finances et de la gestion publique locales
  (OFGL) · Licence Ouverte 2.0 · mise à jour du 29 juillet 2026 » avec « Voir à la
  source ↗ ».
- Après : « ⓘ Calculé par Repère · source » en gris, et la feuille « D'où vient cette
  information ? » décrite en section 10.

Captures côte à côte : `captures/spike-01-chez-vous.jpg` (#53 / spike / sans emojis),
`spike-05-argent.jpg`, `spike-06-vote.jpg`, `spike-07-qui-decide.jpg`.

## 13. Trois propositions pour « Chez vous »

**P1 · Cinq questions empilées (c'est le spike).**

- Pour : clair et complet ; chaque carte est une réponse.
- Contre, mesuré : **à 390 × 844, on ne voit qu'une réponse sur cinq**, le projet. Il
  faut faire défiler 4,3 écrans pour tout lire (3 321 px pour 780 px visibles). #53 en
  demandait 4,1 : **le spike a allongé « Chez vous » de 146 px**, à cause des phrases
  ajoutées. C'est un argument de plus pour P3.

**P2 · Une chose à la fois (cartes à balayer).**

- Pour : très focalisé.
- Contre : le contenu est caché, un carrousel se découvre mal et se parcourt mal au
  lecteur d'écran. Et « balayer pour la suite » ressemble à une mécanique de jeu, ce
  que l'invariant 6 surveille. **Je la déconseille.**

**P3 · Réponses d'abord (recommandée).**

- En haut, un bloc « Meaux en bref » : trois lignes courtes, chacune un bouton vers son
  écran :
  - « Le maire : Jean-François COPE » ;
  - « 2 123 € dépensés par habitant en 2025 » ;
  - « Béatrice Roullaud a voté pour le dernier texte ».
- Dessous, les cartes, **dans l'ordre de la mission** : qui décide, l'argent, le vote,
  un projet, ce qui arrive.
- Pour : les trois réponses devraient tenir au-dessus de la ligne de flottaison (non
  prototypé, donc non mesuré), et l'ordre suit les deux questions fondatrices de Repère.
- Contre : trois phrases de plus à garder vraies. Elles viennent des mêmes fonctions
  que les cartes, donc du même code.
- **Non prototypée dans cette branche.** C'est la première chose à tester (section 20).

## 14. Trois visualisations pour « Où va l'argent ? »

**V1 · « Sur 100 € dépensés » (en place).** C'est la plus honnête. Mais elle ne montre
que deux postes, les salaires et les travaux, parce que la source n'en détaille pas
d'autres. Le reste est dit en toutes lettres.

**V2 · « Une journée de la commune » (proposée).**

- Les 332 254 € par jour, puis **5,82 € par habitant et par jour** (2 123 € ÷ 365).
- C'est l'échelle humaine la plus forte, et c'est un calcul : l'étiquette
  « Calculé par Repère » s'applique.
- Risque : banaliser la dépense. La phrase ne doit rien qualifier.

**V3 · « La dette en mois de recettes » (en place).** Les douze cases sont comprises en
une seconde. La limite : au-delà de 24 mois, les cases débordent. Il faudra une règle,
« plus de deux ans : phrase seule ». **Non codée.**

**Refusé : le camembert, le treemap et le flux.** Raisons en section 7.

## 15. Votes

- **Neutralité.** Trois gris, identiques dans les quatre palettes. Aucune couleur de
  groupe, et la marque du député posée sur sa position.
- **La phrase d'abord :** « Béatrice Roullaud a voté pour. » Puis le titre, puis la
  répartition.
- **« En clair » ne dit que le résultat et la date.** Le décompte figure déjà dans la
  légende.
- **Ce que Repère ne peut pas faire seul :** dire ce que contient « Projet de loi
  relatif à la protection des enfants ». Un résumé automatique a été refusé pour une
  bonne raison. Il faut une phrase écrite par un humain dans `data/evenements/`. C'est
  le trou n°1 du projet, et aucun visuel ne le comble.
- **À ne jamais ajouter :** taux de participation, « fidélité au groupe »,
  comparaison entre députés (invariants 3 et 8).

## 16. « Qui décide ? »

**Ce qui marche :**

- la chaîne à cinq échelons ;
- « Décide : l'école primaire, la cantine… » ;
- la phrase « ce n'est pas un ordre d'importance : c'est un ordre de distance ».

**Ce qui ne va pas :**

- **« Ca Du Pays De Meaux ».** C'est dans la donnée (`departments/77.json`) : « CA »
  (communauté d'agglomération) a été mis en casse de titre en amont. Le lecteur ne
  peut pas le comprendre. Le correctif est à la couche de données, avec un contrôle
  sur tous les noms d'intercommunalités, **pas un bricolage à l'écran**.
- **« Jean-François COPE ».** C'est l'écriture du RNE, sans l'accent de « Copé ».
  Réécrire les noms serait pire : Repère afficherait un nom que la source n'écrit pas.
  On le laisse, et c'est une limite connue de la source.

**Proposition : « À quelle porte frapper ».** Pour chaque échelon, un exemple concret
issu de `COMPETENCES` :

- « Un trou dans la chaussée de votre rue → la mairie » ;
- « Le collège → le département ».

C'est exactement la mission de traducteur. Les contacts (adresse de la mairie)
demanderaient une nouvelle source (l'annuaire de service-public.fr) : pas maintenant.

## 17. Impact sur les performances

Mesuré le 30/09/2026, même machine, même commande, sans cache (`--clear`). Les paquets natifs ont été mesurés avant la dernière retouche de l'écran argent (une ligne retirée).

| | #53 | spike | écart |
|---|---:|---:|---:|
| JS web (brut) | 1 262 406 o | 1 266 945 o | **+4 539 o (+0,36 %)** |
| JS web (gzip -9) | 334 634 o | 335 826 o | +1 192 o (+0,36 %) |
| iOS, Hermes | 2 591 539 o | 2 598 789 o | +7 250 o (+0,28 %) |
| Android, Hermes | 2 920 819 o | 2 928 061 o | +7 242 o (+0,25 %) |
| dépendances nouvelles | — | **0** | — |

**Non mesuré : la fluidité sur téléphone.** Les barres animent leur `width` avec
`useNativeDriver: false`, donc sur le fil JavaScript. Avec quatre ou cinq barres par
écran, ça devrait tenir sur un iPhone. Sur un Android d'entrée de gamme, rien n'est
garanti. **Correctif recommandé :** animer `transform: scaleX`, qui passe par le pilote
natif. Le compteur, lui, change du texte et reste sur le fil JS ; il est seul à l'écran.

**Piège trouvé :** Metro ne réinvalide pas son cache quand une variable
`EXPO_PUBLIC_*` change. La variante sans emojis est d'abord sortie **identique à
l'octet près** (même empreinte). Toute variante de build doit passer `--clear`.

**Hérité, toujours là :** 967 Ko de police MaterialSymbols dans le paquet Android, via
`expo-router` → `expo-symbols`. Non traité ici.

## 18. Plan d'implémentation

Aucun lot ne demande de serveur, de compte, de traçage ou de dépendance.

| lot | contenu | durée estimée | prérequis |
|---|---|---|---|
| **L0** | Licence MIT complète et conservée dans le site (`/*! */` + fichier de licences tierces) | 15 min | votre accord |
| **L1** | Ce spike (cette PR) | fait | revue |
| **L2** | « Réponses d'abord » (P3) + réordonner « Chez vous » | 1 j | test utilisateur, section 20 |
| **L3** | Palette B + durcir la garde de l'invariant 7 (`rgba`, `#rgb`, `hsl`) | ½ j | **votre décision sur la palette** |
| **L4** | Lexique dans `@repere/core` : « d'investissement » → « de travaux et d'équipements », « exercice 2025 » → « en 2025 » dans `phraseProjetLocal`, sur le site ET l'application (le contrôle « même vérité » le garde) | ½ j | — |
| **L5** | Contraste du site : ratios à 4,11:1 et 4,38:1 sur « Où va l'argent » | ½ j | — |
| **L6** | V2 « par habitant et par jour », et la règle des cases au-delà de 24 mois | ½ j | — |
| **L7** | Normaliser les noms d'intercommunalités à l'extraction | 1 j | c'est de la donnée : **à valider** (la refonte du pipeline est hors périmètre) |
| **L8** | Barres en `scaleX` natif + séance VoiceOver / TalkBack sur votre iPhone | ½ j | votre téléphone |

## 19. Risques

| risque | ce qui le tient |
|---|---|
| Des sources discrètes affaiblissent l'invariant 4 | libellé visible « Calculé par Repère » ; contrôle prouvé par la casse (6 échecs sans lui) |
| « En clair » redevient de la répétition | règle écrite en section 11 ; **pas de contrôle automatique** (difficile à mesurer sans juger le sens) |
| Arrondis en mots trompeurs | `partReperee` borné à 3 points de la vraie fraction ; test sur 0–100 prouvé par la casse |
| Divergence de vocabulaire entre site et application | chaque exception est écrite fait par fait dans `meme-verite.mjs` (une seule : l'année du projet) |
| Emojis : rendu différent iOS / Android, ton ludique, perte du point d'échelon | masqués au lecteur d'écran ; coupés par `EXPO_PUBLIC_REPERE_EMOJIS=0` ; **recommandation : off** |
| La garde de palette a un trou (`rgba`, `hsl`, `#rgb`) | lot L3 |
| Tentation de recopier du code Mono Charts | aucune dépendance ; tout code recopié garde sa licence MIT **dans le fichier servi** |
| Les tests ne tournent que sur le rendu web de l'application | aucun banc sur appareil réel en CI ; la séance L8 le compense en partie |
| Licence Amicro absente du site publié | lot L0 |

## 20. Ce que je recommande de prototyper en premier

**« Réponses d'abord » (P3), réordonné, en palette B, sur « Chez vous » seulement.**

Un test de dix minutes avec cinq personnes réelles, dont une de plus de 65 ans et une
de moins de 25 ans, sur votre iPhone en réseau local. La question est posée sans aide,
chronomètre en main :

> « Qui est votre maire, et combien votre commune dépense-t-elle par habitant ? »

**Critère :** quatre personnes sur cinq répondent juste en moins de 30 secondes. Sinon,
on ne généralise pas.

**Deux décisions vous reviennent avant ce test :**

1. la palette B (oui ou non) ;
2. les emojis (je recommande non).

---

## Ce que cette branche contient

**Code :**

- `packages/core/src/visuels.js` : `montantCourt`, `partReperee`, `partEnMots`,
  `parHabitant` ;
- `apps/mobile/src/ui/resume.tsx` : `Resume`, `Etiquette`, `Emoji` ;
- `ui/source.tsx` : pastille discrète et feuille « D'où vient cette information ? » ;
- `lib/sources.ts` : méthodes et usages en français courant ;
- `ui/visuels.tsx` : correctif de contraste de la chaîne ;
- les quatre écrans.

**Contrôles :**

- `tests/core.test.mjs` : parts en mots mesurées sur les vraies fractions ;
- `apps/mobile/tests/parcours-web.mjs` :
  - **contraste AA mesuré sur le rendu** ;
  - « Calculé par Repère » visible ;
  - feuille de source ;
  - replis ;
- `tests/meme-verite.mjs` : ouvre chaque feuille et chaque repli.

**Résultats :**

- core, invariants et santé : 84/84 ;
- parcours : 132 contrôles, 0 échec ;
- même vérité : 127 faits comparés, 0 échec.

**Documentation :**

- ce fichier ;
- `docs/ux/palettes-2026.html` ;
- `docs/ux/captures/spike-*.jpg`.
