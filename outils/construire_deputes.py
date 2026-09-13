#!/usr/bin/env python3
"""Construit le référentiel député actif de la 17e législature.

Usage:
  python3 outils/construire_deputes.py [source_acteurs] [destination]

La sortie est un dictionnaire "département-circonscription" -> identité.
Aucune donnée d'usage n'est produite.
"""
import json
import glob
import os
import sys

SOURCE = sys.argv[1] if len(sys.argv) > 1 else r"data/brut_AMO30/json/acteur"
DEST = sys.argv[2] if len(sys.argv) > 2 else r"site_donnees/deputes.json"

if not os.path.isdir(SOURCE):
    raise SystemExit("source acteurs absente : %s" % SOURCE)

resultat = {}
for f in glob.glob(os.path.join(SOURCE, "*.json")):
    with open(f, encoding="utf-8") as h:
        a = json.load(h)["acteur"]

    mandats = a.get("mandats", {}).get("mandat", [])
    if not isinstance(mandats, list):
        mandats = [mandats]

    ident = a.get("etatCivil", {}).get("ident", {})
    uid = a.get("uid", {}).get("#text", "")

    for m in mandats:
        lieu = ((m.get("election") or {}).get("lieu") or {})
        if str(m.get("legislature")) != "17":
            continue
        if m.get("typeOrgane") != "ASSEMBLEE":
            continue
        if not lieu.get("numDepartement") or not lieu.get("numCirco"):
            continue
        if m.get("dateFin"):
            continue

        dep = str(lieu["numDepartement"])
        circo = str(lieu["numCirco"])
        resultat[f"{dep}-{circo}"] = {
            "acteurRef": uid,
            "prenom": ident.get("prenom", ""),
            "nom": ident.get("nom", ""),
            "dateDebut": m.get("dateDebut"),
            "dateFin": m.get("dateFin"),
        }

if len(resultat) < 500:
    raise SystemExit("trop peu de députés actifs produits : %d" % len(resultat))

os.makedirs(os.path.dirname(DEST) or ".", exist_ok=True)
with open(DEST, "w", encoding="utf-8") as h:
    json.dump(resultat, h, ensure_ascii=False, indent=2, sort_keys=True)

print("députés actifs :", len(resultat))
print("fichier :", DEST)
