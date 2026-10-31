# Auto-évaluation : les 6 dimensions citoyennes

Date : 30/10/2026. Branche `test/sdk58-expo-go`, après V31 bloc 1 (commit 8c42296).

Cette évaluation a été faite à partir du code et des données présents dans le dépôt, et de deux contrôles dans Chromium à 390 px. Elle n'a pas été faite sur iPhone réel. Les scores du brief (5 couvertes sur 6) ne sont pas repris : le code ne les soutient pas.

## Échelle utilisée

- **Couvert** : fonctionne pour tout le territoire annoncé, avec les sources et les limites dites à l'écran.
- **Partiel** : fonctionne pour une part identifiable seulement (un échelon, une région, une fonction). Les manques sont dits à l'écran ou dans ce document.
- **Absent** : rien dans l'application.

Aucune dimension n'atteint « couvert » avec cette échelle. Le score honnête est donc **0 couverte, 6 partielles**.

## Les six dimensions

### 1. Savoir qui décide — partiel

Présent : « Qui décide » et « Mes élus » montrent le maire, le député, et les conseillers départementaux du canton de la commune.

Manques :
- Les sénateurs et les conseillers régionaux ne figurent pas dans les données publiées. L'écran le dit tel quel.
- Les conseillers départementaux ne sont pas cliquables : la fiche élu ne sait pas les ouvrir.
- Pas de photos.

### 2. Où va l'argent — partiel

Présent : les comptes publiés de la commune (exercice 2025) et les comptes régionaux.

Manques :
- Les comptes communaux ne sont disponibles que pour les départements de la phase bêta : 75, 77, 78, 91, 92, 93, 94, 95 (`data/communes-beta.json`, 1 262 communes). Hors Île-de-France, l'écran n'affiche rien pour la commune.
- Les chiffres sont ceux de la source officielle, sans commentaire éditorial.

### 3. Votes des élus — partiel

Présent : les scrutins de l'Assemblée nationale (catalogue `scrutins`) et les votes des députés sur ces scrutins, dans la fiche élu.

Manques :
- Le fichier des groupes politiques (AMO30) n'est pas dans le dépôt. Il doit être téléchargé à la main (`outils/collecte.py`, ligne 59). Sans lui, les votes ne peuvent pas être rattachés à un groupe.
- Pas de votes du Sénat ni des conseils régionaux dans l'application.

### 4. Impact sur ma vie — partiel

Présent : les faits locaux et les publications du fil « Pour vous », avec un filtre par thème (V31 bloc 1). Le rangement par thème repose sur des mots-clés du titre : il est approximatif (« sécurité sociale » est rangé en Sécurité, BLOCAGES 33).

Manques :
- Pas de contenu éditorial qui explique ce que change une loi ou un vote pour la vie quotidienne. C'est le manque principal de cette dimension.
- Le fil ne montre que les publications dont le titre contient un mot-clé, quand un thème est choisi.

### 5. Agir — partiel

Présent : « Mes élus » ; « Voter » ; « Signaler une erreur » sur l'accueil, la fiche élu et « Mes élus ».

Manques :
- « Contacter » ne donne aucun contact direct : aucun courriel d'élu n'est publié dans les données. Le bouton renvoie à la source officielle (Répertoire national des élus), ou affiche « Contact non publié ».
- « Signaler une erreur » n'apparaît que si `EXPO_PUBLIC_CONTACT_EMAIL` est définie. L'adresse officielle est repere0@protonmail.com (BLOCAGES 34). Tant que le CEO ne définit pas la variable, aucun signalement n'est visible.
- Pas de pétition, pas de modèle de courrier, pas d'action en ligne.

### 6. Se préparer aux élections — partiel

Présent : « Voter » affiche le compte à rebours de la présidentielle (1er tour le 18 avril 2027, second tour le 2 mai 2027), un guide en quatre blocs et un lien vers service-public.fr.

Manques :
- Deux entrées seulement. Les législatives sont affichées « Date non fixée », et aucune date n'est inventée.
- Les municipales et sénatoriales de 2026 sont passées, donc non listées.
- Le guide ne donne que des règles générales. Le lien vers maprocuration.gouv.fr n'est pas vérifié : ce site n'est pas joignable depuis l'environnement de travail.
- Les dates sont dans `lib/elections.ts`, vérifiées le 30/10/2026. Elles ne figurent pas dans `data/`, qui n'est pas versionné.

## Ce qui reste pour atteindre 6 sur 6

1. Sénat et conseils régionaux : une source de données, puis un écran, avec la même règle que « Qui décide ».
2. Contacts : une source officielle par élu (courriel publié par l'élu lui-même). Sans elle, « Contacter » reste un lien vers une source.
3. Budgets : étendre la donnée au-delà de l'Île-de-France. Aujourd'hui l'écran est vide ailleurs.
4. Groupes politiques : télécharger AMO30 à la main, puis le rattacher aux votes.
5. Contenu éditorial sur l'impact : décision du CEO sur qui écrit et qui valide.
6. Élections : ajouter les législatives quand la date sera fixée ; vérifier maprocuration.gouv.fr depuis un poste qui y accède.
7. Validation sur iPhone réel, avant toute annonce.

## Décisions à prendre par le CEO

- Le contenu éditorial de la dimension 4 (qui l'écrit, qui le valide).
- La définition de `EXPO_PUBLIC_CONTACT_EMAIL` à minuit (BLOCAGES 34).
- La validation de l'amendement des thèmes (BLOCAGES 33).
