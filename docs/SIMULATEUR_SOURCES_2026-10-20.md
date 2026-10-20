# Simulateur « Ce que vous payez à la commune » — sources et points ouverts

Décision du porteur (20/10/2026) : méthode neutre validée. Ce document trace ce qui est
**vérifié** (relevé sur le runner, workflow `decrire-sources-fiscales.yml`, annotations de
contrôle), ce qui est **juridique** (source officielle lue), et ce qui reste **ouvert**.
Rien ici n'est publié : la publication des données passe par la chaîne de collecte, sur `main`.

## 1. Données vérifiées (relevé du 20/10/2026, runner GitHub)

| Jeu | Producteur | Licence | Modifié | Contenu utile |
|---|---|---|---|---|
| `fiscalite-locale-des-particuliers-geo` | DGFiP | Licence Ouverte v2.0 (Etalab) | 2026-05-21 | 174 668 lignes, exercices 2021 à 2025 (34 874 communes en 2025). Champs : `exercice`, `insee_com`, `com`, `libcom`, `dep`, `taux_global_tfb` (taxe foncière bâti, en %), `taux_plein_teom` (ordures ménagères, en %, vide si non levée), `taux_global_th` (résidences secondaires). |
| `balances-comptables-des-collectivites-et-des-etablissements-publics-locaux-avec-la-presentation-croisee-nature-fonction-2025` | DGFiP | Licence Ouverte v2.0 (Etalab) | 2026-07-13 | 5 326 293 lignes, exercice 2025. Champs : `ident`, `insee` (vide pour les groupements), `ndept`, `nomen` (M14, M52, M57, M57A), `fonction` (code à 3 chiffres ou plus), `compte`, `obnetdeb`, `obnetcre`, `sd`, `sc`. Pas de libellé de fonction dans ce jeu. |

Mesures sur le runner : `fonction` vaut `None` dans 1 355 880 lignes et prend plus de
cent valeurs distinctes ; `nomen` vaut M57 dans 5 319 105 lignes.

## 2. Juridique (taxe d'enlèvement des ordures ménagères)

- La TEOM est assise sur la même base que la taxe foncière sur les propriétés bâties ;
  elle est établie au nom du propriétaire (ou de l'usufruitier). Source : CGI, article 1522,
  et la page DGCL « Taxe d'enlèvement des ordures ménagères » (sans date de mise à jour
  visible ; elle cite une version du CGI de 2018).
- Le propriétaire peut la récupérer de plein droit auprès du locataire, sans frais de gestion.
  Même source (CGI, article 1522).

Les articles de blogs (immobilier, forums) n'ont pas été retenus comme sources.

## 3. Points ouverts (à trancher avant tout affichage de chiffre)

1. **Libellés des fonctions.** Le jeu nature-fonction ne donne aucun nom de domaine. Le
   premier chiffre du code de fonction donne le domaine (les codes sont à trois chiffres :
   020, 021, 025… appartiennent au domaine 0). Source trouvée, **provisoire** : fichier DGCL
   « M57 Plan de compte développé, modèle de compte administratif voté par fonction »
   (https://collectivites-locales.gouv.fr/files/finances-locales/M57/IBC%202025/2024-M57-M57_D-fonction-CA%20avec%20budget%20vert.pdf).
   Il donne les dix libellés (0 Services généraux ; 1 Sécurité ; 2 Enseignement, formation
   professionnelle, apprentissage ; 3 Culture, vie sociale, jeunesse, sports, loisirs ;
   4 Santé et action sociale ; 5 Aménagement des territoires et habitat ; 6 Action économique ;
   7 Environnement ; 8 Transports ; 9 Fonction en réserve). Mais il est **sans date**, et sa
   portée (communes ou départements) n'est pas écrite. À confirmer avant publication, par
   l'instruction budgétaire M57 en vigueur pour le bloc communal.
2. **Définition de « dépense ».** Choisir les comptes (classes 6 et 2, débit) et vérifier la
   somme commune par commune contre les agrégats publiés de l'OFGL (`ofgl-base-communes`),
   sur Meaux 2025 d'abord. Un écart non expliqué bloque la publication.
3. **Chemin de publication.** L'ingesteur s'ajoute à `outils/pipeline.sh` (chaîne du `main`),
   donc après relecture de la PR et accord du porteur, comme les autres sources.
4. **Profils.** Propriétaire : taux de la taxe foncière de la commune, sans montant en euros
   (la valeur locative du bien est une donnée personnelle que Repère ne demande pas).
   Locataire : la TEOM est en général répercutée (point 2 juridique). Famille et étudiant :
   pas de taxe locale directe dans les cas courants, à formuler sans affirmer une règle que
   la source ne donne pas.
5. **Nom de l'écran.** « Mon impact personnel » laisse entendre une évaluation personnelle ;
   proposition : « Ce que vous payez à la commune ». À valider par le porteur.
6. **Interdits de formulation** (test de neutralité à écrire avant l'écran) : « gain »,
   « perte », « retour direct », « valeur réelle », « coût réel », « net » et toute somme
   qui additionne plusieurs profils ou compare deux communes.
