---
name: prouver-une-garde
description: Écrire un contrôle (test, assertion, garde de pipeline) et prouver qu'il attrape vraiment le défaut qu'il prétend garder. À utiliser pour tout nouveau contrôle du banc.
---

# Prouver une garde

Un garde jamais vu tirer n'est pas un garde. Trois fois en deux jours (13-16/09),
un contrôle vert gardait une propriété fausse.

## Règles
1. **Garder une propriété, jamais une liste de mots.** « Aucune valeur ne dépasse sa
   population » plutôt que « le champ X n'existe pas ». Une liste de noms se
   contourne par un renommage.
2. **Mesurer le comportement, pas le volume.** Compter des éléments à l'écran ne dit
   pas s'ils sont les bons.
3. **Mesurer le rendu réel** dans un navigateur quand la propriété est visible :
   `element.focus()` ne déclenche pas `:focus-visible` ; une coupure réseau simulée
   (`setOffline`) n'atteint pas le service worker — éteindre le serveur.
4. **Chercher l'affectation, jamais la chaîne nue** : une garde qui grep un mot
   trébuche sur son propre commentaire. On reformule le commentaire, on ne
   desserre jamais la garde.
5. **Un garde dit QUI il refuse** (le fichier, la commune, la valeur), pas seulement
   qu'il refuse.
6. **Un contrôle indépendant** relit la source brute sans réutiliser une ligne du
   code qu'il vérifie.

## Procédure
1. Écrire le contrôle.
2. Introduire délibérément le défaut (forcer une valeur, retirer un élément, masquer
   une donnée).
3. Lancer : le contrôle **doit** tomber, avec un message qui nomme le coupable.
4. Remettre en état, relancer : vert.
5. Écrire dans le commit quel défaut a été introduit et quels contrôles sont tombés.
