# Checklist de la bêta Île-de-France — critères mesurables (13/10/2026)

Objectif : une bêta utilisable par 10 testeurs en décembre 2026, limitée aux
8 départements d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95).

État de chaque critère : **OK** (mesuré), **ÉCHEC** (mesuré, à corriger),
**MANUEL** (à faire sur téléphone), **DÉCISION** (ton avis requis).

## A. Périmètre et données

| Critère | Mesure | État 13/10 |
|---|---|---|
| Communes couvertes = 1 262 (8 départements) | `communes-beta.json` à l'extraction | OK |
| Aucune adresse réseau ne porte un code de commune | parcours-web, contrôle 2 | OK |
| Données par département (`/data/departments/{dep}`) | extraction | OK |
| Commune hors IDF : phrase de couverture, jamais une absence | parcours-web (« hors d'Île-de-France ») | OK |
| Montants incohérents exclus, pas publiés | règle V-2 : 119 exercices sur 104 515 | OK |
| Source, producteur, date et licence sur chaque chiffre | parcours-web (pastilles, feuille de source) | OK |
| Chiffre calculé annoncé « Calcul Repère » | parcours-web | OK |
| Questions au gouvernement publiées | dépend de `data/brut_*` (absents du rendu local) | À VÉRIFIER dans le dépôt de production |

## B. Doctrine (invariants)

| Critère | Mesure | État 13/10 |
|---|---|---|
| Aucune donnée absente affichée comme zéro | parcours-web, `doctrine-vide-mobile` (libellés) | OK (libellé des groupes corrigé ce jour) |
| Aucun classement, score ni rang | parcours-web et invariants | OK |
| Aucune donnée de présence ni d'absence d'élu | parcours-web (« aucune donnée de présence ») | OK |
| Une seule clé locale, aucune requête avec le code commune | parcours-web (mémoire) | OK |
| Couleurs d'échelon figées | invariants (amplitude ≤ 24) | OK |

## C. Mise en page et lisibilité (360, 390, 430 px)

| Critère | Mesure | État 13/10 |
|---|---|---|
| Aucun débordement horizontal | parcours-web | OK |
| Cibles tactiles ≥ 44 px | parcours-web | OK |
| Contraste AA (4,5:1) sur le texte visible | parcours-web | OK |
| Les trois réponses de l'accueil tiennent dans le premier écran (390 × 844) | parcours-web | **ÉCHEC** (888 px pour la troisième) |
| Chaque bouton et lien a un nom accessible | parcours-web (0 sans nom) | OK |
| Aucun mot affiché sans accents | parcours-web | OK |

## D. États dégradés

| Critère | Mesure | État 13/10 |
|---|---|---|
| Source injoignable : phrase d'échec et bouton « Réessayer » | parcours-web (panne du département) | OK |
| Données gardées lisibles hors ligne, sans « mis à jour » mensonger | parcours-web (fraîcheur) | OK |
| Votes et projets en panne : « pas arrivés », jamais « aucun » | parcours-web | OK |
| Agenda au-delà du dernier jour publié : « pas encore publié » | parcours-web (cas fabriqué) | OK |

## E. Ce qui reste manuel (téléphone réel)

| Critère | Comment | État 13/10 |
|---|---|---|
| Installation et première ouverture | Expo Go en Wi-Fi (`npm.cmd start`) | MANUEL |
| VoiceOver (iPhone) et TalkBack (Android) : chaque réponse se lit en entier | écouter les écrans | MANUEL |
| Texte agrandi jusqu'à 200 % | réglage système | MANUEL |
| Perte de connexion puis retour : données gardées | couper le Wi-Fi | MANUEL |
| Retour après fermeture : commune retrouvée | fermer et rouvrir | MANUEL |
| Lisibilité sous lumière réelle | observation | MANUEL |

## F. Décisions à trancher (ton avis)

1. **Accueil à 390 × 844** : pour que les trois réponses tiennent, il faut retirer environ
   45 px. Options : (a) déplacer « 5 projets aidés › » sur la ligne de la note ;
   (b) retirer « Partager » de la carte d'accueil et le garder dans la feuille de la
   réponse. Recommandation : (a), qui ne retire aucune information.
2. **Dix testeurs** : comment les recruter et leur remettre la bêta (lien, TestFlight,
   Play Console interne) — décision produit et juridique.
3. **Mentions légales et identité de l'éditeur** : à fournir par toi, jamais inventées.
4. **Hébergement** : Netlify (crédits à vérifier) ou Cloudflare Pages (cible décidée,
   non commencée). Décision de dépense.

## G. Seuil de sortie vers les testeurs

Tous les critères **A à D** en OK, un parcours complet sur téléphone réel (**E**),
et les décisions **F** tranchées. Une seule exception possible : un critère ÉCHEC
accepté par écrit, avec sa raison.
