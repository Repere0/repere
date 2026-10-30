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
