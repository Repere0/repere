# Héberger la politique de confidentialité

Source : `docs/privacy-policy.md` (texte de référence). L'application l'affiche aussi dans l'écran « Confidentialité », qui doit rester identique.

## URL prévue (proposition, à confirmer)

`https://repereapp.netlify.app/confidentialite`

Cette URL repose sur le site Netlify qui sert déjà les données (`/data`). Elle n'existe pas encore. Ne la déclarer dans App Store Connect qu'après l'avoir vérifiée en ligne.

## Mise en ligne (à faire, après vérification de la configuration Netlify)

1. Produire une page HTML simple à partir de `docs/privacy-policy.md` (titres, listes, sans script).
2. La publier à l'adresse ci-dessus, dans le dépôt qui alimente le site Netlify.
3. Ouvrir l'adresse dans un navigateur, sur téléphone : le texte doit s'afficher en entier, sans erreur.
4. Reporter l'adresse exacte dans App Store Connect (champ « URL de la politique de confidentialité »).

Non vérifié ici : la configuration de déploiement Netlify n'a pas été lue dans cette session.

## Mise à jour

- Toute modification du texte se fait d'abord dans `docs/privacy-policy.md`, puis dans `mono/apps/mobile/src/app/confidentialite.tsx` (les deux doivent rester identiques ; le test `conformite.test.mjs` ne compare que quelques phrases clés).
- Changer la date de version dans les deux fichiers.
- Republier la page en ligne le même jour.
