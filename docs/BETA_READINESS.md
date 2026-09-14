# REPÈRE — ÉTAT DE PRÉPARATION DE LA BÊTA
**Mesuré le 13 septembre 2026.** Aucune ligne de ce tableau n'est déclarative : chacune vient
d'une mesure, ou porte la mention « non mesuré ».

---

## 1. COUVERTURE ÎLE-DE-FRANCE — mesurée sur les fichiers publiés

| département | communes | maire | circo | député | votes | comptes |
|---|---|---|---|---|---|---|
| 75 Paris | 1 | 1 | 1 | 1 | 1 | 1 |
| 77 Seine-et-Marne | 505 | 505 | 505 | 505 | 505 | 505 |
| 78 Yvelines | 259 | 259 | 259 | 259 | 254 | 259 |
| 91 Essonne | 194 | 194 | 194 | 194 | 194 | 194 |
| 92 Hauts-de-Seine | 35 | 35 | 35 | 35 | 35 | 35 |
| 93 Seine-Saint-Denis | 39 | 39 | 39 | 39 | 39 | 39 |
| 94 Val-de-Marne | 46 | 46 | 46 | 46 | 46 | 46 |
| 95 Val-d'Oise | 183 | 183 | 183 | 183 | 183 | 183 |
| **total** | **1 262** | **1 262** | **1 262** | **1 262** | **1 257** | **1 262** |

| critère | taux |
|---|---|
| commune reconnue | **100,0 %** |
| département | **100,0 %** |
| **intercommunalité** | **0,0 %** — la donnée n'est pas dans le produit |
| région | 100,0 % *(déduite du département, non affichée)* |
| circonscription | **100,0 %** |
| député nommable | **100,0 %** |
| position de vote | **99,6 %** — 5 communes du 78 sans position |
| comptes communaux | **100,0 %** (exercice 2025 : 99,7 %) |
| sources affichées | **100,0 %** — aucun chiffre sans provenance |
| **événements / décisions datés** | **0,0 %** — aucune donnée datée dans le produit |
| état hors ligne | **mesuré serveur éteint à chaque exécution du banc** |

**Lecture** : la couverture des données *statiques* est excellente et n'est pas le sujet. Les deux
zéros — intercommunalité et événements datés — sont le sujet.

---

## 2. PERFORMANCE — mesurée dans un navigateur, compression comprise

| étape | téléchargé | cumul |
|---|---|---|
| ouverture de l'application | 87,1 Ko | 87,1 Ko |
| choix de la commune | 16,3 Ko | 103,5 Ko |
| les votes du député | 3,5 Ko | 107,0 Ko |
| argent et sources | 0 Ko | **107,0 Ko** |

Ensuite : **aucune requête**, l'application fonctionne sans réseau.
*(93 Ko avant la phase 2 ; +11 Ko d'index de communes pour supprimer trois étapes, +3 Ko de contenu.)*

---

## 3. ACCESSIBILITÉ ET LISIBILITÉ — mesurées sur les six écrans

| | avant | après |
|---|---|---|
| cibles tactiles sous 44 px | 11 | **0** |
| texte porteur de sens sous 13 px | 46 à 63 % selon l'écran | **0** |
| contraste en thème sombre | mesuré, seuil 3:1 | idem |
| `prefers-reduced-motion` | partiel | **appliqué par le navigateur, sans JavaScript** |
| motifs ARIA incomplets | aucun dans le monorepo | idem |
| **un H1 par écran** | **non** — un seul H1, celui du produit | **non corrigé** |
| **réglage de taille du texte** | absent | **absent** |

---

## 4. INSTALLATION

| | état |
|---|---|
| manifeste complet (`id`, `scope`, `display`, icônes 192/512/maskable) | ✅ |
| service worker répondant aux requêtes | ✅ |
| métas iOS (`apple-mobile-web-app-capable`, `apple-touch-icon`) | ✅ |
| **installation testée sur un vrai téléphone Android** | ❌ non mesuré |
| **installation testée sur un vrai iPhone** | ❌ non mesuré |

---

## 5. CHAÎNE DE LIVRAISON

| | état |
|---|---|
| le dépôt pousse | ✅ |
| la tâche horaire ne peut plus bloquer le dépôt | ✅ v7 |
| `main` protégée des commits automatiques | ✅ v7 |
| banc statique | ✅ 44/44 |
| banc navigateur | ✅ 64/64 |
| chaîne d'intégration capable de finir | ✅ ordre corrigé |
| **branche fusionnée dans `main`** | ⛔ **non** |
| **URL en ligne** | ⛔ **non** |

---

## 6. VERDICT

**Prêt** : les données, la performance, l'accessibilité tactile et typographique, le hors-ligne,
la provenance, le banc.

**Pas prêt** : la publication, et la raison de revenir.

**Deux zéros dans le tableau de couverture, et ils disent la même chose** : Repère sait dire *qui
décide* et *combien*, il ne sait pas encore dire *ce qui s'est passé*.

**Non mesuré, et à ne pas présenter comme acquis** : le comportement sur un vrai téléphone, le
temps réel qu'un humain met à trouver sa commune, et l'effet de la correction des noms sur la
confiance.
