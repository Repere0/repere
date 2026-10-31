# Zones sûres et clavier (V36, bloc 3, m4)

Date : 31/10/2026. Vérifié par lecture du code ; **non vérifié sur appareil** (aucun iPhone ni Android dans la session).

## Clavier : la recherche de l'accueil

- Champ de recherche « Chercher une commune » : `mono/apps/mobile/src/app/index.tsx`, `TextInput` à la ligne 497, dans la liste de l'accueil.
- Le conteneur est un `KeyboardAvoidingView` (ligne 432) qui enveloppe toute la liste (`FlatList`, ligne 434) et se ferme à la ligne 591.
- Comportement configuré :
  - iOS : `behavior="padding"` — le contenu remonte au-dessus du clavier ;
  - Android : `behavior` non défini (`undefined`) — c'est le mode de clavier Android qui décide. Aucune valeur `softwareKeyboardLayoutMode` n'est déclarée dans `app.json`, donc le réglage par défaut d'Android s'applique.
- Conclusion : la recherche est protégée sur iOS par le code. Sur Android, elle dépend d'un réglage par défaut qui n'a pas été vérifié. **À tester sur un Android réel** avant de dire que le clavier ne masque pas le champ.

## Zones sûres (encoches, barre d'accueil)

- Racine : `SafeAreaProvider` dans `src/app/_layout.tsx` (ligne 69).
- Marges lues avec `useSafeAreaInsets()` dans `src/app/index.tsx` (ligne 17), `src/ui/page.tsx` (ligne 22) et `src/ui/source.tsx` (ligne 76).
- Les écrans qui ne lisent pas les marges reposent sur le conteneur de navigation d'Expo Router. Non vérifié sur un iPhone avec encoche ou une barre d'accueil.

## Ce qui n'a pas été fait

Aucun changement de code. Le brief ne demandait qu'une vérification et la documentation, et le clavier est déjà configuré sur iOS.
