# RESUME v28 — 30/10/2026

Branche : `test/sdk58-expo-go`. Principe du brief : **aucune donnée supprimée**. Un élément qui n'est pas au premier regard reste à un geste (« Voir plus », « Tout voir »).

Ordre suivi : 1 → 2 → 6 → 3 → 4 → 5 → 7. Tout a été fait, sans blocage.

## Commits

| Commit | Bloc | Contenu |
|---|---|---|
| 61d7576 | 1 | Composant `Details` (accordéon réutilisable, fermé par défaut, 200 ms, immédiat si animations réduites) |
| 9610319 | 2 | Composant `ModaleExhaustif` (feuille plein écran, sections titrées, source sous chaque section) |
| 7720541 | 6 | `docs/audit-progressive-disclosure.md` : audit anti-perte V15 → V20 |
| 27d4823 | 3 | Carte budget de l'accueil en trois niveaux. Correction : le lien « Changer » du badge zoom était invisible sur l'accueil sombre |
| bd49017 | 4 | Carte du vote en trois niveaux, un seul composant pour le député et pour l'exemple |
| 9d1f65e | 5 | Fiche élu en trois niveaux |
| (ce commit) | 7 | Ce rapport |

## Tests à chaque bloc

- Tests partagés : 259/259, 0 échec.
- Invariants : 0 erreur. Le contrôle affiche 3 avertissements, non examinés dans ce sprint.
- `tsc` : 0 erreur.
- Parcours navigateur (390 px, Chromium) : zéro échec. Zoom : zéro échec. Cartes de partage : zéro échec.
- Captures vérifiées à l'œil à chaque bloc (hors dépôt) : accueil, budget niveaux 1-3, vote niveaux 1-3, fiche élu niveaux 1 et 3.

## Ce qui a changé, écran par écran

| Écran | Niveau 1 (à l'écran) | Niveau 2 (« Voir plus ») | Niveau 3 (« Tout voir ») |
|---|---|---|---|
| Accueil, carte budget | Titre calculé : « Sur 100 € dépensés à X, N € vont aux salaires des agents ». Chiffre par habitant. Source | Comparaison à la médiane régionale, année précédente, répartition (salaires, investissement, autres) | Feuille : montant, répartition, méthode, comparaison, lien officiel OFGL |
| Accueil, carte vote | « X a voté pour. » (ou « contre », « s'est abstenu »), sens en toutes lettres avec son rond de couleur, date et titre du scrutin | Décompte du scrutin (barre et chiffres) | Feuille : scrutin, décompte écrit, règle de lecture de la position, lien officiel (député réel seulement) |
| Fiche élu | Identité, accroche calculée sur ses trois derniers votes (« 3 pour, 0 contre, 0 abstention »), ses votes | « Fonction et mandat » : fonction, date de début quand la source la publie, ce que ce niveau décide. Fermé pour un député, ouvert pour les autres fonctions | Feuille : méthode des votes, date du relevé, répertoire des élus, ce que Repère n'affiche pas, lien officiel |

Ce qui a été ajouté à l'accroche du budget : l'année précédente s'affiche avec la comparaison au lieu d'être remplacée par elle. Rien n'est retiré.

## Ce qui reste, et ce qu'il faut décider

1. **Audit anti-perte (bloc 6)** : trois cas demandent une décision du CEO, détaillés dans `docs/audit-progressive-disclosure.md` :
   - le sous-titre du calendrier a perdu « pas seulement votre commune » ;
   - la phrase « Repère ne sait pas qui vous êtes » a quitté l'accueil pour la FAQ, réécrite ; proposition : la remettre au niveau 2 sur l'accueil ;
   - le motif vie privée des photos de l'Assemblée (adresse du lecteur) n'est plus écrit nulle part ; proposition : le réintégrer dans l'ADR 0004.
   Limite : l'audit ne voit que les lignes supprimées dans le code. Les données publiées (budgets, votes, actus) ne sont pas versionnées : elles ne sont pas auditées.
2. **Le vote de l'exemple** garde sa position « a » écrite dans le code. Elle n'est pas lue du catalogue publié, contrairement au décompte. À corriger.
3. **Deux noms du même producteur** : « Observatoire des finances locales » (`sources.ts`, FAQ) et « Observatoire des finances et de la gestion publique locales (OFGL) » (`source.tsx`). Le nom officiel reste à choisir.
4. **Population** : le brief citait l'INSEE comme source du nombre d'habitants. Le dépôt ne dit pas d'où vient ce nombre dans les montants par habitant. Rien n'a été écrit à ce sujet ; à vérifier avant d'ajouter une source.
5. **Feuilles sur fond sombre** : les feuilles de niveau 3 restent en thème clair, comme le reste de l'application. Le choix reste à valider.
6. **Titre-conclusion du vote** : le titre de niveau 1 nomme l'élu et sa position. La phrase « 503 pour, aucun contre » du brief n'est pas en titre : elle relève du bloc D de V27 (non fait).
7. **Hors de ce sprint, toujours à faire** : V27 blocs C (mode daltonien Okabe-Ito, qui amende D24 et l'invariant 7 : décision formelle requise), D (titres-conclusions sur tous les chiffres), E (« Pourquoi je vois ça »), F (fil « Pour vous »), G (RESUME-v27). V26 blocs 4 à 6 (data viz, méthodologie, fil) : non faits. Brief V25 : absent.

## Écarts relevés au brief

- V27 bloc A et B : un seul commit (`ebf453a`) au lieu de deux.
- V27 bloc C : la couleur « normal » demandée (`#A40E26`) diffère de celle du code (`#CF222E`, D24). Le code n'a pas été modifié. Le gris `#999999` n'est pas une couleur Okabe-Ito.

## Top 5 à tester sur iPhone (trois personas : une personne âgée peu à l'aise avec le tactile ; une personne malvoyante qui règle la taille du texte ; une personne qui veut seulement savoir qui la représente)

1. **Budget, accueil** : « Voir plus » déplie la comparaison et la répartition ; « Tout voir » ouvre la feuille et « Fermer » la referme. Pour la personne malvoyante, le titre doit se lire en taille 22 sans coupure.
2. **Badge « Changer »** sur l'accueil : le lien est lisible (il ne l'était pas avant ce sprint).
3. **Vote, accueil** : la phrase « X a voté pour. » est comprise sans lire le décompte ; le décompte se déplie.
4. **Fiche élu** : l'accroche « Sur ses 3 derniers votes… » est comprise ; « Fonction et mandat » est fermé pour un député.
5. **Feuilles de niveau 3** (budget, vote, fiche) : défilement jusqu'au lien officiel, lien ouvert dans le navigateur, retour à l'écran sans perte de position.

Non vérifié : toutes les captures et tous les tests sont faits sur Chromium à 390 px. Aucun test sur iPhone réel dans ce sprint.
