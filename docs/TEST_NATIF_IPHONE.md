# Tester Repère sur un vrai iPhone — protocole

Ce que **personne d'autre que toi** ne peut faire. Mes bancs tournent dans
Chromium via react-native-web : ils ne disent rien de VoiceOver, du Dynamic Type
natif, ni du rendu réel des polices et des ombres sur iOS.

Compte **20 minutes**. Note ce que tu vois dans la colonne de droite, même
sommairement : « ok », « pas lu », « coupé ». Un « pas vérifié » honnête vaut
mieux qu'une case cochée par habitude.

---

## 0. Lancer

Dans **PowerShell**, un bloc à la fois (pas de `&&`, et `npm.cmd` plutôt que
`npm`). D'abord cette seule ligne :

```powershell
cd C:\Users\APina\repere
git status
```

Lis la réponse. **Si elle finit par `nothing to commit, working tree clean`**,
continue. **Si elle liste des fichiers** sous `Changes not staged` ou
`Untracked files`, tu as du travail en cours sur ton PC : **arrête-toi ici et
dis-le-moi** — la commande suivante remettrait la branche à l'état du serveur et
tu perdrais ces modifications.

```powershell
git fetch origin ux/theme-sombre-20-10
git checkout -B ux/theme-sombre-20-10 origin/ux/theme-sombre-20-10
cd mono\apps\mobile
npm.cmd install
npm.cmd start
```

Puis Expo Go, même Wi-Fi, scan du QR. Si l'application ne charge pas : tape `r`
dans le terminal d'Expo pour recharger.

Pour être sûr de tester la dernière version, et non une plus ancienne :

```powershell
git log --oneline -1
git rev-parse HEAD origin/ux/theme-sombre-20-10
```

Les **deux lignes** de la seconde commande doivent afficher le **même**
identifiant. Si elles diffèrent, le `git fetch` ci-dessus n'a pas abouti —
relance-le. (On ne note pas de numéro de commit en dur ici : il change à chaque
livraison, et un numéro périmé dans un protocole est pire que pas de numéro.)

---

## 1. VoiceOver — 8 minutes

**Activer :** Réglages → Accessibilité → VoiceOver. Mets le **raccourci
d'accessibilité** (Réglages → Accessibilité → Raccourci d'accessibilité →
VoiceOver) : trois appuis sur le bouton latéral l'allument et l'éteignent. Sans
ça, désactiver VoiceOver avec VoiceOver allumé est pénible.

Gestes : **balayer à droite** = élément suivant · **double-tap** = activer ·
**deux doigts vers le haut** = lire toute la page depuis le début.

| # | Ce que tu fais | Ce qui doit être lu | Résultat |
|---|---|---|---|
| 1.1 | Accueil, balaye jusqu'au champ | « Où habitez-vous ? » — pas « champ de texte » seul | |
| 1.2 | Balaye jusqu'à la bannière jeunes | « Vous avez moins de 18 ans ? » et la description | |
| 1.3 | Tape « meaux », balaye les résultats | « Meaux, Seine-et-Marne » — le département doit être lu | |
| 1.4 | Ouvre Meaux, balaye les trois réponses | Chaque réponse lue **en une phrase entière**, pas mot à mot | |
| 1.5 | Sur la carte du projet | Le montant doit être lu **dans sa phrase**, pas isolé | |
| 1.6 | Barre basse, balaye les onglets | « Aujourd'hui », « Chez vous », « Calendrier », « Qui décide » + l'état sélectionné | |
| 1.7 | « Qui décide », carte de l'intercommunalité | « Également maire de Meaux… » doit être lu | |
| 1.8 | « Comprendre ce vote », la barre de vote | Les trois positions lues **avec leur libellé** : pour, contre, abstention | |
| 1.9 | La même barre | Les couleurs seules ne doivent **jamais** porter l'information | |
| 1.10 | Bouton de partage d'une fiche d'élu | « Partager la fiche » — pas « bouton » seul | |
| 1.11 | Calendrier, filtre « Tout / Assemblée / Sénat » | Le filtre actif doit être annoncé « sélectionné » — c'est le défaut corrigé ce soir (voir plus bas) | |
| 1.12 | Dictionnaire, rangée des lettres | Même chose : la lettre choisie s'annonce sélectionnée | |

**Ce qui serait un défaut à me signaler :** un élément annoncé « bouton » sans
nom, une phrase découpée en fragments, un chiffre lu hors de son contexte, ou un
élément décoratif (un filet de couleur, une pastille) qui se fait lire.

---

## 2. Dynamic Type — 5 minutes

**Activer :** Réglages → Accessibilité → Affichage et taille du texte → Texte
plus grand → active **Tailles plus grandes**, puis pousse le curseur **au
maximum**.

| # | Écran | Ce qui doit tenir | Résultat |
|---|---|---|---|
| 2.1 | Accueil | Le champ de recherche reste atteignable sans défiler longtemps | |
| 2.2 | Aujourd'hui | Les trois réponses restent lisibles ; le texte ne se coupe pas en « … » | |
| 2.3 | Aujourd'hui | Les gros montants (`726 800 €`) ne débordent pas de leur carte | |
| 2.4 | Barre basse | Les libellés disparaissent et les icônes restent — c'est **voulu** | |
| 2.5 | Comprendre ce vote | L'intitulé du texte reste entier, pas tronqué à deux lignes | |
| 2.6 | Où va l'argent | Les trois postes des 100 € restent alignés avec leurs barres | |
| 2.7 | Calendrier | Les heures ne passent pas à la ligne au milieu (« 14 » / « h ») | |

**Mes bancs ne testent ceci que par lecture de code** (aucun composant ne bloque
l'agrandissement, aucun plafond, aucune troncature à deux lignes). **Le rendu
réel à 200 %, je ne l'ai jamais vu.**

---

## 3. Rendu natif — 4 minutes

| # | Quoi | Attendu | Résultat |
|---|---|---|---|
| 3.1 | Bascule Réglages → Luminosité → Sombre, app ouverte | Tout suit, y compris la barre d'état | |
| 3.2 | En sombre, « Chez vous » | Le filet « France » de la circonscription est **clair**, pas noir sur noir | |
| 3.3 | En sombre, fiche d'élu | La pastille d'initiales garde sa couleur d'échelon et les lettres restent lisibles | |
| 3.4 | Polices | Les titres s'affichent en Bricolage Grotesque, pas en police système | |
| 3.5 | Ombres des cartes | Présentes mais discrètes ; pas de halo gris marqué | |
| 3.6 | Défilement | Fluide, sans à-coup au rebond | |

---

## 4. Le partage — 3 minutes

C'est le seul endroit où **je ne peux rien prouver** : `captureRef` passe par la
hiérarchie de vues iOS, que mon banc n'exécute pas.

| # | Quoi | Attendu | Résultat |
|---|---|---|---|
| 4.1 | Comprendre ce vote → Partager | Deux cartes encadrées, à lire dans l'ordre | |
| 4.2 | « Partager la carte 1 » | La feuille de partage s'ouvre avec **une image** | |
| 4.3 | Regarde l'image produite | **Pas de cadre ni de filet autour** : le cadre est un décor d'aperçu | |
| 4.4 | L'image | Le nom, le vote, l'intitulé, la date, le n° de scrutin et la source y sont | |
| 4.5 | Si le partage d'image échoue | Le texte et le lien du scrutin partent à la place | |

**Le point 4.3 est celui que j'attends le plus.** J'ai mesuré en web que le
cadre ne change ni les dimensions ni le style de ce qui est capturé
(350 × 438 et 350 × 543, identiques avec et sans) — mais l'image réellement
produite par iOS, je ne l'ai jamais vue.

---

## 5. TalkBack (Android) — seulement si tu as un appareil

Même grille que la section 1. **Réglages → Accessibilité → TalkBack.** Je n'ai
testé aucun des deux ; ne présume pas qu'un comportement correct sous VoiceOver
l'est sous TalkBack.

---

## Ce que mes bancs couvrent déjà, pour ne pas te le faire refaire

Deux familles de contrôles, qui ne valent pas la même chose. Je les sépare
exprès : un contrôle sur le code ne dit rien du rendu.

**Mesuré dans le rendu, en Chromium** (`tests/parcours-web.mjs`) :

- aucun débordement horizontal à 360, 390 et 430 px en clair — **et à 390 px
  seulement en sombre** : le thème sombre n'est pas éprouvé aux deux autres
  largeurs, c'est un trou connu du banc ;
- toute cible tactile atteint 44 px ;
- chaque contrôle a un nom accessible (zéro sans nom) ;
- le contraste du texte atteint AA contre le fond **réellement peint** ;
- chaque onglet expose s'il est actif, et vit dans une liste d'onglets ;
- aucun contrôle emboîté dans un autre ;
- la vue **mois** du calendrier est basculée et remesurée (elle ne l'était pas) ;
- les **cinq** états de fraîcheur de l'invariant 9, dont les deux qui affichent
  une donnée périmée : « une publication plus récente est disponible » et
  « une partie de ce qui s'affiche date d'une publication précédente » ;
- aucun mot affiché sans ses accents, aucun montant abrégé.

**Lu dans les sources, pas dans le rendu** (`tests/refonte-ux.test.mjs`,
`tests/texte-agrandi.test.mjs`) :

- aucun composant ne désactive ni ne plafonne l'agrandissement du texte ;
- aucun texte posé sur du flou ou de la translucidité ;
- aucune fermeture automatique sur minuterie.

**Agrandissement simulé, pas natif** (`tests/reflow-200.mjs`) : chaque texte est
multiplié par deux dans Chromium et on remesure débordement et troncature. Ce
n'est **pas** le Dynamic Type d'iOS — d'où la section 2 ci-dessus.

Inventaire du code au 21/10/2026 : **73 `accessibilityLabel`, 71
`accessibilityRole`, 14 `accessibilityState`, 17 éléments masqués au lecteur
d'écran**. Un seul `accessibilityHint` — c'est peu, et c'est le premier chantier
si la section 1 révèle des contrôles dont l'effet n'est pas évident à l'oreille.

## Un défaut trouvé et corrigé ce soir, à vérifier à l'oreille

En sondant le rendu, j'ai constaté que **react-native-web 0.21.3 ne traduit pas
`accessibilityState={{ selected }}`**. Sept onglets de l'application — les trois
filtres du calendrier, les lettres du dictionnaire, les onglets de la fiche
d'élu, les étapes de la procédure, les deux onglets de « Comprendre ce vote » —
n'exposaient donc aucun état actif. Les onglets de la barre basse, eux, en
avaient un : expo-router le pose lui-même. C'est le même défaut que celui trouvé
le 16/10 pour `expanded`, et la correction est la même : l'attribut `aria-*`
accolé à `accessibilityState`.

**Ce que je ne sais pas :** sur iOS, React Native honore `accessibilityState`
sans avoir besoin d'`aria-*`. Il est donc probable que VoiceOver annonçait
correctement l'onglet actif **avant** cette correction, et que le défaut ne
concernait que le rendu web. Je n'ai pas pu le vérifier. C'est précisément le
point **1.6** de la section 1 : si VoiceOver annonce « sélectionné » sur
l'onglet actif, les deux rendus sont d'accord.
