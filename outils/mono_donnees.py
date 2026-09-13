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
def deputes():
    source = chemin("data", "brut_AMO30", "json", "acteur")
    fichiers = glob.glob(os.path.join(source, "*.json"))
    if not fichiers:
        manques.append("deputes : %s est vide — le referentiel AMO30 n'a pas ete depile" % source)
        return
    sortie, doublons = {}, []
    for f in fichiers:
        a = json.load(io.open(f, encoding="utf-8"))["acteur"]
        mandats = a.get("mandats", {}).get("mandat", [])
        if not isinstance(mandats, list):
            mandats = [mandats]
        ident = a.get("etatCivil", {}).get("ident", {})
        uid = (a.get("uid") or {}).get("#text", "")
        for m in mandats:
            lieu = ((m.get("election") or {}).get("lieu") or {})
            if str(m.get("legislature")) != "17":         continue
            if m.get("typeOrgane") != "ASSEMBLEE":        continue
            if not lieu.get("numDepartement") or not lieu.get("numCirco"): continue
            if m.get("dateFin"):                          continue
            cle = "%s-%s" % (lieu["numDepartement"], lieu["numCirco"])
            if cle in sortie:
                doublons.append(cle)
            sortie[cle] = {"prenom": ident.get("prenom", ""), "nom": ident.get("nom", ""),
                           "acteurRef": uid, "dateDebut": m.get("dateDebut")}
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

deputes()
scrutins()
for m in manques:
    print("::warning::" + m)
sys.exit(1 if manques else 0)
