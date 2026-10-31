# Référencement (site web)

Date : 30/10/2026. Bloc 10 (bonus) de la mission v8. Fichiers vérifiés : `mono/apps/web/index.html`, `mono/apps/web/src/App.jsx`, `mono/apps/web/src/routes/`, `mono/apps/web/public/`.

## Ce qui est en place

- **Titre** : « Repère — qui décide chez vous » (`<title>`).
- **Description** : une phrase qui dit ce qu'on trouve (élus, circonscription, comptes de la commune, sources officielles) et « Aucun compte, aucun traceur ».
- **Open Graph** : `og:type`, `og:locale` (fr_FR), `og:site_name`, `og:title`, `og:description`.
- **Titre dynamique** (`App.jsx`, effet sur `fiche` et `nomDepartement`) : l'onglet du navigateur porte le nom de l'élu ou du département affiché. Deux onglets sur deux communes se distinguent.
- **Langue** : `<html lang="fr">`.
- **Sans JavaScript** : une phrase `<noscript>` explique l'application et renvoie aux sources officielles.

## Ce qui n'est pas en place, et pourquoi

- **Image de partage (`og:image`)** : volontairement absente. Une image servie depuis un hôte dirait à cet hôte qui regarde un lien partagé. Le commentaire d'`index.html` le dit ; je n'ai rien changé.
- **Lien canonique** (`<link rel="canonical">`) : non ajouté. Il faut l'adresse publique définitive du site. Le dépôt cite `repereapp.netlify.app` (`docs/MONO_PRODUCTION_ROLLBACK.md`) sans dire si c'est le domaine retenu. Ajouter une adresse non confirmée serait inventer.
- **Plan du site (`sitemap.xml`)** : non ajouté. Le site n'a qu'une seule adresse : les écrans (élus, calendrier, sources) sont changés par l'état de la page, sans adresse propre (`src/routes/` ne contient pas de routage par adresse). Un plan du site ne listerait qu'une page.
- **`robots.txt`** : non ajouté. Il n'apporte rien tant que le domaine n'est pas fixé.
- **Backlinks** : rien à faire dans le code. Aucune prise de contact n'a été inventée.

## Décision à prendre avant d'aller plus loin

Une adresse propre par commune (par exemple `/commune/...`) donnerait des pages à référencer. Elle poserait une question de vie privée : une adresse de commune deviendrait visible dans l'historique et les signets. Elle contredit aussi l'invariant 2, qui veut qu'aucune requête ne porte un code de commune. **Ce point est à trancher par le porteur, avant tout travail de référencement par page.** Je ne l'ai pas tranché.

## Vérifié

- Lecture de `index.html`, `App.jsx` et de la liste des routes : aucun changement de code nécessaire pour les métadonnées existantes.
- Aucun test automatisé ne couvre les métadonnées du site web. Pas de vérification avec un outil de référencement externe dans cette session.
