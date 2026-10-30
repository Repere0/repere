# RESUME v10 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. `main` n'a pas été touchée, et les invariants non plus.

## Commits

| Commit | Objet |
|---|---|
| 148bd6a | D18/D19 : la carte « L'argent de [commune] » lit les comptes OFGL publiés |
| 60cd81f | Bloc B : liens « Aller plus loin » (**poussé avec un test en échec**, voir plus bas) |
| 3c7d619 | Correctif : lien « Actualités » rétabli, tests à nouveau à 248/248 |
| f6cdd84 | Bloc C : fiche élu, synthèse en 3 cartes, historique derrière un lien |
| 3d6f3fa | Bloc D : recherche, liste de A à Z, fermeture après choix, communes de la session |
| e06c72a | Bloc F : sigles HOR, DEM, GDR, LIOT ajoutés ; EPR corrigé ; EELV complété |

## Fait

- **D18 / D19 (chiffre figé).** 2 495 € n'est plus écrit dans le code. La carte lit la dépense par habitant du dernier exercice publié : pour la commune retenue sur le téléphone, sinon pour Melun, annoncée « Un exemple, en attendant votre commune ». Sans dépense publiée, la carte n'apparaît pas. « Le chiffre du jour » a disparu. Le vote de l'accueil, toujours figé, est annoncé « Un vote, à titre d'exemple ».
- **B (accueil).** Le pitch est le titre de l'accueil depuis D15. Le titre « Ce qui se passe chez vous. » n'existe plus dans le code. Les liens « Aller plus loin » sont des lignes simples. Hauteur mesurée dans le navigateur à 390 × 844 : Meaux 1 699 px, Paris 1 737 px. Objectif de deux écrans (1 688 px) manqué de 11 à 49 px (voir « Bloqué »).
- **C (fiche élu).** Identité, badge de groupe, puis les 3 votes publiés les plus récents. Chaque carte porte la position en mot et en signe neutre (✓ ✕ ○), le titre du texte et « Comprendre ce vote ». Ce bouton ouvre une feuille : résultat publié, décompte, résumé de la rédaction Repère s'il existe (avec sa source officielle), lien vers le scrutin de l'Assemblée. Ensuite viennent « Voir ses N votes publiés », la fonction, ce que ce niveau décide et les sources. En pied : la mention du parti en petit et un partage discret. Les onglets et le doublon du bouton Retour sont retirés.
- **D (recherche).** L'ordre était déjà le bon (exact, début du nom, le reste, puis l'alphabet) ; il est partagé avec le site. Sans résultat : « Voir toutes les communes d'Île-de-France », de A à Z. La recherche se vide après le choix. Les communes ouvertes pendant la session sont gardées en mémoire, jamais écrites sur le téléphone.
- **F (dictionnaire).** Six des dix sigles demandés existaient déjà : LFI, RN, EELV, EPR, PS et LR. Quatre ajoutés : HOR, DEM, GDR, LIOT. La définition d'EPR était fausse : elle décrivait la coalition Ensemble de 2021, alors qu'EPR est le groupe formé le 18/07/2024. Corrigée. EELV : ajout du nom Les Écologistes (14/10/2023). Sources : pages des groupes sur datan.fr et Reporterre, consultées le 30/10/2026.

## Vérifications

- `tsc` : 0 erreur. Tests partagés : 248/248.
- Parcours navigateur : 222/222, rejoué après C et D.
- Vu dans le navigateur : la carte « L'argent de Melun » (OFGL 2025) ; la fiche de Béatrice Roullaud (3 cartes et la feuille « Comprendre ce vote ») ; la recherche (« me », liste de A à Z, champ vide au retour, communes récentes).
- Non fait : `tests/meme-verite.mjs` (il demande le site et l'application en marche) ; aucun appareil ; aucun Expo Go.

## Incident

Le commit 60cd81f a été poussé alors qu'un test échouait (247/248). Retirer le lien « Actualités » laissait son écran sans accès. Le commit 3c7d619 l'a corrigé quelques minutes plus tard. Les commits suivants ne partent qu'après des tests verts.

## Bloqué, à décider (détail dans BLOCAGES.md, sections 14 et 15)

1. **Écran Actualités** : le supprimer tant qu'aucune actualité n'est publiée, ce qui ramène l'accueil sous deux écrans, ou le garder.
2. **Vote de l'accueil** : toujours figé (scrutin 8706). Le brancher sur les votes publiés, ou le retirer.
3. **« Ce qu'il défend »** : impossible sans thème ni dossier dans les scrutins publiés.
4. **Résumé officiel d'un scrutin** : absent des données. Seuls 7 scrutins de juillet ont un résumé de la rédaction Repère.
5. **Définition d'EPR** : elle avait été validée le 30/10 et elle était fausse. Elle est corrigée, à relire.

## Checklist CEO à minuit

1. `git pull` sur `test/sdk58-expo-go`, puis depuis `mono/apps/mobile` : `npx expo start -c`.
2. Créer l'adresse e-mail de contact.
3. Créer `mono/apps/mobile/.env` avec `EXPO_PUBLIC_CONTACT_EMAIL=adresse@…`. Elle s'affiche alors dans « À propos » (`src/app/a-propos.tsx`). Attention : `.env` n'est **pas** ignoré par git dans ce dossier. Ne pas le commiter par erreur.
4. Lancer `scripts/lancer-pour-testeurs.ps1`. Au premier lancement, accepter l'installation d'`@expo/ngrok`.
5. Tester avec le QR code sur votre téléphone (Expo Go). Si Expo Go refuse le projet, c'est un problème de version du SDK 58 : à vérifier en premier.
6. Envoyer aux 5 premiers testeurs (marche à suivre dans `docs/testeurs.md`).
