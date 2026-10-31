# RESUME v34 — 31/10/2026

Branche : `test/sdk58-expo-go`. Huit blocs du brief V34 traités, dans l'ordre. Rien n'a été fusionné dans `main`, aucune branche supprimée, la PR #174 n'a pas été modifiée. Rien n'a été vérifié sur iPhone.

## Commits de la session

| Commit | Bloc | Contenu |
|---|---|---|
| 0fa1498 | 1 | Crash de l'onglet Élus : l'avatar passait le Proxy de thème `OMBRE` dans une prop gelée. Copie `...OMBRE`. Garde `theme-proxy.test.mjs`, citée dans `mobile.yml`. |
| f117841 | 2 | Splash : fond `#161513`, repère `#F3F0EA` (image `splash-icon-sombre.png`). |
| 173bb7c | 3 | Onboarding : « Aucune préférence » aux questions 2 à 4 (vue France, texte 16, aucun sujet). Test `onboarding-web.mjs`. |
| 43d3b3b | 1-2 | `BLOCAGES.md` 35 et 36 (cause du crash, règle du splash levée). |
| 50e5e5f | 4 | Cartes stories 9:16 simplifiées : logo en haut, un titre, une phrase, source en bas. |
| a4c1964 | 5 | Budget « Où vont 100 € » : blocs empilés au lieu des barres fondues. |
| d4bc65c | 6 | Calendrier : diagnostic (BLOCAGES 37) et fallback « Dernier événement ». |
| 69dafba | 7 | Audit UX des cinq écrans : trois défauts corrigés. |

Le bloc 8 est ce rapport.

## État par bloc

1. **Crash Élus** : corrigé à la source, garde en place. La cause n'est pas celle du brief : ce n'est pas un `.sort()` en place (le tri de `elus.tsx` opère sur un tableau local), mais un Proxy de thème passé à une prop que React Native fige en développement. Le message exact sur iPhone n'a pas été reproduit (pas d'appareil). **À confirmer sur iPhone.**
2. **Splash** : fait. Le démarrage n'a pas de texte, le repère est une image. Le fond du démarrage ne suit plus la tuile du logo : c'est une règle du 29/10 levée par ordre du CEO (BLOCAGES 36).
3. **Onboarding** : fait et testé dans le navigateur. « Terminer » enregistre les valeurs par défaut ; le « Passer » du bas, qui garde tous les réglages par défaut, reste.
4. **Cartes story** : fait (voir plus bas pour les skills). Mesuré sur les captures : le vote passe de 54 à 27 mots, le budget de 31 à 43 mots (avec l'infographie). Plafond de 45 mots par carte dans le test.
5. **Budget** : fait, dans le clair et le sombre. Voir « Couleurs » ci-dessous.
6. **Calendrier** : diagnostic et fallback. Cause racine : la collecte échoue depuis le 25/10 (publication Netlify refusée, HTTP 401). Détail dans BLOCAGES 37.
7. **Audit UX** : trois défauts corrigés (roue de réglages, note sur une fonction absente, première séance poussée sous la barre d'onglets). Deux défauts mesurés non corrigés (graisse, densité du calendrier).
8. **Ce rapport** : fait.

## Couleurs (bloc 5)

- Le vert demandé par le brief n'est pas utilisé. Il est réservé aux votes (ADR 0003, invariant 7). L'infographie utilise les couleurs d'échelon de la commune (bleu-sarcelle `#0e7490` pour les salaires, orange `#b45309` pour les investissements) et un gris pour le reste.
- Validation avec `scripts/validate_palette.js` (skill `dataviz`) : séparation daltonien OK (ΔE 16,5 protanopie, 26,6 tritanopie), vision normale OK (ΔE 24,1), contraste sur fond OK. **Échec sur le critère « chroma »** pour le bleu-sarcelle : c'est une couleur d'échelon fixée par l'invariant 7, non modifiée. Parade : libellés directs et valeurs écrites, sans compter sur la couleur seule.

## Comment les skills ont été utilisés

Honnêtement, et sans les étendre :

- **`ux-ui-audit`** (blocs 4 et 7) : bloc 4, critique des cartes existantes avant refonte, avec mesures (nombre de mots et de blocs de texte, captures). Bloc 7 : les trois sondes du skill (`probe-core`, `probe-heuristics`, `probe-perception`) exécutées sur les cinq écrans à 390 px, avant et après. Non fait : la passe de lecture du texte (ton, cohérence des libellés), le contrôle des données sources, les sondes de langue (RTL, LTR, parité) : l'application est en français seulement, et la passe de lecture n'a été faite que sur les écrans touchés.
- **`dataviz`** (bloc 5) : lu avant d'écrire le graphique. Choix de forme (blocs empilés, libellés directs, un chiffre dans chaque bloc quand il tient), validation de palette par le script.
- **`frontend-design`** (blocs 4 et 5) : principes de sobriété appliqués à la carte (un élément fort : le chiffre ou le verdict, le reste discret).
- **`ux-superpowers`** : **non appliqué.** Son point d'entrée (`ux-discover`) construit une découverte à partir de personas, d'entretiens et de données d'usage. Le dépôt n'a pas de dossier `docs/ux-discovery/` (vérifié), et je n'ai pas inventé ces éléments. Le skill `ux-validate` n'a donc pas pu se déclencher non plus.
- **`Design`** (nom du brief) : pas de skill de ce nom dans la session. Les skills `design:*` disponibles (critique, système de design) n'ont pas été utilisés.

## Décisions à prendre par le CEO

1. **Publication cassée** : remplacer le secret `NETLIFY_AUTH_TOKEN` (refusé en 401). Puis relancer `collecte.yml` sur `main`. Sans ce secret, le site ne reçoit plus de données (BLOCAGES 37).
2. **Règle du splash** : garder le démarrage sombre et la tuile du logo claire (état actuel), ou passer aussi la tuile en sombre pour retrouver la règle du 29/10 (BLOCAGES 36). La seconde option change l'icône de l'application.
3. **Carte de vote** : elle ne porte plus le sujet du texte voté (trop long pour une story). Le sujet reste dans le message de partage. À valider.
4. **Carte d'élu** : la mention « Groupe politique : non publié » et la date « depuis » ont quitté la carte. La mention reste dans la fiche.
5. **Vert du budget** : confirmer qu'il reste réservé aux votes (invariant 7) et que le budget n'a que les couleurs d'échelon.
6. **Palette** : le bleu-sarcelle de la commune échoue au critère « chroma » du validateur. Décider si l'échelon doit changer (c'est une décision d'invariant) ou si la limite est acceptée.
7. **PR #174 et version d'Expo** : inchangées depuis V32 (SDK 58 sur la branche, SDK 57 sur `main`).

## Ce qui reste (mesuré, non corrigé)

- **Graisse** : 48 à 62 % du texte est en graisse 600 ou plus selon l'écran (sonde `emphasis`). La graisse ne sépare plus les niveaux. Corriger demande de revoir la typographie des cartes, pas une retouche.
- **Densité du calendrier** : 33 cibles au premier écran, indice de Hick 5,09 (référence 3,2 à 4,0). La semaine de sept jours et les filtres occupent l'écran avant la liste.
- **Impôts et taxes** (écran budget, carte « D'où vient l'argent ») : encore une barre simple (`BarrePart`). Elle n'a pas été transformée : le brief ne visait que « Où vont 100 € ».
- **Calendrier en production** : non vérifié. `repereapp.netlify.app` est injoignable depuis l'environnement de travail. Le contenu réel du site est donc inconnu.
- **Sur iPhone** : rien n'a été vérifié (splash, icône, onboarding, cartes, calendrier, gear).
- **Données** : AMO30 absent du dépôt ; actualités locales vides ; Sénat et conseils régionaux non publiés ; contenu éditorial sur l'impact des votes inexistant.

## CI

Au moment de la rédaction, les exécutions « Mobile » et « Épreuve » sur le HEAD étaient **en attente** (aucun résultat). La dernière exécution observée verte est celle de `2f5d317` (fin V32). Les exécutions de `a4c1964` ont été annulées (remplacées par les pushes suivants), ce ne sont pas des échecs. **Vérifier le vert sur le dernier commit avant toute fusion.**

## Vérifications faites

- `tsc` : 0 erreur à chaque bloc.
- Tests de garde : `theme-proxy`, `theme` (21 réussis), `core` (46 réussis, dont le cas « dernier rendez-vous passé »).
- Web (Chromium 390 px) : parcours, cartes de partage (cinq cartes, zéro échec), onboarding, zoom.
- Captures des cartes, du budget (clair et sombre), du calendrier (avec des séances réelles du normaliseur filtrées sur celles déjà passées) : relues à l'œil.
