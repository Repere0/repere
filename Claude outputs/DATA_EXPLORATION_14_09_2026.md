# REPÈRE — EXPLORATION DES DONNÉES PUBLIQUES, 14 SEPTEMBRE 2026
**Vingt domaines explorés comme des RÉPONSES CITOYENNES, pas comme des fichiers.**

Ce document est le relevé brut de l'exploration. La synthèse et les arbitrages sont
dans `repere_product_review_01.md` § I. Ici : chaque source, ses vraies colonnes lues
ligne à ligne, sa licence vérifiée, sa couverture mesurée, et ses pièges.

**Aucune intégration n'a été faite.** Rien ici n'est branché dans le produit.

## La règle qui décide de tout : les trois portes de P16

Un chiffre qui appelle « c'est beaucoup ? » ne s'affiche que s'il porte une référence
**absolue** :

- **porte (a)** — une **obligation légale** (l'objectif SRU, un classement par arrêté) ;
- **porte (b)** — un **seuil réglementaire** (conformité de l'eau, indice ATMO) ;
- **porte (c)** — **la commune comparée à elle-même** dans le temps.

Une donnée qui n'en franchit aucune est écartée, quelle que soit sa qualité.

---

## OBSTACLES D'OUTILLAGE, à connaître avant de recommencer

- **`tabular-api.data.gouv.fr`** n'indexe que les ressources hébergées ou moissonnées.
  Opérateurs qui marchent : `__exact`, `__in`, `__greater`, `__sort`. Qui ne marchent
  pas : `__startswith` (400), `/data/aggregate/` (404), `/profile/` (404).
- **Interdits par robots.txt**, donc plusieurs « non vérifié » : `static.data.gouv.fr`,
  `data.education.gouv.fr`, `opendata.hauts-de-seine.fr`, `api.insee.fr/melodi`,
  `projets-environnement.gouv.fr`, `data.ofgl.fr`, le dictionnaire de la BPE sur insee.fr.
- **API DIDO du SDES** (tout Sitadel) : aucune syntaxe de filtrage ne fonctionne, le
  service sert le fichier entier. Mais `/dido/api/v1/datafiles/<rid>` documente
  parfaitement les colonnes — c'est par là qu'on vérifie sans télécharger.
- **API Carto GPU de l'IGN** : `municipality` accepte `insee=`, mais `document` et
  `zone-urba` **non** — `geom={point}` ou `partition=` uniquement.
- **Hub'Eau** : `code_departement` est **silencieusement ignoré** sur `/communes_udi`
  (renvoie la France entière) ; `fields=` **casse** le filtre `code_commune` ; la liste
  `code_commune=a,b,c` marche à 8 valeurs et est ignorée à 17 — paginer par 8 ; l'ordre
  par défaut **n'est pas chronologique**.

---

## LES ONZE RETENUS

### 1. Conformité de l'eau potable — la porte (b) la plus propre du corpus
**Question** — « L'eau de mon robinet est-elle potable, et qui me la vend ? »
**Source** — Ministère de la Santé (SISE-Eaux), via Hub'Eau
`https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis` · **LOv2**
**Colonnes décisives** — `reference_qualite_parametre` (la limite réglementaire **écrite
en clair**, ex. `"<=0,1 mg/L"`), `conclusion_conformite_prelevement` (le **verdict
administratif**, ex. `"Eau conforme aux exigences de qualité"`), `nom_distributeur`,
`date_prelevement`, `resultat_numerique`.
**Couverture IDF** — 24 codes testés sur 8 départements → **23 présents sur 23 codes
INSEE valides** (le 24ᵉ, `95001`, n'existe pas). Référentiel national : 49 805 couples
commune × réseau.
**Fraîcheur** — mensuelle, `last_update` 01/09/2026 ; prélèvement lu à Saint-Denis :
**15/06/2026**. Série depuis 2016.
**Porte** — **(b)**, et sans aucune interprétation de notre part : le producteur livre
la valeur, le seuil **et** le verdict. Porte (c) en prime.
**Phrase affichable** — « À Saint-Denis, l'eau est distribuée par FRANCILIANE sur le
réseau UDI SEDIF NEUILLY. Le prélèvement du 15 juin 2026 conclut : *eau conforme aux
exigences de qualité*. Ammonium mesuré 0,015 mg/L, pour une limite réglementaire de
0,1 mg/L. »
**Piège produit** — une commune a **plusieurs réseaux** (Paris en a 4, Montreuil 4) et
**un « verdict commune » unique n'existe pas dans la donnée**. Afficher par réseau, ou
compter conformes / non conformes sur une fenêtre datée. Ne jamais fabriquer un verdict
global.
**Pas de plan B** : le jeu data.gouv correspondant n'expose que des ZIP sur un domaine
interdit. Sans l'API, cette donnée est inaccessible.

### 2. Objectif légal SRU — la porte (a) la plus lisible
**Question** — « Ma commune respecte-t-elle la loi sur le logement social ? »
**Source** — Ministère de la Transition écologique · **LOv2** · annuelle, 11/08/2026
**Colonnes décisives** — `Taux_cible_commune` (**l'obligation de l'article 55**, livrée
par le producteur à côté du taux constaté), `Nombre_lls_Inventaire`,
`commune_deficitaire`, `Commune_carencee`, `Prelevement_net_2026`.
**Couverture IDF** — **427 communes dans le champ légal** sur 2 206 en France, dont
**39 sur 40 en Seine-Saint-Denis**. Les 835 autres communes IDF sont **hors champ** : la
loi ne s'applique qu'aux communes de 1 500 habitants et plus situées dans une
agglomération de plus de 50 000. **« La loi ne vous impose pas d'objectif » est en
soi une réponse à afficher**, pas un trou.
**Porte** — **(a)** au sens strict, **(b)** en prime : la carence et le prélèvement sont
des décisions administratives, pas des jugements de Repère.

### 3. Indice ATMO quotidien — porte (b), couverture intégrale vérifiée
**Question** — « L'air est-il respirable aujourd'hui ? »
**Source** — Atmo France / Airparif · **ODbL** · **quotidienne**, 14/09/2026
**Couverture IDF** — mesurée département par département sur `type_zone='commune'` :
75 = 21, 77 = 507, 78 = 259, 91 = 194, 92 = 36, 93 = 40, 94 = 47, 95 = 184 →
**1 288 zones communales, zéro trou.** Les nombres correspondent exactement aux communes
de ces départements ; les 21 de Paris sont la commune plus ses 20 arrondissements.
**Porte** — **(b)** : échelle réglementaire à 6 classes définie par arrêté. `lib_qual`
est le verdict officiel, pas un score maison.
**Question produit ouverte** — c'est la seule donnée vraiment quotidienne du corpus.
**Mais est-ce de la vie publique locale ?** Un indice d'air ne nomme aucun décideur.

### 4. Sitadel — l'historique auto-comparatif le plus long du corpus
**Question** — « Combien de logements autorisés chez moi cette année, et avant ? »
**Source** — SDES · **Licence Ouverte** · **mensuelle**, 05/09/2026,
couverture **2013-01-01 → 2026-07-31**
**Colonnes** — `ANNEE`, `MOIS`, **`CODE_INSEE`**, `TYPE_LGT`, `LOG_AUT`, `LOG_COM`,
`SDP_AUT`, `SDP_COM`.
**Porte** — **(c)**, série mensuelle communale sur treize ans.
**Pièges** — `TYPE_LGT` contient une modalité **« Tous Logements » qui est un total** :
sommer toutes les modalités double le résultat. « En date de prise en compte » ≠ date
réelle ; une variante « en date réelle » donne d'autres chiffres. `LOG_AUT` (autorisé)
n'est pas `LOG_COM` (commencé). Les derniers mois sont **provisoires et révisés**.
**Ingestion** — téléchargement complet obligatoire, l'API ne filtre pas.

### 5. Marchés publics (DECP consolidées) — la meilleure donnée d'argent
**Source** — organisation **Colmo**, retraitement d'un mainteneur unique dont le code est
public · **LOv2** · **quotidienne**, 13/09/2026, délai réel ~2 jours
**Couverture IDF** — **102 291 marchés** (`acheteur_departement_code__in=…` +
`acheteur_categorie=Commune` + `donneesActuelles=true`). Test sur une petite commune :
**Thomery (77463, ~3 000 hab.) → 17 marchés**, dont « ESC VL 2 - LOT 5 : MENUISERIE
BOIS », 177 765,89 €, notifié le 23/03/2026. **La couverture descend réellement aux
petites communes.**
**Deux filtres obligatoires sous peine de compter faux** — `donneesActuelles=true`
(sinon un marché modifié trois fois est compté quatre fois) et
`acheteur_categorie=Commune` (sinon on attribue à une commune des marchés d'État :
`acheteur_commune_code` est **l'adresse de l'acheteur**, pas le lieu des travaux).
**Risque** — de gouvernance, pas de qualité : un seul mainteneur privé. Le jeu officiel
équivalent n'existe qu'en JSON mensuels, et sa version enrichie est **[DEPRECIE]**.

### 6. Conseillers municipaux (RNE) — meilleur rapport valeur / coût
**Couverture IDF** — **1 264 maires et 27 431 conseillers municipaux** mesurés.
**Porte** — sans objet : faits de mandat, datés, avec un nom et une fonction légale.

### 7. Intercommunalité (BANATIC) — la clé de voûte de « qui décide »
**Couverture IDF** — **1 266 lignes** (une par commune membre). *À noter : la cible
produit est 1 262 communes et la mesure donne 1 266 ici, 1 288 pour ATMO et 1 264 maires.
Ces écarts ne sont pas expliqués — **le nombre de communes de la bêta mérite d'être
revérifié sur le COG en vigueur**.*
**Deux pièges décisifs** — le département de la commune est **`dep_com`**, pas `dept`
(qui porte le siège de l'EPCI : `75` pour la Métropole du Grand Paris, y compris sur ses
communes du 93). Et **les Établissements publics territoriaux du Grand Paris sont
absents** : `insee=93048` renvoie la Métropole, pas l'EPT Est Ensemble. Or pour un
habitant de la petite couronne, **c'est l'EPT qui exerce les compétences qu'il touche**
(déchets, urbanisme). Afficher « votre intercommunalité = Métropole du Grand Paris »
pour 130 communes est vrai mais trompeur, et doit être dit.

### 8. Quartiers prioritaires 2024 (ANCT) — porte (a)
**Couverture IDF** — **298 couples quartier × commune** : 75=21, 77=25, 78=22, 91=47,
92=19, 93=75, 94=47, 95=42. Un quartier à cheval sur deux communes compte deux fois :
**298 n'est pas un nombre de quartiers.**
**Piège majeur** — `insee_com` est écrit **`="01053"`**, protection Excel. Lu brut, tout
rapprochement avec un code INSEE propre **échoue en silence**. Et `insee_dep` est, lui,
**sans** zéro initial (`1` pour l'Ain) : convention inverse d'autres jeux.

### 9. Annuaire de l'éducation — porte (a) via REP+
**Couverture IDF** — **10 145 établissements** : 75=1 467, 77=1 484, 78=1 418, 91=1 164,
92=1 049, 93=1 384, 94=1 027, 95=1 152. **Quotidien, LOv2.**
**Affichable** — présences et classements réglementaires uniquement : cantine, ULIS,
SEGPA, REP/REP+. Mesuré à Pantin : 46 établissements, 38 avec restauration, **11 en
REP+**. *Ne jamais afficher un nombre d'établissements comme un indicateur* : ce serait
la comparaison interdite. `Code_departement` est sur **3 caractères**.

### 10. Géorisques — porte (a) sur trois volets, et une chronologie locale
**Volets** — risques par commune, **arrêtés CATNAT** (actes juridiques datés au JO),
**classe radon** (1 à 3, réglementaire), **zone de sismicité** (réglementaire).
**Mesuré** — Saint-Denis (93066) : **11 risques, 17 arrêtés CATNAT**. Argenteuil
(95018) : 4 risques.
**Porte** — **(a)** sur les classements et les arrêtés ; **(c)** en prime : l'historique
CATNAT **est** la chronologie de la commune comparée à elle-même. L'exposition déclenche
l'obligation légale d'information acquéreur-locataire.
**Réserve** — **licence non vérifiée**. À établir avant tout affichage.

### 11. Élections agrégées 1999 → 2026 — la porte (c) sur la participation
**Couverture** — 3 162 440 lignes, maille **bureau de vote**, avec code commune.
Mesures IDF : `2026_muni_t1` en Seine-Saint-Denis = **841 bureaux** ; `2024_legi_t1` =
838 ; Paris toutes élections = 37 304 lignes ; Montreuil aux municipales 2020 tour 1 =
57 bureaux.
**Porte** — **(c)** de façon exemplaire : `2020_muni_t1` et `2026_muni_t1` coexistent
dans le même fichier avec la même clé commune.
**Piège** — l'identifiant d'élection est **`2024_legi_t1`**, pas `2024_leg_t1` : un
faux négatif silencieux.
**Complément obligatoire** — le jeu des municipales 2026 second tour ne couvre **que
les 1 526 communes passées au second tour** (dont 20 en Seine-Saint-Denis) ; le premier
tour est dans un autre fichier.

---

## LES COMPLÉMENTS À COÛT MARGINAL

- **Fonds Vert** (MTE, LOv2, 28/07/2026) — **391 projets IDF 2025** sur 5 590 en France,
  `code_commune` INSEE natif, et un `resume_du_projet` **lisible par un habitant sans
  reformulation**. Même patron de connecteur que la DGCL. `code_departement` sur **2**
  caractères, à l'inverse de la DGCL qui en met 3. `montant_engage` est un engagement.
- **Data ES, équipements sportifs** (Sports, LOv2, quotidien) — **10 098 installations
  IDF**, `insee` natif, avec `acces_handi` et `acces_transp_commun`. Inventaire
  descriptif et qualifications ERP seulement : **aucun décompte communal**.
- **Arrêts et lignes IDFM** — **74 294 couples arrêt × ligne**, `Code_insee` natif,
  quotidien. **La granularité est le couple**, pas l'arrêt : dédoublonner sur `stop_id`
  avant tout affichage. **Licence non vérifiée** (champ vide sur data.gouv).
- **Bibliothèques** (1 013 lignes IDF) — **les champs de service uniquement** :
  gratuité, wifi, ouverture le dimanche, adresse. **Tous les indicateurs d'activité sont
  écartés** : 57 266 prêts n'a de sens que contre une autre bibliothèque.
- **Déchèteries SINOE** — adresse, horaires, déchets acceptés. Filtre `ANNEE` obligatoire.
- **Géoportail de l'urbanisme (API Carto IGN)** — `is_rnu` par code INSEE, et la **date
  d'approbation du document** applicable. Vérifié : Pantin est couverte par le PLUi
  d'Est Ensemble, approuvé le 23/02/2026, publié le 13/03/2026. *Piège :
  `partition=DU_93055` renvoie vide — la commune est couverte par un PLUi porté par
  l'EPT. Conclure « pas de document » serait faux.*

---

## LES ÉCARTÉS, ET POURQUOI IL NE FAUT PAS Y REVENIR

| écarté | raison mesurée |
|---|---|
| **délibérations municipales** | `?schema=scdl/deliberations` → **46 jeux France entière = 0,13 % des communes**, aucun producteur francilien. Et la publicité légale des actes se fait en PDF sur le site de chaque commune, sans format commun : **l'obligation existe mais ne produit pas de donnée**. *Et les déclarations de schéma ne sont pas fiables : le premier résultat de `?schema=scdl/budget` est une étude sur les télécommunications.* |
| **budgets primitifs** | 37 jeux au plus. Le budget voté n'existe pas en national ; le budget **exécuté** (DGFiP/OFGL) est complet et ne le remplace pas. |
| **budgets participatifs** | **2 communes IDF** (Paris, Meudon — gelé depuis 2021). ODbL de Paris incompatible avec le reste. |
| **subventions politique de la ville (ANCT)** | **aucun code INSEE dans le schéma du décret 2017-779 lui-même.** Le déduire du siège du bénéficiaire serait deviné : ligne 1 = « LE MOUVEMENT ASSOCIATIF », tête de réseau nationale. Limite du schéma, pas du producteur. |
| **carte des loyers** | aucune porte franchie ; **57,3 % des valeurs IDF sont des prédictions de maille** présentées à la commune ; licence non établie. |
| **RPLS détaillé** | le SRU livre déjà le comptage **avec sa référence légale**, pour zéro effort de volumétrie. |
| **taxe sur les logements vacants** | producteur non institutionnel, périmètre 2022 sur un décret modifié depuis. La bonne source est l'annexe consolidée sur Légifrance. |
| **licences sportives** | un nombre de licenciés n'existe que pour être comparé, et la source mélange des **estimations non distinguées**. |
| **indicateurs d'activité des bibliothèques** | aucune porte. `Amplitude horaire = 16,5 h` appelle « c'est peu ? » sans aucun seuil légal. |
| **gares du Grand Paris Express (SGP)** | `last_update` **19/12/2016**, ZIP, aucun code INSEE, et le producteur **décline lui-même toute valeur juridique**. |
| **grands travaux d'été IDFM** | **CC BY-NC-ND** : aucun dérivé autorisé. Seule licence bloquante du corpus. |
| **gares IDFM par ligne** | **aucune colonne commune** sur 28 ; doublé par « arrêts et lignes ». |
| **permis de Plaine Commune** | 8 communes, ODbL, doublé par Sitadel national. |
| **chantiers CD92** | couverture temporelle arrêtée au **30/03/2026** malgré une fréquence mensuelle déclarée ; rattachement commune non vérifiable (portail interdit). |
| **sénateurs** | **réexaminé comme demandé, décision inchangée** : maille départementale, pas d'élection directe, rattachement impossible sans approximation. |
| **registre des projets soumis à évaluation environnementale** | **interdit par robots.txt**, aucun miroir moissonné. |
| **avis des autorités environnementales IDF (DRIEAT)** | `last_update` 28/04/2021, uniquement Shapefile/WMS/WFS dont deux pointant vers un **intranet**. |
| **« consultations citoyennes »** | producteur = un parti politique, archive de 2018. Hors périmètre et incompatible avec la neutralité. |

## LES DEUX « À CREUSER » QUI VALENT LE DÉTOUR

- **Compétences exercées par l'EPCI.** *« La voirie relève de votre intercommunalité,
  pas de votre mairie »* est probablement **la réponse la plus utile que Repère puisse
  donner à « qui décide chez moi »**, et elle est à **un seul XLSX** de distance. Le
  chemin CSV est un cul-de-sac : les ressources ne portent qu'un compteur (`Nombre de
  compétences exercées` = 3), inaffichable, et `codes-competences.csv` est mal formé
  (112 colonnes fantômes `Unnamed:`). La nomenclature existe : **118 codes**.
- **Taux d'imposition votés (REI, DGFiP).** Le **seul** chiffre budgétaire qui satisfait
  nativement P16 : un taux voté se lit contre le taux voté par **la même commune**
  l'année précédente. 44 millésimes 1982 → 2025, **tous en ZIP**, et le miroir API
  `data.ofgl.fr` est interdit par robots.txt. *Conséquence : l'incertitude déjà notée
  dans `Repere_Plan_Action_Data.md` sur le nom exact du champ INSEE des API OFGL reste
  **non levée**, et devra l'être depuis un poste connecté.*

## CONSULTATIONS PUBLIQUES : LE SEUL TEST QUI MANQUE
**Saisines de la CNDP** (LOv2, `last_update` 04/03/2026, couverture 1995 → 2025) :
colonnes et rattachement **non vérifiés**, limite de session atteinte. Une saisine est un
**acte daté qui déclenche une procédure légale de participation** — porte (a)
potentielle. **La seule question qui reste : ces lignes portent-elles un code INSEE ou
seulement un périmètre de projet ?** À faire en premier au prochain passage.
