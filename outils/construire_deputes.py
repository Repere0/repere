import json
import glob
import os

SOURCE = r"data\brut_AMO30\json\acteur"
DEST = r"mono\data\deputes.json"

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

        date_fin = m.get("dateFin")
        if date_fin:
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

os.makedirs(os.path.dirname(DEST), exist_ok=True)

with open(DEST, "w", encoding="utf-8") as h:
    json.dump(resultat, h, ensure_ascii=False, indent=2, sort_keys=True)

print("députés actifs :", len(resultat))
print("fichier :", DEST)

for k in sorted(resultat):
    if k.startswith("69-"):
        x = resultat[k]
        print(k, "→", x["prenom"], x["nom"], "|", x["acteurRef"])