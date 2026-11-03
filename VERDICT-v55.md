# VERDICT V55 — 03/11/2026

## Réponses demandées

- **Catégorie histoire** : **20 villes** couvertes (sur 20 à 30 demandées), une phrase sourcée par ville, un jour sur trois.
- **Partage story fonctionne** : **oui dans le navigateur** (image 1080 x 1920, contenu et source vérifiés). **Non vérifié sur téléphone** : la capture `react-native-view-shot` n'est testable que sur appareil.
- **Positions R1 / R2 / R3 (390 x 844)** : 411 / 613 / 843 px. Règle 844 px tenue.
- **État CI** : Mobile **vert** sur 38f61c0 (le run précédent, sur ff85fe2, était rouge pour l'invariant 3 : corrigé). Épreuve **en cours** à la rédaction.
- **Templates actifs** : **22** (15 budget + 7 élus).
- **Écarts assumés** : bandeau à 22 caractères de fait et non 60 (un seul écran de 44 px) ; Wikipédia seule comme source historique ; Play Store non rouvert.

## PRÊT POUR 5 TESTEURS ?

**PRESQUE.**

Pas OUI, parce que le projet n'a jamais été ouvert sur un vrai téléphone dans Expo Go pendant cette version, et que la story n'a pas été capturée sur appareil. Ces deux points ne se mesurent pas ici. Je ne les tiens pas pour acquis.

Pas NON : tout ce qui se mesure dans cet environnement est vert (tsc, 296 tests, 61 invariants, parcours 225 contrôles, même vérité 107 faits, R3 à 843 px).

## Si PRESQUE : la dernière chose à vérifier

Ouvrir Repère dans Expo Go sur un iPhone et un Android réels, depuis le QR du script. Vérifier trois choses : l'application s'ouvre (compatibilité SDK 58), le bandeau mène à la page du jour, et « Partager ma story » produit une image ou, à défaut, envoie le texte. Une fois cela fait, le verdict passe à OUI, et l'étape suivante est la distribution.

## Autres points avant l'envoi (non bloquants)

- Relecture humaine des 20 phrases historiques (chaque lien vers l'article Wikipédia est dans le code).
- Google Play : rouvrir le lien Expo Go.
- QR code et créneau du message : à compléter par le porteur.
