#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Collecte quotidienne des sources publiques de Repere.

Ce script tourne dans GitHub Actions, pas sur le poste ni dans un conteneur Claude :
data.assemblee-nationale.fr et data.gouv.fr y sont joignables, et l'execution est
gratuite, tracee et rejouable. Chaque execution laisse une trace lisible dans
`data/journal_collecte.json` — y compris ses echecs.

PRINCIPE, et c'est le seul qui compte ici :
    une collecte qui echoue en silence est pire qu'une collecte qui n'existe pas.
Le journal enregistre donc, pour chaque source : la date de la tentative, le code
HTTP, la taille, l'empreinte, et l'erreur le cas echeant. L'application affiche
ensuite « derniere mise a jour reussie le ... » a partir de ce fichier. Un manque
visible est une information ; un manque invisible est un mensonge.

Usage :
    python3 outils/collecte.py            # tout
    python3 outils/collecte.py --liste    # affiche les sources sans rien telecharger
    python3 outils/collecte.py agenda_an  # une seule source
"""
import sys, os, io, json, time, hashlib, urllib.request, urllib.error

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RACINE, "data")
JOURNAL = os.path.join(DEST, "journal_collecte.json")

# ---------------------------------------------------------------------------
# Les sources. `poids` est l'ordre de grandeur observe, pour qu'un ajout de 900 Mo
# ne passe pas inapercu dans une revue. `cadence` documente ce que la source
# annonce — elle ne remplace pas la mesure : le journal dit ce qui est arrive.
# ---------------------------------------------------------------------------
SOURCES = [
    {
        "cle": "agenda_an",
        "titre": "Assemblee nationale — reunions (seance, commissions, enquetes)",
        "url": "https://data.assemblee-nationale.fr/static/openData/repository/17/vp/reunions/Agenda.json.zip",
        "fichier": "Agenda.json.zip",
        "poids": "8 Mo",
        "cadence": "quotidienne",
        "licence": "Licence ouverte",
    },
    {
        "cle": "organes_an",
        "titre": "Assemblee nationale — acteurs, mandats et organes (historique)",
        "url": "https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip",
        "fichier": "AMO30.json.zip",
        "poids": "14 Mo",
        "cadence": "quotidienne",
        "licence": "Licence ouverte",
        "note": "Indispensable pour NOMMER les instances : sans lui, 39 % des reunions "
                "s'afficheraient avec un code au lieu d'un nom.",
    },
    {
        "cle": "scrutins_an",
        "titre": "Assemblee nationale — scrutins publics",
        "url": "https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip",
        "fichier": "Scrutins.json.zip",
        "poids": "~10 Mo",
        "cadence": "quotidienne",
        "licence": "Licence ouverte",
    },
]

# Sources a ajouter APRES arbitrage : elles sont trop lourdes pour etre embarquees
# telles quelles et demandent une pre-agregation par territoire. Elles sont listees
# ici pour que personne n'ait a les rechercher, et desactivees pour que personne ne
# les active par megarde.
SOURCES_LOURDES = [
    {
        "cle": "marches_publics",
        "titre": "Marches publics — donnees essentielles de la commande publique",
        "url": "https://www.data.gouv.fr/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e",
        "poids": "500 Mo a 970 Mo par fichier, 40 fichiers",
        "cadence": "quotidienne",
        "pourquoi_pas_encore": "Il faut d'abord decider comment on sert des donnees "
            "par commune sans reveler au serveur quelle commune est consultee.",
    },
    {
        "cle": "ofgl_communes",
        "titre": "OFGL — comptes des communes",
        "url": "https://data.ofgl.fr/",
        "poids": "3,9 Go",
        "cadence": "annuelle",
        "pourquoi_pas_encore": "Deja embarque sous forme pre-agregee. La reprise "
            "complete ne se justifie qu'a la publication d'un nouvel exercice.",
    },
]


def empreinte(chemin):
    h = hashlib.sha256()
    with open(chemin, "rb") as f:
        for bloc in iter(lambda: f.read(1 << 20), b""):
            h.update(bloc)
    return h.hexdigest()[:16]


def telecharger(src):
    """Retourne un enregistrement de journal, que le telechargement reussisse ou non."""
    debut = time.time()
    dest = os.path.join(DEST, src["fichier"])
    rec = {"cle": src["cle"], "titre": src["titre"], "url": src["url"],
           "tentee_le": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    try:
        req = urllib.request.Request(src["url"], headers={
            "User-Agent": "Repere/1.0 (collecte quotidienne de donnees publiques ; repere0@protonmail.com)"
        })
        with urllib.request.urlopen(req, timeout=180) as rep, open(dest, "wb") as f:
            rec["http"] = rep.status
            octets = 0
            while True:
                bloc = rep.read(1 << 20)
                if not bloc:
                    break
                f.write(bloc)
                octets += len(bloc)
        rec["octets"] = octets
        rec["empreinte"] = empreinte(dest)
        rec["secondes"] = round(time.time() - debut, 1)
        # Une reponse de 200 octets n'est pas un jeu de donnees : c'est une page
        # d'erreur deguisee. On refuse de la ranger comme si elle etait valide.
        if octets < 10000:
            rec["ok"] = False
            rec["erreur"] = "reponse anormalement petite (%d octets) : probablement une page d'erreur" % octets
            os.remove(dest)
        else:
            rec["ok"] = True
    except urllib.error.HTTPError as e:
        rec.update(ok=False, http=e.code, erreur="HTTP %s" % e.code)
    except Exception as e:
        rec.update(ok=False, erreur="%s: %s" % (type(e).__name__, e))
    return rec


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--liste" in sys.argv:
        for s in SOURCES:
            print("%-16s %-8s %s" % (s["cle"], s["poids"], s["titre"]))
        print("\nEn attente d'arbitrage :")
        for s in SOURCES_LOURDES:
            print("%-16s %-28s %s" % (s["cle"], s["poids"], s["titre"]))
        return 0

    os.makedirs(DEST, exist_ok=True)
    choisies = [s for s in SOURCES if not args or s["cle"] in args]
    assert choisies, "aucune source ne correspond a %s" % args

    journal = {"execute_le": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "sources": [telecharger(s) for s in choisies]}
    io.open(JOURNAL, "w", encoding="utf-8").write(
        json.dumps(journal, ensure_ascii=False, indent=1))

    echecs = [r for r in journal["sources"] if not r["ok"]]
    for r in journal["sources"]:
        marque = "  ok  " if r["ok"] else " ECHEC"
        print("%s | %-16s %s" % (marque, r["cle"],
              ("%d octets, empreinte %s" % (r["octets"], r["empreinte"])) if r["ok"]
              else r.get("erreur", "")))
    print("\n%d source(s), %d echec(s). Journal : data/journal_collecte.json"
          % (len(journal["sources"]), len(echecs)))
    # On sort en erreur pour que GitHub Actions le signale — mais APRES avoir ecrit
    # le journal : un echec doit rester lisible, pas disparaitre avec le processus.
    return 1 if echecs else 0


if __name__ == "__main__":
    sys.exit(main())
