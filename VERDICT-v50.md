# VERDICT V50-A — 03/11/2026

## État CI

- **Inconnu à la rédaction.** Le run précédent (`0eb7482`) était rouge sur « Même vérité sur le site et dans l'application » (8 échecs « Sur 100 € dépensés »). Cause identifiée et corrigée dans `679d4a9`, poussée. Le run sur `679d4a9` n'était pas terminé. À confirmer dans l'onglet Actions avant toute déclaration de CI verte.

## Ce qui est intégré

- **Groupes politiques : rien.** `data/am30.json` absent du dépôt. « Inconnu » partout.
- **Sénateurs : rien** (skip, D135).
- **Scrutins complets : rien** (skip, D135).
- **Repère du jour : rien de livré dans la branche.** Le bloc 8 n'existe pas.
- **Correction de cohérence** : libellé « Sur 100 € dépensés » aligné sur le site (écran « Où va cet argent »).

## Top 5 des tests iPhone pour le CEO

1. Écran « Où va cet argent » : lire le nouveau libellé « Sur 100 € dépensés : X € de salaires, Y € pour investir » et dire s'il convient.
2. Fiche d'une commune avec données complètes (ex. Paris) : vérifier la carte « Où vont 100 € dépensés » en mode sombre.
3. Accueil : constater que « Sur 100 € dépensés » y reste formulé autrement (non aligné, voir BLOCAGES §54.3).
4. Mode hors ligne après première ouverture : vérifier que les comptes s'affichent avec la même phrase.
5. Fiche élu : vérifier que le badge de groupe affiche « Inconnu » sans erreur (tant que les groupes ne sont pas publiés).

## PRÊT POUR LES 5 TESTEURS ?

**NON.** Raisons :
1. La CI n'est pas confirmée verte sur le dernier commit.
2. Les groupes politiques ne sont pas publiés (données absentes, pas inventées).
3. Le Repère du jour n'est pas livré, alors que la mission V50-A le déclarait livré.
4. Les tests navigateur (`meme-verite`, `runtime`) n'ont pas pu être exécutés localement.

Passage à « PRESQUE » si la CI sur `679d4a9` est verte et si le porteur valide le nouveau libellé.
