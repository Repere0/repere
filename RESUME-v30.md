# RESUME v30 — 30/10/2026

Branche : `test/sdk58-expo-go`. Cinq fonctions citoyennes demandées, quatre faites, une non faite (bloc 5). Rien n'a été fusionné dans `main`.

## Commits

| Commit | Bloc | Contenu |
|---|---|---|
| 0f2c5f0 | 1, 2, 3, 4 | Mes élus ; Voter (agenda et guide) ; Contacter ; Signaler une erreur. Correction de la commune gardée |
| a52bb7f | — | BLOCAGES 28 à 32 |
| (ce commit) | 6 | Ce rapport |

Les blocs 1 à 4 sont dans un seul commit : les écrans partagent des fichiers (`index.tsx`, `elu.tsx`, `_layout.tsx`), et les séparer demandait un découpage par morceaux de fichier que je n'ai pas fait.

## Tests

- Tests partagés : 261 réussis, 0 échec. Bilan : 0 erreur, 3 avertissements (inchangés).
- `tsc` : 0 erreur.
- Porte web complète : verte (parcours, zoom, cartes de partage).
- Contrôles dans Chromium à 390 px, sur le build sans `EXPO_PUBLIC_CONTACT_EMAIL` : accueil (liens Mes élus, Voter, Pour vous ; aucun signalement affiché), Voter (compte à rebours), Mes élus (depuis l'accueil).
- Contrôles sur un build de test où l'adresse de contact est définie (build non publié) : Mes élus, fiche du maire (lien « Contacter : voir la source officielle », « ⚠ Signaler une erreur »), signalements de l'accueil (budget, vote). Captures vérifiées.
- Aucun test sur iPhone réel.

## Ce qui a été fait

**Bloc 1 — Mes élus.** Écran `Mes élus`, accessible par « Mes élus › » sur l'accueil. Il affiche le maire, le député, les conseillers départementaux du canton, et dit tel quel que les sénateurs et les conseillers régionaux ne sont pas publiés. Même source que « Qui décide » : aucune donnée nouvelle.
- Limites : pas de photos ; les conseillers départementaux ne sont pas cliquables (la fiche élu ne sait pas les ouvrir).

**Bloc 2 — Voter.** Écran `Voter`, accessible par « Voter › » sur l'accueil.
- Prochaine élection : présidentielle, premier tour le 18 avril 2027, second tour le 2 mai 2027. Source : service-public.gouv.fr et LCP, consultés le 30/10/2026.
- Législatives : « Date non fixée ». Le brief disait « juin 2027 » : non vérifié, non écrit.
- Municipales et sénatoriales 2026 : passées, non listées.
- Guide : quatre blocs (s'inscrire, voter, procuration, bureau de vote) en règles générales, avec un renvoi à service-public.fr pour les délais.
- Les dates sont dans `lib/elections.ts`, pas dans `data/` : ce dossier n'est pas versionné et ne partirait pas à la publication.

**Bloc 3 — Contacter mon élu.** Aucun courriel d'élu n'est publié dans les données. Le bouton renvoie donc à la source officielle (Répertoire national des élus), ou affiche « Contact non publié ». Je n'ai pas construit de lien vers la fiche personnelle à l'Assemblée ou au Sénat : aucune URL vérifiée n'est dans le dépôt.

**Bloc 4 — Signaler une erreur.** Présent sur l'accueil (budget, vote), la fiche élu et Mes élus. Il ouvre la messagerie avec un sujet « Erreur sur [contexte] » et le texte de la donnée. **Il n'apparaît que si `EXPO_PUBLIC_CONTACT_EMAIL` est définie**, comme les autres contacts de l'application. Le brief demandait « contact@… » : cette adresse n'existe pas dans le dépôt, je ne l'ai pas inventée.

**Correction hors brief — commune gardée.** Une commune gardée sur le téléphone s'affichait sur l'accueil, mais le choix en mémoire restait vide. Après un redémarrage, « Qui décide », « Élus » et « Mes élus » répondaient « Aucune commune n'est choisie ». Corrigé dans l'accueil. Ce défaut existait avant V30 ; c'est une correction, pas un changement de produit. À vérifier sur iPhone.

**Bloc 5 — Suivi de thèmes. Non fait.** Le profil (`repere.profil`) ne porte que des réglages de lecture (ADR 0006, point 1 ; invariant 2 : « deux clés, rien d'autre »). Un centre d'intérêt n'en est pas un. Le filtre du fil demande aussi un classement des publications par thème, que les données ne contiennent pas. Aucune ligne de code n'a été écrite. Décision formelle du CEO requise (BLOCAGES 30).

**Bloc 6 — ce rapport.** Le chiffre « 6 dimensions couvertes : 4.5/6 » du brief n'est pas écrit : il ne repose sur aucune mesure que je peux vérifier. Ce qui est couvert est dit plus haut.

## Décisions demandées au CEO

1. **Bloc 5 (thèmes)** : amender l'ADR 0006 et l'invariant 2, ou stocker les thèmes ailleurs que dans le profil, ou abandonner ?
2. **`EXPO_PUBLIC_CONTACT_EMAIL`** : la définir à la publication ? Le site publie `repere0@protonmail.com`. Tant qu'elle ne l'est pas, les signalements et l'adresse de contact sont masqués.
3. **Dates** : confirmer qu'on n'affiche pas les législatives tant qu'aucune date n'est fixée (le brief disait juin 2027).
4. **Correction de la commune gardée** : la valider, puisqu'elle change le comportement des écrans « Qui décide » et « Élus » après redémarrage.
5. **AMO30** (groupes politiques de l'Assemblée) : toujours absent. Le fichier doit être téléchargé à la main (RESUME-v29, « Ce qui reste »).

## Top 5 à tester sur iPhone

Les profils Marie, Karim et Thomas ne sont définis nulle part dans le dépôt. Les trois profils de RESUME-v28 sont gardés : une personne âgée peu à l'aise avec le tactile, une personne malvoyante qui règle la taille du texte, une personne qui veut seulement savoir qui la représente.

1. **Mes élus, après redémarrage** (personne qui veut savoir qui la représente) : ouvrir l'application, aller à l'accueil, toucher « Mes élus › ». La commune doit apparaître, sans « Aucune commune n'est choisie ».
2. **Voter** (personne âgée) : le compte à rebours et « Date non fixée » pour les législatives se lisent sans effort ; le lien service-public.fr s'ouvre dans le navigateur.
3. **Ligne d'accès de l'accueil** (personne malvoyante, taille 22) : « Mes élus », « Voter », « Pour vous » ne se coupent pas et ne se chevauchent pas.
4. **Fiche du maire** : « Contacter : voir la source officielle » ouvre le Répertoire ; « Contact non publié » ne doit pas apparaître pour un élu qui a une source.
5. **Signalement** (build de test seulement) : le courriel s'ouvre avec le sujet et le texte de la donnée déjà remplis.

## Note

La branche `test/sdk58-expo-go` reste prête pour une fusion vers `main` **à valider par le CEO**. Les points ouverts ci-dessus doivent être tranchés avant.
