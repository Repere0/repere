---
name: rapport-de-session
description: Terminer une session de travail sur Repère - rapport court au porteur et remise en état du contexte pour la session suivante. À utiliser avant le dernier message de toute session qui a modifié le dépôt.
---

# Terminer une session

## 1. Rien ne doit exister qu'en local
- Tout commit utile est poussé sur une branche distante, avec sa PR. Un travail qui
  ne vit que dans un conteneur, un bundle ou un dossier de téléchargement est un
  travail qui sera perdu (le 16/09, onze commits n'existaient que dans un bundle ;
  au 29/09, le script ofgl.py n'existe sur aucune branche).
- Si la poussée est impossible : le dire en tête du rapport, avec le chemin exact
  de ce qui attend.

## 2. Remettre le contexte à jour
- Une ligne de `CLAUDE.md` ou de `CONTEXTE_PROJET.md` devenue fausse se corrige
  dans la PR de la session, avec la date de la mesure.
- `node outils/derive_contexte.mjs` doit passer.
- Une procédure apprise qui reviendra devient une skill ou complète une skill
  existante — pas un paragraphe de plus dans `CLAUDE.md`.

## 3. Le rapport au porteur
Court, dans cet ordre, sans résumé flatteur :
- **Vert** : ce qui est fait et prouvé (contrôle, mesure, capture).
- **Rouge** : ce qui est faux ou cassé, mesuré.
- **Bloqué humain** : ce qui attend un secret, un jeton, une autorisation, une
  décision produit, un achat — et rien d'autre.
- **Une seule prochaine action.**
- Les commandes minimales à lancer sur son PC, s'il y en a.

Style : « j'ai trouvé X → corrigé Y → test Z → prochain blocage A ».
