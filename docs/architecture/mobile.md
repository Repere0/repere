# L'application mobile — `mono/apps/mobile`

*29/09/2026. Expo SDK 57 (expo 57.0.26, React Native 0.86.3, React 19.2.3, TypeScript 6.0),
Expo Router. Versions lues dans le gabarit `create-expo-app` du jour, pas de mémoire.*

## Tester sur son téléphone

Procédure complète, dépannage et ce qui a été vérifié : `mono/apps/mobile/README.md`.
En bref : Expo Go sur le téléphone (compte Expo gratuit sur iPhone depuis le SDK 57),
puis `npm install && npm run telephone` dans `mono/apps/mobile`, et scanner le QR code.
Données de production par défaut ; `EXPO_PUBLIC_REPERE_DONNEES` pour une autre copie
(`https` ou un chemin : `configurerBase` refuse le reste).

## Pourquoi l'application est hors de l'espace de travail pnpm

`mono/pnpm-workspace.yaml` exclut `apps/mobile`. Motif : la chaîne de publication fait
`pnpm install --frozen-lockfile` sur tout l'espace de travail ; y faire entrer ~570
paquets React Native ralentirait chaque publication quotidienne et exposerait le site à
une panne d'installation qui ne le concerne pas. L'application relie `@repere/core` et
`@repere/data-utils` par des liens `file:`, et `metro.config.js` dit à Metro où les lire.
**Rien de ce dossier ne tourne dans `collecte.yml` ni `epreuve.yml` aujourd'hui.**

## Ce qui est partagé, ce qui est réécrit

| | web | mobile |
|---|---|---|
| adresses, cache, états de chargement, phrases de vide | `@repere/data-utils` | idem, importé |
| faits, votes, comptes, recherche, « Aujourd'hui » | `@repere/core` | idem, importé |
| composants (Source, Vide, Carte…) | `packages/ui` (DOM) | `src/lib/composants.tsx` (React Native) |
| navigation | onglets maison + `historique.js` | Expo Router (pile native, geste retour) |
| stockage | IndexedDB (une base, un magasin, garde) | **mémoire seulement** pour l'instant |

Le stockage mobile : `store.js` retombe en mémoire quand IndexedDB manque. Donc **pas de
hors-ligne sur téléphone aujourd'hui**. Le brancher (fichier ou SQLite d'Expo) exige de
porter la garde de l'invariant 2 (« rien d'autre qu'un paquet départemental ») : c'est la
phase 4 de la feuille de route, pas un détail.

## Structure

```
apps/mobile/
  src/app/_layout.tsx    coquille : zones sûres, barre d'état, pile, bouton retour 48 px
  src/app/index.tsx      ouverture + recherche de commune (trouverCommunes de core)
  src/app/chez-vous.tsx  « Voici ce qui se passe chez vous » : assemble, ne calcule rien
  src/cartes/            une carte par bloc (maire, projet, député) — réutilisables
  src/lib/useCommune.ts  charge les fichiers d'une commune, état PAR SOURCE
  src/lib/donnees.ts     configurerBase + ré-export de data-utils — seule porte réseau
  src/lib/selection.tsx  la commune choisie, EN MÉMOIRE (jamais dans l'adresse)
  src/lib/composants.tsx Carte, Texte, Source, Vide, Bouton, LienSortant
  src/lib/theme.ts       couleurs d'échelon (importées) + neutres de tokens.css
  tests/parcours-web.mjs le parcours mesuré à 360 / 390 / 430 px
```

## Règles propres au mobile

- **La commune ne va jamais dans l'adresse d'un écran.** Sur la version web de l'app, un
  rechargement enverrait ce code au serveur (invariant 2). Elle vit dans `selection.tsx`.
- **Une panne n'est pas une absence.** Chaque source a son état (`useCommune`) : « pas
  arrivé, Réessayer » ne se confond jamais avec « la source ne le porte pas ». Contrôlé
  par `tests/parcours-web.mjs`, qui coupe les projets, les votes, puis le département.
- **Aucun `fetch` dans `src/`** : tout passe par `@repere/data-utils`. Contrôle :
  `mobile — l'application ne demande rien au reseau par elle-meme`.
- **Cibles tactiles ≥ 44 px** (`CIBLE = 48`), **libellé d'accessibilité** sur chaque
  bouton et lien, `accessibilityRole="header"` sur les titres, `accessibilityLiveRegion`
  sur les phrases de vide (TalkBack les lit à l'apparition).
- **Aucune notification poussée, aucun compte, aucune synchronisation** : chacun exigerait
  un identifiant d'appareil ou un serveur (invariant 2). Des favoris *locaux* sont possibles.

## Ce qui n'a pas été vérifié

- Rendu sur un vrai iPhone / Android, VoiceOver et TalkBack réels : **non mesuré**. Seuls
  l'export natif (bundles Hermes iOS 2,4 Mo, Android 2,8 Mo) et le rendu web à trois
  largeurs l'ont été.
- Le mode sombre : `userInterfaceStyle: "light"` imposé pour l'instant.
