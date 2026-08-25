## VERDICT : EXPLOITABLE SOUS CONDITIONS

Exploitable sur le fond (la donnée existe, est ouverte, quotidienne, et contient bien « qui a eu quel marché, pour combien, quand »). **Non exploitable en l'état** sans deux travaux amont : un rattachement SIRET→INSEE construit à la main dans le pipeline, et une doctrine du vide qui dise la vérité sur le seuil de 40 000 €. Sans ce second point, l'application mentirait à la majorité des communes.

**Limite de méthode, dite d'emblée** : l'égress de cette session est bloqué par la politique réseau vers `data.gouv.fr`, `static.data.gouv.fr` et `decp.info` (403 au CONNECT, confirmé par `/__agentproxy/status`). Je n'ai donc **pas pu télécharger ni mesurer un seul fichier**. Tous les poids ci-dessous viennent des métadonnées de l'API data.gouv.fr, pas d'un `wc -c`. Toute proportion de rattachement est **non mesurée** et écrite comme telle.

---

### 1. Où, licence, fréquence, poids

Deux sources candidates, à ne pas confondre.

**a) Source officielle — DAJ / Ministères économiques et financiers**
`https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides`
- Licence : **FR-LO** (Licence Ouverte). Fréquence déclarée : **quotidienne**. Dernière mise à jour vue : **24 août 2026**.
- Format : **JSON**, 40 ressources (un fichier par année, un par mois, plus un global).
- Poids réels (octets, métadonnées API) : `decp-global.json` **1 017 309 694** (1,0 Go) ; `decp-2026.json` **525 904 085** ; `decp-2025.json` **699 235 483** ; `decp-2024.json` **540 204 813** ; mois courant `decp-2026-08.json` **121 003 581**. Reliquats historiques : `decp.xml` 646 Mo et `decp.ocds.json` 1,04 Go, figés depuis **février 2023** — morts, ne pas les utiliser.
- Le badge qualité data.gouv.fr signale « fréquence de mise à jour non respectée » : les fichiers mensuels ne sont pas tous fraîchement régénérés (ex. `decp-2025-09.json` daté du 19 juin 2026).
- **Aucun découpage par département ni par acheteur.** Le découpage par département exigé par le banc devrait être produit par `outils/pipeline.sh` à partir du global.

**b) Source retraitée — Colmo / Colin Maudry (decp.info)**
`https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire`
- `decp.csv` **2,5 Go**, `decp.parquet` **244 Mo**, plus `schema.json`, `statistiques-marches.json`, `statistiques-sources.csv`. Mise à jour **quotidienne** (25 août 2026 vu), pipeline ouvert : `https://github.com/ColinMaudry/decp-processing`.
- Se dit « plus exhaustif que les données du Ministère » car exploitant plus de sources ; déduplication par `uid` (SIRET acheteur + identifiant interne) ; **enrichissement via l'API SIRENE**.
- **Conflit de licence non résolu** : la fiche HTML annonce « Licence Ouverte 2.0 », le champ licence de l'API renvoie **ODbL v2**. ODbL imposerait le partage à l'identique des données dérivées — incompatible avec la sérénité juridique d'un fichier embarqué. **À trancher avec le producteur avant tout usage.** Tant que ce n'est pas tranché, prendre la source (a).

Le format Parquet (244 Mo) est le seul plan de traitement raisonnable côté pipeline ; 1 Go de JSON en une passe demande un parseur en flux.

### 2. Schéma

Format de référence **2.0.3**, en vigueur depuis le 1er janvier 2024 (arrêté du 22 décembre 2022 modifié par celui du 22 décembre 2023) : `https://github.com/139bercy/format-commande-publique`. Champs utiles :

| Besoin | Champ |
|---|---|
| acheteur | `acheteur.id` (**SIRET, 14 caractères**), `acheteur.nom` |
| titulaire | `titulaire.id`, `titulaire.typeIdentifiant` (SIRET, TVA, TAHITI, RIDET, FRWF, IREP, HORS-UE), `titulaire.denominationSociale` |
| objet | `objet` (≤ 1 000 caractères) |
| montant | `montant` (HT, forfaitaire ou **maximum estimé**), `dureeMois` |
| dates | `dateNotification`, `datePublicationDonnees` |
| lieu | `lieuExecution.code`, `lieuExecution.typeCode` (postal / commune / arrondissement / canton / département / région / pays), `lieuExecution.nom` |
| divers | `id`, `uid`, `nature`, `codeCPV`, `procedure`, `objetModification` |

Invariant 4 (chaque chiffre porte sa source et sa date) : servi nativement par `dateNotification` + `datePublicationDonnees`.

**Piège de forme** : un marché produit **plusieurs lignes** (co-titulaires, `modification_id`). Sommer naïvement les `montant` double compte. Et `montant` est souvent le **maximum d'un accord-cadre**, pas la dépense réelle — écrire « montant maximum notifié », jamais « dépensé ».

### 3. LE POINT DÉCISIF — rattachement à un code INSEE

**Réponse nette : il n'y a aucun code INSEE de commune dans les DECP.** L'acheteur est identifié par son **SIRET** et rien d'autre.

- Le rattachement passe obligatoirement par une jointure **SIRET → SIRENE → `codeCommuneEtablissement`**. C'est faisable hors ligne (base SIRENE ouverte), c'est ce que faisait le jeu Bercy `decp_augmente` (abandonné le 16 novembre 2023) et ce que fait le pipeline Colmo via l'API SIRENE.
- **N'utilisez jamais `lieuExecution.code` pour rattacher** : son `typeCode` est le plus souvent **code postal**, qui n'est pas bijectif avec le code INSEE (une commune peut avoir plusieurs codes postaux, un code postal couvre plusieurs communes). Et le lieu d'exécution n'est pas la commune décideuse.

Pièges de fond, tous réels :
- **L'acheteur n'est presque jamais « la commune » seule.** Catégories juridiques INSEE distinctes, SIREN distincts : **7210** Commune, **7361** CCAS, **7362** Caisse des écoles, **7378** Régie à caractère administratif, **7353** SIVU, **7354** Syndicat mixte communal, **7343/7346/7348** CU / CC / CA (`https://xml.insee.fr/schema/cj-enum.html`). Le SIRET du CCAS ne « remonte » pas à la commune : il faut décider explicitement si l'on affiche le CCAS sous la commune (recommandé, avec mention) et l'EPCI **à part** (l'EPCI n'est pas la commune ; l'y agréger violerait la sincérité).
- **Groupements de commandes** : le schéma le dit — `acheteur.id` porte « le SIRET du **mandataire** ». Un marché passé pour 30 communes est imputé à une seule. Non détectable, non corrigeable.
- **Centrales d'achat** (UGAP, centrales régionales) : l'achat de la commune y est invisible.
- **Établissement vs siège** : le SIRET est un établissement ; pour une grande collectivité, l'établissement acheteur peut être localisé ailleurs que la mairie. Marginal pour les communes, réel pour les métropoles, Paris/Lyon/Marseille.
- **SIRET absents, tronqués (SIREN à 9 chiffres) ou invalides** dans les dépôts d'acheteurs : documenté comme motif d'existence du pipeline Colmo, **mais je n'ai trouvé aucune mesure publiée du taux**, et je n'ai pas pu le mesurer.

**Proportion rattachable : NON MESURÉE.** C'est le premier travail à faire, et il est simple : sur `decp.parquet`, calculer (i) % de lignes avec `acheteur.id` de 14 chiffres valides (clé de Luhn), (ii) % joignables à SIRENE, (iii) répartition par catégorie juridique. Tant que ces trois chiffres n'existent pas, la fonctionnalité ne doit pas être promise.

### 4. Seuils — et c'est ici que la doctrine du vide se joue

Fiche technique DAJ (`https://www.economie.gouv.fr/files/files/directions_services/daj/marches_publics/dematerialisation/FT_publication_donnees_essentielles_commande_publique.pdf`) :

- **≥ 40 000 € HT** : publication obligatoire des données essentielles sur data.gouv.fr, **dans les 2 mois** de la notification.
- **25 000 – 40 000 € HT** : l'acheteur **peut choisir** de ne publier, au premier trimestre de l'année suivante, qu'une **liste sur le support de son choix** (objet, montant, date, titulaire, code postal). **Cette liste n'entre pas dans les DECP.** Invisible pour nous.
- **< 25 000 € HT** : rien.
- Exclusions supplémentaires : ordre public, secret de la défense nationale, sûreté de l'État, sécurité des systèmes d'information, **secret des affaires**, données personnelles.

Conséquence chiffrée : le recensement OECP 2024 compte **223 383 contrats** au total, dont **159 435 pour l'ensemble des collectivités territoriales** (régions, départements, EPCI, communes, CCAS confondus), pour 100,7 Md€ — à comparer aux **34 875 communes**. La très grande majorité des communes a **zéro marché ≥ 40 000 €** une année donnée. Le vide sera le cas **normal**, pas l'exception.

Donc la phrase du vide ne peut pas être « aucun marché ». Elle doit être, littéralement : « **Aucun marché d'au moins 40 000 € HT publié pour cette commune sur la période. Les marchés inférieurs à ce seuil ne sont pas publiés au niveau national ; ceux de 25 000 à 40 000 € peuvent figurer sur une liste annuelle publiée par la mairie elle-même.** » plus le lien vers la fiche DAJ. Trois vides distincts à ne pas confondre : *rien publié*, *acheteur non rattachable à l'INSEE*, *publication en retard (délai de 2 mois)*.

### 5. Risque juridique et de réputation à nommer les titulaires

Faible en droit, réel en réputation.

- **En droit** : ce sont des données dont la publication est **obligatoire**, sous Licence Ouverte, précisément destinées à la réutilisation. Nommer le titulaire est le cœur de la donnée. Pas de risque en soi.
- **RGPD** : quand le titulaire est un **entrepreneur individuel**, `denominationSociale` est un **nom de personne physique** — donnée à caractère personnel. La CNIL a publié des recommandations pour les réutilisateurs de données ouvertes (`https://www.cnil.fr/fr/recommandations-reutilisateurs-donnees-internet`). Conséquences concrètes : pas d'indexation par nom de personne, pas de moteur de recherche « tous les marchés de M. X », et un canal de rectification.
- **Erreur de source imputée à un tiers nommé** : le montant est souvent un maximum d'accord-cadre, et les doublons sont fréquents. Afficher « l'entreprise Y a reçu 800 000 € » alors que c'est un plafond jamais atteint est diffamatoire par imprécision. Formuler « montant maximum notifié », avec la date et le lien vers la ligne source.
- **Invariants du projet** : l'invariant 3 interdit tout classement. Donc **jamais** de « top 10 des entreprises », jamais de tri décroissant par montant, jamais de « part de marché » d'une entreprise. Une liste chronologique de marchés, oui. Un palmarès, non — et c'est exactement la pente naturelle de cette donnée, il faut la refuser explicitement dans la conception.

### Conditions à remplir avant d'engager le développement

1. Mesurer les trois taux du point 3 sur `decp.parquet` ; abandonner si le taux de rattachement communal fiable est bas.
2. Trancher la licence de la source Colmo, ou s'en tenir à la source DAJ sous FR-LO.
3. Découper par département dans le pipeline (jamais de requête réseau portant un code commune).
4. Dédupliquer par `uid` + `modification_id` avant tout affichage de montant.
5. Traiter CCAS/caisse des écoles sous la commune avec mention explicite, EPCI dans un bloc séparé.
6. Écrire les trois phrases de vide distinctes avant d'écrire l'affichage plein.

Sources : [DECP fichiers consolidés (DAJ)](https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides) · [DECP consolidées format tabulaire (Colmo)](https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire) · [format-commande-publique (139bercy)](https://github.com/139bercy/format-commande-publique) · [decp-table-schema](https://github.com/ColinMaudry/decp-table-schema) · [decp-processing](https://github.com/ColinMaudry/decp-processing) · [Fiche technique DAJ – publication des données essentielles](https://www.economie.gouv.fr/files/files/directions_services/daj/marches_publics/dematerialisation/FT_publication_donnees_essentielles_commande_publique.pdf) · [Arrêté du 22 décembre 2022 (Légifrance)](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000046850496) · [Guide data.gouv.fr – publier les DECP](https://guides.data.gouv.fr/donnees-specifiques/donnees-de-la-commande-publique/publier-les-donnees-essentielles-des-marches-publics) · [Recensement OECP 2024 (Weka)](https://www.weka.fr/actualite/commande-publique/article/recensement-des-marches-publics-les-resultats-2024-sont-connus-212163/) · [Recensement OECP 2024 (Acteurs publics)](https://acteurspublics.fr/articles/commande-publique-les-marches-recenses-bondissent-a-233-milliards-deuros-en-2024-la-commande-publique-franchit-la-barre-des-230-milliards-deuros-grace-a-une-meilleure-collecte-des-donnees/) · [Catégories juridiques INSEE](https://xml.insee.fr/schema/cj-enum.html) · [CNIL – recommandations aux réutilisateurs](https://www.cnil.fr/fr/recommandations-reutilisateurs-donnees-internet)