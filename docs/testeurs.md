# Retour des testeurs : comment le recueillir

Date : 30/10/2026. Public visé : 20 à 30 testeurs en Île-de-France, via Expo Go.

## Recommandation : un mailto, pas de formulaire

- Un lien `mailto:` ouvre l'application de messagerie du testeur avec un objet et un corps déjà écrits. Aucun service tiers, aucun compte, aucune donnée stockée par Repère.
- Un formulaire externe (Google Forms, Typeform, etc.) enverrait les réponses à un tiers, avec un compte et un traceur possibles : cela contredit la politique de confidentialité (`docs/privacy-policy.md`). À éviter tant que cette politique dit « aucun tiers ».
- Limite du mailto : il suppose une messagerie configurée sur le téléphone, et l'adresse de réception doit exister.

## Ce qui reste à décider (voir BLOCAGES.md, section 3)

- L'adresse de réception. Aucune adresse n'est écrite dans ce document ni dans l'application tant que le porteur ne l'a pas validée.
- Le modèle de corps de message, à utiliser une fois l'adresse connue :
  `mailto:<ADRESSE>?subject=Feedback%20Repère&body=Ce%20que%20j'ai%20aimé%20:%0A%0ACe%20qui%20m'a%20gêné%20:%0A%0AUne%20idée%20:%0A`

## Ce qu'on demande au testeur

1. La commune testée, et si elle était à lui ou à un proche (pour savoir quelles communes sont couvertes).
2. Ce qui ne marche pas, avec l'écran et les étapes.
3. Un écran qu'il ne comprend pas : quel mot, quelle phrase.

Ne rien demander de plus : pas de nom, pas de téléphone, pas d'adresse personnelle.

## Lancer une session de test (porteur)

1. Sur l'ordinateur (Windows) : `scripts/lancer-pour-testeurs.ps1`. Il ouvre Expo en mode tunnel depuis `mono/apps/mobile`.
2. Expo affiche un QR code et une adresse `exp://…`. Les envoyer aux testeurs.
3. L'ordinateur reste allumé et connecté pendant toute la session : si le script s'arrête, l'application ne se charge plus chez les testeurs.

## Côté testeur

1. Installer **Expo Go** (App Store ou Google Play).
2. iPhone : scanner le QR code avec l'appareil photo. Android : le scanner depuis Expo Go.
3. Choisir sa commune. Rien n'est retenu sur le téléphone sauf si le testeur appuie sur « Retenir … sur ce téléphone ».

## Non vérifié dans cette session

- Le script n'a pas été exécuté : pas de Windows ni de PowerShell ici. Le mode tunnel dépend d'`@expo/ngrok` et du réseau du porteur.
- La compatibilité de la version d'Expo Go des magasins avec le SDK 58 du projet n'a pas été vérifiée sur appareil. Si Expo Go refuse le projet, c'est le premier point à contrôler.
- Le guide testeur complet, la checklist et le message type d'invitation : le brief v9 a été coupé avant leur description (voir `BLOCAGES.md`, section 14).
