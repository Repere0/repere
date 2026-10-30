# Débrief des retours testeurs — méthode

Date : 30/10/2026. À utiliser à J+7 (`docs/checklist-distribution.md`, étape 6), sur le tableau rempli. Outil : `docs/tableau-debrief.csv`, à copier en `docs/tableau-debrief-rempli.csv`, une copie ignorée par git car elle contient des noms.

## 1. Regrouper par thème

Chaque retour, phrase par phrase, va dans **un** thème :

| Thème | Ce qu'on y range | Exemple de retour (forme, pas un vrai retour) |
|---|---|---|
| **Compréhension** | un mot, un chiffre ou une phrase pas compris ; ce qui a été retenu (question 4) | « je ne sais pas ce que veut dire médiane » |
| **UX** | navigation, bouton introuvable, trop long, trop petit | « je n'ai pas trouvé comment revenir » |
| **Données** | chiffre jugé faux, commune absente, date ancienne, élu manquant | « le maire affiché n'est plus le bon » |
| **Bugs** | écran blanc, plantage, lien mort, Expo Go qui refuse | « l'appli se ferme quand j'ouvre le vote » |

Une remarque sur le **contenu politique** (« vous êtes de gauche », « vous protégez untel ») va en **Compréhension**, avec l'écran concerné : c'est le signe qu'une phrase se lit comme un jugement. À traiter en priorité (neutralité).

## 2. Cinq relances si la réponse est vague

1. « Sur quel écran étiez-vous ? Pouvez-vous m'envoyer une capture ? »
2. « Qu'est-ce que vous cherchiez à savoir à ce moment-là ? »
3. « Quel mot, ou quelle phrase, exactement ? »
4. « Qu'auriez-vous attendu à la place ? »
5. « Est-ce que ça vous a empêché de continuer, ou c'était seulement gênant ? »

Ne jamais demander l'opinion politique du testeur, ni son adresse (`docs/testeurs.md`).

## 3. Grille Rouge / Jaune / Vert

| Couleur | Critère | Action |
|---|---|---|
| **Rouge** | bloque l'usage (bug critique), **ou** donnée fausse, **ou** phrase lue comme un jugement, **ou** soulevé par 3 testeurs ou plus | corriger avant d'élargir à 20-30 testeurs |
| **Jaune** | gêne sans bloquer, soulevé par 2 testeurs | corriger dans la version suivante |
| **Vert** | remarque isolée, ou point fort cité | garder, noter |

Une donnée signalée fausse est **rouge tant qu'elle n'a pas été vérifiée** contre la source officielle. Si la source dit la même chose, ce n'est pas une erreur de Repère : passer en **Compréhension** (l'écran doit mieux dire d'où vient le chiffre).

## 4. Synthèse finale (une page)

```
Débrief Repère — [date] — [N] testeurs, [M] communes

Top 3 à corriger (rouge d'abord)
1. [constat] — [thème] — [nombre de testeurs] — [écran]
2. …
3. …

Top 3 à garder
1. [ce qui a été cité comme utile ou clair] — [nombre de testeurs]
2. …
3. …

Ce qui a été retenu en 5 secondes (question 4) : [les 3 réponses les plus fréquentes]
Reviendraient (question 5) : [x sur N], pour voir : [raisons]
Décision : élargir à 20-30 testeurs / corriger d'abord
```

## 5. Rappels

- On compte les testeurs, pas les remarques : une personne qui répète trois fois la même chose compte pour un.
- On ne recopie jamais de nom dans un document commité (synthèse, issue, commit).
