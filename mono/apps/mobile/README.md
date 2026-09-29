# Repère sur ton téléphone

*Vérifié le 29/09/2026 (voir « Ce qui a été vérifié » plus bas).*

## Une seule fois

1. Sur le téléphone : installer **Expo Go** (App Store ou Play Store).
2. **iPhone seulement** : créer un compte Expo gratuit sur expo.dev et s'y connecter
   dans Expo Go (icône en haut de l'onglet *Home*). Depuis le SDK 57, Expo Go sur iPhone
   exige le même compte des deux côtés. Ce compte est celui du développeur, pas celui
   des lecteurs de Repère : l'application elle-même n'en demande aucun.
3. Sur le PC (PowerShell), une copie à part pour ne rien toucher à ton dossier habituel :

```
cd C:\Users\APina
git -C repere fetch origin
git -C repere worktree add C:\Users\APina\repere-mobile origin/feat/mobile-memoire-commune
```

(`feat/mobile-memoire-commune` est le haut de la pile #45 → #50 : tout ce qui a été
fait sur le mobile. Pour mettre à jour plus tard :
`git -C C:\Users\APina\repere-mobile checkout --detach origin/feat/mobile-memoire-commune`
après un `git -C repere fetch origin`.)

## À chaque test

```
cd C:\Users\APina\repere-mobile\mono\apps\mobile
npm install
npx expo login          (iPhone seulement, la première fois)
npm run telephone
```

Scanner le QR code : appareil photo sur iPhone, Expo Go sur Android. Taper une commune
d'Île-de-France. Les données sont celles du site en production.

## Ce que tu dois voir (5 minutes)

| taper | tu dois lire |
|---|---|
| `meaux` | le maire, un projet financé par l'État, le vote de la députée de la 6e circonscription, une source datée sous chaque bloc (le 29/09 : Jean-François COPE ; 726 800 € en 2025 ; Béatrice Roullaud, pour, le 21 juillet 2026 — un vote plus récent peut l'avoir remplacé) |
| `paris` | « Paris est partagée entre … circonscriptions » : l'app ne devine pas laquelle est la tienne |
| `amponville` | une phrase qui dit qu'aucun projet n'est publié, pas une carte vide |
| en bas de l'écran | « Retenir … sur ce téléphone », puis fermer et rouvrir Expo Go : la commune est proposée ; « Oublier » l'efface |
| un lien « Voir à la source » | il ouvre le site officiel |
| VoiceOver (iPhone) ou TalkBack (Android) | chaque bouton se lit avec un nom clair ; les titres de carte sont annoncés comme titres |

Ce qui est normal aujourd'hui : pas de fonctionnement hors ligne ; la source du maire n'a pas
encore de lien (il arrive avec #42) ; l'app n'existe qu'en mode clair.

## Si ça bloque

| symptôme | cause probable | quoi faire |
|---|---|---|
| `npm install` refuse : version de Node | Node trop ancien | installer Node 22 LTS (nodejs.org) ; il faut ≥ 20.19.4 |
| le tunnel ne démarre pas (« ngrok ») | service de tunnel indisponible | `npm run telephone:wifi`, téléphone et PC sur le **même** Wi-Fi |
| Windows demande d'autoriser Node sur le réseau | pare-feu | accepter « réseaux privés » |
| Expo Go : « you need to be logged in » | iPhone, compte absent d'un côté | `npx expo login` et connexion dans Expo Go, même compte |
| Expo Go : « incompatible SDK » | Expo Go pas à jour | mettre à jour Expo Go depuis le magasin |

## Ce qui a été vérifié, et ce qui ne l'a pas été

- Vérifié : le serveur de développement démarre et sert l'application à un appareil
  iOS et Android (5,7 Mo et 6,4 Mo en développement) ; les fichiers de production
  (`communes-beta`, `projets/77`, `scrutins/77`) répondent ; le parcours complet passe
  sur le rendu web à 360, 390 et 430 px, pannes réseau partielles comprises.
- **Non vérifié** : un vrai téléphone, le tunnel (le conteneur de travail n'y a pas
  accès), VoiceOver et TalkBack. C'est l'objet de ton test.
