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

## 48. V42 bloc 2 : guide testeurs, écarts avec le brief

- **Étape 4 reformulée** : le brief demande « Suis un élu ou une commune (en attendant Mes suivis) ». « Mes suivis » est bloqué (§42, invariant 2). Le guide propose d'ouvrir la fiche d'un élu, et écrit noir sur blanc que le suivi n'est pas possible.
- **Adresse de contact** : `repere0@protonmail.com`, reprise de D71 (`docs/contact-email.md`). `docs/testeurs.md` demandait de ne pas l'écrire avant validation du porteur : ancienne consigne, à confirmer.
- **Noms d'onglets non vérifiés** : le guide décrit les fonctions (chercher une commune, le budget, les votes), pas les libellés exacts des onglets, qui n'ont pas été lus sur un appareil.
- **Longueur** : estimée, pas mesurée sur téléphone. Le texte fait environ 1 000 mots, soit une dizaine d'écrans de défilement.
- **Expo Go et SDK 58** : non vérifiés sur appareil (déjà signalé dans `docs/kit-testeur.md`). Le guide demande aux testeurs de signaler un refus.
- **Décision demandée au CEO** : valider l'adresse de contact dans le guide, et le texte de la section « Ce qu'on fera avec vos retours », qui fait des promesses de process.

## 49. V43 (D88) : fichier LICENSE non créé

- **Constat** : D88 demande un fichier `LICENSE` (AGPL-3.0) à la racine. Il n'est **pas créé**.
- **Pourquoi** : le texte officiel n'est pas accessible depuis la session. gnu.org refuse la connexion (403 au tunnel du proxy) et l'outil de lecture de pages refuse la lecture (robots). Aucune copie du texte n'est sur la machine. Le texte n'a pas été reconstitué de mémoire : une licence reconstituée peut être fausse, et une fausse licence vaut pire qu'une licence absente.
- **Ce qui manque** : copier le texte officiel, sans modification, de https://www.gnu.org/licenses/agpl-3.0.txt vers `LICENSE` à la racine. Vérifier que le fichier commence par « GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007 ».
- **Ce qui est fait** : le README et le CONTRIBUTING disent que le fichier n'est pas encore présent, et ne renvoient pas à un `LICENSE` absent. Aucun champ `license` n'est ajouté : il n'y a pas de `package.json` à la racine (vérifié).
- **Risque** : sans fichier de licence, aucune licence n'est accordée explicitement à qui utilise le code. La candidature AIC ne doit pas citer l'AGPL avant l'ajout du fichier (`docs/candidature-aic/brouillon.md`).
- **Décision demandée au CEO** : confirmer l'AGPL-3.0 (choix du porteur, non tranché par la session), puis ajouter le fichier.

## 50. V43 (D91) : contraste du focus clavier en mode sombre, chiffre corrigé

- **Correction de D91** : D91 annonçait un contraste de focus de **1,04:1** en mode sombre et demandait de le noter comme bloquant. **Ce chiffre est retiré.** Il venait de la valeur calculée du contour (`rgb(16,16,16)`), qui n'est pas la couleur réellement peinte à l'écran.
- **Mesure** : sur un élément, dans Chromium, l'anneau peint est blanc, `#FFFFFF`, sur un fond `#161513` : **18,25:1**, au-dessus du seuil de 3:1 du critère 1.4.11. Mesure faite sur les pixels (`scratchpad/focus-dark.png`), pas sur le style calculé. En mode clair, le même type de mesure donne `#101010` sur fond clair, 17,03:1.
- **Ce qui n'est pas mesuré** : les autres types d'éléments en mode sombre (boutons, onglets, champs). Un seul élément a été mesuré.
- **Conséquence** : ce n'est pas un blocage pour la bêta. À vérifier sur iPhone en mode sombre (test prioritaire du résumé V43). Si un élément ne contraste pas, le corriger après la bêta.

## 51. V42 bloc 4 / V43 bloc 1 : performance au-dessus de 500 ms, non optimisée

- **Constat** : mesures dans `docs/audit-performance.md`. En 4G simulée, le premier texte arrive entre 3,7 et 4,1 s sur tous les écrans. En local, environ 700 ms sur la plupart des écrans, 415 à 437 ms sur les onglets.
- **Cause identifiée** : le paquet JavaScript principal, 1,07 Mo (287 Ko compressé). Le texte n'apparaît qu'après son téléchargement et son exécution.
- **Non fait** : aucun découpage du build (chargement des écrans à la demande). Ce changement demande une mesure avant et après sur le même réseau simulé, et il touche la chaîne de build partagée.
- **Non vérifié** : la cible de 400 ms citée pour Apple (aucune source lue dans la session). La compression appliquée par Netlify (en-têtes de réponse non lus). Le comportement sur iPhone en Expo Go (non mesuré).
- **Décision à prendre** : si les testeurs signalent la lenteur, faire la mesure avant et après, puis découper le build.

## 52. V47 (D99) : couleurs de vote adoucies, règle 7 amendée, un conflit de contrastes non résolu

- **Constat** : D99 demande vert sauge, rouge brique et gris perle. Le porteur a autorisé à outrepasser les invariants. La règle 7 de `CLAUDE.md` (et `AGENTS.md`) est amendée, l'empreinte `.claude/invariants.sha256` rescellée avec `outils/derive_contexte.mjs --sceller`. Valeurs : `palette.ts`.
- **Valeurs retenues** : pour `#4A7C59` (D99), contre `#AA4A4A` (D99 : `#A64B4B` ajusté), abstention `#5F6B7A` (D99 : `#6B7280` ajusté).
- **Pourquoi les ajustements** : le test A2 (`theme.test.mjs`, décision du 30/10) exige 4,5:1 sur carte claire et 3:1 sur carte sombre. `#A64B4B` fait 2,99:1 sur carte sombre. `#6B7280` est la couleur du groupe **LIOT** (`COULEURS_GROUPES`), ce qui l'aurait fait confondre avec un groupe.
- **Conflit non résolu, à trancher** : le validateur (skill dataviz, `validate_palette.js`) échoue deux contrôles pour `#4A7C59`, `#AA4A4A`, `#5F6B7A` : ΔE 2,8 rouge/vert en vision déuteranope (plancher 6), et ΔE 14,6 gris/rouge en vision normale (plancher dur 15). Le brief (bloc 3c) demande que les trois couleurs restent distinguables. Avec les deux fonds imposés par le test A2, les trois couleurs sont contraintes dans une même bande de luminosité, ce qui réduit l'écart entre elles. Un rouge plus foncé (`#8B3A2F`, ΔE 8,3 / 15,9) passe le validateur mais échoue le test A2 sur carte sombre (2,20:1).
- **Ce qui compense** : le libellé écrit (« Pour », « Contre », « Abstention ») porte déjà le sens du vote. La couleur n'est jamais seule (invariant 7).
- **Décision demandée au CEO** : (1) accepter ce compromis, ou (2) assouplir le test A2 (seuil sur carte sombre) pour retenir `#8B3A2F`, ou (3) changer le fond de la carte sombre. Le porteur tranche : c'est une décision de contraste, pas de code.
- **Non modifié** : la variante daltonienne (D56 : bleu `#0072B2`, vermillion `#B35900`, gris `#6E7781`).
- **Non vérifié** : le rendu sur iPhone (clair et sombre) et la distinction réelle en vision déficiente. Seuls les contrastes et les ΔE ont été calculés.
## Mises à jour 2026-11-02

- Netlify token régénéré, publication reprend.
- AMO30 non encore déposé. Groupes politiques resteront "Inconnu".
- LICENSE AGPL-3.0 créé.
- Test dev-impact : à exclure du parcours (Claude Code mardi).
- 5 testeurs pilotes : prêts (docs/kit-testeur.md).

## 53. V49-BIS (03/11/2026) : vérifications P0, groupes et « Repère du jour »

### 53.1 Ce qui est vérifié (commandes lancées, résultats relus)

- **Test de parcours (BLOC 1.1)** : `node --test apps/mobile/tests/parcours.test.mjs` échouait avec « écrans sans geste d'accès : dev-impact ». Cause : le test liste les écrans à partir des noms de fichiers, sans distinguer les écrans `__DEV__`. Correction : les écrans `dev-*` sont exclus du contrôle (D115). Aucun bouton ajouté. Résultat : 5/5. Commit `1599d45`.
- **Invariants (BLOC 1.3)** : `node outils/derive_contexte.mjs` : 0 erreur, 3 avertissements (A1 `build-publish.yml` introuvable ; A2 date d'en-tête de `CONTEXTE_PROJET.md` en retard de 69 jours ; A3 une mesure de plus de 45 jours). Le script n'a pas été lancé avec `--sceller`. `tests/invariants.test.mjs` : **61/61**, après `extract-html` et `pnpm build` (étapes de la CI reproduites localement).
- **CLAUDE.md et AGENTS.md** : identiques.
- **TypeScript** : `npx tsc --noEmit` dans `mono/apps/mobile` : 0 erreur.
- **Socle partagé** (liste exacte de la CI, job « Socle partagé et invariants ») : **279/279**.
- **Cleanup (BLOC 1.4)** : 0 `console.log` et 0 `TODO`/`FIXME` dans `mono/apps/mobile/src`. `docs/audit-cleanup.md` n'existe pas dans le dépôt. Rien à corriger.

### 53.2 Ce qui n'est PAS vérifié

- **`tests/runtime.test.mjs`** (tests dans un navigateur) : échoue faute de Chromium Playwright. Le téléchargement est refusé par le proxy (`Download failure`). Le test n'a donc pas été exécuté.
- **`npm test` complet de `mono/`** : 229/231 en local, dont 1 échec = `runtime.test.mjs` (point ci-dessus) et 1 test ignoré. La CI ne lance pas ce test dans son job socle.
- **CI GitHub (état vert/rouge)** : inconnu. L'accès à l'API GitHub n'est pas activé pour cette session (« use add_repo »). Ne pas la déclarer verte.
- **Rendu sur iPhone, contact sur la fiche élu** : non vérifié (vérification statique seulement, comme le constat précédent).

### 53.3 BLOC 2 — groupes politiques : BLOQUÉ, aucune donnée inventée

- **Hypothèse de D125 contredite par le fichier** : `mono/scripts/deputes.json` (et le `mono/data/deputes.json` généré par `extract-html.js`) contient 574 députés, mais **aucun champ groupe**. Chaque entrée n'a que `prenom`, `nom`, `acteurRef`, `dateDebut`. Recherche de « groupe », « Renaissance », « Rassemblement national », « La France insoumise » dans les données générées : aucun résultat.
- **Source officielle inaccessible** : l'archive AMO30 (`data.assemblee-nationale.fr`) répond toujours `CONNECT tunnel failed, response 403` (tentative du 03/11/2026, une seule fois).
- **Conséquence** : `groupeDe()` continue de renvoyer « Inconnu » (`src/lib/groupes.ts`). Aucun fichier `data/deputes-groupes.json` n'est créé, et aucune couleur n'est appliquée à un élu. Une table de groupes écrite de mémoire serait une donnée inventée (règle 1).
- **Pour débloquer** : soit la collecte CI `mono/scripts/collecte-groupes.mjs` produit le fichier au premier run réussi (à vérifier dans le journal de `collecte.yml`, message « groupes : N deputes sur 574 rattaches »), soit un fichier AMO30 est déposé à la main (procédure en §1 ci-dessus).
- **Décision du porteur demandée** : confirmer que D125 est remplacée par « groupes restent Inconnu jusqu'au premier run AMO30 réussi ».

### 53.4 BLOC 3 (sénateurs) : SKIP, comme prévu par D126

Aucun fichier `senateurs.json` dans le dépôt. `outils/senateurs_idf.py` existe mais n'a produit aucune donnée. Rien n'est ajouté.

### 53.5 BLOC 8 — « Repère du jour » (D127, prioritaire) : NON COMMENCÉ, décision requise

Trois problèmes, tous signalés avant exécution (demande du porteur : dire ce qui ne va pas avant d'exécuter) :

1. **Conflit avec D116** : « ZÉRO nouvelle feature, ZÉRO nouvel écran ». Le bloc 8 crée une fonctionnalité complète (rituel quotidien, moteur de rotation, nouveau composant, nouveau bloc sur l'accueil). D127 le met en priorité, sans lever D116 explicitement. **Le porteur doit trancher lequel des deux prévaut.**
2. **Source budget absente** : le bloc 8.1 lit `mono/scripts/comptes-communes.json` (OFGL). Ce fichier n'existe pas. Seuls `comptes-regions.json` et `departments/` sont présents. Sans cette source, la catégorie BUDGET (20 modèles) n'a pas de données publiques vérifiées dans le dépôt.
3. **Sources historiques injoignables** : `api.pop.culture.gouv.fr` (Mérimée) et `query.wikidata.org` répondent « 000 » (refus du proxy) depuis cette session. La catégorie HISTOIRE (10 modèles) ne peut pas être alimentée, ni sourcée. Le fallback du bloc 8.2 (désactiver la catégorie) est la seule option honnête pour l'instant.

Ce qui reste faisable sans nouvelle source : la catégorie ÉLUS/VOTES, à partir de `mono/scripts/deputes.json` et des 12 scrutins solennels (`mono/scripts/scrutins.json`). Même là, D116 doit être levée avant de créer un écran ou un composant.

### 53.6 Ce qui n'a pas été fait, et pourquoi

- Phase 2 (groupes) : bloquée, voir 53.3.
- Phase 3 (sénateurs) : skip, voir 53.4.
- Phase 8 (Repère du jour) : non commencée, voir 53.5.
- Phase 4 (photos), 5 (scrutins complets), 6 (Ponytail), 7 (UX) : non lancées dans cette session. Elles dépendent des décisions ci-dessus.
- Phase 9 (RESUME-v49 / VERDICT-v49) : non produite. Elle sera écrite une fois les décisions du porteur reçues.

### 53.7 Décisions demandées au porteur

1. D116 ou D127 : lequel prévaut pour « Repère du jour » (nouvelle fonctionnalité ou non) ?
2. Groupes : accepter « Inconnu » jusqu'au premier run AMO30 réussi (CI ou dépôt manuel) ?
3. Source budget : fournir `comptes-communes.json` (OFGL), ou abandonner la catégorie BUDGET du bloc 8 ?

## 54. V50-A (03/11/2026) : groupes absents, Repère du jour non livré, CI rouge puis corrigée

### 54.1 Prémisses de la mission contredites par le dépôt

- **`data/am30.json` n'est pas déposé** sur `test/sdk58-expo-go`. Vérifié : absent de l'arbre (`git ls-tree origin/test/sdk58-expo-go data/`) et jamais présent dans l'historique (`git log --all -- '*am30*'`). D133 ne peut donc pas être exécutée.
- **Le « Repère du jour » n'est pas livré.** Aucun fichier `faits-templates`, `faits-journaliers`, `carte-repere-du-jour` ni `faitDuJour` dans la branche. Le seul écran « Aujourd'hui » existant (`mono/packages/core/src/aujourdhui.js`, web) est une fonctionnalité antérieure, distincte du bloc 8 décrit en V49-BIS. BLOCAGES §53.5 indique toujours « non commencé ». Aucune vérification de ce bloc n'a donc été faite (BLOC 2 de V50-A) : il n'y a rien à vérifier en l'état.

### 54.2 BLOC 1 — groupes politiques : BLOQUÉ

Rien n'a été produit. Pas de `data/deputes-groupes.json`, pas de couleur appliquée. `groupeDe()` renvoie toujours « Inconnu ». Aucun groupe n'a été écrit de mémoire (règle 1). Le déblocage dépend du dépôt de `data/am30.json` (ou d'un run CI réussi de `collecte-groupes.mjs`, à confirmer dans le journal de `collecte.yml`).

### 54.3 CI : rouge sur `0eb7482`, cause identifiée et corrigée

- Run `41607858675` (job « Mobile »), étape **« Même vérité sur le site et dans l'application »** (`mono/tests/meme-verite.mjs`) : 8 échecs sur 4 communes (Paris, Boulogne-Billancourt, Meaux, Amponville), tous sur la phrase « Sur 100 € dépensés » (salaires et investissement). Les 279 tests du socle passaient.
- **Cause** : le site écrit « X € de salaires » et « X € pour investir » depuis `rapports()` de `@repere/core` (source unique). L'application recomposait ses propres phrases dans `mono/apps/mobile/src/app/argent.tsx` (« Sur 100 € dépensés, X € vont aux salaires des agents »). Deux textes pour un même fait : c'est exactement ce que le contrôle « même vérité » interdit.
- **Correction** (commit `679d4a9`) : la phrase d'en-tête de la carte « Où vont 100 € dépensés » reprend les valeurs de `rapports()`. Aucun texte nouveau n'a été écrit. Le test n'a pas été assoupli.
- **Effet visible** : le libellé change sur l'écran « Où va cet argent ». Ancien : « Sur 100 € dépensés, 30 € vont aux salaires des agents. » Nouveau : « Sur 100 € dépensés : 30 € de salaires, 22 € pour investir. » À relire par le porteur.
- **Non traité** : `mono/apps/mobile/src/app/index.tsx` lignes 80 et 397 recomposent encore la même phrase (« vont aux salaires des agents »). Le contrôle ne les a pas signalées (il lit un autre texte), mais elles relèvent du même principe. À aligner dans une prochaine passe.

### 54.4 Vérifications réellement faites (commandes lancées)

- `npx tsc --noEmit` (mono/apps/mobile) : 0 erreur, après la correction.
- Socle partagé (liste exacte de la CI, depuis `mono/`) : 279/279, après la correction.
- `derive_contexte.mjs` et invariants 61/61 : vérifiés en V49-BIS, non relancés depuis (aucun changement d'invariant).

### 54.5 Ce qui n'est PAS vérifié

- **`meme-verite.mjs` lui-même** : il exige Chromium (Playwright), impossible à télécharger ici. La correction n'est confirmée que par le run CI qui suit le push de `679d4a9`.
- **`runtime.test.mjs`** : même limite, non exécuté.
- **Rendu iPhone** du nouveau libellé : non vérifié.
- **CI sur `679d4a9`** : en cours au moment de la rédaction. Ne pas la déclarer verte avant le résultat.

### 54.6 Décisions demandées au porteur

1. Déposer `data/am30.json` (ou confirmer que le run CI `collecte-groupes` est la source retenue) pour débloquer les groupes.
2. Confirmer le nouveau libellé « Sur 100 € dépensés : X € de salaires, Y € pour investir » sur l'écran « Où va cet argent », ou demander un autre texte (à écrire dans `@repere/core`, pas dans l'application).
3. Dire si « Repère du jour » (V49-BIS §53.5) est autorisé, et si D116 est levée pour ce cas. Tant que ce n'est pas tranché, le bloc 8 n'existe pas.

## 55. V51 (03/11/2026) : Repère du jour livré (version partielle), téléchargements refusés

### 55.1 Téléchargements (D136, D137) : refusés, passés sans insister

- `curl -L https://nosparlementaires.fr/data/deputes.json` : code 000 (connexion refusée par le proxy).
- `curl -L https://nosparlementaires.fr/data/senateurs.json` : code 000.
- `curl -L https://www.senat.fr/open-data/senateurs.zip` : code 000.
- AMO30 (`data.assemblee-nationale.fr`) : déjà refusé (403, voir §38 et §54).
- **Aucun fichier téléchargé.** Rien n'a été écrit dans `data/`.
- **Point de source à trancher** : même s'ils étaient joignables, `nosparlementaires.fr` n'est pas une source officielle. L'invariant 4 exige « sa source officielle et sa date ». Le fichier sénateurs officiel est celui du Sénat (open data), non joint. Et la licence de NosParlementaires n'a pas été vérifiée : rien ne doit être utilisé sans cela.

### 55.2 Repère du jour (D138) : version partielle livrée

Décision prise : D138 est une décision explicite du porteur, postérieure à D116 ; je la traite comme la levée de D116 pour cette fonctionnalité. À confirmer.

Livré :
- `mono/packages/core/src/repere-du-jour.js` (logique partagée site/mobile, dans `@repere/core`).
- `faitsDuJour({ nom, insee, date, exercice, rapportsComptes, fiche, vote, nbCircos })` : jusqu'à trois faits, un budget et un élu quand ils existent, ordre tiré de (commune, date) par empreinte FNV-1a.
- Chaque fait porte sa source (`comptes`, `comptes-calcul`, `scrutin`, `elus`) ; un calcul est annoncé comme tel (`calcul: true`).
- `mono/apps/mobile/src/ui/carte-repere-du-jour.tsx` : carte « Le Repère du jour », un fait sans source affichable n'est pas montré, pas de carte vide.
- Intégrée EN PREMIER dans `mono/apps/mobile/src/app/(onglets)/chez-vous.tsx` (l'écran « Aujourd'hui » vers lequel l'accueil redirige une fois la commune choisie).
- Tests : `mono/tests/repere-du-jour.test.mjs`, 12 contrôles (stabilité du jour, changement de jour en jour, aucune donnée inventée, sources, repli, signe du solde, nom du député). Ajoutés à `npm test` et à la liste « socle partagé » de la CI.

Écarts par rapport à la mission, à signaler :
- **19 modèles, pas 30** : 12 budget, 7 élus. Aucun fait n'a été écrit pour atteindre un nombre.
- **Pas de `data/faits-templates.json`** : les modèles sont dans `@repere/core`, où le site et le mobile les lisent ensemble. Un JSON sous `data/` ne serait pas lu par le mobile sans nouveau chargeur.
- **Pas de `comptes-communes.json`** : il n'existe pas. Le budget vient de `dernierExercice` / `parHabitant`, la même lecture que l'écran « Aujourd'hui ».
- **Pas de `src/lib/faits-journaliers.ts`** : la rotation est dans `@repere/core`, pour la même raison.
- **Pas d'anti-répétition sur 30 jours** : elle exigerait de stocker l'historique, donc une clé locale de plus. L'invariant 2 en autorise deux seulement (`repere.departement`, `repere.profil`). Sans cette mémoire, un même fait peut revenir après quelques jours.
- **Pas de faits « histoire »** : Mérimée et Wikidata ne répondent pas depuis le proxy. Aucune donnée historique n'est affichée.
- **Pas de bouton « Voir plus »** : hors périmètre livré. Le bouton Partager est présent sur chaque fait.
- **Recouvrement avec l'écran** : les trois réponses de « Aujourd'hui » affichent déjà le budget par habitant et le vote du député, avec les mêmes phrases. Le Repère du jour reprend donc des faits déjà visibles juste en dessous. Intérêt produit à trancher.

### 55.3 Vérifications faites

- `npx tsc --noEmit` (mono/apps/mobile) : 0 erreur.
- Liste « socle partagé » de la CI, exacte : 291/291.
- `npm test` (mono) : 241 pass, 1 échec = `runtime.test.mjs` (Chromium absent, §53.2), 1 ignoré. `invariants.test.mjs` : 61/61.
- Un premier essai de l'invariant 3 a échoué : mon commentaire contenait le mot « classement ». Reformulé, pas de changement de logique.

### 55.4 Non vérifié

- Rendu de la carte sur iPhone (clair, sombre, taille de police élevée).
- Partage : le message contient le texte du fait, le lien `repere://chez-vous` et la source. Testé par lecture du code, pas sur appareil.
- CI sur le commit qui suit : à confirmer après push.

### 55.5 Décisions demandées au porteur

1. Confirmer que D138 lève D116 pour le Repère du jour.
2. Trancher le recouvrement avec les trois réponses de « Aujourd'hui » : garder les deux, ou remplacer par des faits qui n'y figurent pas.
3. Accepter l'absence d'anti-répétition sur 30 jours (ou autoriser une clé locale supplémentaire, ce qui exige une décision explicite sur l'invariant 2).
4. Fournir la source officielle des sénateurs (Sénat open data) et confirmer la licence avant tout import.

### 55.6 CI : attendu du parcours navigateur aligné sur la phrase du socle (03/11/2026)

- **Cause** : `parcours-web.mjs` attendait l'ancienne phrase « Sur 100 € dépensés, N € vont aux salaires ». Depuis `679d4a9`, l'écran « Où va cet argent ? » affiche la phrase issue de `rapports()` : « Sur 100 € dépensés : N € de salaires, M € pour investir ». L'échec (`360px/390px/430px · Où va cet argent ?`) était attendu : la phrase avait changé volontairement.
- **Correction** : l'attendu devient `/Sur 100 € dépensés : \d+ € de salaires/`. Vérifié hors navigateur : l'expression accepte la nouvelle phrase et refuse l'ancienne. Le test de navigateur lui-même n'a pas pu être lancé ici (pas de Chromium) ; le verdict réel viendra de la CI.
- **Non traité, volontairement** : `mono/apps/mobile/src/app/index.tsx` (lignes 80 et 397) recompose encore « vont aux salaires des agents » sur l'accueil. Ce n'est pas une contradiction de chiffres (même montant, autre formulation), mais la phrase de l'accueil et celle de l'écran « Où va cet argent ? » diffèrent. Aligner l'accueil sur le socle est une décision de wording à valider par le porteur ; le contrôle « même vérité » ne le couvre pas.

## 56. V51 (03/11/2026, seconde passe) : Repère du jour placé sous les réponses, rotation corrigée, « Ma rue » respectée

### 56.1 CI rouge sur 3718d06 : la carte repoussait les réponses sous le pli

- Étape « Parcours dans un navigateur » : `390 x 844 : les trois réponses tiennent dans le premier écran [905,1113,1349]`.
- **Cause** : `CarteReperDuJour` était placée en tête de « Chez vous », avant les trois réponses.
- **Mesure locale** (même build, même commune, Meaux, 390 x 844) :
  - sans la carte : réponses à **363, 571 et 807 px** (tiennent) ;
  - avec la carte en tête : **940, 1148 et 1384 px** (ne tiennent pas).
  Une carte en tête ne peut donc pas tenir sur 844 px, quelle que soit sa taille : « en premier » et « Réponses d'abord » (docs/ux/systeme-visuel-2026.md, point 10) sont incompatibles.
- **Décision prise (à confirmer par le CEO)** : la carte est placée **sous les trois réponses**, au même endroit que « Au Parlement cette semaine » (le code le prévoyait déjà : « sous les trois réponses, jamais parmi elles »). Le CEO avait demandé « EN PREMIER » (V51, bloc 1.4) : ce point est écarté, à sa demande de confirmation. Pour revenir en tête, il faut assouplir le test de parcours, pas seulement déplacer la ligne.

### 56.2 La rotation était mauvaise : corrigée

- **Mesure avant correction** (30 jours, fixture de test) : 90 faits affichés, **72 revenaient dans le mois**, **14 étaient identiques à la veille**. Le tirage par empreinte ne tenait pas « jour suivant : une autre sélection ».
- **Correction** : rotation sans mémoire (`tirages`, `pas`) dans `repere-du-jour.js`. Deux faits budget et un élu par jour ; un pas premier avec la longueur de la liste.
- **Mesure après** : **0** identique à la veille, intervalle minimal de **6 jours** pour chaque emplacement.
- **Ce qui ne passe pas** : la non-répétition sur **30 jours**. Elle exige 30 modèles par catégorie ; avec 12 budget et 6 élus, un fait revient au plus tôt après 6 jours. Une mémoire locale résoudrait ce point, mais l'invariant 2 l'interdit (deux clés seulement). **Décision du porteur** si l'invariant doit changer.
- **Test adapté** : « solde budgétaire » cherchait le fait le 3 novembre ; la rotation ne le montre pas forcément ce jour-là. Le test le cherche désormais sur dix jours, et contrôle le signe à chaque occurrence. Le comportement testé n'a pas été relâché.

### 56.3 Bug réel trouvé par le test zoom : « Ma rue » affichait le national

- `zoom-web.mjs` a échoué : « Qui décide ne montre ni l'échelon national ni la région » (texte : « Scrutin n° 8706 de l'Assemblée nationale »).
- **Cause réelle** : la carte ignorait le réglage de niveau. En mode « Ma rue », le vote et la circonscription (nationaux) pouvaient apparaître. L'écran « Chez vous » reste monté sous « Qui décide » : son texte entrait donc dans la lecture de la page.
- **Correction** : chaque modèle porte un échelon (`echelonDe`) ; `faitsDuJour` reçoit le réglage (`niveau`) et filtre **avant** la sélection (`visibleAuNiveau`). Le contrôle `Ma rue` (30 jours) est ajouté à `repere-du-jour.test.mjs`.
- **Ce n'est pas un assouplissement du test** : le national n'apparaît plus en « Ma rue », comme le demande le réglage.

### 56.4 Vérifications faites (commandes lancées)

- `npx tsc --noEmit` (mono/apps/mobile) : 0 erreur, après chaque correction.
- `tests/repere-du-jour.test.mjs` : **14/14**.
- Invariants `tests/invariants.test.mjs` : **61/61** (après `pnpm build` reproduit comme la CI). `node outils/derive_contexte.mjs` : 0 erreur, 3 avertissements (inchangés).
- Navigateur, build web reproduit comme la CI (`expo export` + `pnpm build`), serveurs statiques 8811 et 8821 :
  - `parcours-web.mjs` : 225 contrôles OK, 0 échec, réponses à **363, 571, 807 px** ;
  - `zoom-web.mjs` : 0 échec ;
  - `commune-web`, `recherche-web`, `elections-web`, `partage-texte-web`, `onboarding-web`, `mode-web` : 0 échec ;
  - `meme-verite.mjs` : voir §56.6.

### 56.5 Ce qui n'est pas fait, et pourquoi

- **19 modèles, pas 30** (12 budget, 7 élus). Les élus sont limités à ce que le dépôt publie par commune. Pistes non écrites, à sourcer avant usage : nombre d'adjoints (RNE, champ `adjoints` des fiches), population (exercice). Aucun modèle n'a été écrit pour atteindre un nombre.
- **Téléchargements D136** : `nosparlementaires.fr/data/deputes.json` et `senateurs.json` : code 000 (connexion refusée par le proxy) ; `data.assemblee-nationale.fr` (AMO30) : 403 ; `senat.fr` : 000. Rien écrit dans `data/`. NosParlementaires n'est pas une source officielle au sens de l'invariant 4, et sa licence n'est pas vérifiée : à ne pas utiliser sans cela.
- **Groupes politiques** : toujours « Inconnu » ; aucune donnée AMO30 dans le dépôt.
- **Sénateurs** : skip (D135).
- **Histoire** : skip (sources injoignables).

### 56.6 Dernier contrôle

- « Même vérité » (`meme-verite.mjs`) : lancé en fin de passe, résultat à reporter dans RESUME-v51.md / VERDICT-v51.md.
- `runtime.test.mjs` : à relancer avec le Chromium disponible dans cette session (le chemin Playwright a été contourné par un lien local, sans modifier le dépôt).

## 57. V52 (03/11/2026) : bandeau « Repère du jour » non livré (contrainte de 844 px et cible de 44 px), 22 modèles sur 30

### 57.1 Bandeau en tête : mesuré, non poussé

- Décision CEO D139 : bandeau compact (environ 40 px) au-dessus des trois réponses, un geste ouvre la page complète.
- Code écrit (non commité, hors dépôt) : `/tmp/claude-0/-home-claude/c1806ef1-5d90-52c1-b8b7-3a388e8d0191/scratchpad/bloc1-banniere/` (`chez-vous.patch`, `repere-jour.ts`, `bandeau-repere.tsx`, `repere-du-jour.tsx`).
- Mesure au build web (390 x 844), `parcours-web.mjs` :
  - sans bandeau (état commité) : réponses à **363, 571, 807 px** ;
  - avec bandeau en tête : réponses à **415, 623, 859 px** : la troisième dépasse 844 px de **15 px** ;
  - le bandeau mesure **42 px** : le contrôle « cibles tactiles >= 44 px » échoue sur Aujourd'hui, Qui décide et Le calendrier (360, 390, 430 px).
- Donc deux contrôles de parcours échouent : la règle « Réponses d'abord » (844 px) et la cible de 44 px. La CI serait rouge. Rien n'est poussé dans cet état.
- Pour tenir les 844 px, il faut libérer environ **17 px** dans l'en-tête (15 px pour la troisième réponse, 2 px pour une cible de 44 px), ou assouplir la règle. Les deux sont des décisions produit.
- Options pour le CEO :
  1. Bandeau en tête, la règle « 844 px » ne porte plus que sur la première réponse (changement de règle, à valider).
  2. Bandeau en tête et ligne « Publication Repère » déplacée (dans « D'où vient cette information ? » ou sous le titre) : à mesurer ensuite.
  3. Garder l'état actuel (carte sous les réponses, V51) : la page complète n'a pas de porte d'entrée, donc rien de V52 n'est visible.

### 57.2 Templates : 22 sur 30 (D142)

- Ajouté : trois évolutions entre deux exercices (`b-evolution-depenses`, `b-evolution-recettes`, `b-evolution-dette`). Source `comptes-calcul`, annoncées comme calcul. Sans exercice précédent publié : rien n'est écrit (pas de zéro, pas de pourcentage inventé).
- Total : **22 modèles** (15 budget, 7 élus). Cible : 30. Écart : **8**.
- Candidats refusés, faute de donnée sourcée et exacte dans le dépôt :
  - dotations, CAF, fonctionnement, personnel par catégorie : non publiés par commune dans les données du dépôt ;
  - profession du maire, sexe des conseillers : non publiés ;
  - commission du député : non publiée dans `deputes.json` ;
  - participation d'un député aux scrutins : donnée de présence, interdite (invariant 8) ;
  - nombre de communes par circonscription : les « manquantes » de Seine-et-Marne rendent le compte inexact (505 communes publiées, liste incomplète) ;
  - histoire (Mérimée, Wikidata) : sources injoignables (skip) ; sénateurs : skip (D135).
- Aucun modèle n'a été écrit pour atteindre le nombre.

### 57.3 Vérifications

- `tsc --noEmit` (apps/mobile) : 0 erreur.
- `pnpm build` : OK. Suite de la CI (liste de `mobile.yml`) : **294 / 294**.
- `parcours-web.mjs` (build web avec le nouvel appel) : **225 OK**, réponses à 363 / 571 / 807 px.
- `zoom-web.mjs` : 0 échec.
- Non relancés cette passe : `commune`, `recherche`, `elections`, `partage-texte`, `onboarding`, `mode`, `meme-verite`. Le changement touche uniquement la carte « Repère du jour » ; à relancer en CI.

## 58. V54 (03/11/2026) : bandeau livré, marges resserrées, publication gardée sur « Chez vous », trois infographies

### 58.1 Bandeau (D139, D147, D148)

- Repris de `scratchpad/bloc1-banniere/` : bandeau en tête de « Chez vous », zone tactile 44 px (fond visible 32 px), icône 💡, « Aujourd'hui : {premier fait} » tronqué, chevron. Un geste ouvre `/repere-du-jour`. Vérifié : clic, zone 44 px, clair et sombre.
- **Emplacement : « Chez vous » et non `(onglets)/index.tsx`.** `index.tsx` est l'écran de recherche « Où habitez-vous ? » : il n'a pas de commune choisie, donc pas de fait. Les trois réponses vivent dans `(onglets)/chez-vous.tsx`. C'est là que D139 (« au-dessus des trois réponses ») s'applique.
- Page complète `/repere-du-jour` : les trois faits, leurs sources, le partage, et en pied « Sources : … · Publication du … » (D147).
- `ui/carte-repere-du-jour.tsx` supprimée (remplacée par le bandeau et la page).
- Logique partagée dans `lib/repere-jour.ts` : le bandeau et la page lisent les mêmes faits.

### 58.2 Publication : ligne gardée sur « Chez vous » (à confirmer par le CEO)

- D147 demandait de retirer la ligne « Publication Repère du … » de l'accueil « Chez vous ». **Non fait.** Raison :
  - invariant 9 (`CLAUDE.md`) : les états de fraîcheur doivent être « toujours distinguables à l'écran » ; la ligne est le seul affichage de la date de publication sur l'écran des réponses ;
  - `parcours-web.mjs` ligne 225 vérifie « Publication Repère du … » sur « Chez vous » à 360, 390 et 430 px.
- La date est aussi écrite en pied de la page complète (D147). Il reste donc deux affichages de la même date. À trancher : retirer la ligne de « Chez vous » (et modifier l'invariant 9 ou son test), ou la garder.

### 58.3 Marges et positions (390 x 844, `parcours-web.mjs`)

| État | R1 | R2 | R3 | Règle 844 px |
|---|---|---|---|---|
| Commité avant V54 (sans bandeau) | 363 | 571 | 807 | tenue |
| Bandeau, marges de V52 | 419 | 627 | 863 | cassée de 19 px |
| **Bandeau, marges V54 (final)** | **411** | **613** | **843** | **tenue, 1 px de marge** |

- Ladder de la mission appliqué : marge bandeau → R1 de 12 à 4 px ; marge entre réponses de 8 à 2 px. Le bandeau est dans le même conteneur que les réponses, pour que la marge soit maîtrisée.
- **Cible de 838 px non atteinte** (843 px). Le garde-fou (« accepter jusqu'à 848 ») n'a pas eu à servir : la règle des 844 px est respectée, le test n'a pas été modifié.
- Gain du « hero » (-8 px) : sans objet, aucun hero sur « Chez vous ».
- Marges de 2 px entre réponses : visuellement serrées mais lisibles (capture `captures/chez-vous-390-0.png`).

### 58.4 Infographies (D149 : pas de dépendance, palette existante)

1. **Stat card avec delta chip** : `Tendance` (`ui/visuels.tsx`), dans la fiche budget (`argent.tsx`), sous le chiffre par habitant. « ↑ 1,4 % par rapport à 2024 · calcul Repère ». Couleur neutre (encre sur voile), jamais vert ni rouge (invariant 7). Absente si le N-1 n'est pas publié (`exercicePrecedent` renvoie null) ou si la variation est nulle.
   - **Non posée sur « Chez vous »** : la puce y ajouterait une ligne et ferait sortir R3 du premier écran.
2. **Bar list** : `RepartitionCent` (`ui/visuels.tsx`), « Où vont 100 € » (fiche budget). Une ligne par poste, triée du plus grand au plus petit ; libellé à gauche, montant au centre, barre à droite (6 px, arrondi 3). Piste voile, partie active encre.
   - Écarts par rapport au cahier : le montant est écrit « 47 € » et non « 47 % » (la source parle de « sur 100 € » ; même chiffre, unité du texte) ; le reste s'appelle « Autres (non détaillés) » (le libellé complet tenait sur trois lignes).
3. **Chart vote** : **déjà en place** (`Repartition` : barre pour/contre/abstention, légende avec décompte, libellé d'accessibilité). Utilisé dans `vote.tsx`, `elu.tsx`, `chez-vous.tsx`. Non dupliqué. Un segment à zéro a une largeur nulle : il n'apparaît pas dans la barre ; la légende garde « 0 », comme dans l'exemple du cahier.
   - Remarque : la phrase d'accessibilité de `Repartition` dit « députés ayant pris part au vote ». « Pris part » est une formule de présence ; l'invariant 8 interdit les données de présence. Le texte est à revoir (non modifié ici, hors périmètre V54).

### 58.5 Vérifications (sur le commit final)

- `tsc --noEmit` : 0 erreur. `pnpm build` : OK.
- Suite de la CI (liste de `mobile.yml`) : **294 / 294**. Invariants : **61 / 61**.
- `derive_contexte` (V52, inchangé depuis) : 0 erreur, 3 avertissements.
- Navigateur : `parcours-web` 225 OK ; `zoom-web`, `commune-web`, `recherche-web`, `elections-web`, `partage-texte-web`, `onboarding-web`, `mode-web` : 0 échec ; `meme-verite` : 107 faits, 0 échec.
- Bandeau : clic ouvre `/repere-du-jour` (clair et sombre) ; zone tactile 44 px.
- Infographies : bar list et puce vérifiées en clair et en sombre (captures dans le dossier de travail, hors dépôt).
- Test de thème : le contrôle « aucune feuille de style de module ne fige une couleur » a échoué une fois (feuille du bandeau créée au chargement) ; corrigé par `feuille(...)`, comme le reste du projet.

### 58.6 Non fait ou écarté

- Retrait de la ligne de publication sur « Chez vous » (58.2) : en attente de décision.
- Groupes politiques, sénateurs, photos : skip (D150).
- Non-répétition sur 30 jours : impossible sans mémoire locale (invariant 2).
