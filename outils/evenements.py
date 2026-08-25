#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AUTO -> RELU -> PUBLIE : la couche editoriale de Repere.

D'OU VIENT CETTE IDEE : du document « DATA BRAIN », et c'est la meilleure des cinq
propositions. Elle repond a une objection que la synthese de l'equipe avait laissee
ouverte : « si l'ingestion tourne seule, la phrase "relu par un humain" devient fausse,
sur le point exact ou l'on demande d'etre cru. » Le decoupage en trois etats resout ca
sans rien sacrifier :
    data/auto/        candidats fabriques par la machine — JAMAIS affiches
    data/evenements/  ce qu'un humain a relu et valide — la seule source de l'application
Le passage de l'un a l'autre est un geste humain, et c'est ce geste qui rend vraie la
promesse de l'invariant 4.

CE QUE CE SCRIPT FAIT : il lit data/evenements/*.md (entete YAML + corps), refuse tout ce
qui ne porte pas ses preuves, et produit outils/evenements.json pour l'application.

CE QU'IL REFUSE, ET POURQUOI IL LE REFUSE PLUTOT QUE DE LE CORRIGER :
  - un evenement sans `source` ou sans `date` : l'invariant 4 exige que chaque fait porte
    sa source officielle et sa date. Un evenement sans source n'est pas un evenement
    incomplet, c'est une affirmation ;
  - un evenement dont la source n'est pas un domaine public francais autorise. La liste
    est en dur plus bas. Elle exclut la presse : republier le titre et le chapeau d'un
    journal, c'est reproduire une oeuvre protegee — et un produit qui promet « sources
    officielles uniquement » ne peut pas heriter de la ligne editoriale d'un journal ;
  - un evenement encore marque `valide: false` : c'est un candidat, il reste en salle
    d'attente.

Usage :  python3 outils/evenements.py data/evenements outils/evenements.json
"""
import sys, io, os, re, json, glob, datetime, collections

SOURCE = sys.argv[1] if len(sys.argv) > 1 else "data/evenements"
SORTIE = sys.argv[2] if len(sys.argv) > 2 else "outils/evenements.json"

# Domaines admis : institutions et donnees publiques francaises, sous Licence ouverte ou
# regime de publicite legale. AUCUN media. Ajouter une ligne ici est une decision, pas
# une correction : elle engage la promesse « sources officielles uniquement ».
DOMAINES = (
    "legifrance.gouv.fr", "assemblee-nationale.fr", "senat.fr",
    "conseil-constitutionnel.fr", "vie-publique.fr", "data.gouv.fr",
    "journal-officiel.gouv.fr", "hatvp.fr", "ccomptes.fr", "insee.fr",
    "collectivites-locales.gouv.fr", "economie.gouv.fr", "interieur.gouv.fr",
    "elections.interieur.gouv.fr", "gouvernement.fr", "prefectures-regions.gouv.fr",
    ".gouv.fr", ".fr/deliberations",           # prefectures, mairies : suffixes larges
)
ECHELONS = ("ville", "agglo", "departement", "region", "france")
CONFIANCE = ("verifie", "a_confirmer")

def entete(txt):
    """Entete YAML minimal : cle: valeur, une par ligne. Pas de dependance externe."""
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", txt, re.S)
    if not m:
        return None, txt
    meta = {}
    for ligne in m.group(1).split("\n"):
        if ":" not in ligne:
            continue
        k, v = ligne.split(":", 1)
        v = v.strip().strip('"').strip("'")
        if v in ("true", "false"):
            v = (v == "true")
        meta[k.strip()] = v
    return meta, m.group(2).strip()

fichiers = sorted(glob.glob(os.path.join(SOURCE, "*.md")))
retenus, refus = [], collections.Counter()
detail = []

for f in fichiers:
    brut = io.open(f, encoding="utf-8").read()
    meta, corps = entete(brut)
    nom = os.path.basename(f)
    if meta is None:
        refus["entete absente"] += 1; detail.append((nom, "entete YAML absente")); continue
    if not meta.get("valide") is True:
        refus["en attente de relecture"] += 1; continue
    manque = [c for c in ("titre", "date", "source", "echelon") if not meta.get(c)]
    if manque:
        refus["champ manquant"] += 1; detail.append((nom, "manque " + ", ".join(manque))); continue
    src = str(meta["source"])
    if not any(d in src for d in DOMAINES):
        refus["source non officielle"] += 1
        detail.append((nom, "source hors liste : " + src[:70])); continue
    if meta["echelon"] not in ECHELONS:
        refus["echelon inconnu"] += 1; detail.append((nom, "echelon " + str(meta["echelon"]))); continue
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(meta["date"])):
        refus["date mal formee"] += 1; detail.append((nom, "date " + str(meta["date"]))); continue
    conf = meta.get("confiance", "a_confirmer")
    if conf not in CONFIANCE:
        refus["confiance inconnue"] += 1; detail.append((nom, "confiance " + str(conf))); continue
    if not corps:
        refus["corps vide"] += 1; detail.append((nom, "aucun texte")); continue
    retenus.append({
        "id": os.path.splitext(nom)[0],
        "t": meta["titre"],
        "d": str(meta["date"]),
        "e": meta["echelon"],
        "src": src,
        "srcn": meta.get("source_nom", ""),
        "conf": conf,
        "insee": str(meta.get("insee", "")),
        "txt": corps,
    })

retenus.sort(key=lambda e: (e["d"], e["id"]), reverse=True)
paquet = {"v": 1,
          "maj": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
          "r": retenus}
brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))

# controle independant : on relit sans reutiliser une variable d'au-dessus
relu = json.loads(brut)
assert all(e["src"] and e["d"] and e["e"] for e in relu["r"]), "un evenement sans preuve a passe"
assert relu["r"] == sorted(relu["r"], key=lambda e: (e["d"], e["id"]), reverse=True)
assert all(any(d in e["src"] for d in DOMAINES) for e in relu["r"]), "une source hors liste a passe"

os.makedirs(os.path.dirname(SORTIE) or ".", exist_ok=True)
io.open(SORTIE, "w", encoding="utf-8").write(brut)

print("fichiers lus            : %d" % len(fichiers))
print("evenements publies      : %d" % len(retenus))
if retenus:
    print("  du %s au %s" % (retenus[-1]["d"], retenus[0]["d"]))
for k, v in refus.most_common():
    print("  ecarte : %-24s %d" % (k, v))
for nom, raison in detail[:8]:
    print("     %s -> %s" % (nom, raison))
print("poids                   : %.1f Ko" % (len(brut.encode()) / 1024))
