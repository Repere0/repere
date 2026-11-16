# Repère : bilan du projet au 12 novembre 2026

Document de point d'étape pour le porteur et ses partenaires. Les chiffres marqués **mesuré** sont relevés
dans le dépôt `Repere0/repere` et sur GitHub le 12/11/2026. Ceux marqués **estimé** ne sont enregistrés
nulle part : la méthode d'estimation est écrite à côté.

## 1. L'effort fourni

| Indicateur | Valeur | Statut |
|---|---|---|
| Durée du projet | du 13 août au 12 novembre 2026, soit 92 jours | mesuré (premier et dernier commit) |
| Jours avec au moins un commit | 48 | mesuré |
| Commits sur `main` | 894 : 531 écrits par les agents Claude, environ 300 par le porteur, 65 collectes automatiques quotidiennes | mesuré |
| Pull requests | 194 ouvertes, dont 127 fusionnées | mesuré (API GitHub) |
| Issues | 8 | mesuré : le suivi passe par les rapports et les PR, pas par les issues |
| Décisions d'architecture (ADR) | 8 (`docs/adr/`) | mesuré |
| Code | environ 37 000 lignes de TypeScript et JavaScript (dont 9 600 de TSX pour les écrans mobiles), 7 200 de Python (collecte), 760 de shell | mesuré (fichiers suivis) |
| Fichier autonome historique | `app_repere_v18_20.html`, 17 Mo, encore la source des données figées | mesuré |
| Documentation | 199 fichiers Markdown, environ 21 000 lignes (rapports, décisions, procédures, notes de reprise) | mesuré |
| Tests | 64 fichiers, environ 410 cas. La CI mobile en joue 366 à chaque PR, plus des parcours dans un navigateur et un contrôle « même vérité » entre le site et l'application | mesuré |
| Écrans de l'application | 30 fichiers d'écran (Expo, React Native, version web) | mesuré |
| Temps du porteur | **150 à 250 heures** | **estimé** : 48 jours actifs à raison de 3 à 5 heures (consignes, relecture, tests sur téléphone, arbitrages). Aucun relevé d'heures n'existe |
| Tokens consommés | **de l'ordre de 100 à 500 millions** | **estimé**, très incertain : environ 200 sessions d'agent (une par PR, plus des audits). Chaque session relit plusieurs millions de tokens de contexte, l'essentiel en relecture mise en cache. Aucun compteur n'est enregistré dans le dépôt |

**Ce qui a coûté le plus**, d'après les rapports (`RAPPORT-*.md`, notes de reprise du Project) :
- la migration du fichier unique de 17 Mo vers un monorepo (septembre) ;
- la chaîne de collecte des données publiques (Assemblée nationale, OFGL, Répertoire national des élus, DILA, Wikidata), qui tourne sur GitHub parce que l'environnement des agents ne joint pas ces sources ;
- les garde-fous de neutralité. Les 9 invariants sont scellés par une empreinte, et une PR qui les touche sans décision du porteur échoue.

## 2. L'état actuel

### Ce qui marche (en production, vérifié par la CI et par des captures d'écran)
- **Qui décide chez moi** : pour chacune des 1 262 communes d'Île-de-France, la chaîne de décision du maire jusqu'à l'État, avec ce que décide chaque niveau.
- **Où va mon argent** : les comptes officiels de la commune (OFGL), ramenés à 100 € et par habitant, comparés à la médiane d'Île-de-France et à l'année précédente (calculs annoncés comme tels), plus les projets aidés par l'État.
- **Les élus** : fiche de chaque élu, avec les 10 derniers votes solennels d'un député en mots et en couleurs de fait. 376 photos libres (Wikimedia) avec leur crédit.
- **Les votes** : détail de chaque scrutin solennel, « Comprendre ce vote ».
- **Culture civique** : dictionnaire, quiz, « Comment une loi devient loi ».
- **Présidentielle 2027** : règles, étapes, démarches pour voter, carrousel des candidatures déclarées (deux sources de presse par nom).
- **Hors ligne et vie privée** : application installable (PWA), aucun compte ni traceur, deux clés de stockage local seulement, données découpées par département.
- **Partage** : lien par commune (`#melun`), cartes d'image pour l'actualité locale, le calendrier et l'annuaire.

### Ce qui est partiel
- **Candidats et photos des candidats** : jusqu'au 12/11, la collecte quotidienne échouait avant de publier les fichiers de la présidentielle (dépendance installée trop tard dans la chaîne). Le correctif est en cours de fusion (PR #202). Les photos des candidats n'ont jamais été collectées en réel.
- **Résumés « En clair »** : le mécanisme et ses garde-fous sont en place. Aucun résumé n'est encore validé par le porteur, hormis l'exemple de la FAQ.
- **Calendrier parlementaire** : présent, mais son état rempli n'a pas été relu dans cette session.
- **Recherche par code postal** : le côté lecture est prêt, la donnée n'est pas encore ingérée.
- **Appareils réels** : l'interface est auditée dans Chromium seulement. La barre basse iOS, le partage en image et le raccourci d'écran d'accueil restent à confirmer sur iPhone.
- **Hébergement** : production sur Netlify, démonstration sur Vercel. Cloudflare Pages a été décidé, mais rien n'est commencé.

### Ce qui manque
- Les communes hors Île-de-France (le périmètre de la bêta est volontairement régional).
- Les conseils municipaux : seulement un lien officiel, aucune donnée.
- La liste officielle des candidats, qui ne sera publiée qu'en mars 2027 par le Conseil constitutionnel.
- Une validation juridique écrite : droit à l'image des élus et des candidats, mentions légales. Le porteur a pris la responsabilité éditoriale le 12/11, mais aucun juriste n'a relu.
- Un protocole de retour des testeurs compatible avec « aucun traceur ».

## 3. Le pitch de Repère

Repère répond à deux questions que tout le monde se pose sans savoir où chercher : **qui décide chez moi, et où va mon argent ?** On tape le nom de sa commune et l'application montre, du plus proche au plus lointain, qui s'occupe de quoi : l'école, les déchets, les transports, les lois. On y trouve aussi ce que la commune dépense, ramené à 100 € ou à un habitant, et ce que les députés ont réellement voté.

Tout vient de sources officielles : Assemblée nationale, Observatoire des finances locales, Répertoire national des élus. Chaque chiffre porte sa source et sa date. Repère ne donne aucune opinion, ne classe personne et ne transforme pas la politique en jeu. Quand une donnée manque, l'application le dit au lieu d'inventer.

L'application fonctionne sans compte, sans publicité et sans traceur. Elle marche même hors ligne. Une bêta est prévue en décembre 2026 avec dix testeurs en Île-de-France, avant la présidentielle d'avril 2027, pour que chacun puisse comprendre qui le représente avant d'aller voter.

## 4. La roadmap bêta

1. **Fiabiliser la chaîne de données** (décembre, avant les testeurs). Vérifier chaque matin le bilan de collecte : présidentielle publiée, photos des candidats relues une par une grâce à leur identifiant Wikidata, calendrier rempli. Ingérer les codes postaux. Ajouter une alerte quand une étape non bloquante échoue plusieurs jours de suite : c'est ainsi que l'échec de la présidentielle est passé inaperçu.
2. **Tester sur de vrais téléphones**, iPhone et Android : barre basse, installation sur l'écran d'accueil, partage en image, lecture hors ligne. Corriger ce qui casse avant de recruter les testeurs.
3. **Faire relire le cadre juridique** par un juriste : droit à l'image (élus, candidats sans mandat), mentions légales, procédure de retrait des photos, licences des sources.
4. **Ouvrir le banc de dix testeurs** avec un protocole de retour sans traceur : formulaire externe ou entretiens. Rédiger et faire valider les premiers résumés « En clair » des votes les plus consultés.
5. **Choisir l'hébergement définitif** : migration vers Cloudflare Pages ou maintien sur Netlify, avec une procédure de retour arrière (`docs/MONO_PRODUCTION_ROLLBACK.md`) éprouvée une fois.

*Sources : historique Git de `main`, API GitHub (recherche de PR et d'issues), `RAPPORT-*.md`, `docs/adr/`, notes de reprise du Project Repère.*
