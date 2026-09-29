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
git -C repere worktree add C:\Users\APina\repere-mobile origin/feat/mobile-durcissement
```

## À chaque test

```
cd C:\Users\APina\repere-mobile\mono\apps\mobile
npm install
npx expo login          (iPhone seulement, la première fois)
npm run telephone
```

Scanner le QR code : appareil photo sur iPhone, Expo Go sur Android. Taper une commune
d'Île-de-France. Les données sont celles du site en production.

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
