# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **1800**
- Fichiers ouverts pour le tirage : **1800** (pas de 1)
- Fichiers decrits : **1800** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **45**
- Fichier montre en entier plus bas : `QANR5L17QG1.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `question.@xmlns` | texte | 1800 | http://schemas.assemblee-nationale.fr/referentiel |
| `question.@xmlns:xsi` | texte | 1800 | http://www.w3.org/2001/XMLSchema-instance |
| `question.@xsi:type` | texte | 1800 | QuestionGouvernement_Type |
| `question.uid` | texte | 1800 | QANR5L17QG1 · QANR5L17QG10 |
| `question.identifiant.numero` | texte | 1800 | 1 · 10 |
| `question.identifiant.regime` | texte | 1800 | 5eme Republique |
| `question.identifiant.legislature` | texte | 1800 | 17 |
| `question.type` | texte | 1800 | QG |
| `question.indexationAN.rubrique` | texte/vide | 1800 | outre-mer · politique extérieure |
| `question.indexationAN.teteAnalyse` | vide | 1800 |  |
| `question.indexationAN.analyses.analyse` | texte/vide | 1800 | Situation à Mayotte · Situation en Nouvelle-Calédonie |
| `question.auteur.identite.acteurRef` | texte | 1800 | PA842279 · PA842299 |
| `question.auteur.identite.mandatRef` | texte | 1800 | PM843779 · PM843791 |
| `question.auteur.groupe.organeRef` | texte | 1800 | PO845401 · PO845514 |
| `question.auteur.groupe.abrege` | texte | 1800 | RN · GDR |
| `question.auteur.groupe.developpe` | texte | 1800 | Rassemblement National · Gauche Démocrate et Républicaine |
| `question.minInt.organeRef` | texte | 1800 | PO847643 · PO847640 |
| `question.minInt.abrege` | texte | 1800 | Intérieur · Premier ministre |
| `question.minInt.developpe` | texte | 1800 | Ministère de l'intérieur · Premier ministre |
| `question.minAttribs.minAttrib.infoJO.typeJO` | texte | 1800 | JO_DEBAT |
| `question.minAttribs.minAttrib.infoJO.dateJO` | texte | 1800 | 2024-10-03 · 2024-10-30 |
| `question.minAttribs.minAttrib.infoJO.pageJO` | vide | 1800 |  |
| `question.minAttribs.minAttrib.infoJO.numJO` | vide | 1800 |  |
| `question.minAttribs.minAttrib.infoJO.urlLegifrance` | vide | 1800 |  |
| `question.minAttribs.minAttrib.infoJO.referenceNOR` | vide | 1800 |  |
| `question.minAttribs.minAttrib.denomination.organeRef` | texte | 1800 | PO847643 · PO847640 |
| `question.minAttribs.minAttrib.denomination.abrege` | texte | 1800 | Intérieur · Premier ministre |
| `question.minAttribs.minAttrib.denomination.developpe` | texte | 1800 | Ministère de l'intérieur · Premier ministre |
| `question.textesQuestion` | vide | 1800 |  |
| `question.textesReponse.texteReponse.infoJO.typeJO` | texte | 1800 | JO_DEBAT |
| `question.textesReponse.texteReponse.infoJO.dateJO` | texte | 1800 | 2024-10-03 · 2024-10-30 |
| `question.textesReponse.texteReponse.infoJO.pageJO` | texte/vide | 1800 | 5283 · 5290 |
| `question.textesReponse.texteReponse.infoJO.numJO` | vide | 1800 |  |
| `question.textesReponse.texteReponse.infoJO.urlLegifrance` | vide | 1800 |  |
| `question.textesReponse.texteReponse.infoJO.referenceNOR` | vide | 1800 |  |
| `question.textesReponse.texteReponse.texte` | texte | 1800 | </p><p align="CENTER"> SITUATION À MAYOTTE <a name=PG1></a> </p><br><strong>Mme la prés... · </p><p align="CENTER"> SITUATION EN NOUVELLE-CALÉDONIE <a name=PG10></a> </p><br><stron... |
| `question.cloture.codeCloture` | texte | 1800 | REP_PUB |
| `question.cloture.libelleCloture` | texte | 1800 | Réponse publiée |
| `question.cloture.dateCloture` | texte | 1800 | 2024-10-03 · 2024-10-30 |
| `question.cloture.infoJO.typeJO` | texte | 1800 | JO_DEBAT |
| `question.cloture.infoJO.dateJO` | texte | 1800 | 2024-10-03 · 2024-10-30 |
| `question.cloture.infoJO.pageJO` | texte/vide | 1800 | 5283 · 5290 |
| `question.cloture.infoJO.numJO` | vide | 1800 |  |
| `question.cloture.infoJO.urlLegifrance` | vide | 1800 |  |
| `question.cloture.infoJO.referenceNOR` | vide | 1800 |  |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

_Aucune : toutes les cles apparaissent au moins deux fois._

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "question": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "@xsi:type": "QuestionGouvernement_Type",
    "uid": "QANR5L17QG1",
    "identifiant": {
      "numero": "1",
      "regime": "5eme Republique",
      "legislature": "17"
    },
    "type": "QG",
    "indexationAN": {
      "rubrique": "outre-mer",
      "teteAnalyse": null,
      "analyses": {
        "analyse": "Situation à Mayotte"
      }
    },
    "auteur": {
      "identite": {
        "acteurRef": "PA842279",
        "mandatRef": "PM843779"
      },
      "groupe": {
        "organeRef": "PO845401",
        "abrege": "RN",
        "developpe": "Rassemblement National"
      }
    },
    "minInt": {
      "organeRef": "PO847643",
      "abrege": "Intérieur",
      "developpe": "Ministère de l'intérieur"
    },
    "minAttribs": {
      "minAttrib": {
        "infoJO": {
          "typeJO": "JO_DEBAT",
          "dateJO": "2024-10-03",
          "pageJO": null,
          "numJO": null,
          "urlLegifrance": null,
          "referenceNOR": null
        },
        "denomination": {
          "organeRef": "PO847643",
          "abrege": "Intérieur",
          "developpe": "Ministère de l'intérieur"
        }
      }
    },
    "textesQuestion": null,
    "textesReponse": {
      "texteReponse": {
        "infoJO": {
          "typeJO": "JO_DEBAT",
          "dateJO": "2024-10-03",
          "pageJO": "5283",
          "numJO": null,
          "urlLegifrance": null,
          "referenceNOR": null
        },
        "texte": "</p><p align=\"CENTER\"> SITUATION À MAYOTTE <a name=PG1></a> </p><br><strong>Mme la présidente . </strong>La parole est à Mme Anchya Bamana.<br><br><strong>Mme Anchya Bamana . </strong>C'est avec émotion que je prends la parole, au nom du groupe Rassemblement national, pour la première question au Gouvernement de cette session. À la suite de Marine Le Pen qui, ces dernières années, a défendu avec ardeur Mayotte, je souhaite vous alerter sur la situation extrêmement difficile que vit ce morceau de France au-delà des mers.<br><br>Mayotte condense en effet à elle seule l'ensemble des problèmes qui touchent notre pays : immigration sans contrôle – la moitié de la population de l'île est clandestine ; insécurité omniprésente, qui touche même les bus scolaires et ceux des soignants, régulièrement caillassés – ce fut encore le cas la semaine dernière ; prison surpeuplée, où le taux d'occupation atteint 260 % ; services publics submergés – l'hôpital est débordé et manque de personnel dans tous les services ; diplomatie atone, qui laisse les Comores imposer leur politique à la France ; pouvoir d'achat en baisse, sans perspective de développement économique.<br><br>Monsieur le Premier ministre, Mayotte est aujourd'hui en situation d'urgence vitale. Il apparaît que l'urgence des urgences, c'est de mettre un terme à cette immigration hors de contrôle qui gangrène notre territoire. Êtes-vous prêt à mobiliser la marine nationale pour instaurer un contrôle drastique de nos frontières dès la haute mer, afin de repousser les dizaines de bateaux qui déversent à Mayotte des étrangers que nous n'avons pas les moyens d'accueillir sur notre sol d'autant que beaucoup d'entre eux, hélas, perdent la vie en tentant la traversée ? <i>(Les députés des groupes RN et UDR se lèvent et applaudissent.)</i><br><br><strong>Mme la présidente . </strong>La parole est à M. le ministre de l'intérieur.<br><br><strong>M. Bruno Retailleau,</strong><i> ministre de l'intérieur . </i>Vous avez raison : Mayotte est en situation d'urgence. Souvenez-vous : j'y étais en mai dernier – j'y ai consacré un voyage pour me rendre compte de la situation sur place. Mayotte est malheureusement le triste exemple de ce qu'une immigration totalement incontrôlée <i>(Murmures sur les bancs du groupe LFI-NFP) </i>peut provoquer en matière de désordre,…<br><br><strong>M. Pierre Cordier .</strong> CQFD !<br><br><strong>M. Sylvain Maillard .</strong> Il a raison !<br><br><strong>M. Bruno Retailleau,</strong><i> ministre . </i>…de mal-développement et aussi sur le plan sanitaire. Mayotte concentre trois grandes crises, à commencer par la crise migratoire : la moitié de sa population est d'origine étrangère, la plupart du temps en situation d'irrégularité. Le chômage, ensuite, atteint pratiquement 40 % de la population active. S'y ajoute malheureusement une crise sécuritaire à laquelle vous avez fait allusion : il y a quelques jours, un bus transportant des soignants à l'hôpital – pour secourir, entre autres, des migrants en situation irrégulière – a été caillassé.<br><br>Nous ne resterons pas les bras croisés. Il y a des solutions de court et de long terme. À court terme, bien sûr, je veux reprendre l'action menée par mon prédécesseur : nous confirmerons les 1 150 gendarmes et policiers déployés <i>(Applaudissements sur les bancs du groupe DR et sur quelques bancs du groupe EPR)</i>, auxquels s'ajoutent quatre escadrons de gendarmerie mobile et 300 gendarmes spécialisés dans le maintien de l'ordre. Cela ne suffira pas et nous irons plus loin, notamment en passant des accords de sécurité bilatéraux avec les pays voisins de l'Afrique des Grands Lacs ; je m'y engage, parce que c'est ce qui nous permettra d'arrêter le flux issu de ces pays.<br><br><strong>M. Thibault Bazin .</strong> Très bien !<br><br><strong>M. Bruno Retailleau,</strong><i> ministre . </i>Ensuite, dès ce mois d'octobre, le préfet de Mayotte organisera – il en a reçu l'instruction – des vols groupés pour pouvoir reconduire les étrangers en situation irrégulière…<br><br><strong>M. Pierre Cordier .</strong> Très bien !<br><br><strong>M. Bruno Retailleau,</strong><i> ministre . </i>…vers la République démocratique du Congo.<br><br><strong>Mme la présidente .</strong> Merci, monsieur le ministre.<br><br><strong>M. Bruno Retailleau,</strong><i> ministre . </i>Enfin, à long terme, nous évaluerons l'efficacité du « rideau de fer » maritime. <i>(Applaudissements sur les bancs du groupe DR.)</i><br><br><strong>Mme la présidente . </strong>À l'Assemblée nationale, monsieur le ministre, le temps est scrupuleusement égalitaire : deux minutes par personne, que l'on soit député ou ministre ! <i>(Applaudissements sur les bancs du groupe SOC.)</i><br><br><strong>M. Fabien Di Filippo .</strong> Il y a bien un petit bonus quand c'est intéressant ?<br> <p>"
      }
    },
    "cloture": {
      "codeCloture": "REP_PUB",
      "libelleCloture": "Réponse publiée",
      "dateCloture": "2024-10-03",
      "infoJO": {
        "typeJO": "JO_DEBAT",
        "dateJO": "2024-10-03",
        "pageJO": "5283",
        "numJO": null,
        "urlLegifrance": null,
        "referenceNOR": null
      }
    }
  }
}
```
