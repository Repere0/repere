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
| Aujourd'hui | 2,4 | 2,3 ; **3 cartes entières au premier écran** |
| Qui décide | 2,1 | 1,9 |

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

- **Séance en cours** : elle disparaît du calendrier dès son heure de début (« à
  venir » exclut ce qui a commencé ; vu à 15 h 04). Fin rarement publiée : que montrer ?
- **Cartes de partage** : ancienne marque « R » (choix laissé, risque 6ter).
- **Fiche d'un élu** : un lien « Retour » double le retour de la barre haute.
- **375 × 667** : la 3e réponse d'Aujourd'hui commence au premier écran (578 px) mais
  reste coupée.
