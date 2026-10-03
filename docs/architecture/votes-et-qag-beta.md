# Votes et séances AN — guide technique bêta

## 1. Ce qui existe déjà

La chaîne Assemblée nationale repose sur deux sources distinctes :
- AMO30 : acteurs, mandats et organes. Il permet de relier une circonscription à un acteurRef et de nommer les députés et les groupes.
- Scrutins : positions de vote nominatives et résultats agrégés.

La collecte quotidienne télécharge les deux archives dans data/. Le runner GitHub est nécessaire pour cette étape.

Chaîne des votes : data/brut_Scrutins/*.json → outils/scrutins_an.py → outils/scrutins_an.json → outils/mono_donnees.py → mono/scripts/scrutins.json → mono/scripts/extract-html.js → mono/data/scrutins.json + mono/data/scrutins/<dep>.json.

## 2. Pourquoi le filtre existe

Le filtre produit est volontairement celui des scrutins publics solennels et motions de censure. L'archive est mesurée avant filtrage ; on ne prend pas les 80 derniers scrutins ordinaires puis les solennels.

scrutins_an.py accepte votant sous forme d'objet ou de liste, conserve acteurRef pour pour/contre/abstention, relève les non-votants uniquement pour vérifier qu'ils ne fuient pas, refuse les doublons et les mauvais types, et ne republie ni miseAuPoint ni numPlace.

## 3. Appariement commune → député → vote

commune → circo → deputes.json → acteurRef → scrutins/<departement>.json → scrutin n°N → position p/c/a.

packages/core/src/votes.js impose que les positions soient indexées par numéro de scrutin et que le catalogue et le relevé des positions aient la même date. Si l'appariement n'est pas certain, Repère refuse d'afficher une position.

## 4. Ce que fait déjà le mobile

vote.tsx affiche la position du député, le résultat global, le chemin commune → circonscription → député → Assemblée, l'étape de procédure, les votes précédents et la source officielle.

Chez vous réutilise les mêmes faits via packages/core/src/faits.js.

## 5. Nouvelle couche bêta : détail intégral

scrutins-details.mjs lit l'archive brute et produit mono/scripts/scrutins-details.json.

Pour chaque scrutin retenu : numéro, date, intitulé, type, résultat, URL officielle précise, groupes, décompte du groupe et positions nominatives disponibles avec acteurRef et nom AMO30.

Les non-votants et mises au point restent hors du paquet.

Le fichier est publié comme /data/scrutins-details.json et chargé uniquement à l'ouverture de l'explorateur via adresseScrutinsDetails → chargerScrutinsDetails → chargerSocle. Il bénéficie donc du même cache et de la même garde de génération.

## 6. UX bêta

scrutins.tsx est organisé en trois niveaux : liste des scrutins, détail d'un scrutin, groupes repliés puis députés à la demande.

Le vote du député renvoie vers cet explorateur.

Une position de vote n'est jamais représentée par rouge/vert ou par une couleur de jugement. Le groupe est une catégorie descriptive ; son nom vient de la source. La position reste explicitement Pour, Contre ou Abstention.

Aucun total de votes par député, taux d'accord avec un groupe, score ou classement n'est produit.

## 7. QAG : état réel du dépôt

Le dépôt sait déjà collecter et afficher l'agenda des séances de l'Assemblée nationale via agenda_an.py puis agenda-an.mjs.

En revanche, il n'ingère pas encore le jeu officiel Questions au Gouvernement : questions + réponses.

La source officielle existe en JSON/XML et couvre les séances dédiées depuis juin 2022. Le chantier QAG doit donc être traité comme une ingestion distincte : archive JSON → description du schéma réel → extraction question/réponse → provenance → contrôle d'appariement → couche légère récente + détail à la demande.

Il ne faut pas inventer le schéma à partir de souvenirs : la première exécution sur l'archive réelle doit produire le banc de schéma avant publication.

## 8. Provenance

La source des scrutins est l'Assemblée nationale, Licence Ouverte 2.0, avec date de relevé. Chaque scrutin conserve une URL précise vers son analyse officielle.

## 9. Tests à conserver

- absence de fuite des non-votants ;
- absence de doublon d'acteur dans un scrutin ;
- cohérence des dates catalogue/positions ;
- absence de glissement de rang ;
- nom complet des députés ;
- aucune donnée de présence/absence ;
- aucune URL contenant un code commune ;
- source + licence + date présentes ;
- détail absent = texte explicite, jamais position déduite du groupe.

## 10. Décision produit restante

La seule décision volontairement laissée ouverte est l'usage de couleurs propres aux groupes politiques.

La donnée textuelle des groupes est sûre et déjà exploitable. En revanche, la charte Repère contient une contrainte stricte sur la couleur et interdit que la couleur encode une valeur politique. Avant d'introduire onze couleurs de groupes, il faut donc modifier explicitement la doctrine visuelle et son banc associé. En attendant, les groupes restent identifiables par leur nom et une présentation uniforme.