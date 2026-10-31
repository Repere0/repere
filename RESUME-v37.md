# RESUME v37 — 5 fonctionnalités et 2 correctifs : état honnête

Date : 31/10/2026. Branche `test/sdk58-expo-go` (jamais fusionnée dans `main`, PR #174 non touchée). Les commits sont listés en section 3 ; l'historique complet est dans `git log`.

**En une phrase** : trois fonctionnalités sur cinq sont livrées et testées dans un navigateur ; deux sont bloquées par la règle de stockage (invariant 2), à trancher par le CEO ; la CI reste rouge à la dernière étape à cause d'un écart de formulation qui date de V34, à trancher aussi.

## 1. Ce qui est fait, bloc par bloc

| Bloc | Résultat | Commit |
|---|---|---|
| 1 — Contact en production (D71) | Fait. `EXPO_PUBLIC_CONTACT_EMAIL` dans `eas.json` (3 profils) et `mobile.yml` ; `docs/contact-email.md`. « Signaler une erreur » visible sur la fiche élu. **Le bouton « Contacter » reste masqué** : les données ne portent pas d'adresse courriel d'élu. | `0615320` |
| 2 — Non-régression commune gardée (B6) | Fait. 19 vérifications (était 15). Sur le code d'avant le correctif `e1106f2`, **8 échecs** ; sur le code courant, 19 réussites. `/elus` ne demande pas le nom de la commune : c'est l'annuaire national, il ne l'affiche pas par conception (voir §4). | `d5af156` |
| 3 — Recherche globale (feature 1) | Fait. Loupe dans l'en-tête de l'accueil ; feuille « Rechercher » avec trois sections (Communes, Élus, Scrutins), fiches ouvertes au toucher, état vide « Aucun résultat pour « X ». » + « Voir toutes les communes ». Voir limites §4. | `09f8718` |
| 4 — Mes suivis (feature 2) | **Bloqué** : invariant 2 et ADR 0006 interdisent de stocker des suivis dans `repere.profil`. Voir BLOCAGES §42. | — |
| 5 — Badge « Nouveau » (feature 3) | **Bloqué** : même cause (`derniereVisite` est un historique, interdit par l'ADR 0006). BLOCAGES §42. | — |
| 6 — Rappel des élections (feature 4) | Fait. Carte sous la citation de l'accueil : « Élections présidentielles », « dans 169 jours (18 avril 2027) », « Comment voter ? ». Affichée seulement dans les 180 jours, jour J compris. Source et date de vérification affichées. | `119ee2f` |
| 7 — Partage (feature 5) | Fait pour les écrans sans partage : Où va l'argent, Mes élus, Actualités, Le calendrier. Texte : titre, lien `repere://<écran>`, source. La fiche élu garde son partage existant (carte d'image). | `a818578` |
| 8 — Vérification et rapport | Ce fichier. Profil plein : **279 octets** (limite 500). Tests unitaires : 279/279. Navigateur : voir §2. CI : voir §2. | ce commit |

## 2. Vérifications

**Faites, dans ce environnement :**
- `tsc --noEmit` : vert.
- Tests unitaires et invariants (liste de `mobile.yml`) : 279/279 après le dernier changement.
- Navigateur (Chromium, 390 px), sur le build web courant :
  - `recherche-web` : 14 contrôles (nouveau).
  - `commune-web` : 19 contrôles.
  - `elections-web` : 8 contrôles, horloge du navigateur fixée (169 jours au 31/10/2026 ; masquée au 01/10/2026 ; « aujourd'hui » au 18/04/2027) (nouveau).
  - `partage-texte-web` : 4 écrans, titre, lien, pas de code de commune, source (nouveau). Le partage du navigateur est simulé.
  - `onboarding-web`, `zoom-web`, `mode-web`, `parcours-web` (360/390/430 px, pannes), `partage-story-web` : verts.
- CI sur `09f8718` : toutes les étapes jusqu'à « Même vérité » passent, parcours et cartes de partage compris.

**Non faites, et pourquoi :**
- **Aucun essai sur iPhone ni Android**, aucun build EAS. Le lien `repere://` n'a pas été ouvert sur un appareil.
- **CI non verte** : l'étape « Même vérité » échoue (BLOCAGES §43). Ce n'est pas une des cinq fonctionnalités, mais elle est dans la porte de sortie.
- **Mode daltonien et confort de lecture** : les tests unitaires `daltonisme` et `theme` passent, et aucun nouveau code couleur n'a été ajouté. Je n'ai pas regardé les nouveaux écrans en mode daltonien ni en taille 26 : à faire sur appareil.
- **Captures d'écran** : deux vues de contrôle (accueil avec loupe, recherche « Melun ») ont été regardées. Le rappel électoral et les boutons de partage ne l'ont pas été.

## 3. Commits de la session V37

- `0615320` fix(contact) : adresse en production (EAS et CI)
- `d5af156` test(commune) : non-régression gardée
- `09f8718` feat(recherche) : recherche globale unifiée
- `119ee2f` feat(elections) : rappel prochaine élection accueil
- `a818578` feat(partage) : bouton partage sur tous les écrans
- ce commit : docs(v37) : résumé, blocages 42 et 43

## 4. Constats pour le CEO

1. **Décision à prendre, invariant 2 (BLOCAGES §42).** Les fonctionnalités 2 et 3 ne peuvent pas être livrées sans amender l'invariant 2 et l'ADR 0006. Ma recommandation : amender pour `derniereVisite` seul (une date, aucune identité). Pour `suivis`, la décision est plus lourde : c'est une liste d'élus et de communes choisis par le lecteur, donc une identité, ce que l'ADR exclut de `repere.profil`.
2. **Décision à prendre, « Même vérité » (BLOCAGES §43).** La répartition « Sur 100 € » ne dit pas la même phrase sur le site (« 30 € de salaires ») et dans l'application (« Salaires des agents 30 € »). Les montants sont identiques. La CI échoue depuis V34. Deux options : aligner l'application, ou aligner le site.
3. **D71 n'est qu'à moitié tenue.** « Signaler une erreur » est visible. « Contacter l'élu » reste masqué : aucune source publiée ne donne d'adresse courriel d'élu. Le dire tel quel à l'équipe.
4. **`/elus` n'affiche pas la commune.** Le brief demandait que l'annuaire national affiche le nom de la commune gardée. C'est l'annuaire national, sans commune par conception. Je n'ai pas forcé ce point : ce serait un changement de produit.
5. **La recherche globale ne trouve pas les maires.** Les élus publiés sont les députés et les exécutifs régionaux (la même liste que l'onglet « Élus »). Les maires et conseillers ne sont pas indexés à l'échelle de la France. La section « Élus » affiche la fonction et le lieu (département et circonscription, ou région), pas une commune.
6. **Données locales incomplètes.** `scrutins-index.json` et les agendas de l'Assemblée et du Sénat ne sont pas dans `mono/data` de cette session. Conséquences : la section « Scrutins » de la recherche et l'écran « Scrutins publics » affichent « Le serveur a répondu, mais pas avec les données attendues » ici ; la source du calendrier n'est donc pas vérifiée. Les tests le signalent au lieu de passer.
7. **Lien profond `/elu` sans `niveau`** : une ouverture directe plante (« Cannot read properties of undefined (reading 'slice') »). Les liens de V37 ne visent pas `/elu`, mais il faut corriger avant tout lien partagé vers une fiche élu.
8. **D75 (contraste de la date, 2,83:1)** : accepté par le CEO (invariant 7 prime). C'est un échec du critère WCAG 1.4.3 à mentionner une fois dans le dossier d'accessibilité.
9. **Recherche sans tolérance aux fautes.** Les élus et scrutins se cherchent mot à mot, au début des mots, comme les communes. La recherche tolérante (qui ramenait neuf élus pour « Melun ») reste dans l'onglet « Élus ». Choix à confirmer.

## 5. Cinq chemins à tester sur iPhone (Marie, Karim, Thomas)

Personas : `docs/personas.md`. Ces parcours sont proposés à partir du contenu des blocs ; ils n'ont pas été joués sur appareil.

1. **Marie — la recherche** : loupe de l'accueil → taper « Melun » → la commune apparaît avec « Seine-et-Marne » → toucher → elle est choisie. Taper « zzqxw » : « Aucun résultat pour « zzqxw ». » et « Voir toutes les communes ».
2. **Karim — le rappel électoral** : régler la date du téléphone au 31/10/2026 (commune choisie) → la carte « Élections présidentielles, dans 169 jours (18 avril 2027) » et « Comment voter ? » ouvrent l'écran Voter. Au 1er octobre 2026 : la carte n'apparaît pas.
3. **Thomas — le partage du calendrier** : onglet Calendrier → « Partager » en haut → le message contient « Le calendrier », le lien `repere://a-venir`, et la source si l'écran en montre une. Vérifier que le lien ouvre bien l'écran sur l'appareil.
4. **Marie — le signalement** : fiche élu → « ⚠ Signaler une erreur » ouvre un courriel adressé à repere0@protonmail.com (D71).
5. **Karim et Thomas — la commune gardée** : choisir une commune, « Retenir sur ce téléphone », fermer l'application, la rouvrir directement sur « Qui décide » : la commune doit rester affichée (correctif `e1106f2`, non-régression `d5af156`).
