# Politique de confidentialité de Repère

Version du 30/10/2026. Ce texte est la version de l'application (écran Réglages, « Confidentialité ») et la version à publier en ligne pour l'App Store. Il doit être relu par le porteur avant publication.

## Ce que Repère ne fait pas

- Repère ne crée aucun compte. Aucun nom, aucune adresse e-mail, aucun numéro de téléphone ne vous est demandé.
- Repère n'utilise aucun traceur, aucun cookie publicitaire et aucun outil de mesure d'audience à l'intérieur de l'application.
- Repère ne vend, ne loue et ne partage aucune donnée. Repère n'envoie aucune notification.
- Repère fonctionne sans connexion après le premier chargement des données.

## Ce qui est gardé sur votre appareil

- Une seule information peut être gardée : la commune que vous avez choisie, sous la forme de deux codes publics (le code du département et le code INSEE de la commune). Elle n'est gardée que si vous cochez « Retenir sur ce téléphone ». Elle est sous la clé `repere.departement`.
- Le bouton « Oublier » efface cette information.
- Les fichiers publics de Repère (élus, votes, comptes, calendrier) sont gardés dans le dossier de cache de l'application, pour fonctionner hors ligne. Ce sont des données publiques, pas des données qui vous concernent. Le système peut vider ce dossier à tout moment ; l'application les télécharge alors à nouveau.
- Supprimer l'application efface tout ce qu'elle a gardé sur votre appareil.

## Ce qui quitte votre appareil

Pour afficher les données, l'application les télécharge depuis le serveur qui les publie, `repereapp.netlify.app` (hébergement Netlify).

- Comme pour tout site web, ce serveur reçoit votre adresse IP, la date de la demande et le type d'appareil ou de navigateur. Il peut consigner ces informations dans ses journaux techniques, selon sa propre politique.
- Les fichiers demandés sont découpés par département. Le serveur voit donc quel département vous consultez. Il ne voit ni votre nom, ni votre commune exacte (la commune n'apparaît pas dans les adresses des fichiers).
- Repère n'a pas accès à ces journaux, n'en fait aucun usage et ne les relie à aucun compte, puisqu'il n'y en a pas.
- Quand vous ouvrez une source officielle (site de l'Assemblée nationale, data.gouv.fr, ministères), vous quittez Repère. Ce site applique sa propre politique.

## Données concernant des élus

Les données sur les élus, les votes et les comptes sont publiques. Repère les reprend avec leur source et leur date. Repère ne publie ni photo ni patrimoine d'élu.

## Vos droits

Repère ne détient aucune donnée qui vous concerne : il n'y a rien à demander, rectifier ou supprimer chez Repère. Pour effacer ce qui est gardé sur votre appareil, utilisez « Oublier » ou désinstallez l'application.

## Modifications

Toute modification de ce texte porte une nouvelle date en tête de page et est signalée dans l'application.

## Avant publication (porteur, à faire)

- Renseigner l'identité et le contact de l'éditeur. Apple exige un contact dans les métadonnées de l'App Store ; ce contact n'est pas inventé ici.
- Vérifier la politique de journalisation de l'hébergeur Netlify (durée, adresses IP). Le texte ci-dessus dit qu'il peut consigner les demandes : c'est ce qui est établi à ce jour, pas une durée vérifiée.
- Vérifier, sur un appareil réel, que le dossier de cache est bien exclu des sauvegardes iCloud et Google. Le code l'affirme ; ce n'est pas encore mesuré. Le texte ci-dessus ne le promet pas.
- Publier ce texte sur une URL stable (aucune URL n'existe à ce jour) et la reporter dans App Store Connect.
