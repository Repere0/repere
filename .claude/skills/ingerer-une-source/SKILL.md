---
name: ingerer-une-source
description: Brancher une nouvelle donnée publique dans Repère, ou rafraîchir une source existante, avec sa provenance complète. À utiliser avant tout script de collecte ou de normalisation.
---

# Ingérer une source publique

Principe du projet : collecter large → normaliser → croiser → pré-agréger →
**servir petit**. Le navigateur ne reçoit que ce dont la bêta a besoin.

## Avant de coder
1. **Décrire avant de deviner.** Le conteneur ne joint pas les sources françaises :
   faire décrire l'archive par le runner (`outils/echantillon_*.py` → `docs/schema_*.md`),
   puis lire le schéma produit. Ne jamais supposer un nom de champ ou une valeur
   (`"adopte"` au lieu de `"adopté"` a rendu une table muette).
2. **Provenance obligatoire** pour chaque donnée publiée : producteur, licence, date
   de mise à jour de la source, URL. Sans elle, la donnée ne s'affiche pas.
3. **Poids** : mesurer la taille brute. Rien de plus de quelques centaines de Ko
   gzip par département ; DECP (500-970 Mo par fichier) et OFGL brut (3,9 Go) ne
   sont jamais servis tels quels.
4. **Invariants** : aucune donnée de présence ou d'absence, aucun classement
   calculable (compter dans combien de cartes un député apparaît redonne un taux
   de présence — blocker 6 du 16/09).

## Écrire l'ingesteur
- Il **avertit** au lieu de tomber dans `outils/pipeline.sh`
  (`|| echo "::warning::…"`) : un chantier neuf ne bloque pas la publication.
- Il **refuse d'écrire du vide** : aucune ligne lue = aucune sortie, la version
  d'hier reste avec sa propre date. Une archive se juge en l'ouvrant (`testzip`),
  jamais sur sa taille.
- Un total nul sur une population entière est une erreur de collecte, pas un fait.
- Il écrit la date de la source dans sa sortie ; la fraîcheur se calcule au rendu,
  avec un seuil par source (élus : quelques semaines ; comptes : annuel).
- Ingestion et affichage partent **dans la même PR** : trois fois, de la donnée
  produite a été ignorée par l'interface.

## Vérifier
- Comparer la sortie au bloc figé qu'elle remplace, **commune par commune**, et
  écrire les écarts.
- Contrôle du banc sur une propriété de la donnée (skill `prouver-une-garde`).
- Mettre à jour la ligne correspondante de `CONTEXTE_PROJET.md` (source, date,
  couverture mesurée).
