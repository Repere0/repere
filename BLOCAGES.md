# Blocages — session du 30/10/2026

Ce qui n'a pas été fait, pourquoi, et la décision attendue. Rien ici n'a été contourné.

## 1. Groupes politiques des élus (bloc 2, sprint 8 bis) — DÉCISION : téléchargement manuel

**Ce qui existe déjà** : aucun fichier `data/deputes-groupes.json`, aucun `acteurs.json` ni `AMO30` dans le dépôt. `data/deputes.json` ne porte pas le groupe.

**Source** (lue dans `outils/collecte.py`, ligne 59) :
`https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`

**Ce qui est demandé** :
- Télécharger ce fichier à la main depuis data.assemblee-nationale.fr (le classifieur bloque le téléchargement depuis cette session).
- Extraire le JSON et produire `data/deputes-groupes.json` au format :
  `{ "PA123": { "groupe": "<libellé du groupe, tel que publié>", "nom": "..." }, ... }`
- Le déposer dans `data/`.

**Remarque** : `outils/construire_deputes.py` et `outils/pipeline.sh` lisent déjà l'archive extraite dans `data/brut_AMO30/json/acteur`. Le plus simple est de déposer l'archive extraite à cet endroit, puis d'ajouter l'extraction des groupes au pipeline, plutôt que d'ajouter un fichier à part.

**Fallback refusé** : la table de groupes « depuis la mémoire » (20 députés) n'a pas été écrite. Un groupe qu'on ne peut pas citer à sa source est une donnée inventée, et la règle du projet l'interdit. L'application affiche « Inconnu » tant que le fichier manque (`src/lib/groupes.ts`, inchangé).

**Test visuel du badge** (point e) : impossible tant qu'aucun groupe n'est connu.

## 2. Photos des élus (bloc 3, sprint 9) — DÉCISION : ne pas charger de photos depuis l'Assemblée

- **Vérification impossible ici** : la session n'a pas le réseau vers assemblee-nationale.fr, et la commande demandée (`Invoke-WebRequest`, PowerShell) n'existe pas dans ce conteneur. L'URL `.../static/tribun/17/photos/PA[ID].jpg` vient de la mémoire, pas d'une source vérifiée.
- **Décision existante** : `src/ui/avatar.tsx` et l'ADR 0001 disent qu'on n'utilise pas une adresse devinée pour les photos. La stratégie 1 la contredit.
- **Conséquence vie privée** : afficher une photo depuis un serveur tiers envoie l'adresse IP du lecteur à ce serveur, à chaque affichage. La politique de confidentialité et le questionnaire App Store devraient alors le dire. Aujourd'hui, le texte dit « Repère ne publie ni photo ».
- **Droits sur les photos** : à confirmer avant tout usage.
- **Ce qui est fait** : rien. L'avatar à initiales reste l'image unique.
- **Avatar premium (stratégie 2)** : non fait. Le dégradé demande une bibliothèque (`expo-linear-gradient`) absente du projet ; l'ajouter pour un dégradé va contre la règle « pas de dépendance pour quelques lignes ». À décider.

## 3. Contact : adresse e-mail (bloc 4, bloc 5)

- Le brief demande `contact@repere-app.fr` « placeholder à valider CEO ». Cette adresse n'a pas été vérifiée : rien ne prouve qu'elle existe ou qu'elle appartient au projet. La règle « zéro donnée inventée » interdit de la publier dans l'application.
- **Non fait** : le bouton « Signaler un bug », le bouton « Donner mon avis » (mailto), et l'affichage du contact dans « À propos ».
- **Décision attendue** : quelle adresse de contact réelle utiliser (et qui reçoit les messages).
- **Fait** : l'écran « À propos » existe sans contact ; le lien est dans les réglages, sous « Confidentialité ».
- **Fait** : `docs/testeurs.md` décrit la stratégie mailto (recommandée) et le formulaire (à éviter pour l'instant).

## 4. Carte « Cette semaine » (bloc 6, sprint 12) — SPÉCIFICATION INCOMPLÈTE

- Le brief ne contient que la structure de `data/cette-semaine.json`. Les étapes b et suivantes sont absentes.
- Non fait : aucun fichier créé. `data/` est publié tel quel ; un fichier sans spécification de contenu créerait une donnée publique sans règle.
- **Décision attendue** : envoyer la suite du brief (ce que contient chaque semaine, qui l'écrit, à quelle source elle renvoie).

## 5. Blocs bonus (bloc 7) — NON COMMENCÉS

Pas de temps restant consacré au bonus, pour ne pas multiplier les changements non relus avant la distribution.

## 6. expo-doctor — NON VÉRIFIÉ

La commande `npx --yes expo-doctor@latest` a été refusée par le classifieur (téléchargement et exécution d'un paquet). Elle n'a pas été relancée ni contournée. Voir `APP_STORE_READINESS.md`.

## 7. Étape « distribution » (commit « docs(distribution) ») — PARTIELLEMENT CONNUE

Le message fourni commence à l'étape 5 : les étapes 1 à 4 (guide testeurs, script de lancement, checklist, message type) ne sont pas dans la session. Seul `docs/testeurs.md` (stratégie feedback) a été écrit. Le reste n'a pas été inventé.
