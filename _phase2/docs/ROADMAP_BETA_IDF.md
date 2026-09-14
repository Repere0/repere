# REPÈRE — FEUILLE DE ROUTE VERS LA BÊTA ÎLE-DE-FRANCE
**Cible : décembre 2026. État au 13 septembre 2026.**

Une bêta, pas une démonstration : utilisable par de vrais habitants, stable, installable,
compréhensible, sourcée.

---

## PHASE 0 — STABILISATION · *presque finie*

| | état |
|---|---|
| le dépôt pousse vers GitHub | ✅ jeton réparé |
| la tâche horaire ne bloque plus le dépôt | ✅ `pousser.bat` v7 |
| `main` protégée contre les scripts automatiques | ✅ v7 refuse tout commit sur `main` |
| la chaîne d'intégration peut finir | ✅ ordre des étapes corrigé |
| relevés rafraîchis quotidiennement | ✅ `mono_donnees.py` + `noms_communes.py` branchés |
| libellés officiels de communes | ✅ 9 198 corrigés, 100 % d'appariement |
| banc étendu à tout le parcours | ✅ 44 statiques + 64 navigateur |
| **fusionner la branche dans `main`** | ⛔ **bloquant** — les tâches planifiées ne s'exécutent que sur la branche par défaut |
| **publier une URL** | ⛔ **bloquant** — trois secrets Cloudflare |

**Sans ces deux dernières lignes, il n'y a pas de bêta.** Tout le reste est prêt.

---

## PHASE 1 — EXCELLENCE UX · *faite, à éprouver sur humains*

| | état |
|---|---|
| entrée par le nom de la commune, sans département | ✅ 106 cibles → 2, dix étapes → sept |
| votes : les 8 lois en tête, les 72 détails repliés | ✅ |
| ce que décide chaque échelon | ✅ six phrases |
| plancher typographique 13 px | ✅ 0 texte sous 13 px sur six écrans |
| zones d'appui 44 px | ✅ 0 cible trop petite |
| retour Android | ✅ deux niveaux, l'URL ne change jamais |
| installable Android **et** iOS | ✅ métas iOS ajoutées |
| **reformuler la source en langue citoyenne** | ⬜ à faire avant le banc (hypothèse H2) |
| **un H1 par écran** | ⬜ |
| **réglage de taille du texte** | ⬜ |

---

## PHASE 2 — PROFONDEUR CITOYENNE · *le chantier qui compte*

**Objectif unique : donner une raison de revenir.** Aujourd'hui rien ne change entre deux visites.

### 2.1 La surface datée — « Ce qui a été décidé »
Un écran, trois types de faits, tous datés, locaux et sourcés :

1. **un projet financé par l'État** — DGCL, licence ouverte, `beneficiaire_code_insee`,
   intitulé et montants. *Vérifié le 13/09.*
2. **un vote de votre député** — déjà dans le produit, il ne reste qu'à le dater dans le fil.
3. **votre conseil municipal** — élections du 22 mars 2026, participation et sièges.

Ordre : **du plus récent au plus ancien**, et la règle d'ordre écrite à l'écran. Jamais de tri par
importance.

### 2.2 L'intercommunalité nommée
La brique Banatic donne `code INSEE → EPCI` et les compétences exercées. L'écran « Qui décide »
dit déjà ce que décide une intercommunalité ; il pourra dire **laquelle**.
*Réserve : les fichiers Banatic datent de février–mars 2025 alors que les périmètres bougent au
1ᵉʳ janvier. À vérifier avant de publier un nom.*

### 2.3 « Chez vous » — la fiche sociale de la commune
Deux ajouts, choisis parce qu'ils se lisent **sans comparer la commune à une autre** :

- **Le logement social**, présenté par l'obligation légale : « 14 % de logements sociaux, là où la
  loi en impose 25 % ». Plus le loyer moyen au m², le taux de vacance, le taux de mobilité.
  *Réserve : l'inventaire SRU ne couvre que 2 208 communes ; hors champ, on affiche le parc sans
  objectif, et on le dit.*
- **Les équipements du quotidien**, avec leur évolution : « 3 boulangeries, 1 pharmacie,
  2 médecins, 1 école, 1 gymnase — il y avait 5 boulangeries en 2015 ». L'INSEE publie déjà les
  points 2015 / 2020 / 2025 : la série est prête, sans travail d'archivage.

C'est la réponse la plus concrète à « qu'est-ce qui se passe chez moi », et la moins polémique.

### 2.4 Les marchés publics — *seulement si 2.1 est livré et éprouvé*
La rubrique « où va l'argent » est incomplète sans eux, mais le coût est réel : table SIRET→INSEE,
déduplication des avenants, pré-agrégation. **Ne pas commencer avant que la surface datée vive.**

---

## PHASE 3 — BÊTA

- parcours des huit départements rejoué à l'œil (`tests/beta_idf.mjs`) ;
- mesure du poids sur le parcours réel (`tests/poids.mjs`) ;
- installation testée sur un vrai téléphone Android **et** un vrai iPhone ;
- dix testeurs, trois questions (voir `Repere_Banc_Decembre_2026`) ;
- corrections, puis seulement ensuite : nouvelles données.

---

## CE QUI N'EST PAS AU PROGRAMME, ET POURQUOI

| écarté | motif |
|---|---|
| délibérations de conseils municipaux | aucune source homogène n'existe — promettre cette couverture serait mentir |
| comptes, notifications, suivi d'élus | contraire aux invariants, et sans valeur pour la question posée |
| comparaison entre communes | produit un classement, interdit |
| équipements publics **en comparaison entre communes** | un palmarès déguisé. *La BPE est en revanche retenue en 2.3, affichée pour la commune seule et dans son évolution 2015 → 2025* |
| Sénat | maille département, rattachement commune impossible sans approximation |
| données de Paris seul | une commune sur 1 262 : asymétrie intenable |
| réécriture d'architecture | pas sans mesure préalable |

---

## LE SÉQUENÇAGE, EN UNE PHRASE

**Publier d'abord** (phase 0), **rendre lisible ensuite** (fin de phase 1), **donner une raison de
revenir enfin** (phase 2.1). Dans cet ordre : une surface datée que personne ne peut ouvrir ne
sert à rien.
