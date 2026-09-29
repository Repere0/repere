# Conventions

*29/09/2026.*

- **Texte affiché : accents obligatoires.** Commentaires du code : sans accents, par choix.
- **Apostrophe typographique `’` interdite dans le code** (elle casse les ancres de patch).
- **Commentaires : le pourquoi, daté**, avec la mesure qui a motivé le changement.
- **Une règle, un endroit.** Une dérivation affichée par deux écrans ou deux supports va dans
  `@repere/core`. Une adresse de données se compose dans `data-utils/src/client.js`, nulle part ailleurs.
- **Doctrine du vide.** Chaque absence produit une phrase ; deux causes, deux phrases.
  Reprendre les phrases existantes (`PHRASES`, `REFUS_APPARIEMENT`, écrans web) avant d'en écrire.
- **Aucune couleur hors des cinq d'échelon** au-delà d'une amplitude RGB de 24.
- **Mobile :** TypeScript strict, `npx expo install` pour toute dépendance native
  (hors ligne ici : `EXPO_OFFLINE=1`, l'API d'Expo répond 403 depuis le conteneur),
  cibles ≥ 44 px, libellé d'accessibilité sur chaque contrôle.
- **Git :** une branche et une PR par geste ; jamais de fusion par Claude ; commits signés
  `Claude <noreply@anthropic.com>`.
