# Les données — d'où elles viennent, comment elles arrivent

*29/09/2026.*

## Le chemin

1. `outils/pipeline.sh` (GitHub Actions, `collecte.yml`, chaque jour) télécharge les
   sources publiques — le conteneur de travail de Claude **ne peut pas** les joindre (403).
2. `mono/scripts/extract-html.js` écrit `mono/data/` : `index.json`, un fichier par
   département (`departments/NN.json`), et des socles nationaux (députés, scrutins, agenda).
3. Le banc tourne ; s'il est vert, `data/` est publié tel quel sur Netlify.
4. Web et mobile lisent ces fichiers via `@repere/data-utils` (`chargerDepartement`, …).

Ajouter une source : skill `ingerer-une-source` ; décrire d'abord le schéma sur le runner
(`outils/echantillon_*.py`), jamais le deviner.

## Option retenue : A — fichiers statiques + CDN

| option | ce qu'elle apporte | ce qu'elle coûte | verdict |
|---|---|---|---|
| **A. fichiers statiques** | gratuit, hors ligne possible, aucun journal d'accès, déjà en production | publication quotidienne, pas de requête arbitraire | **retenue** |
| B. API Node | requêtes à la demande | serveur à payer, journaux = adresses IP (donnée personnelle), une panne de plus | refusée tant qu'aucun besoin ci-dessous n'existe |
| C. API + base | recherche plein texte, historique long | tout B, plus une base à sauvegarder | idem |

## Ce que le téléphone télécharge aujourd'hui (mesuré le 29/09/2026, `mono/data`)

| | brut | compressé |
|---|---:|---:|
| socle (index, communes de la bêta, députés, catalogue des scrutins) | 103 Ko | 25 Ko |
| un département (fiche + projets + votes), médiane sur 104 | 185 Ko | 51 Ko |
| le plus lourd (62) | 476 Ko | 135 Ko |
| **ouvrir une commune, cas médian** | **≈ 290 Ko** | **≈ 76 Ko** |

## Quand une API deviendrait utile — examiné cas par cas le 29/09/2026

| besoin | aujourd'hui | API nécessaire ? |
|---|---|---|
| volume | 76 Ko compressés par commune ouverte | **non** ; seuil de réexamen : un département > 1 Mo compressé |
| recherche de commune | 30 Ko pour les 1 262 communes de la bêta ; la France entière (34 637 fiches) : 779 Ko brut, **271 Ko compressés**, mesuré | **non** : un seul fichier statique reste raisonnable ; découpé par initiale si besoin |
| recherche plein texte dans les scrutins | 80 scrutins publiés | pas avant d'en publier des milliers ; même alors, index statique d'abord |
| personnalisation (ma commune, mes élus) | sur le téléphone, jamais envoyée | **non, et interdit** : une API personnalisée apprendrait la commune du lecteur (invariant 2) |
| synchronisation entre appareils | inexistante | **interdite** sans compte, et il n'y a pas de compte |
| données dynamiques (séance en cours, résultats du soir) | publication quotidienne | le seul cas crédible ; un fichier statique republié plus souvent coûte moins qu'un serveur |
| notifications | aucune | un envoi exige un identifiant d'appareil : hors invariants |

Même quand un besoin apparaîtra, la première réponse à essayer est un **index statique de
plus**, pas un serveur. Aucune migration tant que le besoin n'est pas mesuré.
