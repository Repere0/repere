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

## 27. V29 bloc 3 — couleurs du brief non retenues (30/10/2026)

- **Rouge `#A40E26` (brief) : non appliqué.** Mesuré : 7,87:1 sur blanc, mais 2,14:1 sur carte sombre (le test exige 3:1). A2 garde `#CF222E` (5,36:1 sur blanc). La prémisse « contraste WCAG AA » ne tient pas : `#CF222E` passe déjà.
- **Orange `#E69F00` (brief) : remplacé par `#B35900`.** 2,25:1 sur blanc, sous 4,5:1.
- **Gris `#999999` (brief) : remplacé par `#6E7781`.** 2,85:1 sur blanc. Ce gris n'est pas une couleur Okabe-Ito.
- Invariant 7 amendé (D56) et scellé. Le porteur doit valider ce texte, qui ne reprend pas les trois valeurs du brief.

## 28. V30 bloc 2 — dates des élections (30/10/2026)

- **Présidentielle 2027** : premier tour le dimanche 18 avril 2027, second tour le dimanche 2 mai 2027. Source : service-public.gouv.fr (page « Élection 2027 ») et LCP, consultés le 30/10/2026. Outre-mer : samedis 17 avril et 1er mai 2027.
- **Législatives 2027 : aucune date fixée.** Le brief indiquait « juin 2027 » : ce n'est pas vérifié, donc rien n'est publié. L'écran dit « Date non fixée ».
- **Municipales (mars 2026) et sénatoriales (2026)** : déjà passées à la date du jour. Elles ne sont pas listées.
- **maprocuration.gouv.fr** : site non consultable depuis cet environnement. Aucun lien vers lui n'est écrit ; le guide renvoie à service-public.fr.
- Dates écrites dans `mono/apps/mobile/src/lib/elections.ts`, pas dans `data/` : `mono/data/` n'est pas versionné (`mono/.gitignore`), donc un fichier de données n'arriverait pas à la publication. À reverifier avant chaque publication.

## 29. V30 blocs 3 et 4 — contacter un élu, signaler une erreur (30/10/2026)

- **Aucun courriel d'élu** n'est publié dans `mono/data/`. « Contacter » renvoie donc à la source officielle (Répertoire national des élus), ou affiche « Contact non publié ».
- **Fiches personnelles de l'Assemblée et du Sénat** : non construites. Le dépôt ne contient aucune URL vérifiée pour une fiche de personne.
- **`EXPO_PUBLIC_CONTACT_EMAIL` n'est pas définie.** Comme ailleurs dans l'application, le signalement et l'adresse de contact restent masqués tant qu'elle ne l'est pas. Le site (`mono/apps/web/src/routes/Sources.jsx`) publie `repere0@protonmail.com`. **Décision CEO** : définir la variable à la publication, avec cette adresse ou une autre.

## 30. V30 bloc 5 — suivi de thèmes : non fait (30/10/2026)

- Le brief demande les thèmes dans le profil (`repere.profil`), cochés à l'onboarding, et un fil filtré par thème.
- **Conflit.** ADR 0006, point 1 : `repere.profil` « porte uniquement des réglages de lecture ». Invariant 2 : « Deux clés de stockage local, nommées, rien d'autre ». Un centre d'intérêt n'est pas un réglage de lecture.
- Le filtre demande aussi de classer chaque publication par thème. Cette classification n'existe pas dans les données.
- **Aucune ligne de code n'a été écrite pour ce bloc.** Il faut une décision formelle du CEO : amender l'ADR 0006 et l'invariant 2, ou stocker les thèmes ailleurs que dans le profil.

## 31. V30 bloc 1 — limites de « Mes élus » (30/10/2026)

- Sénateurs et conseillers régionaux : non publiés dans les données de Repère. L'écran le dit.
- Photos des élus : non affichées sur cet écran.
- Conseillers départementaux du canton : lignes non cliquables, parce que la fiche élu ne sait pas les ouvrir.

## 32. Correction hors brief : commune gardée non restaurée (30/10/2026)

- **Constat (antérieur à V30).** Une commune gardée sur le téléphone (`repere.departement`) s'affiche sur l'accueil, mais le choix en mémoire reste vide. « Qui décide », « Élus » et « Mes élus » répondaient « Aucune commune n'est choisie » après un redémarrage.
- **Correction.** L'accueil remet la commune retenue dans le choix (`useEffect` dans `index.tsx`). Vérifié dans Chromium à 390 px. À vérifier sur iPhone.

## 33. Thèmes d'intérêt (D57, V31 bloc 1) — à confirmer par le CEO

- Amendement appliqué selon le brief V31 : l'ADR 0006 et l'invariant 2 autorisent désormais `themes` dans `repere.profil` (liste fixe de 7 thèmes, dans `@repere/core`). Le sceau a été régénéré. Le CEO doit confirmer l'amendement.
- Le rangement des publications par thème repose sur des mots-clés du titre. Il est approximatif : « sécurité sociale » est rangé en Sécurité (faux positif connu).
- Une publication dont le titre ne contient aucun mot-clé n'apparaît que lorsque le filtre est vide (« Tout voir »).
- Vérifié : onboarding question 4 enregistre les thèmes ; le fil ne montre que les thèmes choisis ; l'état vide propose « Voir tous les sujets ». Pas de test sur iPhone.

## 34. Adresse de contact (D58, V31 bloc 2)

- Adresse officielle : repere0@protonmail.com (déjà publiée sur le site).
- À utiliser pour `EXPO_PUBLIC_CONTACT_EMAIL`. Le CEO définira la variable à minuit.
- Aucune ligne de code modifiée : tant que la variable n'est pas définie, les signalements d'erreur et les boutons de contact restent masqués.

## 35. Crash de l'onglet Élus (V34, bloc 1) — cause corrigée, à confirmer sur iPhone

- Cause : l'avatar, affiché sur chaque ligne de l'onglet Élus, passait `OMBRE` (Proxy de thème de `lib/theme.ts`) dans un tableau de styles. React Native fige en développement les props des vues natives ; sur ce Proxy, le gel écrit sur la cible, et la lecture suivante plante.
- Ce n'était pas un `.sort()` en place : le brief supposait une mutation de tableau. Le tri de `elus.tsx` opère sur un tableau local, et ne crée pas le crash.
- Correctif : l'avatar copie les champs (`...OMBRE`). Garde : `apps/mobile/tests/theme-proxy.test.mjs`, citée dans `mobile.yml`.
- Reproduction : la mécanique est reproduite avec une copie du code de gel de React Native (Node). Le message exact sur appareil (« trap result is configurable… ») n'est pas reproduit ici : pas d'iPhone dans cette session. À confirmer sur iPhone.

## 36. Splash sombre, règle « tuile du logo » levée par ordre du CEO (V34, bloc 2) — à confirmer

- Ordre du CEO : fond du démarrage `#161513`, repère en `#F3F0EA`. Le démarrage n'a pas de texte : le repère est une image. Une version sombre `assets/splash-icon-sombre.png` est ajoutée.
- Règle produit touchée : depuis le 29/10, le fond du démarrage et l'icône adaptative Android suivent la tuile du logo (`#F7F7F9`), test `theme.test.mjs`. Le démarrage n'est plus sur la tuile ; l'icône iOS et l'icône adaptative Android le restent.
- Question au CEO : garder le démarrage sombre et la tuile claire (état actuel), ou passer aussi la tuile de l'icône en sombre pour retrouver la règle ? La deuxième option change l'icône de l'application.
- Non vérifié sur appareil.

## 37. Calendrier « Rien de publié dans les deux prochaines semaines » (V34, bloc 6) — cause : publication bloquée

Diagnostic (31/10/2026), par étapes, ce qui est vérifié et ce qui ne l'est pas :

- Source de l'agenda : OK. `outils/agenda_an.json` (relevé du 28/10) passé dans le vrai normaliseur (`scripts/agenda-an.mjs`) : 48 séances à partir du 28/10, dont 24 dans les 14 jours après aujourd'hui. Pas de décalage de fuseau : les dates sont en heure de Paris, comparées à l'heure de Paris partout.
- Collecte : en échec chaque jour sur `main` depuis le 25/10 (exécutions `collecte.yml`, déclenchement planifié). L'étape qui échoue est « Publier sur Netlify » : HTTP 401, « Jeton NETLIFY_AUTH_TOKEN refusé : révoqué, expiré ou mal recopié ». La collecte et le commit du relevé réussissent (dernier commit 28/10), mais le site n'est plus republié.
- Conséquence : le site en ligne garde sa dernière publication réussie. Son contenu n'a pas pu être vérifié d'ici : `repereapp.netlify.app` est injoignable depuis l'environnement de travail (HTTP 000). Le message « Rien de publié… » n'apparaît que lorsque l'agenda a bien été lu mais qu'aucune séance ne tombe dans les 14 jours : c'est donc une publication dont les séances sont passées, ou absentes. Pas d'autre cause trouvée dans le code.
- Ce que l'application montre désormais : quand rien ne vient, elle dit « Pas d'événement à venir. Dernier événement : [date] » et affiche ce dernier rendez-vous, avec sa source et la date du relevé. Si l'agenda n'est pas arrivé, elle le dit (inchangé). Le bloc « Aucune séance n'est annoncée » ne s'affiche plus quand un dernier événement existe, car il se contredisait.
- Vérifié : tests core (46 réussis, dont un cas « dernier rendez-vous passé ») ; écran vérifié dans Chromium 390 px avec les vraies séances du normaliseur, filtrées sur celles déjà passées.

À trancher par le CEO (je ne peux pas le faire d'ici) :
1. Remplacer le secret `NETLIFY_AUTH_TOKEN` dans les réglages GitHub (le jeton est refusé en 401). Puis relancer `collecte.yml` sur `main`, et vérifier que `repereapp.netlify.app/data/agenda-an.json` contient des séances à venir.
2. Décider si l'écran doit aussi afficher la date du relevé quand il est ancien (il l'affiche déjà : « Relevé de l'agenda du 28 octobre 2026 »).

## 38. AMO30 : téléchargement refusé par le proxy, groupes non produits ici (V36, bloc 1 B2)

- Ce qui a été tenté (31/10/2026) : `curl` vers `data.assemblee-nationale.fr` (archive AMO30, `outils/collecte.py`). Réponse : `CONNECT tunnel failed, response 403`. Le statut du proxy (`/__agentproxy/status`) donne `connect_rejected 403` pour `data.assemblee-nationale.fr:443`, à 11:59:48 UTC.
- Lecture : un 403 du proxy est un refus de politique, pas une panne. Rien n'a été retenté ni contourné (miroir, autre hôte) : c'est une décision à prendre, pas une erreur à réparer en silence.
- Correction d'une indication du brief V36 : « URL dans BLOCAGES.md §23 » est inexacte. La §23 traite des mandats terminés (Henri Mellier). L'URL de l'archive est dans `outils/collecte.py`, ligne 59.
- Ce qui est produit : `mono/scripts/collecte-groupes.mjs`, branché dans `outils/pipeline.sh` (après le relevé du Sénat, dans le sous-shell `cd mono`), et testé (`mono/tests/collecte-groupes.test.mjs`, 8 cas) avec une archive fictive de même forme.
- Ce qui n'est PAS vérifié : la forme réelle de l'archive pour les groupes. Hypothèses : organes `codeType: "GP"` pour les groupes, `libelleAbrege` pour le sigle, `organes.organeRef` en texte. La forme des acteurs et des organes est reprise de `outils/agenda_an.py`, `outils/mono_donnees.py` et `docs/schema_acteurs.md`. Le seuil (90 % des députés rattachés à un groupe, sinon rien n'est écrit) protège le fichier de la veille si une hypothèse est fausse.
- Ce qui reste bloqué : `mono/data/deputes-groupes.json` n'existe pas dans cette session. Il sera produit par la CI, à condition que le runner atteigne data.assemblee-nationale.fr (la collecte quotidienne le fait déjà, selon `outils/collecte.py`). À vérifier au premier run : le message `groupes : N deputes sur 574 rattaches...` dans le journal de `collecte.yml`.
- Décision demandée au CEO : aucune. Si la CI ne peut pas non plus joindre la source, il faudra un autre moyen d'obtenir l'archive ; je ne le choisirai pas seul.

## 39. Adresse de contact : le `.env` n'atteint pas la production (V36, bloc 1 B5)

- Adresse officielle : repere0@protonmail.com. Le CEO définira `EXPO_PUBLIC_CONTACT_EMAIL` à minuit (brief V36).
- **Point à corriger avant minuit, sinon la variable n'aura aucun effet sur l'application publiée** :
  - `mono/apps/mobile/.env` est exclu du dépôt (`.gitignore`, ligne 58). Il ne sert qu'aux lancements et exports faits sur la machine qui le contient.
  - Le seul build de publication web du dépôt (`.github/workflows/mobile.yml`, ligne 100) passe `EXPO_PUBLIC_REPERE_DONNEES` et aucune autre variable ; `outils/pipeline.sh` ne passe rien de tel.
  - `mono/apps/mobile/eas.json` ne déclare aucune variable `EXPO_PUBLIC_*`. Un build de magasin ne la verra donc pas non plus, sauf si elle est définie côté EAS.
- Ce qu'il faut pour que l'adresse arrive : la définir comme variable dans le build qui publie (dans `mobile.yml` ou `pipeline.sh` pour le web, dans `eas.json` ou les variables EAS pour les builds natifs), ou la vérifier sur le site publié après le prochain déploiement. Ce n'est pas un changement fait ici : le brief dit « aucun changement de code ». Décision à prendre par le CEO.
- Le code n'a pas été modifié. Le repli reste en place : sans variable, les boutons de contact et les signalements sont masqués (`src/ui/contact.tsx`, `src/app/faq.tsx`, `src/ui/avatar.tsx`).

## 40. Bleu-sarcelle #0e7490 : échec au test chroma, couleur figée (V36, bloc 2 M4)

- Vérifié le 31/10/2026 : `validate_palette.js "#0e7490" --mode light` donne **[FAIL] Chroma floor**, valeur 0,094, « reads gray ». Les autres contrôles passent (luminosité, contraste 3:1 sur le fond clair).
- Précision : le validateur juge une palette catégorielle. Une seule couleur y est testée comme un jeu de série ; l'écart ne dit donc pas que le bleu-sarcelle est illisible, seulement qu'il est sous le seuil de saturation de cet outil.
- Invariant 7 : la palette d'échelon (`#0e7490` ville, `#0891b2` agglomération, `#b45309` département, `#6d28d9` région, `#1d1d1f` France) est figée.
- **Décision CEO : conserver.** Aucun changement de code.

## 41. Niveau « Ma rue » vide : comportement voulu, à revoir (V36, bloc 2 M5)

- Le niveau rue rend le calendrier et les actualités vides parce que les données sont nationales. Comportement honnête. À revoir quand on aura des actus locales (voir `docs/strategie-editoriale.md`, état du 31/10/2026 : trois communes pilotes vides).

## 42. Features 2 et 3 (« Mes suivis », « Nouveau ») : stockage interdit par l'invariant 2 en l'état (V37, blocs 4 et 5)

- **Ce que le brief demande** : ajouter à `repere.profil` deux champs, `suivis: string[]` (identifiants d'élus ou codes INSEE de communes) et `derniereVisite: string` (date ISO).
- **Ce que la règle dit** : l'invariant 2 (`CLAUDE.md` et `AGENTS.md`, bloc sous `INVARIANTS:DEBUT`) ne permet que deux clés, `repere.departement` et `repere.profil`, et liste les réglages admis dans `repere.profil`. L'ADR 0006 va plus loin : `repere.profil` porte des réglages de lecture, « aucune identité, aucune commune, aucun historique ». `.claude/invariants.sha256` scelle ce texte ; le changer exige un accord explicite du CEO, puis une mise à jour du sceau.
- **Pourquoi je n'ai pas écrit ces champs** :
  - `suivis` range dans le téléphone une liste d'élus et de communes choisis par le lecteur. C'est une identité et une commune, ce que l'ADR exclut de `repere.profil`. Ce n'est pas un réglage de lecture.
  - `derniereVisite` est une date d'usage : un historique, au sens de l'ADR.
  - `repere.departement` ne peut pas porter ces données non plus : il ne contient que la commune retenue (`{d, c}`), et ajouter des champs y violerait la même règle.
  - Une version « en mémoire seulement » (perdue à la fermeture) serait une demi-fonction livrée sans le dire. Je ne l'ai pas faite.
- **Ce qui est livré quand même** : rien pour ces deux blocs. Les blocs 6 (rappel des élections) et 7 (partage) ne touchent pas au stockage et sont faits.
- **Décision demandée au CEO**, par écrit et avec un numéro de décision :
  1. Amender l'invariant 2 et l'ADR 0006 pour `derniereVisite` seul (une date ISO, aucune identité) ? C'est le cas le moins risqué ; sa conséquence est que la règle « aucun historique » est levée pour une seule date, locale, jamais transmise.
  2. Pour `suivis` : accepter une liste locale d'élus et de communes suivis (identité d'intérêt, sur le téléphone seulement, jamais transmise), en amendant « aucune identité, aucune commune » pour ce seul champ ? Ou renoncer à la fonction ?
  3. Si l'amendement est refusé : les blocs 4 et 5 restent non livrés, et l'accueil ne montre pas de section « Mes suivis » ni de badge « Nouveau ».
- **Quand c'est tranché** : la PR qui applique l'amendement met à jour `CLAUDE.md`, `AGENTS.md`, l'ADR 0006 (section amendement, comme D57 et D67) et `.claude/invariants.sha256` dans le même commit. Le test `invariants.test.mjs` doit passer sans modification de ses listes.
- **Le profil reste sous la limite** : 279 octets avec tous les réglages et les sept thèmes (limite 500).

## 43. CI rouge à l'étape « Même vérité » : la répartition « Sur 100 € » ne dit pas la même phrase sur le site et dans l'application (V37, bloc 8)

- **Constat** : sur la branche de test, la CI échoue à la dernière étape de vérification (« Meme verite sur le site et dans l'application », `tests/meme-verite.mjs`) depuis au moins le commit V36 `30bc63b` (run 41200351315). Sur les commits V37 `d5af156` et `09f8718`, toutes les étapes précédentes passent (socle, construction, parcours, commune, recherche, onboarding, zoom, mode, cartes de partage) ; seule celle-ci échoue.
- **Reproduit en local** (site construit avec `pnpm build`, données copiées comme la CI, serveurs 8821 et 8811) : 107 faits comparés, 8 échecs, tous sur la même ligne, pour Paris, Boulogne-Billancourt, Meaux et Amponville :
  - site : « 30 € de salaires », « 22 € pour investir » (le test attend cette phrase) ;
  - application : « Salaires des agents 30 € » et « Investissements 22 € » (`src/ui/visuels.tsx`, `RepartitionCent`, libellé d'accessibilité et légende).
- **Cause** : la refonte « budget plus visuel » (commit `a4c1964`, V34, bloc 5) a changé la formulation côté application. Le test n'a pas été mis à jour ; il est donc rouge depuis. Ce n'est pas une donnée fausse : les montants sont les mêmes, seule la phrase diffère.
- **Ce que je n'ai pas fait** : ni changé la formulation de l'application, ni affaibli le test. Les deux sont des décisions : la formulation de l'infographie est un choix de design, et le test est la garde de la « même vérité ».
- **Décision demandée au CEO**, au choix :
  1. Aligner l'application sur la phrase du site (« 30 € de salaires », « 22 € pour investir ») dans la légende et le libellé d'accessibilité de `RepartitionCent`. Le test passe sans modification. Coût : un changement de libellé visible.
  2. Garder « Salaires des agents 30 € » et mettre le site à la même formulation (la phrase du site vient de `packages/core` et de `apps/web`). Coût : un changement sur le site.
- **Conséquence pour la PR** : la PR de la branche ne peut pas être verte tant que ce point n'est pas tranché. Elle n'est pas fusionnée dans `main` de toute façon.

## 44. V40 : ce qui n'a pas pu être fait ou vérifié dans cette session (flux RSS des mairies, D81)

- **Constat** : l'amendement de l'ADR 0005 et de l'invariant 4 est fait et scellé (bloc 1, `0de2656`). Le collecteur RSS, sa chaîne et son affichage sont faits et testés en local (blocs 2, 4, 5). Les points ci-dessous ne le sont pas.
- **Couverture non mesurée** : le réseau de la session refuse les sites des mairies (403 au tunnel CONNECT, testé sur versailles.fr). Impossible de dire combien de communes ont un flux. Aucun chiffre n'a été écrit.
- **Fichier des mairies absent** : `mono/data/mairies-idf.json` n'existe pas dans cette copie, et l'API DILA est injoignable d'ici. L'état de la production n'a pas été vérifié.
- **Adresses candidates** (`/feed/`, `/rss`, `/flux-rss`, `/955.htm`) : hypothèses, non vérifiées sur un site réel. `/955.htm` est donné par le brief pour Versailles ; rien ne confirme qu'il s'agit d'un flux.
- **Base juridique** (ADR 0007) : non vérifiée. La recherche web n'a pas confirmé l'argument du CADA. Un avis juridique écrit est requis avant la première publication automatique.
- **Bloc 4 déplacé** : pas de workflow séparé `actus-rss.yml`. Raisons : `mono/data/` est ignoré par git et produit par la chaîne ; un workflow isolé ne peut ni lire `mairies-idf.json` ni publier dans les données. Les GitHub Actions planifiées ne tournent que depuis la branche par défaut : rien ne tournera tant que la branche n'est pas fusionnée dans `main`, ce qui n'a pas été fait.
- **Lien « site officiel de la mairie » pour les communes sans flux** : non implémenté. Une carte « Cette semaine » qui ne montrerait qu'un lien annoncerait une actualité qui n'existe pas (D31). Décision à prendre : (a) un lien sans carte, ailleurs ; (b) rien, comme aujourd'hui.
- **Affichage non vu** : `tsc` passe, les tests de données passent, mais la carte n'a pas été rendue dans un navigateur ni sur un appareil.
- **Test d'environnement** : `tests/runtime.test.mjs` échoue ici parce que le navigateur Playwright n'est pas installé dans la session (binaire absent). Ce test n'est pas touché par ce lot.
- **Décision demandée au CEO** : valider la base juridique (ADR 0007), puis décider si le flux doit être fusionné dans `main` pour que la chaîne le lance.

## 45. Résumé par IA des entrées de flux (Bloc 3 de V40) : conflit avec D33, non implémenté

- **Constat** : le brief demande un résumé Gemini Flash, publié automatiquement chaque nuit. Or D33 (`docs/strategie-editoriale.md`) impose que « le CEO relit chaque fait contre la page » avant publication, et que le résumé par IA ne publie pas seul. Une publication quotidienne sans relecture contredit D33.
- **Ce qui n'est pas vérifié** : les conditions de l'offre gratuite de l'API Gemini, notamment si Google peut utiliser les textes envoyés. Or ces textes sont ceux de mairies ; les envoyer à un tiers est une exposition à vérifier avant.
- **Ce qui n'est pas testé** : aucune clé, aucun appel réel. La garde envisagée (chaque chiffre du résumé doit figurer dans la source) n'est pas écrite.
- **Ce qui est fait à la place** : seul le texte du flux, tronqué à deux phrases, est repris. Aucune IA n'est appelée.
- **Décision demandée au CEO**, au choix :
  1. garder D33 : le résumé IA, s'il existe un jour, va dans un fichier brouillon que le CEO relit, jamais dans la publication ;
  2. amender D33 par écrit pour une publication automatique, après vérification des conditions de l'API et une garde sur les chiffres.

## 46. V41 (D84) : lien externe pour les communes sans flux RSS publié

- **Constat** : la ligne « Site officiel de la mairie » existait déjà dans « Aller plus loin » (`chez-vous.tsx`, `SiteMairie`), pour toute commune dont l'annuaire DILA donne un site https. Le lot la rend conditionnelle : elle disparaît quand la commune a des actualités de flux publiées (la carte les montre avec son propre lien).
- **Libellé** : le brief demandait « Voir les actualités sur [site mairie] ». Non retenu : rien ne dit que la page d'accueil d'un site contient des actualités, et « Cette semaine » ou « actualités » promettrait un contenu absent (D31). Le libellé de l'ADR 0005 est conservé.
- **Ce qui n'est pas vérifié** : le site de chaque mairie (annuaire DILA, non lu dans cette session), et l'absence de flux pour Melun et Meaux. Le flux de ces deux communes n'a pas été testé : le réseau refuse les sites des mairies. Ne pas écrire qu'elles n'en ont pas.
- **Décision demandée au CEO** : garder ce lien tel quel, ou le retirer tant que la couverture n'est pas mesurée.

## 47. V42 bloc 1 : fiches « impact concret » incomplètes et factuelles seulement

- **Constat** : le brief vise 15 à 20 scrutins récents. Les données locales (`outils/scrutins_an.json`) n'en contiennent que 12 avec leur titre complet. Les 7 autres fiches du fichier sont des motions, amendements ou sous-amendements dont le titre est tronqué à la source (`data/auto/scrutin-*.md`) : `impact_citoyen: null` (règle d) du brief). Total : 19 fiches, 12 avec impact.
- **Ce que l'impact dit, et ne dit pas** : chaque impact reprend l'objet du titre et son étape (première lecture, commission mixte paritaire, lecture définitive). Il ne dit pas « ce qui change pour moi ». Le titre décrit ce que le texte vise, pas son contenu. Répondre à « qu'est-ce que ça change ? » exigerait de lire le texte adopté, ce qui n'a pas été fait : le site de l'Assemblée n'est pas joignable depuis la session, et le brief interdit de déduire un effet non écrit dans le titre.
- **Exemple du brief non repris** : « Elle s'applique à partir de 2027 » (PFAS) ne peut pas venir d'un titre. Aucune date d'application n'est écrite.
- **Longueur** : 112 à 197 caractères, en deux phrases au plus. Le brief dit « deux lignes max » ; sur mobile, cela peut dépasser deux lignes affichées.
- **Décision demandée au CEO** : (1) garder ce niveau factuel (objet + étape), ou (2) ouvrir la lecture des textes adoptés, ce qui suppose un accès au site de l'Assemblée et une relecture plus lourde ; (3) confirmer si les 7 entrées à `null` restent dans le fichier ou sont retirées.
- **Ce qui n'est pas vérifié** : l'URL `https://www.assemblee-nationale.fr/dyn/17/scrutins/{n}` suit le motif des données, mais aucune page n'a été ouverte.
- **Écran de prévisualisation** : `mono/apps/mobile/src/app/dev-impact.tsx`, hors `__DEV__` il ne rend rien. Vérifié par export web : la chaîne « Aperçu impacts » et les fiches sont absentes du bundle de production. Pour lire le fichier, `metro.config.js` surveille désormais `data/contenu/` (seul ajout de configuration).
- **Pas testé sur appareil** : l'écran n'a été ni rendu dans un navigateur, ni ouvert sur un téléphone.
