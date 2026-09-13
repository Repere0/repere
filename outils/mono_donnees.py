#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les deux releves que le monorepo embarque, refaits a chaque collecte.

CE QU'IL PRODUIT :
  mono/scripts/deputes.json   qui siege dans quelle circonscription (AMO30)
  mono/scripts/scrutins.json  ce sur quoi on a vote, et la position de chacun

POURQUOI CE FICHIER EXISTE. Ces deux releves etaient poses A LA MAIN. Le premier
datait du 26 aout, le second aussi, et la source, elle, publie tous les jours :
l'application affichait donc un depute et des votes de plus en plus vieux sans que
rien ne le dise. Un produit qui promet des donnees officielles ne peut pas servir
un instantane oublie. C'est desormais la collecte qui les refait.

TROIS REFUS, ET ILS SONT LA RAISON D'ETRE DU SCRIPT :
  - on n'ecrit RIEN si la source est absente ou vide. Un relevé valide de la veille
    vaut infiniment mieux qu'un fichier vide d'aujourd'hui ; le build, lui, refuse
    deja de publier un fichier sans source, donc un ecrasement rate mettrait la
    chaine entiere par terre.
  - on n'ecrit rien qui n'ait producteur, licence, adresse, legislature et date.
  - on ne recopie AUCUNE liste de non-votants et AUCUN agregat par depute : le
    releve amont (scrutins_an.py) les ecarte deja, et on verifie ici qu'ils ne
    sont pas revenus par une autre porte.

Usage :  python3 outils/mono_donnees.py [racine du depot]
Sortie : 0 si les deux releves sont a jour, 1 si l'un des deux n'a pas pu l'etre.
"""
import io, os, sys, json, glob, datetime

RACINE = sys.argv[1] if len(sys.argv) > 1 else "."
AUJ = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
chemin = lambda *p: os.path.join(RACINE, *p)
manques = []

def ecrire(dest, paquet, quoi):
    """N'ecrase que par quelque chose de complet, et relit ce qu'il vient d'ecrire."""
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))
    io.open(dest, "w", encoding="utf-8").write(brut)
    relu = json.load(io.open(dest, encoding="utf-8"))
    s = relu.get("source") or {}
    for champ in ("producteur_affiche", "licence", "url", "legislature", "releve_le"):
        assert s.get(champ), "%s : la source ecrite ne porte pas « %s »" % (quoi, champ)
    print("%-26s %s  (%.0f Ko, releve du %s)"
          % (quoi, dest, len(brut.encode("utf-8")) / 1024, s["releve_le"]))
    return relu

# ---------------------------------------------------------------- les deputes
def lire_acteur(a):
    """Les sieges ouverts d'un acteur, sous forme (cle « dep-circo », fiche).

    TROIS PIEGES DU FORMAT, releves dans docs/schema_acteurs.md AVANT d'ecrire
    une ligne — c'est la methode qui avait deja evite le champ `votant` tantot
    liste tantot objet dans les scrutins :

      1. `mandats.mandat` est une LISTE dans 2 995 fichiers et un OBJET SEUL dans
         5 autres. Un lecteur ecrit de memoire aurait plante sur ces cinq-la, ou
         pire, les aurait ignores en silence.
      2. `dateFin` vaut `null` pour un mandat ouvert et une date pour un mandat
         clos. Un mandat clos qui passerait le filtre ferait cohabiter deux
         deputes sur le meme siege — d'ou le controle des doublons plus bas.
      3. `legislature` est une CHAINE (« 17 »), pas un nombre. Comparer a 17
         entier ne retiendrait jamais personne, et le fichier produit serait vide
         sans qu'aucune exception ne soit levee.
    """
    mandats = (a.get("mandats") or {}).get("mandat") or []
    if not isinstance(mandats, list):
        mandats = [mandats]
    ident = (a.get("etatCivil") or {}).get("ident") or {}
    uid = (a.get("uid") or {}).get("#text", "")
    for m in mandats:
        if not isinstance(m, dict):                   continue
        lieu = ((m.get("election") or {}).get("lieu") or {})
        if str(m.get("legislature")) != "17":         continue
        if m.get("typeOrgane") != "ASSEMBLEE":        continue
        if not lieu.get("numDepartement") or not lieu.get("numCirco"): continue
        if m.get("dateFin"):                          continue
        if not uid:                                   continue
        yield ("%s-%s" % (lieu["numDepartement"], lieu["numCirco"]),
               {"prenom": ident.get("prenom", ""), "nom": ident.get("nom", ""),
                "acteurRef": uid, "dateDebut": m.get("dateDebut")})


def deputes():
    source = chemin("data", "brut_AMO30", "json", "acteur")
    fichiers = glob.glob(os.path.join(source, "*.json"))
    if not fichiers:
        manques.append("deputes : %s est vide — le referentiel AMO30 n'a pas ete depile" % source)
        return
    sortie, doublons = {}, []
    for f in fichiers:
        for cle, fiche in lire_acteur(json.load(io.open(f, encoding="utf-8"))["acteur"]):
            if cle in sortie:
                doublons.append(cle)
            sortie[cle] = fiche
    # UN SIEGE, UN DEPUTE. Deux mandats ouverts sur la meme circonscription veut dire
    # que le filtre « dateFin » a laisse passer un mandat clos : on refuse d'ecrire.
    assert not doublons, "deux mandats ouverts sur la meme circonscription : %s" % doublons[:3]
    if len(sortie) < 500:
        manques.append("deputes : seulement %d circonscriptions relevees, on n'ecrase pas" % len(sortie))
        return
    ecrire(chemin("mono", "scripts", "deputes.json"), {
        "v": 1,
        "source": {
            "producteur": "Assemblee nationale — Acteurs, mandats et organes (AMO30)",
            "producteur_affiche": "Assemblée nationale — Acteurs, mandats et organes",
            "licence": "Licence Ouverte 2.0",
            "url": "https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice",
            "legislature": 17,
            "portee": "mandats de députés ouverts (sans date de fin) de la 17e législature",
            "releve_le": AUJ,
        },
        "deputes": dict(sorted(sortie.items())),
    }, "deputes (%d circos)" % len(sortie))

# ---------------------------------------------------------------- les scrutins
def scrutins():
    amont = chemin("outils", "scrutins_an.json")
    if not os.path.exists(amont):
        manques.append("scrutins : %s absent — scrutins_an.py n'a pas tourne" % amont)
        return
    d = json.load(io.open(amont, encoding="utf-8"))
    if not d.get("r") or not d.get("acteurs"):
        manques.append("scrutins : le releve amont est vide, on n'ecrase pas")
        return
    brut = json.dumps(d, ensure_ascii=False)
    for interdit in ("nonVotant", "miseAuPoint", "numPlace"):
        assert interdit not in brut, "le releve amont porte « %s » : il ne doit pas etre republie" % interdit
    ecrire(chemin("mono", "scripts", "scrutins.json"), {
        "v": 1,
        "source": {
            "producteur": "Assemblée nationale — Scrutins publics",
            "producteur_affiche": "Assemblée nationale",
            "licence": "Licence Ouverte 2.0",
            "url": "https://data.assemblee-nationale.fr/travaux-parlementaires/votes",
            # UNE ADRESSE PAR SCRUTIN, et c'est ce qui rend l'affichage verifiable :
            # le lecteur clique et tombe sur l'analyse officielle du meme scrutin.
            "url_scrutin": "https://www.assemblee-nationale.fr/dyn/17/scrutins/",
            "legislature": 17,
            "releve_le": d.get("maj") or AUJ,
            "portee": "les %d derniers scrutins publics de la 17e législature, sur %d publiés à la date du relevé"
                      % (len(d["r"]), d.get("total_source") or len(d["r"])),
            "ecarte": "aucune liste de non-votants, aucun agrégat par député, aucune mise au point : "
                      "la source les porte, Repère ne les republie pas.",
        },
        "total_source": d.get("total_source") or len(d["r"]),
        "acteurs": d["acteurs"],
        "r": d["r"],
    }, "scrutins (%d)" % len(d["r"]))

def autotest():
    """Eprouve la lecture d'un acteur SANS reseau et SANS archive depilee.

    La branche « deputes » ne peut pas tourner dans le conteneur : le referentiel
    AMO30 n'y est pas, et les serveurs de l'Assemblee n'y sont pas joignables. Elle
    partait donc en production sans avoir jamais ete executee. Ce banc lui donne
    les cas du schema reel, y compris ceux qui n'arrivent que cinq fois sur trois
    mille.  Lance :  python3 outils/mono_donnees.py --test
    """
    cas = [
        ("liste normale, un siege ouvert", {
            "uid": {"#text": "PA1"}, "etatCivil": {"ident": {"prenom": "A", "nom": "Un"}},
            "mandats": {"mandat": [
                {"legislature": "17", "typeOrgane": "ASSEMBLEE", "dateDebut": "2024-07-07",
                 "dateFin": None, "election": {"lieu": {"numDepartement": "93", "numCirco": "6"}}},
                {"legislature": "17", "typeOrgane": "COMPER", "dateDebut": "2024-07-18",
                 "dateFin": None, "election": {"lieu": {}}},
            ]}}, [("93-6", "PA1")]),
        ("objet seul au lieu d'une liste", {
            "uid": {"#text": "PA2"}, "etatCivil": {"ident": {"prenom": "B", "nom": "Deux"}},
            "mandats": {"mandat":
                {"legislature": "17", "typeOrgane": "ASSEMBLEE", "dateDebut": "2024-07-07",
                 "dateFin": None, "election": {"lieu": {"numDepartement": "75", "numCirco": "1"}}}}},
            [("75-1", "PA2")]),
        ("mandat clos : ecarte", {
            "uid": {"#text": "PA3"}, "etatCivil": {"ident": {"prenom": "C", "nom": "Trois"}},
            "mandats": {"mandat": [
                {"legislature": "17", "typeOrgane": "ASSEMBLEE", "dateDebut": "2024-07-07",
                 "dateFin": "2025-09-01", "election": {"lieu": {"numDepartement": "75", "numCirco": "2"}}}]}},
            []),
        ("legislature precedente : ecartee", {
            "uid": {"#text": "PA4"}, "etatCivil": {"ident": {"prenom": "D", "nom": "Quatre"}},
            "mandats": {"mandat": [
                {"legislature": "16", "typeOrgane": "ASSEMBLEE", "dateDebut": "2022-06-22",
                 "dateFin": None, "election": {"lieu": {"numDepartement": "75", "numCirco": "3"}}}]}},
            []),
        ("senateur : ecarte", {
            "uid": {"#text": "PA5"}, "etatCivil": {"ident": {"prenom": "E", "nom": "Cinq"}},
            "mandats": {"mandat": [
                {"legislature": "17", "typeOrgane": "SENAT", "dateDebut": "2024-07-07",
                 "dateFin": None, "election": {"lieu": {"numDepartement": "75", "numCirco": "4"}}}]}},
            []),
        ("acteur sans mandat : ne plante pas", {"uid": {"#text": "PA6"}}, []),
        ("mandats absents : ne plante pas", {"uid": {"#text": "PA7"}, "mandats": None}, []),
        ("francais de l'etranger : garde son siege", {
            "uid": {"#text": "PA8"}, "etatCivil": {"ident": {"prenom": "F", "nom": "Huit"}},
            "mandats": {"mandat": [
                {"legislature": "17", "typeOrgane": "ASSEMBLEE", "dateDebut": "2024-07-07",
                 "dateFin": None, "election": {"lieu": {"numDepartement": "099", "numCirco": "5"}}}]}},
            [("099-5", "PA8")]),
    ]
    echecs = 0
    for titre, acteur, attendu in cas:
        obtenu = [(c, f["acteurRef"]) for c, f in lire_acteur(acteur)]
        ok = obtenu == attendu
        echecs += 0 if ok else 1
        print("  %-4s %-42s %s" % ("ok" if ok else "ECHEC", titre,
                                   "" if ok else "attendu %s, obtenu %s" % (attendu, obtenu)))
    print("\n%d cas, %d echec(s)." % (len(cas), echecs))
    return 1 if echecs else 0

if "--test" in sys.argv:
    print("Autotest de la lecture du referentiel des acteurs (AMO30).\n")
    sys.exit(autotest())

deputes()
scrutins()
for m in manques:
    print("::warning::" + m)
sys.exit(1 if manques else 0)
