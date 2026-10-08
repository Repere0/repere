# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **3175**
- Fichiers ouverts pour le tirage : **3000** (pas de 1)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **152**
- Fichier montre en entier plus bas : `PA793146.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `acteur.@xmlns` | texte | 3000 | http://schemas.assemblee-nationale.fr/referentiel |
| `acteur.uid.@xmlns:xsi` | texte | 3000 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uid.@xsi:type` | texte | 3000 | IdActeur_type |
| `acteur.uid.#text` | texte | 3000 | PA1001 · PA1002 |
| `acteur.etatCivil.ident.civ` | texte | 3000 | M. · Mme |
| `acteur.etatCivil.ident.prenom` | texte | 3000 | Marc-Philippe · Yves |
| `acteur.etatCivil.ident.nom` | texte | 3000 | Daubresse · Dauge |
| `acteur.etatCivil.ident.alpha` | texte | 3000 | Daubresse · Dauge |
| `acteur.etatCivil.ident.trigramme.@xmlns:xsi` | texte | 2474 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.ident.trigramme.@xsi:nil` | texte | 2474 | true |
| `acteur.etatCivil.infoNaissance.dateNais` | texte | 2983 | 1953-08-01 · 1935-01-26 |
| `acteur.etatCivil.infoNaissance.villeNais` | texte | 2151 | Lille · Fontevraud-l'Abbaye |
| `acteur.etatCivil.infoNaissance.depNais` | texte | 1998 | Nord · Maine-et-Loire |
| `acteur.etatCivil.infoNaissance.paysNais` | texte | 1786 | France · Maroc |
| `acteur.etatCivil.dateDeces.@xmlns:xsi` | texte | 2733 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.dateDeces.@xsi:nil` | texte | 2733 | true |
| `acteur.profession.libelleCourant` | texte | 2078 | Ancien directeur d'une société de recrutement · Inspecteur général de l'équipement |
| `acteur.profession.socProcINSEE.catSocPro` | texte | 2099 | Anciens artisans, commerçants, chefs d'entreprise · Cadres de la fonction publique, professions intellectuelles et  artistiques |
| `acteur.profession.socProcINSEE.famSocPro` | texte | 2099 | Retraités · Cadres et professions intellectuelles supérieures |
| `acteur.uri_hatvp.@xmlns:xsi` | texte | 2475 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uri_hatvp.@xsi:nil` | texte | 2475 | true |
| `acteur.adresses.adresse[]` | liste | 2080 | de 2 a 11 entrees |
| `acteur.adresses.adresse[].@xmlns:xsi` | texte | 9000 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse[].@xsi:type` | texte | 9000 | AdressePostale_Type · AdresseTelephonique_Type |
| `acteur.adresses.adresse[].uid` | texte | 9000 | AD386857 · AD395657 |
| `acteur.adresses.adresse[].type` | texte | 9000 | 0 · 11 |
| `acteur.adresses.adresse[].typeLibelle` | texte | 9000 | Adresse officielle · Téléphone |
| `acteur.adresses.adresse[].poids` | texte/vide | 9000 | 1 · 22 |
| `acteur.adresses.adresse[].adresseDeRattachement` | texte/vide | 9000 | AD386857 · AD726542 |
| `acteur.adresses.adresse[].intitule` | texte/vide | 2800 | Assemblée nationale, · Casier de la Poste, |
| `acteur.adresses.adresse[].numeroRue` | texte/vide | 2800 | 126 · 7 |
| `acteur.adresses.adresse[].nomRue` | texte/vide | 2800 | Rue de l'Université, · Avenue Roger Schwob |
| `acteur.adresses.adresse[].complementAdresse` | texte/vide | 2800 | Palais Bourbon, · BP 49 |
| `acteur.adresses.adresse[].codePostal` | texte/vide | 2800 | 75355 · 33150 |
| `acteur.adresses.adresse[].ville` | texte/vide | 2800 | Paris 07 SP · Cenon |
| `acteur.adresses.adresse[].valElec` | texte/vide | 6200 | 01 40 63 75 53 · 01 40 63 79 37 |
| `acteur.mandats.mandat[]` | liste | 2992 | de 2 a 814 entrees |
| `acteur.mandats.mandat[].@xmlns:xsi` | texte | 97256 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.mandats.mandat[].@xsi:type` | texte | 97256 | MandatSimple_Type · MandatMission_Type |
| `acteur.mandats.mandat[].uid` | texte | 97256 | PM391145 · PM778068 |
| `acteur.mandats.mandat[].acteurRef` | texte | 97256 | PA1001 · PA1002 |
| `acteur.mandats.mandat[].legislature` | texte/vide | 97256 | 13 · 14 |
| `acteur.mandats.mandat[].typeOrgane` | texte | 97256 | DELEGBUREAU · DELEGSENAT |
| `acteur.mandats.mandat[].dateDebut` | texte | 97256 | 2007-06-28 · 2020-10-20 |
| `acteur.mandats.mandat[].datePublication` | texte/vide | 97256 | 2010-03-23 · 2012-06-27 |
| `acteur.mandats.mandat[].dateFin` | texte/vide | 97256 | 2008-10-08 · 2010-11-13 |
| `acteur.mandats.mandat[].preseance` | texte/vide | 97256 | 24 · 4 |
| `acteur.mandats.mandat[].nominPrincipale` | texte | 97256 | 0 · 1 |
| `acteur.mandats.mandat[].infosQualite.codeQualite` | texte/vide | 97256 | Membre · membre |
| `acteur.mandats.mandat[].infosQualite.libQualite` | texte | 97256 | Membre · membre |
| `acteur.mandats.mandat[].infosQualite.libQualiteSex` | texte/vide | 97256 | Membre · membre |
| `acteur.mandats.mandat[].organes.organeRef` | texte | 97135 | PO391141 · PO420388 |
| `acteur.mandats.mandat[].libelle` | texte/vide | 6035 | Mise en place du plan de relance · La pratique d'une activité physique et sportive pour les élèves et les étudiants |
| `acteur.mandats.mandat[].missionSuivanteRef` | texte/vide | 6035 | PM773756 · PM789978 |
| `acteur.mandats.mandat[].missionPrecedenteRef` | texte/vide | 6035 | PM769451 · PM786854 |
| `acteur.mandats.mandat[].suppleants` | vide | 4803 |  |
| `acteur.mandats.mandat[].chambre` | vide | 3196 |  |
| `acteur.mandats.mandat[].election.lieu.region` | texte/vide | 3373 | Auvergne-Rhône-Alpes · Hauts-de-France |
| `acteur.mandats.mandat[].election.lieu.regionType` | texte/vide | 3373 | Métropolitain · Collectivités d'outre-mer et Nouvelle-Calédonie |
| `acteur.mandats.mandat[].election.lieu.departement` | texte/vide | 3373 | Rhône · Nord |
| `acteur.mandats.mandat[].election.lieu.numDepartement` | texte/vide | 3373 | 59 · 37 |
| `acteur.mandats.mandat[].election.lieu.numCirco` | texte/vide | 3373 | 13 · 23 |
| `acteur.mandats.mandat[].election.causeMandat` | texte/vide | 3373 | élections générales · élection partielle, suite à l'annulation de l'élection d'un député |
| `acteur.mandats.mandat[].mandature.datePriseFonction` | texte/vide | 3373 | 2002-06-19 · 2002-12-16 |
| `acteur.mandats.mandat[].mandature.causeFin` | texte/vide | 3373 | Fin de législature · Annulation de l'élection sur décision du Conseil constitutionnel |
| `acteur.mandats.mandat[].mandature.premiereElection` | texte | 3373 | 0 · 1 |
| `acteur.mandats.mandat[].mandature.placeHemicycle` | texte/vide | 3373 | 424 · 178 |
| `acteur.mandats.mandat[].mandature.mandatRemplaceRef` | texte/vide | 3373 | PM267876 · PM386168 |
| `acteur.mandats.mandat[].collaborateurs` | vide | 3234 |  |
| `acteur.etatCivil.infoNaissance.paysNais.@xmlns:xsi` | texte | 1214 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.paysNais.@xsi:nil` | texte | 1214 | true |
| `acteur.etatCivil.ident.trigramme` | texte | 526 | ADA · JGD |
| `acteur.uri_hatvp` | texte | 525 | https://www.hatvp.fr/pages_nominatives/david-alain · https://www.hatvp.fr/pages_nominatives/guedj-jerome |
| `acteur.etatCivil.dateDeces` | texte | 267 | 2025-02-16 · 2022-01-01 |
| `acteur.mandats.mandat[].suppleants.suppleant.dateDebut` | texte | 1052 | 2002-06-19 · 2002-12-15 |
| `acteur.mandats.mandat[].suppleants.suppleant.dateFin` | texte/vide | 1052 | 2007-06-19 · 2012-06-19 |
| `acteur.mandats.mandat[].suppleants.suppleant.suppleantRef` | texte | 1052 | PA267501 · PA333972 |
| `acteur.mandats.mandat[].election.refCirconscription` | texte | 1307 | PO230806 · PO230733 |
| `acteur.etatCivil.infoNaissance.villeNais.@xmlns:xsi` | texte | 849 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.villeNais.@xsi:nil` | texte | 849 | true |
| `acteur.etatCivil.infoNaissance.depNais.@xmlns:xsi` | texte | 1002 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.depNais.@xsi:nil` | texte | 1002 | true |
| `acteur.profession.libelleCourant.@xmlns:xsi` | texte | 922 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.libelleCourant.@xsi:nil` | texte | 922 | true |
| `acteur.adresses.adresse.@xmlns:xsi` | texte | 843 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse.@xsi:type` | texte | 843 | AdresseSiteWeb_Type · AdressePostale_Type |
| `acteur.adresses.adresse.uid` | texte | 843 | AD317085 · AD317633 |
| `acteur.adresses.adresse.type` | texte | 843 | 23 · 0 |
| `acteur.adresses.adresse.typeLibelle` | texte | 843 | Url sénateur · Adresse officielle |
| `acteur.adresses.adresse.poids` | texte/vide | 843 | 1 |
| `acteur.adresses.adresse.adresseDeRattachement` | vide | 843 |  |
| `acteur.adresses.adresse.valElec` | texte | 808 | https://www.senat.fr/senateur/debre_isabelle04081k.html · https://www.senat.fr/senateur/del_picchia_robert98018t.html |
| `acteur.mandats.mandat[].organes.organeRef[]` | liste/texte | 410 | de 2 a 7 entrees · PO706466 · PO709261 |
| `acteur.profession.socProcINSEE.catSocPro.@xmlns:xsi` | texte | 901 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.catSocPro.@xsi:nil` | texte | 901 | true |
| `acteur.profession.socProcINSEE.famSocPro.@xmlns:xsi` | texte | 901 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.famSocPro.@xsi:nil` | texte | 901 | true |
| `acteur.adresses.adresse.intitule` | texte | 35 | Casier de la Poste, · Assemblée nationale, |
| `acteur.adresses.adresse.numeroRue` | texte/vide | 35 | 126 |
| `acteur.adresses.adresse.nomRue` | texte/vide | 35 | Rue de l'Université, · Rue de l'université, |
| `acteur.adresses.adresse.complementAdresse` | texte/vide | 35 | Palais Bourbon, |
| `acteur.adresses.adresse.codePostal` | texte | 35 | 75355 |
| `acteur.adresses.adresse.ville` | texte | 35 | Paris 07 SP |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[]` | liste | 132 | de 2 a 6 entrees |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].qualite` | texte | 472 | M. · Mme |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].prenom` | texte | 472 | Thomas · Bernard |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].nom` | texte | 472 | Jacquelin · Combes |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].dateDebut` | vide | 472 |  |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].dateFin` | vide | 472 |  |
| `acteur.adresses.@xmlns:xsi` | texte | 77 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.@xsi:nil` | texte | 77 | true |
| `acteur.mandats.mandat.@xmlns:xsi` | texte | 8 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.mandats.mandat.@xsi:type` | texte | 8 | MandatMission_Type · MandatParlementaire_type |
| `acteur.mandats.mandat.uid` | texte | 8 | PM287498 · PM885958 |
| `acteur.mandats.mandat.acteurRef` | texte | 8 | PA497 · PA643110 |
| `acteur.mandats.mandat.legislature` | texte/vide | 8 | 12 · 15 |
| `acteur.mandats.mandat.typeOrgane` | texte | 8 | MINISTERE · SENAT |
| `acteur.mandats.mandat.dateDebut` | texte | 8 | 2002-12-24 · 2026-10-01 |
| `acteur.mandats.mandat.datePublication` | texte/vide | 8 | 2002-12-26 |
| `acteur.mandats.mandat.dateFin` | texte/vide | 8 | 2020-08-01 · 2020-06-24 |
| `acteur.mandats.mandat.preseance` | texte | 8 | 1 · 20 |
| `acteur.mandats.mandat.nominPrincipale` | texte | 8 | 1 |
| `acteur.mandats.mandat.infosQualite.codeQualite` | texte | 8 | en mission · Sénateur |
| `acteur.mandats.mandat.infosQualite.libQualite` | texte | 8 | en mission · SENATEUR |
| `acteur.mandats.mandat.infosQualite.libQualiteSex` | texte | 8 | en mission · Sénateur 5ème République |
| `acteur.mandats.mandat.organes.organeRef` | texte | 8 | PO268781 · PO78718 |
| `acteur.mandats.mandat.libelle` | texte | 1 | La préparation du débat national sur les énergies |
| `acteur.mandats.mandat.missionSuivanteRef` | vide | 1 |  |
| `acteur.mandats.mandat.missionPrecedenteRef` | vide | 1 |  |
| `acteur.mandats.mandat.suppleants` | vide | 7 |  |
| `acteur.mandats.mandat.chambre` | vide | 7 |  |
| `acteur.mandats.mandat.election.lieu.region` | texte/vide | 7 | Pays de la Loire · Ile-de-France |
| `acteur.mandats.mandat.election.lieu.regionType` | texte/vide | 7 | Métropolitain · Dom |
| `acteur.mandats.mandat.election.lieu.departement` | texte/vide | 7 | Maine-et-Loire · Val-de-Marne |
| `acteur.mandats.mandat.election.lieu.numDepartement` | texte | 7 | 84 · 49 |
| `acteur.mandats.mandat.election.lieu.numCirco` | texte/vide | 7 | 3 · 9 |
| `acteur.mandats.mandat.election.causeMandat` | texte/vide | 7 | remplacement d'un député ayant démissionné pour cause d’incompatibilité prévue aux arti... |
| `acteur.mandats.mandat.mandature.datePriseFonction` | texte/vide | 7 | 2020-08-01 · 2020-06-24 |
| `acteur.mandats.mandat.mandature.causeFin` | texte/vide | 7 | Démission · Démission avant entrée en fonction |
| `acteur.mandats.mandat.mandature.premiereElection` | texte | 7 | 0 |
| `acteur.mandats.mandat.mandature.placeHemicycle` | vide | 7 |  |
| `acteur.mandats.mandat.mandature.mandatRemplaceRef` | vide | 7 |  |
| `acteur.mandats.mandat.collaborateurs` | vide | 7 |  |
| `acteur.mandats.mandat.election.refCirconscription` | texte | 3 | PO717890 · PO718496 |
| `acteur.mandats.mandat[].collaborateurs.collaborateur.qualite` | texte | 2 | M. |
| `acteur.mandats.mandat[].collaborateurs.collaborateur.prenom` | texte | 2 | Ambroise · Matteo |
| `acteur.mandats.mandat[].collaborateurs.collaborateur.nom` | texte | 2 | de Rancourt · Pavone |
| `acteur.mandats.mandat[].collaborateurs.collaborateur.dateDebut` | vide | 2 |  |
| `acteur.mandats.mandat[].collaborateurs.collaborateur.dateFin` | vide | 2 |  |
| `acteur.etatCivil.infoNaissance.dateNais.@xmlns:xsi` | texte | 17 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.dateNais.@xsi:nil` | texte | 17 | true |
| `acteur.mandats.mandat[].collaborateurs[]` | liste/vide | 15 | 2 entree(s) |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `acteur.mandats.mandat.libelle`
- `acteur.mandats.mandat.missionSuivanteRef`
- `acteur.mandats.mandat.missionPrecedenteRef`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "acteur": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "uid": {
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@xsi:type": "IdActeur_type",
      "#text": "PA793146"
    },
    "etatCivil": {
      "ident": {
        "civ": "M.",
        "prenom": "Nicolas",
        "nom": "Dragon",
        "alpha": "Dragon",
        "trigramme": "NDR"
      },
      "infoNaissance": {
        "dateNais": "1977-04-19",
        "villeNais": "Laon",
        "depNais": {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:nil": "true"
        },
        "paysNais": "France"
      },
      "dateDeces": {
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:nil": "true"
      }
    },
    "profession": {
      "libelleCourant": "Profession libérale",
      "socProcINSEE": {
        "catSocPro": "Professions libérales",
        "famSocPro": "Cadres et professions intellectuelles supérieures"
      }
    },
    "uri_hatvp": "https://www.hatvp.fr/pages_nominatives/dragon-nicolas-24250",
    "adresses": {
      "adresse": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdressePostale_Type",
          "uid": "AD793148",
          "type": "0",
          "typeLibelle": "Adresse officielle",
          "poids": "1",
          "adresseDeRattachement": null,
          "intitule": "Assemblée nationale,",
          "numeroRue": "126",
          "nomRue": "Rue de l'Université,",
          "complementAdresse": null,
          "codePostal": "75355",
          "ville": "Paris 07 SP"
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdresseMail_Type",
          "uid": "AD797878",
          "type": "15",
          "typeLibelle": "Mèl",
          "poids": null,
          "adresseDeRattachement": null,
          "valElec": "nicolas.dragon@assemblee-nationale.fr"
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdresseSiteWeb_Type",
          "uid": "AD799625",
          "type": "22",
          "typeLibelle": "Site internet",
          "poids": null,
          "adresseDeRattachement": null,
          "valElec": "www.nicolasdragon.com"
        },
        "... (4 entrees au total, tronque)"
      ]
    },
    "mandats": {
      "mandat": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatAvecSuppleant_Type",
          "uid": "PM847287",
          "acteurRef": "PA793146",
          "legislature": "17",
          "typeOrgane": "COMNL",
          "dateDebut": "2024-09-20",
          "datePublication": "2024-09-20",
          "dateFin": "2026-04-09",
          "preseance": "20",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO415287"
          },
          "suppleants": null
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatAvecSuppleant_Type",
          "uid": "PM881497",
          "acteurRef": "PA793146",
          "legislature": "17",
          "typeOrgane": "COMNL",
          "dateDebut": "2026-05-06",
          "datePublication": "2026-05-06",
          "dateFin": null,
          "preseance": "20",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO415287"
          },
          "suppleants": null
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatSimple_Type",
          "uid": "PM806614",
          "acteurRef": "PA793146",
          "legislature": null,
          "typeOrgane": "PARPOL",
          "dateDebut": "2022-12-02",
          "datePublication": null,
          "dateFin": "2024-06-09",
          "preseance": "5",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO761239"
          }
        },
        "... (47 entrees au total, tronque)"
      ]
    }
  }
}
```
