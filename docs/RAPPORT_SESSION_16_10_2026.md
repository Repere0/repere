# Rapport de session — 16 octobre 2026 (journée autonome)

Rien n'est fusionné, poussé sur `main`, fermé ni déployé. Deux PR brouillon.

## 1. Ce qui a réellement été implémenté

**Collecte rouge depuis le 14/10 — PR #147 (base `main`, épreuve verte sur 91c1185).**
- Cause 1 : le test « rétention (0 nouveauté) » fixait la visite au 1er septembre 2026 ;
  Ustaritz a reçu depuis un vote réel. Correctif repris de `fix/retention-date-fixture`.
- Cause 2, établie aujourd'hui : le scrutin solennel **8705** du 13/10 s'intitule « la
  proposition de loi apportant une réponse intégrale… (première lecture). », sans
  l'amorce « l'ensemble de la… » que le test exigeait. Données justes, supposition fausse.
- La cause 2 n'était pas lisible (journaux bloqués par le proxy) : `banc()` remonte
  désormais le message d'assertion dans l'annotation du run.
- Prévention, **à valider** : le vote solennel sur la première partie du PLF 2027 est
  inscrit le **20/10** ; en 2025 son équivalent s'intitulait « la première partie du
  projet de loi de finances pour 2026 (première lecture). » (scrutin 4241). Forme admise.

**Bêta mobile — PR #148 (base `feat/refonte-chez-vous-calendrier`).**
- Aujourd'hui : marque en tête (logo + « Repère »), puis les trois réponses, puis le bloc
  sombre « Qui décide chez vous ? » (il remplace l'entrée « Qui décide » d'« Aller plus
  loin ») ; « Partager » devient une icône 48 × 48 au nom accessible inchangé.
- Barre basse : horloge, maison, calendrier dessinées en vues (plus de « ◷ ⌂ ▦ ») ;
  onglet actif aussi en gras.
- Calendrier : séances avant les avertissements ; rien retiré ; l'âge du relevé reste
  avant la liste (invariant 9).
- Chez vous : un seul « Chez vous » ; région sur sa propre ligne.
- Qui décide : la question une fois ; introduction en une phrase ; légende du point vide.
- Logo : générateur `outils/marque_repere.py`, 6 images, fonds blancs dans `app.json`,
  composant unique `ui/marque.tsx`, `TRICOLORE_MARQUE` dans `invariants.js` et sa garde.
- Couleurs de groupe : la palette de gris **inventée** du script de collecte est retirée ;
  seule `organe.couleurAssociee` (Assemblée) est retenue, si amplitude ≤ 24 ; provenance
  publiée ; sinon sigle et nom.
- Parcours web : le test ouvre le repli de la licence (3 échecs préexistants sur la base).

## 2. Commits et PR

- PR #147 https://github.com/Repere0/repere/pull/147 — `090b129`, `80f12a1`, `91c1185`, `fd64196`.
- PR #148 https://github.com/Repere0/repere/pull/148 — `466f208`, `94c6a88`, `84b5749`
  (repris du matin), `fa0abed`, `26f251f`, `3dfcfa8`, `6ca3849`, `e7bbd13`, `a18c38a`,
  `3ca6621`, `10301b6`, et le commit de ce rapport.
- `84b5749` seul casse la garde du premier écran (865 px pour 844) ; `26f251f` la répare.

## 3. Commandes et résultats exacts

| commande | résultat |
|---|---|
| épreuve GitHub de #147 (chaîne complète, sources fraîches) | 1re : échec (message lisible, 8705) ; 2e (91c1185) : **succès** |
| `npx tsc --noEmit` (mono/apps/mobile) | 0 erreur |
| `node --test tests/refonte-ux.test.mjs` | 12/12 |
| territoire / liens-definitions / partager-lisible / texte-agrandi | 3/3, 6/6, 2/2, 6/6 |
| `node tests/reflow-200.mjs` | 0 débordement, 0 texte coupé |
| `node tests/parcours-web.mjs` (export web local) | « parcours complet, zéro échec » (base : 3 échecs) |
| `node --test tests/invariants.test.mjs` (après `pnpm build`) | 63/63 |
| `pnpm test` (avant le commit des couleurs de groupe) | 161/162 ; échec = `runtime.test.mjs` scrutins, 404 `scrutins-solennels-recents.json` (fichier produit seulement sur le runner) |
| garde tricolore cassée 5 fois | 5 échecs attendus obtenus |
| garde couleurs de groupe cassée 2 fois | 2 échecs attendus obtenus |
| règle des votes solennels, 12 titres injectés | 6 attendus verts, 6 attendus rouges : conforme |

## 4. Captures (export web, Meaux, 16/10/2026)

Dans le conteneur de la session, dossier `scratchpad/caps1610/planches/` :
`aujourdhui-avant-apres.png`, `calendrier-avant-apres.png`, `chez-vous-avant-apres.png`,
`qui-decide-avant-apres.png` (390 × 844 et 375 × 667), `marque-declinaisons.png`,
`ecrans-detail-apres.png`. Envoyées au porteur dans la conversation ; non versionnées.

Mesures clés : Aujourd'hui 390 × 844, bas des cartes 377 / 585 / 817 (base 383 / 591 /
823) ; Calendrier 390 × 844, première séance à 657 px (avant : 740).

## 5. À vérifier sur appareil

- Icône sur l'écran d'accueil iPhone et Android ; icône monochrome Android 13 ; écran
  de lancement blanc.
- Icônes de la barre basse et de partage (dessinées en vues : rendu natif non vu).
- VoiceOver / TalkBack : bloc sombre, icône de partage (« Partager : … »), légende du point vide.
- Seuil de masquage du libellé d'onglet (150 %).

## 6. Risques, inachevé, blocages

- **Juridique (6ter Convention de Paris)** : drapeau d'État ou « imitation au point de vue
  héraldique » dans une marque. Avis à prendre avant magasins ou dépôt.
- **Invariant 7 dans CLAUDE.md / AGENTS.md + scellement** : refusés à l'agent par le
  contrôle de sécurité de son environnement. À faire par le porteur (texte proposé dans #148).
- À 375 × 667 : la 3e réponse d'Aujourd'hui et la première séance du Calendrier restent
  sous le pli (comme sur la base).
- Couleurs de groupe : script de collecte modifié, non éprouvé sur données réelles tant
  que #148 ne vise pas `main` ; chemin des Questions au Gouvernement non couvert par la fixture.
- Cartes de partage : ancienne marque « R ».
- Netlify (échecs du 9 au 13/10) : non traité ; cause probable (crédits) non prouvée.
- Erreur de l'agent, réparée : un `cherry-pick` lancé par erreur dans le worktree de
  `feat/beta-testeur-retours` (#136), annulé ; branche revenue à 77f9fc9, identique au
  distant. Un commit local amendé avant poussée (couleur en clair dans un test).

## 7. Trois prochaines priorités pour décembre

1. Fusionner #147 (après validation de la règle « partie du budget ») avant le 20/10, puis
   régler la publication Netlify : sans elle, le site reste figé au 09/10.
2. Valider #148 sur un vrai téléphone (iPhone et Android), puis viser `main`.
3. Premier écran à 375 × 667 (iPhone SE / mini) : la 3e réponse et la première séance.

## 8. Décisions qui demandent le porteur

- Règle de données « première / seconde partie du projet de loi de finances » (#147).
- Texte de l'invariant 7 dans CLAUDE.md / AGENTS.md et scellement (#148).
- Avis juridique sur le tapis tricolore avant toute publication.
- Marque des cartes de partage : garder « R » ou passer au logo tricolore.
- Ordre de fusion : #147 vers `main` ; #148 dépend de `feat/refonte-chez-vous-calendrier`,
  qui n'a pas de PR.

---

# Après-midi du 16/10/2026 — relecture, puis refonte de densité

Demande du porteur (14 h 17) : avancer au maximum ; « la donnée est recrachée trop
brutalement, indigeste… il va devoir scroller énormément » ; autorisation de dépasser
les invariants. **Aucun invariant n'a eu besoin d'être dépassé** : tout s'est fait en
repliant l'explication, sans retirer ni inventer. Les invariants 2, 3, 4, 8 et 9
(vie privée, neutralité, sources, patrimoine et présence, fraîcheur) ont été gardés
volontairement : ce sont des protections juridiques et de confiance.

## À brancher ce soir, dans cet ordre

1. **#147** → `main` (collecte rouge depuis le 14/10). Épreuve verte. Valider la règle
   « partie du budget » (vote solennel du **20/10**).
2. **#148** → base `feat/refonte-chez-vous-calendrier` (qui n'a pas de PR : la viser vers
   `main` ou fusionner la pile d'abord). CI `mobile` verte.
3. **#149** → base `feat/beta-mobile-16-10` (#148). CI `mobile` verte.
4. À la main : texte de l'invariant 7 dans `CLAUDE.md` / `AGENTS.md` + `node
   outils/derive_contexte.mjs --sceller` (refusés à l'agent) ; avis juridique sur le
   tapis tricolore avant tout magasin.

## #148, compléments

- `61f0065` : « même vérité » ouvrait « Qui décide » par un bouton retiré → 4 échecs ;
  corrigé (régression de l'agent : ce contrôle n'avait pas été lancé avant poussée).
- `1b1bd70` : relecture (compétences make-interfaces-feel-better, expo-native-ui,
  app-icon) : chevauchement de cibles « Voir le mois », coins concentriques, contour du
  logo, chiffres à chasse fixe, icône Android à 289 px de rayon (zone sûre 313), favicon
  192 px.

## #149 — densité (https://github.com/Repere0/repere/pull/149)

| Écran (Meaux, 390 × 844) | avant | après |
|---|---|---|
| Calendrier | 5,9 écrans | **2,2** |
| Où va l'argent | 4,1 | **2,5** |
| Comprendre ce vote | 3,8 | **2,4** |
| Sources | 2,7 | **2,1** |
| Dictionnaire | 2,2 | **1,1** |
| Aujourd'hui | 2,4 | 2,2 ; **3 cartes entières au premier écran** |
| Qui décide | 2,1 | 1,9 |
| **Total des 8 écrans** | **24,3** | **15,5** |

Mesure : `scratchpad/caps1610/longueurs.mjs` (hauteur du conteneur défilant ÷ 844),
export web local, Meaux, 0 erreur console. Chez vous 1,1 ; fiche d'un élu 0,9 ;
partage 1,6 ; procédure 1,0 ; QAG 1,0.

Commits de fin d'après-midi (#149, CI `mobile` verte sur `4144dbd`) :
- `eb6b36a` : texte agrandi à 200 % : plus aucun titre tronqué ; la sonde reflow sautait
  Qui décide et Calendrier sans le dire, elle les visite maintenant.
- `a4fc7c0` : dictionnaire : les mots d'abord, la définition au toucher (`aria-expanded`).
- `b97a7cf` : le bouton de retour dit « Retour » au lieu de nommer un écran qu'il ne vise pas.
- `5dda226` : fiche d'un élu : un seul retour (le lien doublon est retiré), partage par icône.
- `4144dbd` : Calendrier à 375 × 667 : la première séance est visible au premier écran.

- Calendrier : un en-tête par jour (il n'y en avait aucun), une ligne compacte, six
  rendez-vous puis « Voir les N autres ».
- Argent, vote, sources, semaine : la réponse + un visuel + la source ; le reste sous
  « Le détail (…) » ou « En savoir plus (…) ».
- Accueil : le logo en grand. Aujourd'hui : « L'État finance près de la moitié… ».
- Socle : marges 16 pt ; **les replis exposent `aria-expanded`** (absent sur le web).
- Contrôles : parcours web et « même vérité » ouvrent tous les replis avant de lire
  (contraste AA et cibles vérifiés aussi dedans) : zéro échec. tsc 0, gardes mobiles
  vertes, invariants 63/63.

## Constats à trancher (rien modifié)

- **Séance commencée** (`20d2fc1`, choix pris par l'agent, réversible) : elle
  disparaissait dès son heure de début. Elle reste sous « aujourd'hui » avec « a déjà
  commencé, heure de fin non précisée » ; le site garde l'ancienne règle. À valider.
- **Libellés du Répertoire national des élus** au masculin générique (« Président du
  conseil régional » pour Valérie Pécresse), affichés mot pour mot : garder la lettre
  de la source, ou une forme épicène ? Le sexe n'est pas dans le fichier : rien à deviner.
- **« Étape 4 sur 6 »** (écran du vote, formule introduite par l'agent le matin même)
  reposait sur le même ordre linéaire que la « Suite » : remplacé par « Étape de ce
  vote : Commission mixte paritaire », garde vue rouge.
- Écrans des scrutins avec données : non revus (relevé produit seulement sur le runner).
- **Cartes de partage** : ancienne marque « R » (choix laissé, risque 6ter).
- **375 × 667** : la 3e réponse d'Aujourd'hui commence au premier écran (578 px) mais
  reste coupée. (Calendrier : réglé par `4144dbd`.)

## Fin d'après-midi (15 h 45 – 17 h), toujours dans #149

| commit | ce qui était faux, mesuré | correctif |
|---|---|---|
| `c4a9591` | Vote : « Partager ce vote › » flottait entre deux cartes ; la phrase de circonscription doublait le chemin | partage au pied de la carte ; phrase dans le repli. 2,4 → 2,2 écrans |
| `20d2fc1` | Calendrier : une séance commencée disparaissait (aucune fin publiée) | reste sous « aujourd'hui », « a déjà commencé, heure de fin non précisée » ; socle : `commenceesAujourdhui`, `aVenir` inchangé |
| `e314bbc` | Détail d'un rendez-vous : « heure de fin non précisée » ×3 + redites ; **date du relevé absente** (invariant 9) | heures sur une ligne, absence dite une fois, « relevé le 13 octobre 2026, il y a 3 jours » |
| `d40732a` | Sources : « projets aidés par l'**é**tat », « l'**a**ssemblée » (toLowerCase) | titre court ; nom de la source dans le nom lu |
| `0282726` | Fiche d'un maire : « Fonction : Conseil municipal » ; Chez vous : deux définitions de « circonscription » | « Institution » ; un seul lien |
| `4b36ef6`, `678e3ba` | **Doctrine du vide** : 7 absences sans lien (agenda vide, refus d'appariement ×2, comptes insuffisants, périmètre, rendez-vous disparu, scrutins indisponibles) | liens pris dans la donnée (index.json, agendas) ou constantes existantes ; **garde** sur tous les `<Vide>`, vue rouge |
| `775b2f0` | Accueil à 375 × 667 : clavier ouvert, résultats sous le clavier ; « 1262 » | le champ monte pendant la recherche (5 résultats visibles) ; « 1 262 » |
| `1b88ffb` + suivant | **Carte de partage : « Suite : Lecture définitive » pour un texte adopté en CMP** — étape devinée sur une carte faite pour circuler | case retirée ; garde vue rouge |

Vérifié (sonde web) : le point vide de « Qui décide » est lu « Agglo : aucune personne nommée ».
Écarté : micro-texte 13 pt → 15 (audit) : 13 pt est la taille « footnote » d'iOS, et
monter allongerait tous les écrans.

## Banc final (16/10, fin d'après-midi, `4144dbd`)

| contrôle | résultat |
|---|---|
| `pnpm build` + `pnpm test` | 162/163 ; seul échec : `runtime.test.mjs` scrutins (404 `scrutins-solennels-recents.json`, produit seulement sur le runner — identique au matin) |
| CI GitHub | #147 `epreuve` + `mobile` verts ; #148 `mobile` vert ; #149 `mobile` vert |
| `parcours-web.mjs`, `meme-verite.mjs` | zéro échec |
| `tsc`, `refonte-ux` | 0 erreur ; 12/12 |
| `reflow-200.mjs` | 0 débordement, 0 texte coupé |

Planches (conteneur de la session, non versionnées, envoyées au porteur) :
`densite-avant-apres.png`, `premiers-ecrans-matin-soir.png`, `accueil-avant-apres.png`.

**Non vérifié** : rendu natif iOS / Android, VoiceOver / TalkBack, texte système agrandi
sur appareil. Tout ce qui précède est mesuré sur l'export web.

## Banc de clôture (16/10, 17 h, `341cbe5`)

| contrôle | résultat |
|---|---|
| `pnpm build` + `pnpm test` | 163/164 ; seul échec : `runtime.test.mjs` scrutins (fichier produit seulement sur le runner) |
| `parcours-web.mjs`, `meme-verite.mjs` | zéro échec |
| `refonte-ux` | 16/16 (4 gardes ajoutées l'après-midi, chacune vue rouge) |
| `core.test.mjs` | 28/28 (séance commencée, vue rouge) |
| `reflow-200.mjs` | 8 écrans, 0 débordement, 0 texte coupé |
| longueurs (390 × 844, 8 écrans) | **24,3 → 15,3** hauteurs d'écran (Calendrier 2,3 : la séance commencée réapparaît) |

**Non vérifié** : iPhone, Android, VoiceOver, TalkBack ; clavier réel sur l'accueil ;
glyphe du trait d'union insécable (U+2011) dans les polices natives ; écrans des
scrutins avec données.

---

# Soirée du 16/10/2026 — mission « recommandations Lovable »

Le rapport Lovable lui-même n'a pas été transmis : seule la mission du porteur, qui en
reprend les recommandations (P1 à P7), a servi de référence.

## A. État des PR

| PR | départ (20 h 20) | fin de soirée |
|---|---|---|
| #147 `fix/collecte-banc-lisible` → `main` | `fd64196`, `epreuve` + `mobile` verts | inchangée |
| #148 `feat/beta-mobile-16-10` → `feat/refonte-chez-vous-calendrier` | `1b1bd70`, `mobile` vert | inchangée |
| #149 `feat/ux-densite-16-10` → #148 | `978f548` (2 commits de 18 h 19 + **5 fichiers modifiés non commités** trouvés dans l'espace de travail) | `3dbc334`, `mobile` **vert**, fusionnable sans conflit |

Les commits de 18 h 19 et les fichiers non commités viennent d'un premier passage de cette
même session, interrompu. Rien n'a été écrasé : les fichiers ont été vérifiés puis commités.
Aucune fusion, aucun push sur `main`, aucune PR fermée.

## B. Commits de la soirée (tous sur #149)

`f71304f` accueil · `c4ce01f` élu local / Chez vous · `73d2647` feuille source ·
`5037e7f` vote · `36a281d` Qui décide (intercommunalité) · `d5f745c` Qui décide (Paris) ·
`c748e88` accueil hors IDF · `bd77b1b` partage · `86d8051` semaine · `4796b7f` procédure ·
`3dbc334` vote (trait d'union). Plus, de 18 h 19 : `0e873e2` (calcul des parts), `978f548` (HT).

## C. Changements écran par écran

- **Accueil** : vie privée en une ligne ; détail technique déplacé dans Sources ; résultats
  nom puis département ; hors Île-de-France, « Voir un exemple : Meaux » (seulement si publiée).
- **Aujourd'hui** : « 1,5 M€ hors taxes » (donnée vérifiée : 726 800 € / 1 533 500 € HT =
  47,4 %, DGCL, colonne `cout_ht`) ; semaine : portée nationale et âge du relevé en un paragraphe.
- **Chez vous** : plus de lien « Le calendrier » (onglet toujours visible).
- **Qui décide** : président de l'intercommunalité quand le Répertoire le désigne parmi les élus
  de la commune (Meaux : J.-F. COPE ; 17 EPCI de Seine-et-Marne) ; point vide = « pas de nom
  affiché », la carte dit pourquoi ; Paris : « Paris n'a pas de conseil départemental. » en titre.
- **Fiche d'un élu** : plus d'onglet « Votes » pour un élu local ; note interne retirée.
- **Où va l'argent** : le calcul de chaque part avec les deux montants publiés (dans les replis).
- **Vote** : pourquoi ce député, sous le titre ; exemple dit en haut pour une commune partagée
  (régression de l'agent à 15 h 55, corrigée) ; numéro du scrutin.
- **Partager** : ce que fait chaque bouton ; source et scrutin sur la carte 1.
- **Procédure** : six étapes lisibles d'un coup d'œil ; note exacte sur les articles 10, 39, 45, 61.
- **Feuille « D'où vient cette information ? »** : « Fermer » aussi en haut.

## D. Tests (après `3dbc334`)

| commande | résultat |
|---|---|
| `npx tsc --noEmit` (mobile) | 0 erreur |
| `node --test tests/refonte-ux.test.mjs` | 21/21 (8 gardes ajoutées ce soir, chacune vue rouge sur l'ancien fichier) |
| territoire, liens-definitions, partager-lisible, texte-agrandi | 3/3, 6/6, 2/2, 6/6 |
| `node --test tests/core.test.mjs` | 30/30 (président d'EPCI, vu rouge) |
| `node --test tests/invariants.test.mjs` | 63/63 |
| `pnpm build` + `pnpm test` | 162/166 : 3 échecs causés par une copie `apps/web/dist.bak` faite par l'agent (supprimée, invariants relancés : 63/63) ; 1 échec d'environnement (`runtime.test.mjs`, scrutins absents du conteneur, comme le matin) |
| `parcours-web.mjs`, `meme-verite.mjs` | zéro échec (107 faits comparés) |
| `reflow-200.mjs` | 8 écrans, 0 débordement, 0 texte coupé |
| CI GitHub `mobile` | verte sur `3dbc334` (et 73d2647, d5f745c, 86d8051, 4796b7f) ; `36a281d`, `c748e88`, `bd77b1b` **annulées** par le push suivant, non comptées comme vertes |

Longueurs (390 × 844, Meaux) : Aujourd'hui 2,1 · Chez vous 1,0 · Qui décide 1,9 ·
Calendrier 2,3 · Argent 2,5 · Vote 2,3 · Sources 2,3 · Dictionnaire 1,1 (total 15,5 ; 15,3 à
17 h). Hausses voulues : pourquoi ce député, section vie privée, titres des étapes.

## E. Captures

Page « Repère avant / après du 16 octobre » (artefact privé, claude.ai), 19 écrans × 4 vues
(avant `341cbe5` / après `3dbc334`, 390 × 844 et 375 × 667), export web Chromium, Meaux.

## F. Recommandations Lovable

- **Appliquées** : P1 (vie privée, hiérarchie des résultats, hors IDF honnête + exemple),
  P2 (chiffres du projet vérifiés, HT), P3 (doublon, niveaux sans nom, président d'EPCI, Paris),
  P5 (onglet Votes, note interne, pourquoi ce député, n° de scrutin, partage), P6 (fraîcheur
  allégée sans rien retirer), P7 (procédure, fermeture en haut, emoji décoratif).
- **Adaptées** : « répartition fictive sur 100 € » : les parts sont exactes (montants OFGL
  vérifiés), le calcul est désormais montré ; Aujourd'hui : les trois réponses et la carte de la
  semaine sont gardées, la dépense par habitant n'est pas retirée (pas de restructuration forcée).
- **Reportées** : raccourcis touchables vers chaque niveau de Qui décide (le focus du lecteur
  d'écran ne peut pas être vérifié ici) ; troisième réponse à 375 × 667.
- **Rejetées** : aucune. « 15 M€ » n'existe dans aucune donnée : rien à corriger.
- **Déjà présent** : recherche dans le dictionnaire.

## G. À vérifier sur iPhone / Android

Partage d'image (expo-sharing) ; clavier ouvert sur l'accueil ; « Fermer » en haut de la
feuille (pageSheet iOS) ; VoiceOver / TalkBack (onglets de la fiche d'élu, légende, procédure) ;
trait d'union insécable (U+2011) dans les polices natives.

## H. Trois priorités pour décembre

1. Revoir et fusionner la pile #147 → #148 → #149 (#147 avant le vote du 20/10).
2. Un passage sur un vrai téléphone (Expo Go) avec la liste G, puis le banc de 10 testeurs.
3. Rétablir la publication Netlify (figée depuis le 09/10) pour que le site suive.

## I. Décisions requises

- Règle « première / seconde partie du projet de loi de finances » (#147) **avant le 20/10**.
- Texte de l'invariant 7 dans CLAUDE.md / AGENTS.md et scellement (refusés à l'agent).

---

# Reprise du 16/10/2026, 21 h 50 — points ouverts

## 1. PR #149 (état à 22 h)

Tête `47da1ff` avant la reprise : sans conflit avec sa base (#148 contenue), fusionnable « clean »,
43 commits, 33 fichiers. Un seul contrôle se déclenche sur cette branche, « Mobile » (tsc, gardes
mobiles, tests du socle, invariants, santé, données) : **vert** sur `47da1ff`. Sur la journée,
35 runs « Mobile » sur la branche : 24 succès, 9 **annulés** par le push suivant (dont `bd77b1b`,
`c748e88`, `36a281d`) — ni échecs ni succès —, et les 2 derniers en cours au moment de l'écrire. Le contrôle « Épreuve » (chaîne complète,
tests du site) ne se déclenche que sur une PR vers `main` : **il n'a jamais tourné sur #148 ni
#149**, alors que #149 modifie `mono/packages/core` (partagé avec le site). Seul `pnpm test` local
le couvre (voir plus haut).

## 2. Aujourd'hui à 375 × 667 : documenté, non modifié

Mesure (export web, Meaux) : 3e carte de 573 à 818 px, barre d'onglets à 602 px ; sa phrase
finit à 652 px. Il manque 216 px pour la carte entière, 50 px pour sa phrase. Simulations :

| option | bas de la phrase 3 | coût |
|---|---|---|
| actuel | 652 | — |
| B : marque dans la barre haute | 610 | revient sur la place de la marque (décision du porteur) |
| C : retirer « Le détail (projet) » | 600 (visible) | retire le nom du projet et l'année de l'aide de l'écran |
| B + C | 558 | les deux |

Le pied de la carte 2 (sources Comptes + Élus, partage, « Où va cet argent ? ») mesure 338 px pour
311 disponibles : il ne tient sur une ligne qu'en réduisant des cibles sous 48 pt. Aucune option
sans perte : décision produit. À 390 × 844, les trois cartes sont entières.

## 3. Invariant 7 : amendement formel scellé

`bcc11ef` (#148), puis fusion `080cf12` dans #149. Procédure de `outils/derive_contexte.mjs`
suivie pas à pas, refus E3 constaté avant scellement, empreinte
`1e6d34ce8512a365253898719c3ac53df5a0842c33d6cc398f4788e2955b2f28`, contrôle 0 erreur.
Nouveau test « CLAUDE.md et invariants.js disent la même règle » (rouge sur l'ancien texte).
Invariants 64/64. Le refus du matin venait du contrôle de sécurité de l'environnement de
l'agent, pas du dépôt ; la même modification a été acceptée ce soir.

## 4. Test de scrutins

`mono/tests/runtime.test.mjs`, 4 contrôles (« le teaser des scrutins récents est visible sans
action », « chaque ligne du teaser porte déjà un lien source direct », « le bouton de détails
existe », « aucune erreur JavaScript applicative », 404 sur `/data/scrutins-solennels-recents.json`).
Le fichier est produit par `node scripts/scrutins-solennels.mjs ./data ../data/brut_Scrutins`
(étape « scrutins solennels » de `outils/pipeline.sh`), à partir de l'archive de l'Assemblée
téléchargée à l'étape 1. Ici : « ../data/brut_Scrutins absent - les scrutins solennels ne seront
pas publiés » ; `data.assemblee-nationale.fr` injoignable (HTTP 000). Aucune fixture légitime pour
ce contrôle (la seule fixture de scrutins, dans `invariants.test.mjs`, éprouve
`scrutins-details.mjs`). Rien de fabriqué, rien de neutralisé. **Preuve en CI** : « Épreuve » de
#147 sur `fd64196`, run 38897439559, **succès** (aucun avertissement « scrutins solennels non
rafraîchis » dans ses annotations). À rejouer : « Épreuve » quand #148/#149 viseront `main`.

## 5. PR #147

Note séparée : `Repere_Note_PR147_Parties_Budget_16_10_2026.md` (projet). Aucun chiffre affiché
ne change ; recommandation technique A ; décision de sens au porteur avant le 20/10, 15 h.

## 6. Chiffres de Meaux : deux niveaux de vérification

| chiffre | vérifié dans les données de Repère | vérifié dans la source officielle |
|---|---|---|
| projet DPV 2025 : 1 533 500 € HT, aide 726 800 €, 47,4 % | oui (`data/projets/77.json`, colonne `cout_ht`, DGCL, mise à jour 24/07/2026, relevé 13/10/2026) | **non** |
| comptes 2025 : 121 272 659 € de dépenses, 2 123 €/hab., personnel 47,5 %, impôts 44,7 %, dette 7,6 mois | oui (`data/departments/77.json`, OFGL, 29/07/2026) | **non** |

Limite non résolue : la page data.gouv.fr du jeu DGCL est lisible (8 fichiers, le plus récent
daté du 24/07/2026, comme la donnée de Repère), mais le téléchargement du fichier est refusé à
l'outil web de l'agent (robots.txt) et le shell n'atteint pas data.gouv.fr. Vérification
officielle à faire depuis un poste connecté.

## 7. Liens

PR : https://github.com/Repere0/repere/pull/147 · https://github.com/Repere0/repere/pull/148 ·
https://github.com/Repere0/repere/pull/149. Comparatifs avant/après (artefact privé du porteur) :
https://claude.ai/artifact/Gbfb6h1uTw2CZvtq67idMe (captures de 21 h, avant la reprise ; rien
d'affiché n'a changé depuis). Les 47 empreintes de commits citées dans ce rapport ont été
vérifiées présentes sur GitHub.
