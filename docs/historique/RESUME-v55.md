# RÉSUMÉ V55 — FINALISATION BÊTA : HISTOIRE + STORY + DISTRIBUTION (03/11/2026)

Branche : `test/sdk58-expo-go` (jamais `main`). Ordre suivi : bloc 1 → 3 → 2 → 5 → 4.

## Commits

| Commit | Message | Contenu |
|---|---|---|
| c51ff12 | feat(repere-du-jour): catégorie histoire (20 villes IDF) | `histoire-communes.ts`, `avecHistoire` et `raccourcirFait` (core), tests, câblage dans `repere-jour.ts` |
| 4706101 | polish(bandeau): troncature propre | `bandeau-repere.tsx` |
| 3458dde | feat(repere-du-jour): partage story dédié | `partage-repere-du-jour.tsx`, `bouton-partage.tsx` (libellé), page `repere-du-jour.tsx` (bouton) |
| ff85fe2 | docs(distribution): kit testeur final | `docs/kit-testeur.md`, `docs/tableau-retours.csv` |
| 38f61c0 | fix(core): commentaire sans mot de classement (invariant 3) | un mot de classement dans un commentaire faisait échouer l'invariant 3 en CI (run ff85fe2) |

## Bloc 1 — histoire

- **20 villes** avec un fait : Paris, Versailles, Melun, Meaux, Créteil, Boulogne-Billancourt, Saint-Denis, Nanterre, Argenteuil, Montreuil, Évry-Courcouronnes, Cergy, Vitry-sur-Seine, Colombes, Asnières-sur-Seine, Aulnay-sous-Bois, Rueil-Malmaison, Champigny-sur-Marne, Aubervilliers, Sarcelles.
- Chaque fait est une phrase de l'article Wikipédia (fr) de la commune, citée avec son lien. Vérification par lecture des pages (WebFetch), le 3 novembre 2026. Aucune entrée sans source.
- **Écarts avec le cahier** : la source retenue est Wikipédia uniquement (pas de Base Mérimée ni de Cassini, faute de temps de vérification). Le praxinoscope de Montreuil est écarté : contradiction entre sources (1876 et 1877). Saint-Denis : « ancienne église », pas « abbatiale », comme dans l'article.
- Règle : un jour sur trois (`jourEntier % 3 === 0`), le fait historique prend la troisième place. Les autres jours, deux faits. Test : 10 jours sur 30 avec histoire ; sans entrée, rien ne change.
- Vérifié dans le navigateur : le 3 novembre 2026 (jour avec histoire), Meaux affiche « En 1150, Guillaume le Gros fonde l'abbaye de Meaux. » en troisième fait avec sa source.

## Bloc 3 — bandeau

- **Écart avec le cahier (60 caractères)** : à 390 px, une ligne de 44 px tient environ 36 caractères, préfixe « Aujourd'hui : » compris. Le fait est donc raccourci à **22 caractères**. Soixante ne tiennent pas sur une ligne.
- Ce qui est tenu : la coupure tombe à un mot près, un nombre et son unité ne sont jamais coupés, le premier chiffre reste visible (« En 2025, Meaux a… »).
- Mesuré à 360, 390 et 430 px : une ligne, pas de débordement horizontal (`scrollWidth` = `clientWidth`), zone de 44 px.
- Limite : la phrase est coupée en plein milieu. La phrase entière est à un geste, sur la page complète.

## Bloc 2 — story

- Carte 9:16 : logo, « Le Repère du jour », « {date} · {commune} », trois faits au plus (80 caractères au plus, source sous chaque fait), « #Repère » en pied, fond sombre (D5).
- Bouton « Partager ma story » sur `/repere-du-jour`. Si la capture échoue, la feuille de partage reçoit le texte des faits.
- **Vérifié** dans le navigateur (Playwright, échelle 3) : image **1080 × 1920** générée, contenu lisible, aucune superposition.
- **Non vérifié** : la capture `react-native-view-shot` sur un vrai téléphone. Le navigateur ne peut pas la tester (même limite que `partage-story-web.mjs`).

## Bloc 5 — kit testeur

- QR code : emplacement réservé, à générer par le porteur avec `scripts/lancer-pour-testeurs.ps1` avant l'envoi.
- Liens Expo Go : App Store retrouvé par recherche (`apps.apple.com/app/expo-client/id982107779`). Google Play : identifiant du paquet écrit d'après le nom de l'application, **non rouvert** ce jour.
- Les 5 questions du cahier remplacent celles de la version précédente. Celles-ci renvoyaient à `docs/testeurs.md`, qui n'existe pas dans le dépôt.
- `docs/tableau-retours.csv` : colonnes finales (date, testeur, commune, les 5 questions, bug critique, écran, commentaire).

## Bloc 4 — vérification (sur 38f61c0)

| Contrôle | Résultat |
|---|---|
| a) `tsc --noEmit` | 0 erreur |
| b) Suite de la CI (liste de `mobile.yml`) | 296 tests, 296 réussis (après correction de l'invariant 3 ; 295/296 avant) |
| c) Invariants | 61 / 61 |
| d) Parcours R1 / R2 / R3 (390 x 844) | **411 / 613 / 843 px**, tous sous 844 |
| d') `parcours-web` | 225 contrôles OK, zéro échec |
| e) « Même vérité » | 107 faits comparés, zéro échec |
| f) Histoire un jour sur trois | Test unitaire OK ; vérifié en navigateur le 3 novembre |
| g) Story 1080 x 1920 | Générée et contrôlée (navigateur) |
| h) Clair et sombre | Bandeau et bouton vérifiés clair et sombre ; story en sombre seulement (D5) |
| i) CI GitHub | Mobile sur 38f61c0 : **succès**. Épreuve sur 38f61c0 : **en cours** à la rédaction |
| Autres tests navigateur | commune, recherche, élections, partage-texte, onboarding, zoom, mode, partage-story : 0 échec |
| Export natif iOS / Android | OK |
| Export web (CI) | OK, données copiées |

Le run Mobile sur ff85fe2 a échoué (invariant 3, « pire » dans un commentaire) ; corrigé dans 38f61c0 avant ce résumé.

## Templates

22 modèles actifs (15 budget + 7 élus), conformément à D157.

## Ce qui reste hors de ma portée

- Test sur un vrai téléphone en Expo Go (SDK 58) et capture de la story sur appareil.
- Relecture humaine des 20 phrases historiques (vérification faite par lecture de pages, pas par une personne).
- Lien Google Play à rouvrir.
- QR code et créneau du message : à compléter par le porteur.
