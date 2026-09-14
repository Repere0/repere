#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les projets d'investissement finances par l'Etat, commune par commune.

CE QU'IL PRODUIT :
  mono/scripts/projets.json   { insee : [ projets ] } pour les huit departements
                              de la beta, avec son bloc de provenance.

POURQUOI CE FICHIER EXISTE. « Ce qui a ete decide » n'a rien a montrer tant
qu'aucun fait date n'entre dans le produit. Celui-ci est le plus concret qui
existe en donnee publique homogene sur toute la France : un equipement, son
intitule, ce que l'Etat a verse, l'annee. C'est aussi le seul qui reponde
litteralement a « qu'est-ce qui se passe chez moi ».

SOURCE, verifiee le 14/09/2026 :
  Direction generale des collectivites locales — « Projets finances par les
  dotations de soutien a l'investissement des collectivites territoriales ».
  Licence Ouverte 2.0. Mise a jour annuelle, derniere le 24/07/2026.
  Quatre dispositifs : DETR, DSIL, DPV, DSID. 16 799 lignes pour 2025.

QUATRE REFUS, ET ILS SONT LA RAISON D'ETRE DU SCRIPT :

  1. On n'ecrit RIEN si la source est absente, vide ou manifestement tronquee.
     Un releve valide d'hier vaut mieux qu'un fichier vide d'aujourd'hui.

  2. On ne rattache JAMAIS une ligne sans code INSEE. La source en publie :
     les projets portes par un EPCI, un departement ou une region n'ont pas de
     commune, et certains gestionnaires y ont mis le siege administratif. Ces
     lignes sont comptees, annoncees, et jetees. Deviner serait afficher chez
     un habitant une decision qui n'est pas la sienne.

  3. Une seule exception au refus 2, et elle est nominative. « Ville de Paris »
     porte le SIREN 217500016 sans code INSEE. L'identite est verifiee a la
     source (annuaire des entreprises : SIREN 217500016 = VILLE DE PARIS,
     nature juridique 7229, commune) et le code de la commune de Paris au COG
     est 75056. Ce n'est pas une deduction depuis le SIREN — le decoupage du
     SIREN donnerait 75001, c'est-a-dire le 1er arrondissement, et il aurait
     donc ete faux. Toute autre ligne sans code INSEE reste refusee.

  4. On n'ecrit rien qui n'ait producteur, licence, adresse et date de relevé.

CE QU'ON N'AJOUTE PAS. Aucun montant par habitant, aucun total par commune
compare a une autre, aucun classement : la regle du produit interdit toute
comparaison entre communes, et un « par habitant » en est une deguisee.

Usage :  python3 outils/projets_etat.py [racine du depot]
         python3 outils/projets_etat.py --test     (autotest, sans reseau)
Sortie : 0 si le releve est a jour, 1 sinon.
"""
import io, os, sys, csv, json, datetime, urllib.request

RACINE = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "."
AUJ = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

# Les huit departements de la beta, tels que la source les ecrit : sur trois
# caracteres, zero en tete. « 93 » ne trouverait rien.
BETA = {"075", "077", "078", "091", "092", "093", "094", "095"}

# Les deux exercices les plus recents publies. On en garde deux et pas un :
# un fil qui ne porte qu'une seule annee n'est pas un fil.
EXERCICES = ("2025", "2024")

JEU = ("https://www.data.gouv.fr/api/1/datasets/"
       "projets-finances-par-les-dotations-de-soutien-a-linvestissement-"
       "des-collectivites-territoriales/")

PAGE = ("https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
        "de-soutien-a-linvestissement-des-collectivites-territoriales")

# Le seul rattachement nominatif autorise — voir le refus 3 en tete de fichier.
# Les trois champs doivent correspondre exactement, sinon la ligne est refusee.
RATTACHEMENTS = {
    ("217500016", "collectivité à statut particulier", "Ville de Paris"): "75056",
}

# Ce que chaque sigle veut dire, mot pour mot comme la DGCL les developpe. On
# n'invente aucun libelle : un sigle inconnu est affiche tel quel.
DISPOSITIFS = {
    "DETR": "Dotation d'équipement des territoires ruraux",
    "DSIL": "Dotation de soutien à l'investissement local",
    "DPV":  "Dotation politique de la ville",
    "DSID": "Dotation de soutien à l'investissement des départements",
}


def entier(v):
    """Un montant, ou None. La source ecrit parfois vide, parfois avec virgule."""
    if v is None:
        return None
    t = str(v).strip().replace(" ", "").replace(" ", "").replace(",", ".")
    if not t:
        return None
    try:
        return int(round(float(t)))
    except ValueError:
        return None


def retenir(ligne, refus):
    """Une ligne de la source -> un projet rattache, ou None avec un motif compte.

    C'est la seule fonction qui decide d'un rattachement, et c'est elle que
    l'autotest interroge : tout ce qui suit depend d'elle.
    """
    dep = (ligne.get("beneficiaire_dep") or "").strip()
    if dep not in BETA:
        return None                              # hors beta : ni retenu ni refuse

    insee = (ligne.get("beneficiaire_code_insee") or "").strip()
    if len(insee) != 5 or not insee[:2].isdigit():
        cle = ((ligne.get("beneficiaire_siren") or "").strip(),
               (ligne.get("beneficiaire_type") or "").strip(),
               (ligne.get("beneficiaire_nom") or "").strip())
        insee = RATTACHEMENTS.get(cle, "")
        if not insee:
            refus.setdefault(cle[1] or "type absent", 0)
            refus[cle[1] or "type absent"] += 1
            return None

    if insee[:2] != dep[1:]:                     # « 093 » -> « 93 »
        refus.setdefault("code INSEE hors de son departement", 0)
        refus["code INSEE hors de son departement"] += 1
        return None

    intitule = (ligne.get("intitule") or "").strip()
    subvention = entier(ligne.get("subvention"))
    if not intitule or subvention is None:
        refus.setdefault("ligne sans intitule ou sans montant", 0)
        refus["ligne sans intitule ou sans montant"] += 1
        return None

    exercice = entier(ligne.get("exercice"))
    projet = {
        "insee": insee,
        "annee": exercice,
        "dispositif": (ligne.get("dispositif") or "").strip(),
        "intitule": intitule,                    # verbatim : voir la note ci-dessous
        "subvention": subvention,
    }
    cout = entier(ligne.get("cout_ht") or ligne.get("cou_ht"))
    if cout:
        projet["cout"] = cout
    return projet


# L'INTITULE EST RECOPIE MOT POUR MOT, ACCENTS MANQUANTS COMPRIS. La source
# ecrit « Renovation de la halle du Montfort » sans accent : les remettre serait
# reecrire un intitule officiel, ce que le produit s'interdit, et personne ne
# sait si « Realisation » devait porter un accent sur le premier e, le second,
# ou les deux. Le lien vers la source donne le texte tel qu'il est publie.


def telecharger(url):
    req = urllib.request.Request(url, headers={"User-Agent": "repere-collecte"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def ressources():
    """L'adresse de chaque exercice, demandee au catalogue plutot que codee en dur.

    Les adresses de fichiers portent la date de depot ; les coder en dur les
    ferait pourrir a la prochaine publication.
    """
    jeu = json.loads(telecharger(JEU).decode("utf-8"))
    trouvees = {}
    for r in jeu.get("resources", []):
        titre = (r.get("title") or "").lower()
        if (r.get("format") or "").lower() != "csv":
            continue
        for ex in EXERCICES:
            if ex in titre and r.get("url"):
                trouvees.setdefault(ex, {"url": r["url"],
                                         "maj": (r.get("last_modified") or "")[:10]})
    return trouvees, (jeu.get("license") or ""), (jeu.get("last_update") or "")[:10]


def collecter():
    trouvees, licence, maj_jeu = ressources()
    manquants = [e for e in EXERCICES if e not in trouvees]
    if manquants:
        raise SystemExit("exercice(s) introuvable(s) au catalogue : "
                         + ", ".join(manquants))

    par_commune, refus, lus = {}, {}, 0
    for ex in EXERCICES:                          # du plus recent au plus ancien
        brut = telecharger(trouvees[ex]["url"]).decode("utf-8-sig", "replace")
        dialecte = csv.Sniffer().sniff(brut[:4096], delimiters=",;\t")
        for ligne in csv.DictReader(io.StringIO(brut), dialect=dialecte):
            lus += 1
            p = retenir(ligne, refus)
            if p:
                par_commune.setdefault(p.pop("insee"), []).append(p)

    return par_commune, refus, lus, licence, maj_jeu, trouvees


def ecrire(par_commune, refus, lus, licence, maj_jeu, trouvees):
    dest = os.path.join(RACINE, "mono", "scripts", "projets.json")

    # Refus 1 : on n'ecrase un releve valide que par quelque chose de complet.
    # 1 262 communes de beta, et la DGCL finance des milliers de projets par an :
    # moins de cent communes servies veut dire que quelque chose a casse en amont.
    if len(par_commune) < 100:
        ancien = os.path.exists(dest)
        print("::warning::seulement %d communes servies : le releve n'est PAS "
              "ecrase%s" % (len(par_commune), " (celui de la veille reste)" if ancien else ""))
        return 1

    paquet = {
        "source": {
            "producteur_affiche": "Direction générale des collectivités locales",
            "producteur_citoyen": "l'État",
            "licence": "Licence Ouverte 2.0",
            "url": PAGE,
            "exercices": list(EXERCICES),
            "mis_a_jour_le": maj_jeu,
            "releve_le": AUJ,
        },
        "dispositifs": DISPOSITIFS,
        "communes": {k: v for k, v in sorted(par_commune.items())},
    }
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))
    io.open(dest, "w", encoding="utf-8").write(brut)

    relu = json.load(io.open(dest, encoding="utf-8"))
    s = relu["source"]
    for champ in ("producteur_affiche", "licence", "url", "mis_a_jour_le", "releve_le"):
        assert s.get(champ), "la source ecrite ne porte pas « %s »" % champ
    assert relu["communes"], "aucune commune dans le fichier relu"

    total = sum(len(v) for v in par_commune.values())
    print("projets.json               %s  (%.0f Ko)" % (dest, len(brut.encode("utf-8")) / 1024))
    print("lignes lues                %d sur %s" % (lus, " + ".join(EXERCICES)))
    print("projets retenus            %d, repartis sur %d communes"
          % (total, len(par_commune)))
    if licence and "lov2" not in licence.lower() and "ouverte" not in licence.lower():
        print("::warning::la licence annoncee par le catalogue a change : %s" % licence)
    for motif, n in sorted(refus.items(), key=lambda x: -x[1]):
        print("refuse (%-42s) %d" % (motif, n))
    return 0


# ------------------------------------------------------------------- autotest
CAS = [
    # Les six premieres lignes sont recopiees telles quelles de la source, lues
    # le 14/09/2026 par l'API tabulaire de data.gouv.fr. Ce ne sont pas des
    # exemples inventes : c'est ce que le script devra lire pour de vrai.
    ("commune de beta, tout est la",
     {"exercice": 2025, "dispositif": "DPV", "beneficiaire_type": "commune",
      "beneficiaire_siren": "219300019", "beneficiaire_dep": "093",
      "beneficiaire_nom": "AUBERVILLIERS", "beneficiaire_code_insee": "93001",
      "intitule": "Renovation de la halle du Montfort",
      "cout_ht": 1333667, "subvention": 533466},
     {"insee": "93001", "annee": 2025, "dispositif": "DPV",
      "intitule": "Renovation de la halle du Montfort",
      "subvention": 533466, "cout": 1333667}),

    ("hors beta : ignore sans etre compte comme un refus",
     {"exercice": 2025, "dispositif": "DPV", "beneficiaire_type": "commune",
      "beneficiaire_siren": "210100533", "beneficiaire_dep": "001",
      "beneficiaire_nom": "BOURG-EN-BRESSE", "beneficiaire_code_insee": "01053",
      "intitule": "Renovation de plusieurs groupes scolaires",
      "cout_ht": 937443, "subvention": 508068},
     None),

    ("Ville de Paris : le seul rattachement nominatif, et il donne 75056",
     {"exercice": 2025, "dispositif": "DSIL",
      "beneficiaire_type": "collectivité à statut particulier",
      "beneficiaire_siren": "217500016", "beneficiaire_dep": "075",
      "beneficiaire_nom": "Ville de Paris", "beneficiaire_code_insee": None,
      "intitule": "Creation de 3 sites de baignade en milieu naturel",
      "cout_ht": 11085751, "subvention": 1700346},
     {"insee": "75056", "annee": 2025, "dispositif": "DSIL",
      "intitule": "Creation de 3 sites de baignade en milieu naturel",
      "subvention": 1700346, "cout": 11085751}),

    ("un EPCI de beta sans code INSEE : refuse, jamais rattache au siege",
     {"exercice": 2025, "dispositif": "DSIL", "beneficiaire_type": "EPCI",
      "beneficiaire_siren": "200057867", "beneficiaire_dep": "093",
      "beneficiaire_nom": "CA PLAINE COMMUNE", "beneficiaire_code_insee": "",
      "intitule": "Piscine intercommunale", "cout_ht": 4000000,
      "subvention": 800000},
     None),

    ("un SIREN inconnu sans code INSEE : refuse, l'exception n'est pas une regle",
     {"exercice": 2025, "dispositif": "DSIL",
      "beneficiaire_type": "collectivité à statut particulier",
      "beneficiaire_siren": "229200000", "beneficiaire_dep": "092",
      "beneficiaire_nom": "Autre collectivite", "beneficiaire_code_insee": None,
      "intitule": "Projet quelconque", "subvention": 1000},
     None),

    ("code INSEE d'un autre departement que celui annonce : refuse",
     {"exercice": 2025, "dispositif": "DETR", "beneficiaire_type": "commune",
      "beneficiaire_siren": "217700000", "beneficiaire_dep": "077",
      "beneficiaire_nom": "AILLEURS", "beneficiaire_code_insee": "45001",
      "intitule": "Salle des fetes", "subvention": 20000},
     None),

    ("montant absent : refuse — un projet sans montant n'apprend rien",
     {"exercice": 2025, "dispositif": "DETR", "beneficiaire_type": "commune",
      "beneficiaire_siren": "217700001", "beneficiaire_dep": "077",
      "beneficiaire_nom": "MEAUX", "beneficiaire_code_insee": "77284",
      "intitule": "Ecole", "subvention": ""},
     None),

    ("intitule vide : refuse — on n'affiche pas « projet sans titre »",
     {"exercice": 2025, "dispositif": "DETR", "beneficiaire_type": "commune",
      "beneficiaire_siren": "217700001", "beneficiaire_dep": "077",
      "beneficiaire_nom": "MEAUX", "beneficiaire_code_insee": "77284",
      "intitule": "   ", "subvention": 20000},
     None),

    ("cout absent : retenu, mais sans la cle cout",
     {"exercice": 2024, "dispositif": "DSIL", "beneficiaire_type": "commune",
      "beneficiaire_siren": "219500000", "beneficiaire_dep": "095",
      "beneficiaire_nom": "CERGY", "beneficiaire_code_insee": "95127",
      "intitule": "Renovation thermique du gymnase", "cout_ht": "",
      "subvention": "150000"},
     {"insee": "95127", "annee": 2024, "dispositif": "DSIL",
      "intitule": "Renovation thermique du gymnase", "subvention": 150000}),
]


def autotest():
    echecs = 0
    for nom, ligne, attendu in CAS:
        refus = {}
        obtenu = retenir(ligne, refus)
        if obtenu != attendu:
            echecs += 1
            print("ECHEC  %s\n       attendu %r\n       obtenu  %r" % (nom, attendu, obtenu))
        else:
            print("ok     %s" % nom)

    # Le refus doit etre compte, pas seulement silencieux : sans cela une source
    # qui se degraderait passerait inapercue.
    refus = {}
    retenir({"exercice": 2025, "beneficiaire_type": "EPCI", "beneficiaire_dep": "093",
             "beneficiaire_siren": "200057867", "beneficiaire_nom": "X",
             "beneficiaire_code_insee": "", "intitule": "Y", "subvention": 1}, refus)
    if refus.get("EPCI") != 1:
        echecs += 1
        print("ECHEC  un refus doit etre compte par motif, obtenu %r" % refus)
    else:
        print("ok     un refus est compte par motif")

    print("\n%d cas, %d echec(s)." % (len(CAS) + 1, echecs))
    return 1 if echecs else 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(autotest())
    try:
        sys.exit(ecrire(*collecter()))
    except Exception as e:
        print("::warning::projets de l'Etat : %s — le releve precedent est conserve" % e)
        sys.exit(1)
