# BANATIC — préparation d'une intégration (21 octobre 2026)

Ce document prépare, il ne déploie rien. Il sépare ce qui est **vérifié** de ce
qui reste **inconnu**, et ne propose aucune donnée inventée.

---

## 1. Pourquoi : le trou constaté à l'écran

L'écran « Chez vous » nomme l'intercommunalité et s'arrête là. Mesuré le
21/10/2026 sur les données servies (`mono/data/departments/77.json`, commune
77284) :

```
clefs agglo : nom, delegues
competences ? (absent)
nb communes ? (absent)
siren ?       (absent)
```

Le dossier de référence du porteur demande, pour cet écran, « CA du Pays de
Meaux — **26 communes** » et les compétences réelles (« Transports & mobilités,
Tri & déchets, Zones économiques, Sports & culture »). **Aucune de ces deux
informations n'existe dans la donnée publiée aujourd'hui.** Les afficher sans
source serait du contenu inventé pour remplir une maquette.

Ce que l'application dit à la place, via `@repere/core`, est une phrase générique
et prudente (« Décide : les déchets, l'eau, et **souvent** les piscines et les
médiathèques »). Elle est honnête, mais elle n'est pas la compétence de **cette**
intercommunalité.

## 2. Ce qui est vérifié sur le runner

**Le runner sait déjà télécharger depuis data.gouv.fr.** `outils/collecte.py`
tire plusieurs sources par URL de ressource stable :

```python
"url": "https://www.data.gouv.fr/api/1/datasets/r/4d0b70e1-7757-43cc-882b-5c3b04fe38b4",
```

Ajouter BANATIC passerait donc par **exactement le même mécanisme**, sans
nouveauté d'architecture. La forme d'une entrée de `SOURCES` est figée et porte
déjà tout ce que l'invariant 4 exige :

```python
{
    "cle": "...",            # identifiant court
    "titre": "...",          # producteur nommé dans le titre
    "url": "...",            # ressource stable data.gouv.fr
    "fichier": "...",        # nom du fichier déposé
    "poids": "...",          # mesuré, pas estimé
    "cadence": "...",        # à quelle fréquence la source bouge
    "licence": "Licence ouverte",
    "note": "...",           # provenance à écrire telle quelle si tiers
}
```

**Le conteneur de l'agent, lui, ne joint pas data.gouv.fr** : seul le runner
télécharge. Ce n'est pas un obstacle — c'est le fonctionnement normal depuis le
13/09.

## 3. Ce qui reste inconnu, et pourquoi

**Je n'ai pas pu énumérer les fichiers que BANATIC publie.** Deux jeux de données
existent sur data.gouv.fr :

- « BAse NATionale sur l'Inter-Communalité BANATIC » (`5d501be86f44414c3efc77ad`)
- « Base nationale sur les intercommunalités BANATIC » (`5e1f20058b4c414d3f94460d`)

Les pages sont rendues en JavaScript : l'outil de lecture ne reçoit que la
navigation et le pied de page. L'API (`/api/1/datasets/...`), qui donnerait la
liste des ressources, leur format, leur licence et leur date, demande une
autorisation que le porteur n'était pas là pour accorder.

**Donc, non vérifié à ce stade :**

- l'identifiant exact de la ressource « compétences des EPCI » ;
- l'identifiant exact de la ressource « périmètre » (communes membres) ;
- les formats, poids et dates de mise à jour ;
- la licence propre au jeu de données (le pied de page du site annonce la
  Licence Ouverte 2.0 « sauf indication contraire » — ce n'est pas une preuve).

**Comment lever ce point en une minute :** le porteur colle dans un message l'URL
`https://www.data.gouv.fr/api/1/datasets/base-nationale-sur-les-intercommunalites/`
(ou l'un des deux identifiants ci-dessus). L'autorisation accordée, la liste des
ressources se lit d'un appel et ce document se complète.

## 4. La forme qu'aurait l'intégration

À suivre dans cet ordre, qui est celui de la skill `ingerer-une-source` :

1. **Relever** la ressource BANATIC et l'ajouter à `SOURCES` dans
   `outils/collecte.py`, avec producteur, licence, cadence et poids **mesurés**.
2. **Normaliser** dans un script dédié de `mono/scripts/`, sur le modèle de
   `rne` et `ofgl-decrire` : écrire un fichier intermédiaire, et **publier le
   delta** (combien d'EPCI identiques, différents, absents d'un côté) comme le
   fait déjà `ofgl-decrire`. Le porteur exige ce delta avant toute fusion.
3. **Porter** dans le fichier départemental deux champs seulement, sous `agglo` :
   `communes` (le nombre) et `competences` (la liste publiée). Rien de plus : le
   fichier est servi au téléphone et chaque octet compte.
4. **Afficher** sur « Chez vous », dans la rubrique « Intercommunalité » qui
   porte déjà la couleur de l'échelon `agglo`, avec sa pastille de source.
5. **Garder** : une garde qui échoue si une compétence affichée n'existe pas dans
   la donnée servie, et une autre qui vérifie que l'absence produit la phrase
   générique actuelle, jamais une liste vide (invariant 5).

## 5. Les limites à ne pas franchir

- **La compétence affichée est celle que BANATIC publie, mot pour mot.** Repère
  ne reformule pas une compétence en langage « clair » sans dire que c'est une
  reformulation : ce serait interpréter un acte administratif.
- **Une compétence publiée n'est pas une action.** BANATIC dit ce que l'EPCI a
  le droit de faire, pas ce qu'il fait. La phrase affichée doit le refléter, sinon
  elle laisse croire à une activité non constatée (invariant 5, et la règle
  promesse ≠ position ≠ vote ≠ action).
- **Pas de date, pas d'affichage.** Si la ressource ne porte pas de date de mise
  à jour exploitable, la compétence ne s'affiche pas : l'invariant 4 exige une
  date par chiffre et par fait.
- **Rien n'est déployé** : l'ajout d'une source passe par une PR, l'épreuve, et
  l'accord du porteur.

---

## Sources

- [Base nationale sur les intercommunalités BANATIC](https://www.data.gouv.fr/fr/datasets/base-nationale-sur-les-intercommunalites/)
- [BAse NATionale sur l'Inter-Communalité BANATIC](https://www.data.gouv.fr/fr/datasets/base-nationale-sur-linter-communalite/)
- [Liste et composition des EPCI à fiscalité propre (collectivites-locales.gouv.fr)](https://www.collectivites-locales.gouv.fr/index.php/etudes-et-statistiques/acces-aux-statistiques-par-thematique/perimetre-des-intercommunalites/liste-et-composition-des-epci-fiscalite-propre)
