# Repère sur ton téléphone

*Vérifié le 29/09/2026 ; procédure du Wi-Fi validée sur ton iPhone le 30/09/2026.*

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
git -C repere worktree add C:\Users\APina\repere-mobile origin/feat/mobile-ux-revolution
```

(`feat/mobile-ux-revolution` est le haut de la pile : la refonte de l'expérience, avec
tout ce qui précède. Pour mettre à jour plus tard :
`git -C C:\Users\APina\repere-mobile checkout --detach origin/feat/mobile-ux-revolution`
après un `git -C repere fetch origin`.)

## À chaque test

```
cd C:\Users\APina\repere-mobile\mono\apps\mobile
npm.cmd install
npm.cmd start
```

Téléphone et PC sur le **même Wi-Fi**. (`npm.cmd` et pas `npm` : PowerShell bloque les
scripts `.ps1`. Le tunnel, `npm run telephone`, n'a pas fonctionné chez toi ; le Wi-Fi, si.)

Scanner le QR code : appareil photo sur iPhone, Expo Go sur Android. Taper une commune
d'Île-de-France. Les données sont celles du site en production.

## Ce que tu dois voir (5 minutes)

| geste | tu dois voir |
|---|---|
| ouvrir l'app | « Ce qui se passe chez vous, expliqué simplement. », puis « Où habitez-vous ? » et une ligne : pas de compte, rien de gardé sans ton accord |
| taper `meaux` | l'écran **Meaux** : la date des données, puis cinq cartes — un projet (barre : la part de l'État dans le coût), le vote de la députée (barre pour / contre / abstention), l'argent (montant par jour qui se compte, deux barres « sur 100 € »), qui décide (cinq points de couleur), ce qui arrive au Parlement (frise) |
| toucher une pastille « ⓘ » | une feuille « D'où vient cette information ? » : producteur, date, méthode si c'est un calcul, lien officiel |
| « Comprendre le budget de la commune » | la question en grand, les barres, « Ce que ça ne veut pas dire » qui s'ouvre, 2024 → 2025, tous les projets |
| « Comprendre ce vote » | la position en grand, la répartition, pourquoi c'est ta députée, le parcours d'une loi avec l'étape du vote surlignée |
| « Qui décide de quoi » | la chaîne commune → Assemblée, et ce que chaque niveau décide |
| glisser depuis le bord gauche | retour à l'écran précédent |
| Réglages > Accessibilité > Mouvement > Réduire les animations | les montants s'affichent d'un coup, les barres pleines d'emblée |
| VoiceOver | chaque graphique se lit en une phrase (« Pour : 378, contre : 7… ») |

**Hors ligne, ce qui est vrai (les deux supports ne se valent pas) :**

- **Le site** (navigateur) garde le département consulté dans le navigateur et le relit sans réseau. C'est testé dans un vrai navigateur, serveur coupé (`tests/runtime.test.mjs`).
- **L'application** garde le département consulté dans le dossier cache de l'application et le relit sans réseau. C'est testé sur les modules de données (`tests/donnees.test.mjs`), **pas encore sur un iPhone ni sur un Android** : à valider avec les bêta-testeurs.
- **Un département jamais consulté** ne se télécharge pas hors ligne. Sur l'application, l'écran affiche la phrase d'échec de connexion, et non la phrase « vous êtes hors ligne » : React Native ne permet pas de savoir que l'appareil est hors ligne. Défaut documenté : B-06.

**Autres points normaux aujourd'hui :** l'application suit le thème clair ou sombre du téléphone ; la source du maire n'a pas encore de lien (il arrive avec #42, numéro non vérifié dans ce dépôt) ; Paris et les communes à plusieurs circonscriptions ne nomment qu'un député dans « Qui décide ».

## Les messages d'état, tels qu'ils s'affichent

Ces phrases sont celles du code (`packages/data-utils/src/client.js`, constantes `PHRASES` et `PHRASES_FRAICHEUR`). Le titre est lu tel quel à l'écran ; le corps est affiché dessous. Ce qui suit est extrait des constantes, pas réécrit.

| situation | titre affiché | constante |
|---|---|---|
| les données arrivent | Chargement des données de votre département. | `PHRASES["en cours"]` |
| le serveur ne répond pas | Repère n'a pas réussi à joindre le serveur. | `PHRASES["echec"]` (bouton « Réessayer ») |
| hors ligne, département jamais reçu | Vous êtes hors ligne, et ce département n'a jamais été téléchargé sur cet appareil. | `PHRASES["hors ligne"]`, **inatteignable sur l'application (B-06)** |
| le fichier n'existe pas (404) | Ce département ne figure pas dans le découpage publié. | `PHRASES["introuvable"]` |
| le serveur répond, mais pas avec les données | Le serveur a répondu, mais pas avec les données attendues. | `PHRASES["invalide"]` |
| une partie date d'une publication précédente | Une partie de ce qui s'affiche date d'une publication précédente. | `PHRASES_FRAICHEUR["precedente"]` |
| le serveur n'a pas pu confirmer la dernière publication | Repère n'a pas pu vérifier s'il existe une publication plus récente. | `PHRASES_FRAICHEUR["inconnue"]` |
| une publication plus récente est arrivée pendant l'usage | Une publication plus récente est disponible. (bouton « Mettre à jour ») | `PHRASES_FRAICHEUR["nouvelle"]` |

**Attendu :** un message d'échec ne s'affiche jamais au-dessus de données présentes (un test de navigateur le vérifie sur le site, `tests/runtime.test.mjs`). Hors ligne, un département déjà reçu reste lisible.

**Non attendu :** un message qui dit « pas de réseau » alors que le téléphone est connecté ; des données anciennes présentées comme du jour sans la mention « publication précédente ».

**Pour signaler un problème :** dis le département, le message exact affiché, ce que tu venais de faire, et si tu étais en Wi-Fi, en 4G ou en mode avion.

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
