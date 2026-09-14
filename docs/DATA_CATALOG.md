# REPÈRE — CATALOGUE DES DONNÉES
**Mis à jour le 13 septembre 2026, après deux explorations : l'argent public et la vie sociale.**
Toute source ajoutée porte les douze champs du gabarit. Un champ non vérifié s'écrit
« non vérifié » — jamais une estimation.

---

## 0. LA DÉCOUVERTE QUI COMMANDE CE CATALOGUE

Repère s'interdit toute comparaison entre territoires. Or **la plupart des données sociales n'ont
de sens qu'en comparaison** : « 18 % de pauvreté », « 3,2 d'accessibilité aux médecins »,
« IPS 104,7 » ne veulent rien dire seuls. Cette contradiction semblait fermer le sujet social.

**Elle ne le ferme pas. Il existe trois sorties honnêtes, et elles suffisent :**

1. **La référence absolue fixée par la loi.** L'inventaire SRU impose 20 % ou 25 % de logements
   sociaux selon la commune. Dire *« votre commune en compte 14 % ; la loi lui en impose 25 % ;
   l'écart est de 430 logements »* ne classe personne : cela confronte un élu à une règle
   publique, pas à ses voisins. **C'est exactement le registre de Repère.**
2. **Le seuil réglementaire.** La conformité de l'eau du robinet, le niveau d'hygiène d'un
   contrôle sanitaire, le zonage sismique sont des normes absolues.
3. **La commune comparée à elle-même dans le temps.** L'invariant interdit de hiérarchiser des
   territoires, pas de montrer une évolution. *« Trois boulangeries en 2025, cinq en 2015 »* est
   un fait local complet.

**Corollaire, appliqué dans tout ce catalogue** : une donnée qui n'a de sens que comparée à une
autre commune **et** qui n'a pas d'historique exploitable est écartée, quelle que soit sa qualité.
C'est ce qui élimine l'IPS des écoles et l'accessibilité aux médecins — deux excellentes données
de recherche, inutilisables ici.

---

## 1. DÉJÀ SERVIES PAR LE PRODUIT

| donnée | producteur | licence | relevé le | clé |
|---|---|---|---|---|
| maire et adjoints | Ministère de l'Intérieur (RNE) | ODbL 1.0 | 11 août 2026 | code INSEE |
| commune → circonscription | Ministère de l'Intérieur | Licence Ouverte | découpage 2010 | code INSEE |
| députés en exercice | Assemblée nationale (AMO30) | Licence Ouverte 2.0 | quotidien | dep-circo |
| scrutins et positions | Assemblée nationale | Licence Ouverte 2.0 | quotidien | acteurRef |
| comptes communaux | OFGL | Licence Ouverte 2.0 | 29 juillet 2026 | code INSEE |
| libellés officiels de communes | Etalab / DINUM (COG) | Licence Ouverte 2.0 | quotidien | code INSEE |

Couverture Île-de-France mesurée : maire 100 %, circonscription 100 %, député 100 %,
position de vote 99,6 %, comptes 100 %, sur 1 262 communes.

---

## 2. RETENUES POUR DÉCEMBRE — trois, pas plus

### 2.1 ★ Projets financés par les dotations d'investissement de l'État

| champ | valeur |
|---|---|
| producteur | DGCL |
| licence | **Licence Ouverte 2.0** *(vérifié)* |
| url | https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-de-soutien-a-linvestissement-des-collectivites-territoriales |
| format | 8 CSV annuels (2018→2025), 3,1 à 5,3 Mo |
| fréquence | annuelle · dernière mise à jour **24 juillet 2026** *(vérifié)* |
| clé | **`beneficiaire_code_insee`** *(vérifié)* |
| date | `exercice` — **année seule, pas de jour** |
| colonnes | exercice, dispositif, programme, beneficiaire_type, beneficiaire_siren, beneficiaire_dep, beneficiaire_nom, beneficiaire_code_insee, **intitule**, **cout_ht**, **subvention**, taux |
| volume | **16 799 lignes pour 2025** *(vérifié le 14/09/2026)* |
| dispositifs | **DETR · DSIL · DPV · DSID** — quatre, pas deux |
| affichable seul ? | **oui** — un projet nommé et chiffré se suffit |
| valeur citoyenne | « En 2025, l'État a engagé 533 466 € pour la rénovation de la halle du Montfort, sur un chantier de 1 333 667 € hors taxes. » |
| coût | **faible** |
| état | ✅ **collecté par `outils/projets_etat.py`, affiché par « Ce qui a été décidé »** (14/09/2026) |

**Ce que la lecture des vraies lignes a appris, et qu'aucune fiche ne disait :**

- `beneficiaire_dep` est écrit **sur trois caractères, zéro en tête** : filtrer sur
  « 93 » ne renvoie rien, il faut « 093 ».
- la colonne est `cout_ht`, pas `cou_ht` comme l'annonce la description du jeu.
- **`beneficiaire_code_insee` est vide pour la Ville de Paris**, qui y figure comme
  « collectivité à statut particulier ». Cinq projets, 2,1 millions d'habitants.
  Et le SIREN ne sauve pas : `21 + dép + commune` donne 75001 — le 1ᵉʳ
  arrondissement — au lieu de 75056. Voir la décision D-21.
- **les intitulés arrivent sans accents** (« Renovation », « accessibilite ») alors
  que les noms de bénéficiaires en portent. On recopie, on ne corrige pas (D-22).
- les projets portés par un EPCI, un département ou une région n'ont pas de commune :
  ils sont comptés, annoncés et jetés — jamais rattachés au siège administratif.

| piège | **jamais de montant par habitant, jamais de total par commune** : les deux se lisent contre la commune d'à côté |

### 2.2 ★ Logement social — RPLS communal + inventaire SRU

| champ | valeur |
|---|---|
| producteurs | SDES (RPLS) · ministère de la Transition écologique (SRU) |
| licence | SRU : **Licence Ouverte 2.0** *(vérifié)* · RPLS fichiers communaux : **non vérifiée** (les données détaillées sur data.gouv.fr sont en Licence Ouverte) |
| url | https://www.data.gouv.fr/datasets/communes-et-inventaire-sru · https://www.statistiques.developpement-durable.gouv.fr/repertoire-des-logements-locatifs-des-bailleurs-sociaux-rpls |
| fréquence | annuelle · SRU mis à jour le **11 août 2026** (données au 1ᵉʳ janvier 2025) · RPLS le **20 janvier 2026** |
| couverture | RPLS : toutes communes · **SRU : 2 208 communes seulement** — beaucoup de petites communes du 77, 78, 91 et 95 sont hors champ |
| historique | RPLS depuis **2011** ; série à reconstituer millésime par millésime |
| affichable seul ? | **oui, et c'est le cas d'école** — l'objectif SRU est une référence absolue fixée par la loi |
| valeur citoyenne | « Votre commune compte 14 % de logements sociaux ; la loi lui en impose 25 %. » Plus : loyer moyen au m², taux de vacance, taux de mobilité. |
| coût | moyen (ZIP de 20 Mo à filtrer sur huit départements) |
| à écrire dans le produit | pour une commune hors champ SRU, afficher le RPLS **sans objectif**, et le dire |

### 2.3 ★ Équipements du quotidien — Base permanente des équipements (INSEE)

| champ | valeur |
|---|---|
| producteur | INSEE |
| licence | **non vérifiée** sur la page INSEE — à lever avant intégration |
| url | https://www.insee.fr/fr/statistiques/8217537 |
| fréquence | annuelle · millésime 2025 publié le **9 juillet 2026** |
| maille | commune *(ne jamais utiliser la maille IRIS : elle ne se ramène pas à la commune)* |
| historique | **l'INSEE publie déjà les points 2015 / 2020 / 2025** — la série est prête à l'emploi |
| affichable seul ? | **oui, sans réserve** — c'est un dénombrement |
| valeur citoyenne | « Votre commune compte 3 boulangeries, 1 pharmacie, 2 médecins, 1 école, 1 gymnase. En 2015 il y avait 5 boulangeries. » |
| coût | moyen à l'ingestion, **très faible à l'affichage** |

**Quasi gratuit à faire en même temps** : les **élections municipales des 15 et 22 mars 2026**
(ministère de l'Intérieur, Licence Ouverte 2.0, participation et sièges par commune, **date réelle
d'événement**) et **Banatic** pour la table commune → intercommunalité.
*Réserve Banatic : les fichiers datent de février–mars 2025 alors que les périmètres bougent au
1ᵉʳ janvier.*

---

## 3. PLUS TARD — par ordre de promotion

| source | ce qui la retient |
|---|---|
| **API Géorisques** (BRGM) | quasi gratuite, requêtable **par code INSEE**, arrêtés de catastrophe naturelle **datés**, auto-portante. Ne manque que la fréquence de mise à jour, non divulguée. **Première de la liste.** |
| **Alim'confiance** — contrôles sanitaires | flux **d'événements datés**, mis à jour en continu (12 septembre 2026), note absolue. Retenue par un arbitrage juridique : un établissement à nom propre peut être une donnée personnelle. |
| **Effectifs d'élèves par école** (DEPP) | série annuelle, sujet de mobilisation local majeur. Suppose de créer un objet « école ». Effectifs sous 5 supprimés. |
| **Marchés publics (DECP)** | la version exploitable est tenue par un **acteur privé** ; table SIRET→INSEE à construire ; un marché s'étale sur plusieurs lignes — tout comptage naïf **gonfle les montants**. |
| **Qualité de l'eau du robinet** | très forte valeur, mais 12 millions d'analyses/an et **une UDI peut couvrir plusieurs communes** : l'approximation devrait être affichée. Évaluer d'abord l'API Hub'Eau. |
| **Indice ATMO quotidien** | auto-portant, par commune — mais **365 jours d'historique seulement**. Promettre une série imposerait d'archiver soi-même. |
| **Inscrits à France Travail** (Dares) | **10 ans embarqués dans un seul CSV**, rare et précieux. Mais arrondi au multiple de 5 et aucun dénominateur. |
| **Filosofi — taux de pauvreté uniquement** | honnête seul si l'on énonce le seuil national en euros. **Le revenu médian est à écarter de l'affichage.** Rupture Filosofi 2 : pas de série avant plusieurs millésimes. |
| **Autorisations d'urbanisme (Sitadel)** | mensuelle, datée. Bloquée sur un point : le champ commune et l'absence de nom de pétitionnaire sont **non vérifiés**. ⚠️ l'ancien jeu, premier dans les moteurs, est **archivé depuis août 2025**. |
| **Enquêtes publiques** (projets-environnement) | **la seule source à date future.** Licence et fréquence non vérifiées. |
| **Petite enfance** (CNAF) | lisible seule, mais **communes de plus de 10 000 habitants uniquement** : couverture francilienne trouée. |
| **Fréquentation des gares** (SNCF) | série 2015→2024 par gare, code INSEE fourni. **En Île-de-France le trafic est extrapolé** et l'historique révisé rétroactivement. |

---

## 4. ÉCARTÉES, ET POURQUOI

| source | motif |
|---|---|
| **IPS des écoles, collèges, lycées** | **indice relatif par construction** : sa seule lecture est le positionnement face aux autres. Rupture en 2022, biais du privé en 2023, jeu des écoles plus mis à jour. Incompatible, sans recours. |
| **Accessibilité aux médecins (APL)** | l'unité n'a **aucun repère intuitif** ; la seule échelle disponible est la distribution des autres communes. Rupture méthodologique 2022-2023. À rouvrir **si** la DREES publie un seuil officiel de sous-densité — il jouerait alors le rôle de l'objectif SRU. |
| **Délinquance enregistrée** | « 143 vols » ne dit rien : ni la taille, ni le passage, ni le taux de plainte. **C'est la donnée qui fait le plus dériver vers le classement.** Envisageable un jour en évolution propre 2016-2025, avec un avertissement sur ce qu'elle mesure vraiment. |
| **Délibérations de conseils municipaux** | **aucune consolidation nationale n'existe.** Un jeu par commune et par séance. |
| **Subventions aux associations (SCDL)** | le jeu « national » ne couvre en réalité qu'une commune, arrêté en décembre 2022. |
| **Demandes de logement social en attente (SNE)** | **aucun jeu open data national à maille communale trouvé.** Ce serait pourtant la donnée logement la plus attendue. |
| **Bruit (Bruitparif)** | statistiques communales 2022 et 2024 existantes, **aucune licence formelle publiée**. Repère s'impose d'afficher une licence : condition non remplie. |
| **API Airparif** | ODbL, mais **clé délivrée sur demande** : ce n'est pas de l'open data consommable, et cela crée une dépendance. Le jeu Atmo France national couvre le même besoin. |
| **Espaces verts IDF** | **territoires manquants signalés par le producteur**, licence non indiquée. Publier une couverture incomplète ferait dire des choses fausses. |
| **DGF sur data.gouv.fr** | producteur : un particulier, **dernière mise à jour septembre 2019**. |
| **Sénat** | élus **par département** : aucun rattachement commune sans approximation. |
| **Chantiers et travaux de Paris** | excellents et datés, mais **une commune sur 1 262**. Asymétrie intenable. |
| **Base du dossier complet (INSEE)** | 307 Mo, 700 indicateurs, millésimes mélangés. **À utiliser comme réservoir de dénominateurs**, jamais comme contenu affiché. |
| **Toute donnée à maille IRIS, UDI ou arrêt** | ne se ramène pas à la commune sans approximation. |

---

## 5. CE QUI N'EXISTE PAS — et qu'il faut cesser d'espérer

Vérifié absent ou introuvable au cours des deux explorations. **Ce sont les promesses à ne jamais
faire.**

1. **Le délai d'attente réel pour un logement social.** Probablement la question numéro un en
   Île-de-France. Le SNE la détient ; aucune diffusion nationale à maille communale.
2. **Les tarifs des services municipaux** — cantine, périscolaire, crèche, conservatoire, quotient
   familial. Des dépenses mensuelles concrètes, décidées par le conseil municipal, **sans aucun
   référentiel national ouvert**. *C'est le plus gros angle mort de l'open data communal français,
   et le plus proche de la mission de Repère.*
3. **Les places disponibles en crèche, maintenant.** Le taux CNAF est une capacité théorique de
   décembre, sans les places vacantes.
4. **Un taux de chômage communal officiel.** L'INSEE s'arrête à la zone d'emploi.
5. **Les médecins acceptant de nouveaux patients.** L'information la plus utile, et la plus absente.
6. **Les résultats scolaires des écoles primaires.** Existent pour collèges et lycées, pas pour
   les écoles — là où se joue le choix résidentiel des familles.
7. **La carte scolaire** : quelle école pour quelle adresse.
8. **Les délibérations municipales exploitables.**
9. **Les loyers réels du parc privé** à la commune.
10. **L'accessibilité handicap** des équipements publics, agrégée.
11. **Une série longue et cohérente sur les revenus** : la rupture Filosofi 2 rend la stratégie
    « la commune comparée à elle-même » inopérante sur le sujet social le plus important.
12. **Un historique long de la qualité de l'air** : 365 jours glissants seulement.

---

## 6. AVERTISSEMENTS TECHNIQUES

- **Mailles qui ne se ramènent pas à la commune** : IRIS, **UDI** (une unité de distribution d'eau
  peut couvrir plusieurs communes), **arrêt de transport** (une gare dessert plusieurs communes),
  EPCI.
- **Arrondis et seuils qui faussent les petites communes** : multiple de 5 pour les inscrits
  France Travail et les allocataires CAF ; effectifs scolaires sous 5 supprimés ; délinquance
  diffusée au-delà de 5 faits sur 3 ans ; petite enfance limitée aux communes de plus de
  10 000 habitants.
- **Ruptures méthodologiques à ne jamais franchir en série** : Filosofi 2 en 2023, IPS en 2022 et
  2023, APL en 2022-2023, méthodologie SNCF révisée rétroactivement.
- **Licences à confirmer avant publication** : RPLS communal, BPE, Cafdata, Bruitparif, IDFM,
  Institut Paris Region. Repère affichant la licence, c'est bloquant.
- **data.gouv.fr, insee.fr et ofgl.fr sont injoignables depuis le conteneur de développement.**
  Toute collecte passe par GitHub Actions ; toute mesure de couverture faite « de tête » ici
  serait une supposition.
