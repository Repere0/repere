# RESUME v15 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Après chaque bloc : `tsc` à 0 erreur, tests partagés à 251/251, parcours navigateur à 222/222, contrôle des invariants à 0 erreur.

## Commits

| Commit | Bloc |
|---|---|
| df212c9 | 1 — A1 : médiane d'Île-de-France au lieu de la moyenne |
| 421ac75 | 2 — A2 : vert des votes `#1F883D`, test WCAG automatique, invariant 7 rescellé |
| 56332a9 | 3 — A3 : carte budget de l'accueil en 4 lignes |
| 1ac9299 | 4 — performance : agrégats régionaux pré-calculés par la chaîne, département seul |
| da2c8e1 | 5 — audit « 5 secondes » |
| (ce commit) | 6 — RESUME-v15 |

## Valeurs

- Médiane d'Île-de-France 2025 : **1 407 €** par habitant, sur 1 258 communes sur 1 262 (moyenne interne : 1 606 €).
- Melun : 2 495 €, « 1,8 fois la commune médiane d'Île-de-France ». Meaux : 2 123 €.
- A2 : vert `#1F883D` à 4,52:1 sur carte blanche. Le rouge `#CF222E` est gardé (5,36:1 sur blanc). Le gris `#6E7781` est gardé (4,55:1 sur blanc ; la brief annonçait plus de 5:1, la mesure dit non). Sur le sol clair, le vert et le gris restent sous 4,5:1 : aucune barre n'y est posée.

## Mesure des données, avant et après le bloc 4 (navigateur, pas appareil)

| Parcours | Avant | Après |
|---|---|---|
| Premier lancement, accueil | 12 fichiers, 890 Ko bruts, 249 Ko compressés | 6 fichiers, 369 Ko bruts, **105 Ko compressés** |
| Accueil + budget de Meaux | 1 029 Ko bruts, 277 Ko compressés | 507 Ko bruts, 132 Ko compressés |
| Retour, même navigateur | — | 1 requête, ~4 Ko compressés |

- **Objectif de moins de 200 Ko : atteint en compressé, pas en brut.** `departments/77.json` pèse 298 Ko bruts à lui seul.
- **Le gain n'existe en production qu'après fusion sur `main`**, car c'est de là que `outils/pipeline.sh` publie `agregats-regionaux.json`. D'ici là, l'application retombe sur le calcul par départements, soit 249 Ko compressés.
- Les agrégats ne sont pas écrits en dur dans `packages/`, contrairement à ce que demandait la brief. Un fichier figé dans le code redonnerait le défaut du « 2 495 € » (D18). Ils sont produits à chaque publication, avec leur source et leur date.

## Top 5 des manques produit qu'aucun code ne résout

1. **Photos des élus.** Pas de photos dans les données publiées. D1 écarte celles de l'Assemblée pour des raisons de droits. Les initiales tiennent lieu de visage. Il faut une source sous licence ouverte, ou une décision juridique.
2. **Groupes politiques des députés.** Tous les badges disent « Groupe : Inconnu ». Le lien député → groupe (AMO30) n'est pas extrait (D3 : ne pas le télécharger). La palette des 12 groupes (ADR 0001) attend cette donnée.
3. **Actualités.** Le fil compte 8 faits nationaux, le dernier daté du 14/08/2026, et aucun fait par commune. Il faut une rédaction humaine (format : `docs/data/evenements-format.md`).
4. **Rythme de publication.** Le dernier scrutin solennel relevé date du 13/10. La carte « Dernières publications » reste donc masquée (règle des 7 jours). La rétention dépend de ce rythme.
5. **Comptes OFGL de 93 jours.** C'est le rythme de la source (mise à jour du 29/07/2026). Il s'affiche honnêtement « ancien ». Rien à faire côté code.

## Recommandation pour la prochaine session (ce qui demande le CEO)

1. **Fusionner `test/sdk58-expo-go` sur `main`**, ou dire comment publier les données de la branche. Sans cela, ni `agregats-regionaux.json` ni le gain de 249 à 105 Ko ne partent en production.
2. **Tester sur un vrai téléphone (Expo Go)** : délai de la comparaison régionale en 4G, lisibilité des couleurs de vote au soleil, VoiceOver.
3. **Trancher les points ouverts** : écran Actualités vide (le garder ou le retirer) ; ligne « Données Repère publiées le » sur l'accueil avant choix d'une commune ; assouplir ou non « trois réponses dans le premier écran » (audit 5 s).
4. **Décider la source des groupes politiques et des photos** (points 1 et 2 ci-dessus) : ce sont les deux manques les plus visibles pour un testeur.
5. **Adresse de contact** (`EXPO_PUBLIC_CONTACT_EMAIL`) avant d'envoyer aux premiers testeurs.
