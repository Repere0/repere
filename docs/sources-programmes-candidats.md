# Programmes des candidats 2027 : sources ouvertes, licences, faisabilité

Recherche du 13/11/2026. Aucun code, aucune collecte, aucune donnée ajoutée.

Décision du porteur (13/11/2026), qui amende celle du 10/11 : publication
automatique des programmes des candidats déclarés permise **si chaque programme
a une source officielle ET une licence de réutilisation vérifiée**.
Consigne ajoutée le même soir : **données publiques ouvertes uniquement** ; toute
source non clairement identifiée est soumise au porteur (oui / non).

## Recommandation

**NON pour l'instant : aucune source ne remplit les deux conditions à la fois.**

- Ce qui est **officiel** (le site du candidat, la profession de foi) n'est pas
  sous licence ouverte vérifiée, ou n'existe pas encore.
- Ce qui est **sous licence ouverte** (jeux data.gouv.fr) est compilé par des
  **tiers citoyens**, pas par les candidats ni par une institution. Ce sont des
  résumés faits par quelqu'un d'autre, pas le programme.

On garde donc la saisie manuelle, sauf si le porteur répond oui à l'une des
trois questions de la fin. Ce qui reste possible sans rien trancher : **un lien
vers la page programme officielle de chaque candidat** (titre, adresse, date de
vérification), sans en lire ni en reproduire le contenu, sur le modèle de
l'ADR 0005 (site de mairie en lien externe, HTML jamais lu).

## Méthode et limites

- Licences relevées sur la fiche data.gouv.fr de chaque jeu (résultats de
  recherche du 13/11/2026) ou sur la page citée.
- **Non vérifié** : les mentions légales des sites de campagne autres que
  melenchon2027.fr (recherche interrompue à la demande du porteur) ; le contenu
  exact des fichiers ; le fichier `LICENCE-DONNEES.md` de 2027etmoi (lu à
  travers le résumé du README, pas directement).
- Une licence affichée sur data.gouv.fr est une déclaration du producteur. Elle
  ne couvre pas les contenus de tiers repris dans le jeu (citations de presse).

## 1. Sources institutionnelles

| Source | Ce qu'elle publie | Licence | Faisabilité |
|---|---|---|---|
| Conseil constitutionnel | Liste officielle des candidats, attendue mi-mars 2027 ; parrainages | non relevée | Rien sur les programmes aujourd'hui |
| info.gouv.fr | Renvoie aux sites des candidats et aux professions de foi envoyées avant chaque tour | sans objet | Aucune donnée de programme |
| Professions de foi (CNCCEP, ministère de l'Intérieur) | Document officiel de chaque candidat, après la liste officielle | **non vérifiée** | Rien avant mars-avril 2027 ; licence à relever à ce moment-là |
| Vie-publique.fr | Aucun jeu de programmes 2027 trouvé | sans objet | Rien |

Aucune institution ne publie de programme avant la liste officielle.

## 2. Jeux ouverts sur data.gouv.fr (tous produits par des tiers)

| Jeu | Producteur | Licence | Mise à jour | Contenu | Faisabilité |
|---|---|---|---|---|---|
| Mesures fiscales des candidats (LaFacture2027) | Nicolas Martel, à titre personnel | Licence Ouverte 2.0 | 26/10/2026, au fil des annonces | Mesures fiscales pour les particuliers, statut, date, adresse de la source primaire | Licence OK ; **tiers, pas officiel** ; fiscalité seulement. Question 1 |
| Candidatures 2027, statuts sourcés | 2027etmoi | Licence Ouverte 2.0 | 12/11/2026 | 51 personnalités, statut, source datée | Liste, pas programme |
| Prises de parole des candidats | 2027etmoi | Licence Ouverte 2.0 | 23/10/2026 | Interviews, discours, une à trois phrases reformulées | Reformulation par un tiers, pas un programme |
| Programmes par candidat (`data/programmes/<id>.json`) | 2027etmoi, dépôt GitHub seulement, **absent de data.gouv.fr** | Licence Ouverte 2.0 selon le README, hors photos et citations de presse | non relevée | Mesures par thème | Éditeur bénévole **non nommé**. Question 1 |
| Liste des candidats, statut daté | Swipe Your President (120K, SAS) | Licence Ouverte 2.0 | 09/11/2026 | 34 personnes, parti, statut, identifiant Wikidata | Liste, pas programme |
| Positions sourcées, silences et revirements | Swipe Your President | Licence Ouverte 2.0, mensuel | adresse du jeu non retrouvée | Couverture d'une boussole électorale | Outil de proximité : **contraire à l'invariant 3** |
| Positions des candidats, citations et sources | Ça vote ? | **ODbL** | 27/10/2026 | Positions notées de -2 à 2 | Échelle chiffrée : **contraire à l'invariant 3** ; ODbL hors de la liste acceptée |
| Liste des candidats, partis et sources | Hémicycle | Licence Ouverte 2.0 | 13/11/2026 | Liste ; le producteur précise que ce ne sont pas des données officielles | Liste, pas programme |
| Sondages, candidatures, projection | association « Repère 2027 » | Licence Ouverte 2.0 | 25/10/2026 | Sondages et projection | Hors sujet. Voir l'alerte plus bas |

## 3. Sites des candidats et des partis

| Source | Licence relevée | Faisabilité |
|---|---|---|
| melenchon2027.fr (édité par La France insoumise) | CC BY-NC-SA 4.0 pour les textes, sauf mention contraire | Officiel ; **clause non commerciale** et partage à l'identique. Question 2 |
| Autres sites de campagne | **non vérifiée** | Sans licence écrite, le droit d'auteur s'applique : lien seulement |

Même avec un oui à la question 2, un seul candidat serait couvert : publier le
programme de l'un et pas des autres est une inégalité de traitement.

## 4. Ce qui n'est pas réutilisable

- **Poligraph** : code sous AGPL-3.0 ; la fiche de l'API sur data.gouv.fr porte
  « licence non renseignée ». Blocage par la règle du porteur. Le service couvre
  aussi le patrimoine (invariant 8).
- **quiproposequoi2027.fr** : ni éditeur ni licence sur la page d'accueil. Blocage.
- **« Comparateur de programmes »** (1 200 mesures, réutilisation data.gouv.fr) :
  aucun jeu de données identifié, seulement un site. Non vérifié plus loin.
- **Swipe Your President, Ça vote ?** : boussoles électorales. Leurs données
  servent à calculer une proximité : invariant 3.
- **Médias** : aucune licence, écartés sans collecte.
- **« Swipe 2027 (PromethEUs), 602 propositions »** : introuvable.

## 5. Structure proposée (liens seulement, tant que rien n'est tranché)

`data/presidentielle-2027/programmes.json`

```json
{
  "candidatId": "identifiant de candidats.json",
  "titre": "titre du programme, tel que publié",
  "sourceUrl": "adresse de la page officielle",
  "editeur": "qui publie la page",
  "licence": "licence relevée, ou null",
  "dateMiseAJour": "date affichée par la source, ou null",
  "dateVerification": "date du dernier contrôle du lien",
  "themes": [],
  "publier": false
}
```

- `themes` reste vide tant que la source ne fournit pas elle-même ses thèmes :
  les attribuer serait un choix éditorial de Repère.
- `publier: false` par défaut, comme pour les meetings (décision du 10/11).
- Champ absent ou `null` si la donnée manque : jamais de valeur inventée.

## 6. Questions au porteur (oui / non)

1. Un jeu sous Licence Ouverte 2.0 compilé par un **tiers citoyen**
   (2027etmoi, LaFacture2027) compte-t-il comme « source officielle » ?
   Avis : non. C'est le résumé d'un tiers ; Repère en porterait les erreurs.
2. La licence **CC BY-NC-SA** (melenchon2027.fr) est-elle acceptée ?
   Avis : non tant qu'un abonnement payant reste envisagé, et non tant qu'un
   seul candidat est couvert.
3. Faut-il ajouter dès maintenant le **lien vers la page programme officielle**
   de chaque candidat déjà présent dans `candidats.json` ? Avis : oui.

## Alerte hors sujet

Une association loi 1901 nommée **« Repère 2027 »** (repere2027.fr) publie des
jeux sur la présidentielle sur data.gouv.fr. Le nom est très proche du nôtre,
sur le même sujet : risque de confusion, à regarder avant la bêta publique
(antériorité du nom, dépôt de marque). Non vérifié au-delà de la fiche.

## Sources consultées

- https://www.data.gouv.fr/organizations/2027etmoi/
- https://github.com/2027etmoi/2027etmoi
- https://www.data.gouv.fr/datasets/candidatures-a-lelection-presidentielle-2027-statuts-sources
- https://www.data.gouv.fr/datasets/prises-de-parole-des-candidats-a-lelection-presidentielle-2027
- https://www.data.gouv.fr/datasets/mesures-fiscales-des-candidats-a-lelection-presidentielle-2027
- https://www.data.gouv.fr/datasets/candidats-a-lelection-presidentielle-2027-liste-statut-date-de-chaque-candidature-parti-et-famille-politique
- https://www.data.gouv.fr/datasets/positions-des-candidats-a-la-presidentielle-2027-avec-citations-et-sources
- https://www.data.gouv.fr/datasets/candidats-a-lelection-presidentielle-2027-liste-partis-et-sources
- https://www.data.gouv.fr/datasets/presidentielle-2027-sondages-candidatures-et-projection-departementale
- https://www.data.gouv.fr/reuses/swipe-your-president-le-test-de-lelection-presidentielle-2027-ou-chaque-position-de-candidat-est-prouvee
- https://www.data.gouv.fr/reuses/presidentielle-2027-comparateur-de-programmes
- https://www.data.gouv.fr/dataservices/poligraph-api-transparence-politique-affaires-judiciaires-et-fact-checks-rest-json
- https://www.info.gouv.fr/actualite/presidentielle-2027-date-a-retenir-et-informations-cles
- https://melenchon2027.fr/?p=19228
- https://quiproposequoi2027.fr/
