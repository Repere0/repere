# REPÈRE — REGISTRE DES DÉCISIONS

Une décision tranchée ne se rouvre pas au fil de l'eau. Chacune porte ce qui l'a décidée — une
mesure quand il y en a une — pour qu'on puisse la **réviser sur preuve**, jamais sur impression.

---

### D-01 · La navigation compte quatre onglets
**Décidé le 13/09/2026.** `Ce qui a été décidé · Qui décide · Où va l'argent · Repère`.
Trois architectures ont été comparées et écartées :
- *deux onglets seulement* — cohérent avec les deux questions fondatrices, mais sans surface
  datée rien ne justifie de rouvrir l'application ;
- *page unique déroulante* — 5,3 hauteurs d'écran mesurées pour deux sujets sans rapport ; le
  défilement n'est pas une navigation ;
- *navigation par échelon* (commune / département / France) — **rejetée fermement** : elle exige
  du citoyen qu'il sache qui fait quoi avant de cliquer, c'est-à-dire exactement ce que le produit
  doit lui éviter.

### D-02 · « Où va l'argent », jamais « Mon argent »
Le possessif promet un compte personnel que la donnée ne tient pas : Repère ne sait rien des
impôts d'un habitant, il sait ce que dépense sa commune.

### D-03 · La surface datée s'appelle « Ce qui a été décidé »
Comparée à *Fil* (mot de réseau social, promet un algorithme), *Près de vous* et *Chez vous*
(sous-entendent une géolocalisation que Repère refuse), *L'actualité* (promet une fraîcheur non
tenable). Le passé composé promet du **vérifiable** plutôt que du frais — c'est la promesse que
le produit peut tenir.

### D-04 · L'onglet « Sources » disparaît, la provenance reste
Un tiers de la navigation permanente pour un écran de doctrine. Il devient une section de
« Repère ». **On retire l'onglet, jamais la preuve attachée à chaque chiffre.**

### D-05 · Le jeu sort de la barre
Un onglet est une promesse sur ce qu'est le produit ; un quiz sur 20 % de la barre dit que Repère
est un jeu civique. Aggravé dans le produit en ligne, où l'onglet du jeu porte le libellé
« Qui décide ? » et les élus « Qui dirige ? ». Le jeu **n'est pas supprimé** — c'est le seul levier
de retour existant : il devient une carte « La question du jour ». Pas « Comprendre » : ce mot
promet que celui qui joue comprend, donc juge celui qui ne joue pas.

### D-06 · L'entrée se fait par le nom de la commune
Trois étapes du parcours sur dix n'existaient que parce que les fichiers sont découpés par
département. Index de 1 262 communes d'Île-de-France : **10 Ko compressés** (271 Ko pour la France
entière — c'est pourquoi la recherche directe est limitée à la bêta).
**L'invariant n'a pas été payé** : l'index sert à déduire deux caractères, et c'est le fichier
départemental habituel qui part au réseau. Le serveur n'apprend jamais quelle commune est lue.

### D-07 · Les résultats de recherche sont ordonnés par pertinence
Taper « paris » proposait Cormeilles-en-Parisis, Fontenay-en-Parisis, puis Paris. L'ordre est
désormais : nom exact, noms commençant par la recherche, reste — alphabétique dans chaque groupe.
**Ce n'est pas un ordre entre territoires** : il ne dépend d'aucune propriété de la commune, ni
taille, ni population.

### D-08 · Les votes séparent les lois des votes de détail
89 % des scrutins publiés sont des amendements ou des motions ; 66 sur 80 portent sur un seul
texte. Le champ `typeVote` de la source isole **8 scrutins solennels**, qui sont exactement les
votes sur l'ensemble d'un texte. Les 72 autres gardent leur intitulé officiel intact, derrière un
dépliant. **Rien n'est retiré — c'est un ordre, pas une censure.**

### D-09 · L'intitulé d'une loi est allégé, jamais réécrit
On retire l'amorce « l'ensemble de la » et la parenthèse de lecture — **qui est réaffichée à côté
de la date**. Aucun mot ajouté, aucune reformulation, et le lien vers le scrutin officiel donne le
texte intégral. « Texte adopté » plutôt qu'« Adoptée » : deviner le genre d'un intitulé officiel
serait une réécriture.

### D-10 · Le Sénat n'entre pas dans « Qui décide »
Un sénateur n'est pas élu par le citoyen, et la maille est le département : le rattachement à une
commune serait une approximation. L'expliquer coûterait plus de mots qu'il n'en rapporte.

### D-11 · Aucune tâche automatique ne commite sur `main`
Un script d'entretien a laissé le dépôt sur `main` ; la tâche horaire s'y est exécutée, a poussé
un commit, et l'avance rapide est devenue impossible. **Fusionner une branche dans `main` est une
décision, et une décision se prend à la main.** `pousser.bat` v7 refuse.

### D-12 · La collecte ne remplace jamais un relevé valide par un fichier vide
Une source absente **avertit**, elle ne casse rien : la chaîne continue avec le relevé de la
veille. Corollaire : l'extraction avertit quand un relevé dépasse sept jours, sans arrêter la
publication — des données officielles d'il y a trois semaines restent publiables **tant que leur
date est affichée**.

### D-13 · Aucune comparaison entre communes, sous aucune forme
Y compris les montants par habitant et les dotations, qui produisent un classement dans la tête
du lecteur même sans tableau. On affiche la valeur brute de la commune consultée.

### D-14 · Pas de délibérations municipales en bêta
Vérifié le 13/09 : **aucune consolidation nationale n'existe.** Un jeu de données par commune et
par séance, sans licence homogène. Promettre cette couverture sur huit départements serait mentir.

### D-15 · La recherche de commune partage la règle de la recherche de département
Deux endroits dérivaient la même règle et avaient divergé : « Évry » donnait zéro résultat.
Une seule fonction désormais, et un contrôle qui échoue si une seconde apparaît.

### D-16 · Les libellés de communes viennent du Code officiel géographique
9 198 communes sur 34 637 s'écrivaient mal. Une règle typographique aurait corrigé les articles
internes, mais **aucune règle ne sait qu'Évry prend un accent et Ermont non** : deviner est
interdit. Source : Etalab / DINUM, appariement 100 %.

### D-17 · Une donnée sociale ne s'affiche qu'avec une référence absolue
**Décidé le 13/09/2026, après l'exploration des données sociales.**
La plupart des données sociales n'ont de sens qu'en comparaison — ce qui semblait fermer le sujet.
Trois sorties honnêtes existent et suffisent : **l'obligation légale** (objectif SRU), **le seuil
réglementaire** (conformité de l'eau, niveau d'hygiène), **la commune comparée à elle-même dans le
temps**. Une donnée qui n'a de sens que face à une autre commune *et* qui n'a pas d'historique
exploitable est écartée, quelle que soit sa qualité.
*Écartés en conséquence : l'indice de position sociale des écoles, l'accessibilité aux médecins,
la délinquance enregistrée en niveau.*

### D-18 · Le logement social entre par l'obligation légale, pas par le taux
Afficher « 14 % de logements sociaux » appelle immédiatement « c'est beaucoup ? » et pousse à
comparer. Afficher « 14 %, là où la loi en impose 25 %, soit 430 logements d'écart » répond à la
question sans sortir de la commune.
**Réserve à écrire dans le produit** : l'inventaire SRU ne couvre que 2 208 communes. Pour une
commune hors champ, on affiche le parc social **sans objectif**, et on le dit.

### D-19 · Les marchés publics attendent que la surface datée vive
Coût réel — table SIRET→INSEE à construire, avenants et cotitulaires à dédupliquer sous peine de
gonfler les montants, dépendance à un acteur privé pour la version exploitable. La valeur ne se
révèle qu'une fois le contenant existant. **Ne pas commencer avant.**

### D-21 · « Ville de Paris » est le seul rattachement nominatif du produit
**Décidé le 14/09/2026.** La source des projets financés publie un code INSEE pour
chaque bénéficiaire — sauf pour la Ville de Paris, qui y figure comme
« collectivité à statut particulier » avec un code vide. Cinq projets, 2,1 millions
d'habitants : les écarter serait un trou visible.

**Et pourtant le SIREN ne suffit pas.** Le SIREN d'une commune se décompose
habituellement en `21 + département + commune` : 219300019 donne bien 93001,
Aubervilliers. Appliqué à Paris, 217500016 donnerait **75001 — le 1ᵉʳ
arrondissement — au lieu de 75056**. La règle qui marche 34 000 fois est fausse
pour la seule commune où l'on aurait été tenté de s'en servir.

Le rattachement est donc **nominatif, pas déduit** : une table d'une ligne, dont
les trois champs (SIREN, type, nom) doivent correspondre exactement, vérifiée à
l'annuaire des entreprises (SIREN 217500016 = VILLE DE PARIS, nature juridique
7229, commune). Toute autre ligne sans code INSEE — les EPCI, les départements,
les régions — est **comptée, annoncée et jetée**.

### D-22 · Un intitulé officiel sans accents reste sans accents, et l'écran le dit
La DGCL publie « Renovation de la halle du Montfort ». Remettre les accents serait
réécrire un intitulé officiel (P15), et personne ne sait si « Realisation » en
portait un, deux ou aucun. Ne rien dire laisserait croire à une faute de Repère.
**On recopie, et on écrit une fois : « les intitulés sont recopiés tels que l'État
les publie, sans correction ».** Un contrôle du banc échoue si quelqu'un corrige.

### D-23 · La surface datée est le premier onglet, pas encore l'onglet d'ouverture
L'ordre de la barre dit ce qui compte : « Ce qui a été décidé » passe devant.
Mais l'application continue de s'ouvrir sur « Qui décide », dont la couverture est
mesurée à 100 % sur les huit départements, tant que **la collecte réelle des
projets n'a jamais tourné** — elle ne le peut pas hors de GitHub Actions, et les
tâches planifiées ne se déclenchent que sur la branche par défaut.
**La condition pour basculer est écrite dans le code** (`App.jsx`) : quand la
collecte aura tourné et que la couverture aura été mesurée sur les 1 262 communes,
`useState("qui")` devient `useState("decide")`. Une ligne, sur preuve.

### D-24 · Une donnée dont la source a disparu ne survit pas au relevé
Trouvé le 14/09 : le relevé des projets retiré, l'extraction a continué — et
`data/projets/` est resté sur le disque, publié, pendant qu'`index.json` ne
déclarait plus aucune source pour lui. Des fichiers valides, mais orphelins :
exactement ce que l'invariant 4 existe pour empêcher, et invisible.
**Ce qui n'a plus de source est effacé, et l'effacement est annoncé.**

### D-20 · Les promesses impossibles sont écrites, pour ne plus être refaites
Le délai d'attente d'un logement social, les tarifs de cantine, les places de crèche disponibles,
le taux de chômage communal, les médecins acceptant de nouveaux patients : **ces données n'existent
pas en open data**. Elles sont listées dans `DATA_CATALOG.md` § 5. Aucune feuille de route ne doit
les supposer.
