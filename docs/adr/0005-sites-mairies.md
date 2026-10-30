# ADR 0005 — Sites officiels des mairies, en lien externe

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026 (décision D28 du CEO). Invariant 4 complété dans `CLAUDE.md` et `AGENTS.md`, puis scellé.

## Décision

1. **Source :** l'Annuaire de l'administration (DILA, Service-Public), sous Licence Ouverte 2.0.
2. **Usage :** un lien « Site officiel de la mairie », ouvert dans le navigateur. Aucun contenu du site n'est lu, copié ni aspiré par Repère.
3. **Données :** `data/mairies-idf.json`, produit par `mono/scripts/collecte-sites-mairies.mjs` dans la chaîne de publication. C'est un seul fichier pour toute l'Île-de-France : aucune adresse réseau ne porte un code de commune (invariant 2).

## Limites

- **Un site peut être faux, ancien ou mort** : l'annuaire est déclaratif. Le lien dit qu'il ouvre un site externe, et la source de l'adresse est indiquée.
- **Sans site dans l'annuaire, pas de lien.** Aucune adresse n'est devinée (par exemple « ville-xxx.fr »).
