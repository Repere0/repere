# Blocages — session du 30/10/2026 (sprint V7)

Ce qui n'a pas été fait, pourquoi, et la décision attendue. Rien ici n'a été contourné et rien n'a été inventé.

## 0. Décisions du CEO appliquées (D1 à D9)

| Décision | Statut | Où |
|---|---|---|
| D1 Photos : pas de photo AN, avatars à initiales | ✅ appliquée | `src/ui/avatar.tsx`, section 2 |
| D2 Contact : placeholder documenté, boutons conditionnels | ⚠️ code fait, adresse réelle manquante | section 3 |
| D3 AMO30 : pas de téléchargement, procédure manuelle | ✅ procédure écrite, fichier absent | section 1 |
| D4 « Cette semaine » : fichier vide, structure documentée | ⚠️ fichier créé, non commité, carte non faite | section 4 |
| D5 Carte de partage sombre | ✅ appliquée (inverse la règle « cartes claires ») | section 8 |
| D6 Identifiant `com.repere.app` : placeholder documenté | ✅ documenté, non écrit dans `app.json` | section 6 |
| D7 iPad hors bêta ; catégorie « Actualités » | ⚠️ catégorie faite ; iPad à trancher | section 7 |
| D8 U+2019 remplacé par `’` | ✅ appliquée | `conformite.test.mjs` |
| D9 Logo vectoriel en React Native | ✅ appliquée ; icône PNG à faire | `src/ui/logo.tsx`, section 5 |

## 1. Groupes politiques des élus (AMO30) — téléchargement manuel (D3)

**Ce qui existe déjà** : aucun fichier `data/deputes-groupes.json`, aucun `AMO30` dans le dépôt. `data/deputes.json` ne porte pas le groupe. L'application affiche « Inconnu » (`src/lib/groupes.ts`, `groupeDe()` renvoie toujours « Inconnu » : raccourci documenté).

**Procédure exacte, à faire par le porteur sur sa machine** (le téléchargement depuis cette session est bloqué) :

1. Ouvrir dans un navigateur :
   `https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`
   (URL lue dans `outils/collecte.py`, ligne 59.)
2. Enregistrer le fichier `.zip`, puis l'extraire dans un dossier vide.
3. Placer le dossier extrait à la racine du dépôt, de sorte que les fichiers acteurs soient dans `data/brut_AMO30/json/acteur/`. C'est le chemin lu par `outils/construire_deputes.py` et `outils/pipeline.sh`.
4. Ne rien écrire à la main : la table des groupes ne doit pas venir de la mémoire. Un groupe qu'on ne peut pas citer à sa source est une donnée inventée.

**Ce qui manque ensuite (tâche de code, non faite)** : aucun script n'extrait aujourd'hui le champ groupe vers `data/deputes-groupes.json`. Format visé : `{ "PA123": { "groupe": "<libellé tel que publié>", "nom": "..." } }`. Quand ce fichier existe, `groupeDe()` doit le lire. Tant qu'il n'existe pas, le badge reste « Inconnu » (couleur `#6B7280`).

**Vérification impossible ici** : le badge n'a pas été regardé avec un vrai groupe, puisqu'aucun n'est connu.

## 2. Photos des élus — décision D1 (appliquée)

- Aucune photo n'est chargée. Aucune requête vers `assemblee-nationale.fr`.
- Raison : une requête depuis le téléphone révèle l'adresse IP du lecteur à un tiers. Cela contredit la promesse de confidentialité (`docs/privacy-policy.md`).
- Remplacement : avatar à initiales (`src/ui/avatar.tsx`), bordure calculée à partir de la couleur du groupe.
- Écart avec le brief : les initiales ne sont pas toujours blanches. Elles prennent la couleur qui se lit sur le fond (`texteSur`). Sur une couleur de groupe claire, le blanc serait illisible.
- Avatar avec dégradé : non fait. Il demanderait une dépendance (`expo-linear-gradient`) pour quelques lignes.

## 3. Contact — décision D2 (code fait, adresse à fournir)

- Placeholder : `contact@repere-app.fr`. Il est **à remplacer avant distribution**. Cette adresse n'a pas été vérifiée : rien ne prouve qu'elle existe ni qu'elle appartient au projet. Elle n'est écrite dans aucun fichier de l'application.
- Code : `src/app/a-propos.tsx` lit `process.env.EXPO_PUBLIC_CONTACT_EMAIL`. Si elle est définie, les boutons « Signaler un bug » et « Donner mon avis » (mailto) apparaissent. Sinon : « Contact : bientôt disponible dans la bêta. » en gris.
- **À faire** : fournir la vraie adresse de réception, puis la définir au moment du build. Où la définir dans le profil de build n'a pas été vérifié (aucun profil EAS n'a encore été lancé).
- Décision ouverte : qui lit les messages reçus (boîte réelle, personne désignée).

## 4. Carte « Cette semaine » — D4 (fichier vide, carte non faite)

- `mono/data/cette-semaine.json` est créé, vide, avec la structure du brief (`semaine`, `date_publication`, `communes: {}`). Structure documentée dans `docs/cette-semaine.md`.
- **Non commité** : `mono/.gitignore` exclut `data/`. De plus, `.github/workflows/collecte.yml` indique qu'un nouvel artefact de `data/` s'ajoute par une PR relue, et qu'un fait n'est publié que par un humain. Le fichier reste donc sur le disque. Décision à prendre : l'ajouter par PR, ou le laisser local.
- Melun : aucun événement de Melun dans `data/evenements.json` (8 enregistrements, tous nationaux, le plus récent du 14/08/2026). Le fichier reste vide, comme prévu par D4.
- **Spécification incomplète** : le brief s'arrête à la structure JSON. Les étapes b et suivantes manquent. Aucune carte n'est faite.
- Décision attendue : envoyer la suite du brief (ce que contient chaque semaine, qui l'écrit, à quelle source il renvoie).

## 5. Icône de l'application et logo — décision D9 (icône à faire par le CEO)

- Le logo est un composant : `src/ui/logo.tsx`. Documentation : `docs/ux/logo.md`.
- **À faire par le CEO** : exporter le logo en PNG 1024 × 1024 (fond et proportions à choisir) et remplacer `assets/icon.png`. Un composant React ne produit pas de fichier binaire. L'icône actuelle est inchangée.
- Tailles : 48 px (en-tête) vu dans un navigateur, en mode sombre. Les tailles 24 px, 34 px (cartes), 96 px (À propos) et 128 px ne sont pas regardées : à vérifier sur appareil.
- Une capture de parcours en pleine page (`captures/accueil-390.png`) ne montre pas le logo, alors que le DOM le contient et que deux captures de zone visible le montrent. Cause non trouvée (probablement la méthode de capture). À revérifier sur appareil.

## 6. Identifiant d'application — décision D6 (placeholder)

- `com.repere.app` est un **placeholder**. Il n'est pas écrit dans `app.json`.
- À décider par le porteur avant `eas build`. Sans identifiant, `eas build` en demandera un : ne pas le créer sans accord.

## 7. iPad et catégorie — décision D7

- **Catégorie** : « Actualités » (décision D7). Documentée dans `docs/app-store-metadata.md`.
- **iPad** : D7 dit « skip pour la bêta ». Mais `supportsTablet` vaut toujours `true` dans `app.json`, et Apple exige alors des captures iPad. Je n'ai pas modifié `app.json` : c'est la configuration de build, et l'intention exacte du CEO (passer à `false`, ou seulement ne pas faire de captures) n'est pas claire.
- **Question au CEO** : passer `supportsTablet` à `false` ? Si oui, je le fais dans un commit à part.

## 8. Cartes de partage sombres — décision D5 (inverse une règle précédente)

- Les cartes de partage utilisent désormais la palette fixe sombre `PALETTE_CARTE` (`src/lib/palette.ts`). Elles ne dépendent plus du thème du téléphone.
- Cela **inverse** la règle « cartes claires par défaut » qui était documentée jusqu'ici, et que `theme.test.mjs` verrouillait. Le test a été mis à jour.
- Vérification : par le code et les tests seulement. Aucune carte n'a été regardée sur appareil.

## 9. Vérification sur appareil, expo-doctor, captures

- **expo-doctor : non vérifié.** La commande `npx --yes expo-doctor@latest` a été refusée par le classifieur (téléchargement et exécution d'un paquet). Elle n'a pas été relancée ni contournée. À lancer par le porteur : `npx expo-doctor` depuis `mono/apps/mobile`.
- **Aucun appareil** (ni iPhone, ni Android) dans cette session. Aucune capture officielle d'App Store n'a été faite.
- **Parcours navigateur** : 222/222 sur le dernier build web local (après les changements du sprint V7).
- **Tests partagés** : 246/246 (liste de la CI, `.github/workflows/mobile.yml`, ligne 91).

## 10. Étape « distribution » (commit « docs(distribution) ») — partiellement connue

Le message fourni commence à l'étape 5 : les étapes 1 à 4 (guide testeurs, script de lancement, checklist, message type) ne sont pas dans la session. Seul `docs/testeurs.md` (stratégie de retour, mailto recommandé) a été écrit. Le reste n'a pas été inventé.

## 11. Blocs bonus — non commencés

Pas de temps consacré au bonus, pour ne pas multiplier les changements non relus avant la distribution.

## 12. Compte Apple Developer et premier build

- Compte payant à ouvrir par le porteur. Nécessaire pour `eas submit` et TestFlight.
- Première construction iOS jamais faite (pas de dossier `ios/`). Le manifeste de confidentialité reste à valider par le rapport de confidentialité de Xcode (voir `APP_STORE_READINESS.md`).
- URL publique de la politique de confidentialité : proposée `https://repereapp.netlify.app/confidentialite`, à vérifier (voir `docs/privacy-policy-hosting.md`).

## 13. Mission v8 (30/10/2026) — blocs non faits ou décisions à prendre

- **Bloc 5, carte « Cette semaine » : non ajoutée.** Une carte existe déjà (« Au Parlement cette semaine », `src/ui/semaine.tsx`) avec un état vide honnête. Une seconde carte en tête contredit la règle qui place l'agenda national sous les trois réponses. Les événements de `mono/data/evenements.json` sont tous nationaux, dont la plus récente date du 14/08/2026. La promesse « chaque lundi » n'a aucune source dans le dépôt. Détail : `docs/data/cette-semaine-format.md`. **À décider** : garder la carte existante (recommandé) ou la déplacer.
- **Bloc 5, fichier `mono/data/cette-semaine.json` (non suivi par git)** : `semaine: 2026-W45`, `date_publication: 2026-11-03` (postérieure à aujourd'hui), `communes: {}`. Non lu par l'application, non commité. **À vérifier** : qui l'a produit.
- **Bloc 6, onboarding : non fait.** Deux obstacles. (a) Le trigger demandé, l'absence de `repere.departement`, ne suffit pas : l'écran « Où habitez-vous ? » sert déjà de premier accueil, et un « onboarding vu » exigerait une seconde clé de stockage, ce que l'invariant 2 interdit (« une seule clé de stockage local »). (b) `src/lib/memoire.ts` ne garde la commune que sur demande explicite (« Retenir … sur ce téléphone »). **À décider** : accepter une exception à l'invariant 2 pour un drapeau booléen, ou retenir le premier accueil actuel. Les « mini-cartes factices » de l'écran 2 sont aussi à arbitrer : des cartes d'exemple dans une application qui cite ses sources risquent d'être lues comme des données.
- **Bloc 1, « Mis à jour hier » / « Calendrier actualisé hier » (brief, bloc 3) : non appliqué.** L'invariant 9 interdit de présenter une donnée gardée comme actuelle. « Hier » affirme une fraîcheur qui n'est pas vérifiée. Les formulations en place disent la date de publication (`DatePublication`, `BandeauFraicheur`).
- **Bloc 8, console.time sur l'accueil et la fiche élu** : non ajouté. Ces écrans reçoivent leurs données du fournisseur de commune partagé ; l'instrumentation demande un point de mesure dans ce fournisseur.
- **Bloc 10, SEO** : pas de canonique, pas de plan du site, pas de robots.txt. Il faut d'abord l'adresse publique définitive, et une décision sur des adresses par commune (voir `docs/seo.md`).
- **Bloc 9, tests de rendu** : impossibles sans moteur de rendu React installé ; aucune dépendance ajoutée. `photoUrl` n'existe pas dans le code.
- **Lecteur d'écran et appareil** : aucun contrôle VoiceOver, TalkBack, ni sur iPhone / Android dans cette session. Voir `docs/accessibilite.md` (checklist en 10 points).

## 14. Sprint v9 (30/10/2026)

- **D17 appliqué** : `mono/data/cette-semaine.json` supprimé (orphelin, ignoré par git, jamais commité). La structure reste décrite dans `docs/cette-semaine.md`. **Le processus éditorial d'un résumé hebdomadaire viendra après la bêta** : aucune source, aucune fréquence de publication n'est arrêtée.
- **Brief v9 tronqué** : le message s'arrête au bloc A, au milieu du script `lancer-pour-testeurs.ps1`. Les chantiers annoncés dans le titre, « Pitch », « Fiche élu » et « Recherche », n'ont pas de consigne. Je ne les ai pas inventés. **À renvoyer** si ces blocs doivent être faits.
- **« Le chiffre du jour » de l'accueil est figé** : 2 495 € par habitant à Melun (OFGL 2025) et le dernier vote du député 77-1, écrits en dur dans `src/app/index.tsx` (vérifiés dans `data/` le 30/10/2026). L'étiquette « du jour » laisse croire à une valeur qui change chaque jour. Ce n'est pas le cas : risque de lecture contraire à l'invariant 9 quand les testeurs reviendront dans une semaine. **À décider** : renommer (par exemple « Un chiffre de Melun ») ou brancher sur les données publiées. Non changé : la décision est de l'ordre du produit.

## 15. Sprint v10 (30/10/2026)

- **D18 appliqué, avec un repli annoncé.** L'accueil de choix de commune n'a pas encore de commune choisie à la première ouverture. La carte lit donc les comptes OFGL de la commune retenue (si le lecteur l'a demandé), sinon ceux de Melun, sous l'étiquette « Un exemple, en attendant votre commune ». La carte du vote reste figée (député 77-1, scrutin 8706), étiquetée « Un vote, à titre d'exemple ». **À décider** : la brancher sur les votes publiés, ou la retirer.
- **Bloc B, objectif « deux écrans au plus » manqué de peu.** Aujourd'hui à 390 x 844, mesuré dans le navigateur : Meaux 1 699 px, Paris 1 737 px, pour 1 688. Retirer le lien « Actualités » ramenait à 1 647 et 1 685 px, mais l'écran Actualités devenait inaccessible : le test `parcours — aucune impasse` échoue. Le lien est remis. **À décider** : supprimer l'écran Actualités tant qu'aucune actualité n'est publiée (et le test suivra), ou accepter environ 50 px de plus.
- **Incident** : le commit 60cd81f a été poussé avec ce test en échec (247/248), puis corrigé par le commit suivant. Les commandes de commit s'arrêtent désormais sur un test en échec.
- **Bloc B, « sous le titre "Ce qui se passe chez vous." »** : ce titre n'existe plus dans le code. Le pitch est déjà le titre de l'accueil depuis D15. Rien ajouté.
- **Bloc C, fiche élu** : « Ce qu'il défend en ce moment » n'est pas affiché. `scrutins.json` ne porte ni thème ni dossier (champs : numéro, date, titre, sort, décompte) : aucun thème à compter sans en inventer. Le « résumé officiel » n'existe pas dans les données. « Comprendre ce vote » montre le résultat publié et, pour 7 scrutins de juillet, le résumé de la rédaction Repère (`evenements.json`, avec sa source officielle), présenté comme tel ; sinon le titre et le lien vers le scrutin de l'Assemblée. Le compteur « Voir les 47 votes » dit le nombre réel : 12 scrutins solennels relevés au plus. Positions en mots et en signes neutres (✓, ✕, ○), pas en émojis colorés : les couleurs de Repère ne codent jamais Pour ou Contre.

## 16. Sprint v11 (30/10/2026)

- **Brief v11 tronqué** au point 3 du bloc 0 (« Crée `.env.example` avec : »). Le contenu prévu et les « 3 décisions CEO » du titre ne sont pas arrivés. Le `.env.example` contient les trois variables que le code lit réellement (`EXPO_PUBLIC_CONTACT_EMAIL`, `EXPO_PUBLIC_REPERE_DONNEES`, `EXPO_PUBLIC_REPERE_EMOJIS`), sans valeur. **À renvoyer** : la suite du bloc 0 et les 3 décisions.

## 17. Sprint v12 (30/10/2026)

- **« Ce qu'il défend en ce moment » (fiche élu) : REPORTÉ (D22).** Les scrutins publiés (`scrutins.json`) n'ont ni thème ni dossier législatif. Il n'y a donc rien à compter sans inventer. La section n'est pas affichée. Pour la débloquer, il faudrait publier pour chaque scrutin un champ thème ou dossier, tiré d'une source officielle (dossiers législatifs de l'Assemblée), puis compter les thèmes des votes de chaque député.
- **D20** : « Actualités » n'a jamais figuré dans la barre d'onglets (Aujourd'hui, Qui décide, Calendrier, Élus). L'écran reste ouvert par le lien « Voir les actualités » en bas d'Aujourd'hui.
- **D21 fait.** Une limite : la carte du vote ne devient dynamique que si le lecteur a demandé de retenir sa commune sur le téléphone, car l'accueil n'a pas d'autre commune choisie. Sans cela, l'exemple 8706 reste affiché, étiqueté « Un exemple ».

## 18. Sprint v13 (30/10/2026)

- **Bloc B : la couche « contexte » demandée n'est pas faite, car elle casse l'invariant 3.** « Moyenne IDF : X € » et « Comme 7 communes sur 10 en IDF » comparent ou classent des territoires. L'invariant 3 l'interdit (« aucun classement, score, ou tri numérique de … territoires »), et `docs/ux/systeme-visuel-2026.md` le rappelle pour la carte choroplèthe. À la place, le contexte reste dans la commune : le chiffre publié de l'exercice précédent (« En 2024 : 2 372 € par habitant »), affiché seulement si les deux exercices se suivent et si la population a peu changé (règle `evolution` de @repere/core). **À décider par le porteur** : amender l'invariant 3 pour permettre une moyenne régionale, ou garder cette version.
- **Bloc B, conséquence** : le texte demandé (« Finance vos écoles, vos routes, vos agents ») n'est pas vérifiable commune par commune. Les comptes OFGL publiés n'ont pas de répartition par poste (écoles, voirie). La conséquence affichée est lue dans les mêmes comptes : salaires des agents et investissement par habitant, deux montants publiés.
- **Bloc D, « Dernières publications »** : la carte est faite, mais **elle est masquée aujourd'hui**. Le fait le plus récent est le vote du 13/10/2026, il y a 17 jours, et la règle est de moins de 7 jours. « Prochaine publication : [jour] » ne peut pas être déduit : aucun calendrier de publication n'existe dans les données. La carte réapparaîtra dès qu'un scrutin solennel ou un fait de rédaction de moins de 7 jours sera publié. Elle a été vérifiée en avançant l'horloge du navigateur au 16/10/2026. **À décider** : allonger la fenêtre (30 jours ?) ou publier plus souvent. La rétention dépend des données, pas de l'écran.

## 19. Sprint v15 (30/10/2026)

- **Bloc 4, fichier d'agrégats : pas en dur dans `packages/data-utils/src/agregats-idf.json`.** Une valeur écrite dans le code se fige : c'est exactement le défaut du « 2 495 € » corrigé par D18, et l'invariant 9 l'interdit. À la place, `mono/scripts/agregats-regionaux.mjs` produit `data/agregats-regionaux.json` à chaque publication (`outils/pipeline.sh`), avec la date de l'index et la source OFGL. L'application le lit (environ 1 Ko compressé) et ne télécharge plus que le département de la commune.
- **Dépendance : la publication se fait depuis `main`.** Tant que cette branche n'est pas fusionnée, la production ne contient pas `agregats-regionaux.json`. L'application retombe alors sur le calcul à partir des 8 départements, soit environ 249 Ko compressés au premier lancement, au lieu de 105 Ko. **À décider par le porteur : la fusion.**
- **A2, gris d'abstention** : la brief annonçait plus de 5:1. La mesure donne 4,55:1 sur carte blanche et 4,07:1 sur le sol clair. Il passe le test AA sur carte, où toutes les barres sont posées.

## 20. Sprint v16 (30/10/2026)

- **Réseau : l'API DILA, Wikidata et Wikimedia Commons sont refusés par le proxy de la session.** Les deux scripts de collecte sont écrits et vérifiés hors ligne, mais n'ont tourné sur aucune donnée réelle. Ils tourneront dans `outils/pipeline.sh`, qui ne publie que depuis `main` (fusion à décider par le porteur). **Couvertures inconnues** : sites de mairies, photos des 574 députés publiés, photos des maires.
- **Photos : servies par département, pas chargées chez Wikimedia.** La brief ne le précisait pas. Le faire à l'affichage aurait dit à Wikimedia quel élu chaque lecteur regarde (invariant 2). Choix fait et documenté (ADR 0004).
- **Maires : rapprochement par commune et par nom seulement.** Un rapprochement par nom seul aurait risqué des homonymes. S'il y a doute, pas de photo.
- **Annuaire « Élus » sans photos** : il faudrait charger le fichier de photos de chaque département de France pour une seule liste.
- **Droit à l'image** à faire valider par un juriste (une licence libre ne le couvre pas). Je ne suis pas juriste.
- **Incident** : le commit d4773ac (bloc 0) a été poussé avec CLAUDE.md à 121 lignes (erreur E1 du contrôle des invariants). Corrigé quelques minutes après par a6ddbd2. Les commits suivants s'arrêtent sur ce contrôle.

## 21. Sprint v17 (30/10/2026) — confirmations du CEO et collecte en CI

**Le proxy de session Claude bloque les API, mais les scripts de collecte tournent en CI GitHub Actions où le réseau est ouvert.**

Confirmations apportées par le CEO (non revérifiées depuis la session : le proxy refuse ces sites) :

1. **P4123 est la bonne propriété** : « French National Assembly ID », URL de formatage `https://www.assemblee-nationale.fr/dyn/deputes/PA$1`. La valeur Wikidata est donc le numéro sans « PA ». `collecte-photos-elus.mjs` retire « PA » des deux côtés avant de comparer : cohérent, aucun changement.
2. **API DILA** : le champ du site s'appelle `site_internet` ; le point d'accès `.../api-lannuaire-administration/records` est confirmé ; Licence Ouverte Etalab. **Reste non confirmé** : les champs `pivot` (type de service, « mairie ») et `code_insee_commune`, que le script utilise aussi. S'ils manquent, le script s'arrête avec la liste des champs reçus et n'écrit rien : la première exécution en CI le dira. Le script utilise le point d'export (`/exports/json`) du même jeu, pour éviter la pagination à 100 fiches de `/records`.
3. **Les scripts tournent en CI, pas en local.** Le travail de la session est de rendre les scripts justes et de faire que la CI les exécute. C'est l'objet du bloc 1.

**Bloc 1 — déclenchement manuel depuis une branche d'essai.** `collecte.yml` avait déjà `workflow_dispatch`. Mais lancé depuis `test/sdk58-expo-go`, il aurait :
- fait `git pull --rebase origin main` puis `git push` sur la branche ;
- **publié le site et les données de la branche en production sur Netlify** ;
- ouvert ou modifié les issues de santé.

Ajout d'une garde `HORS_MAIN` : hors de `main`, la chaîne tourne, un bilan de couverture s'écrit dans le résumé du job, et les sorties partent en artefact `collectes-essai` (7 jours). **Rien n'est enregistré ni publié.** À vérifier au premier lancement manuel : le résumé doit montrer le bilan, et l'étape « Publier sur Netlify » doit apparaître comme sautée.

**Brief v17 tronqué** : le message s'arrête au milieu du YAML du bloc 1. La suite (autres blocs, « droit image », « rapport ») n'est pas arrivée.
- **V18, script DILA** : `code_insee_commune` est confirmé (note DILA du 17/07/2024). Le champ de type de service est probablement `code_type_service_local` d'après la même note, mais non vu sur une vraie réponse : le script accepte les trois noms candidats (`code_type_service_local`, `type_service_local`, `type_organisme`). La première exécution en CI tranchera.

## 22. Sprint v21 (30/10/2026)

- **Brief v21 tronqué** au point a) du bloc 3, au milieu du JSON. La suite du bloc 3 et les blocs suivants ne sont pas arrivés. Seul le point a) est fait.
- **`date_publication` corrigée dans le gabarit** : la brief proposait `2026-11-03`, qui est un mardi. D31 dit « chaque lundi », et le lundi de la semaine ISO 2026-W45 est le **2 novembre 2026**. Le gabarit porte `2026-11-02`.
- **`source_nom` ajouté au format** : l'invariant 4 demande le producteur de la source, pas seulement son adresse.
- **Libellé du groupe** : « Groupe politique : non publié », sans « (source AN) ». Ce serait inexact : l'Assemblée publie les groupes, c'est Repère qui ne les extrait pas (D3).
- **« Repère publie chaque lundi »** est désormais affiché aux lecteurs des 3 communes pilotes. Une semaine sans pull request fusionnée avant lundi matin affichera « Aucune actu cette semaine ». La promesse dépend du CEO, pas du code.
- **Publication** : `data/actus-hebdo.json` n'arrive en production qu'après fusion sur `main` (pull request, `main` est protégée), puis passage de `collecte.yml`.

### 22 bis. Bloc 3d — première actu Melun : non remplie (30/10/2026, 17 h 30)

**Le CEO doit remplir la première actu Melun manuellement.**

Recherche faite sur le site officiel (melun.fr / ville-melun.fr) :
- **Aucun article de la ville n'affiche de date de publication.** L'exigence « des 7 derniers jours » ne peut donc pas être vérifiée sur la source officielle.
- **Seul élément récent et daté par son contenu** : « Obsèques d'Henri Mellier » (https://www.melun.fr/actualites/1303-obseques-dhenri-mellier). Décès le 25/10/2026 d'un adjoint au maire, obsèques le 04/11/2026. Je ne l'ai pas publié, pour deux raisons :
  - c'est un avis de décès signé par la famille ; en faire la première actu de l'application est un choix éditorial qui revient au CEO ;
  - si M. Mellier figurait encore dans l'annuaire des élus (RNE), sa fiche resterait affichée comme celle d'un élu en fonction jusqu'à la prochaine mise à jour du RNE. **À vérifier** dans l'application avant toute publication sur ce sujet. Je n'ai pas pu le faire, faute d'accès aux sources d'annuaire depuis cette session.
- « Travaux en Centre-Ville » (Tzen 2, réseau de chaleur) : la page est marquée « Expiré », sans date. Écarté.
- Les pages du conseil municipal sont inaccessibles depuis cette session (erreur du site).
- La presse locale n'a pas été utilisée comme source (D29 : pas de reprise de presse).

**Règle de fond** : D29 exclut l'IA générative pour les actus. Même avec une actu trouvée, un titre et un résumé écrits par Claude seraient en tension avec D29. Le texte doit être écrit, ou au minimum réécrit, par le CEO.

## 23. Sprint v22 (30/10/2026)

### Bloc 2 — mandats terminés (D32)
- **Aucune donnée publiée ne porte de fin de mandat.** Vérifié fichier par fichier :
  - `deputes.json` : `outils/mono_donnees.py` écarte tout mandat qui a une `dateFin` (corrigé le 30/10 : `construire_deputes.py` fait de même mais la chaîne ne l'appelle pas) ;
  - `elus-regions/*.json` : seulement `debut` ;
  - `departments/*.json` (RNE) : seulement `debut`, aucun motif.
  La détection automatique trouve donc **0 cas**. Aucune source ne dit « décès » : le RNE retire l'élu à sa mise à jour suivante, sans motif.
- **Henri Mellier n'a pas de fiche dans l'application.** Il figure seulement parmi les 21 délégués de Melun à l'intercommunalité. L'application affiche ce nombre, pas les noms, et l'annuaire « Élus » ne couvre que les députés et les exécutifs régionaux. Il n'y a donc pas de badge « En fonction » à retirer.
- **Ce qui est fait** : une liste tenue à la main, `mono/apps/mobile/src/lib/mandats-termines.ts`, avec une seule entrée : Henri Mellier, fin le 25/10/2026, décès, source Ville de Melun. Sous la carte Intercommunalité de Melun, l'application affiche « Mandat terminé le 25 octobre 2026 (décès) : Henri Mellier, conseiller communautaire. Le Répertoire national des élus le compte encore dans ce nombre. », avec un lien vers la source. La phrase disparaît d'elle-même quand le RNE ne liste plus son nom. Un garde de test exige une date passée et une source https. Vérifié dans le navigateur : présent pour Melun, absent pour Meaux.
- **Écart de fonction** : l'avis de la ville dit « adjoint au maire ». Le RNE publié par Repère le classe seulement « conseiller communautaire », et la liste des adjoints de Melun n'est qu'un nombre. J'ai affiché la fonction du RNE, qui est la source du nombre affiché.
- **Source** : la page de la Ville de Melun est un avis signé par la famille, hébergé sur le site officiel de la commune. C'est la source retenue par D32.
- **Reste à décider** : garder les mandats terminés des députés comme historique. La brief dit « Ne retire PAS la fiche ». Aujourd'hui la chaîne n'en garde aucun, et la clé est la circonscription : deux députés successifs prendraient la même place. Ce serait un changement de format, que je n'ai pas fait.

### Brief V22 tronqué
- Le message s'arrête au point b) du bloc 4 (« Vérifie que main et test/sdk58-expo-go peuvent fusionner sans conflit : »). Ce point est fait : essai sur une copie jetable de `main`, 0 conflit (`docs/fusion-main.md`). Ce qui suivait n'est pas arrivé.
- **« Netlify ~5 min » non confirmé** : la fusion seule ne publie rien. La production change à la collecte suivante (05 h 47 UTC ou lancement manuel depuis `main`), dont la durée n'a pas pu être lue (`gh` non authentifié).
- **Le lien « Voir les dernières publications »** mène à l'écran Actualités, qui ne montre que des événements nationaux. Le plus récent date du 14/08/2026. Le lecteur y trouvera des publications anciennes : c'est honnête, mais peu engageant.

## 24. Sprint v23 (30/10/2026)
- **Brief V23 tronqué** juste après le titre du bloc 2 (« Crée docs/survie-ceo.md : un document unique qui liste les actions récurrentes du CEO. »). Le contenu attendu n'est pas arrivé. Le kit est construit à partir des procédures déjà présentes dans le dépôt, sans règle nouvelle. Les blocs suivants, s'il y en avait, ne sont pas faits.
- **Correction** : le filtre des députés sortants est dans `outils/mono_donnees.py`, pas dans `construire_deputes.py`, que la chaîne n'appelle pas. Corrigé en section 23 et dans un commentaire de `lib/mandats-termines.ts`.
- **D36, nommage** : `date_fin_mandat` et `successeur_de` sont en snake_case, alors que `deputes.json` est en camelCase (`dateDebut`). À aligner au moment du changement post-bêta.

## 25. Sprint V26 (30/10/2026) — universalité, blocs 0 à 3

### Brief V26 : blocs 4, 5, 6, 7
- **Bloc 4 (data viz : titres-conclusions, encodage non coloriel, labels directs, barres à zéro)** : non fait. Un titre-conclusion (« 45 € sur 100 vont aux salaires ») est une phrase qui affirme un fait ; c'est un texte que le CEO doit valider, pas un gabarit à remplir. Les autres règles touchent la carte budget, la carte vote, la fiche élu et la modale : à faire après validation des titres.
- **Bloc 5 (« Pourquoi je vois ça »)** : non fait. Source, méthode et « pourquoi ici » sont à écrire pour chaque chiffre ; c'est le cœur de la transparence (invariant 4), donc à relire.
- **Bloc 6 (fil « Pour vous »)** : non fait. Il demande de trancher quoi entre dans le fil (scrutins, budgets, actus, échéances) et ce qui se passe quand il est vide dans chaque vue.
- **Bloc 7** : `RESUME-v26.md` écrit. Les tests passent à chaque commit.
- **Brief V25 absent** : V26 dit « V25 + corrections V23 » et « enchaîne sur l'universalité (V25) ». Le texte de V25 n'a pas été reçu. Seul ce qui figure dans V26 est fait.

### Bloc 0 — invariant 2 (fait, 1ad1d3a et 4f63856)
- Le sceau a été régénéré sur décision explicite de V26. Un commit intermédiaire (1ad1d3a) a été poussé avec un test rouge (250/251), parce que mon contrôle ne s'arrêtait pas sur un échec. Corrigé dans 4f63856. Le contrôle de `gate.sh` est désormais strict.

### Bloc 1 — onboarding (fait, e3f3bca)
- **« Passer » ne garde rien.** Le brief demandait de sauvegarder dans `repere.profil`. Garder des réglages par défaut au passage, sans réponse, aurait contredit la règle « rien n'est gardé tant que le lecteur ne l'a pas demandé » (test mémoire). Conséquence : **la question reviendra à chaque ouverture** tant que le lecteur passe. À trancher : soit accepter cette répétition, soit garder les défauts après un passage explicite (il faut alors amender la règle mémoire).
- **« Oublier » efface aussi le profil** sur le disque. L'état en mémoire de la session garde le profil jusqu'au redémarrage. Effet visible : rien, mais un réglage peut rester actif pendant la session.
- **Trois questions, pas quatre** : la commune reste répondue sur l'accueil avant l'écran de bienvenue.

### Bloc 2 — zoom (fait, 126931b)
- **« France » et « Tout » sont identiques** : les deux gardent tout. Le brief les distingue sans dire comment. À trancher.
- **Calendrier et actualités en vue « Ma rue » ne montrent rien.** Ces deux écrans ne contiennent que des informations nationales (Assemblée, Sénat). L'écran le dit et propose la vue France. C'est le comportement que le brief décrit, mais un lecteur qui choisit « Ma rue » ne voit jamais le calendrier : **à relire avant la bêta**.
- Le préfet de région est traité comme un échelon régional (masqué en « Ma rue »). La carte de vote de l'accueil est masquée en « Ma rue » et « Ma région ».

### Bloc 3 — confort de lecture (fait, b17b134)
- **Appliqués** : taille, espacement, contraste (élevé et très élevé remplacent le gris secondaire par l'encre), animations réduites, masquer les images.
- **Contraste « très élevé » ne fait pas 10:1** : il ne fait pas davantage que « élevé ». Atteindre 10:1 demande de nouvelles couleurs, donc une décision sur la palette (invariant 7).
- **Non faits, et listés à l'écran** : police de dyslexie (aucune police de ce type dans le dépôt ; il faut en choisir une et vérifier sa licence), mode daltonien (demande une décision sur les couleurs de vote, D24), guide de lecture et mode focus (non conçus).
- **Taille 26 non vérifiée** : les tailles sont multipliées dans tout le thème. À 26, la plus grande (« affiche », 36) passe à environ 58 points. Un débordement est possible sur les écrans denses. Les tests navigateur ne couvrent que la taille 16 et 22 ; **à vérifier sur iPhone**.

### Vérifications
- Tests partagés : 257/257 à chaque commit ; invariants à 0 erreur ; `tsc` à 0 erreur ; parcours navigateur (222/222) ; cartes de partage ; zoom et confort (`zoom-web.mjs`).
- Le test de zoom passe par l'accueil, comme un lecteur : ouvrir `/qui-decide` directement n'a pas de commune en mémoire de session (comportement existant, non modifié).

## 26. V29 bloc 2c — source du nombre d'habitants à vérifier (30/10/2026)

- Le brief citait l'INSEE comme source du nombre d'habitants. **Non vérifié.**
- Ce que le dépôt dit : chaque exercice du bloc OFGL porte la population qu'il utilise (`mono/scripts/extract-html.js`, règle V-2, 29/09/2026). Les montants par habitant sont ceux que publie l'OFGL.
- Ce que le dépôt ne dit pas : qui produit cette population (INSEE, DGCL ou autre) ni à quelle date de référence. Rien n'a été écrit dans l'application à ce sujet.
- Action : vérifier le producteur de la population dans le fichier OFGL source avant d'ajouter une mention de source. Jusque-là, l'application ne cite que l'OFGL.
