#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AUTO : fabrique des candidats d'evenement a partir des sources DEJA collectees.

L'ETAGE « AUTO » du decoupage AUTO -> RELU -> PUBLIE. Ce script ne publie rien : il pose
des brouillons dans data/auto/, avec `valide: false`. Tant qu'un humain n'a pas relu et
bascule le fichier dans data/evenements/, l'application ne les voit pas.

POURQUOI PAS DE FLUX DE PRESSE, alors que le document « SCRAPER PIPELINE » en proposait
trois : republier le titre et le chapeau d'un article est une reproduction d'oeuvre
protegee, et un produit qui promet « sources officielles uniquement » ne peut pas heriter
de la ligne editoriale d'un journal. Les scrutins de l'Assemblee, eux, sont sous Licence
ouverte, dates, nominatifs et incontestables. Il y en a 8 434 : la matiere ne manque pas.

POURQUOI AUCUN APPEL A UN MODELE DE LANGAGE ICI : le document « PIPELINE IA » proposait de
faire ecrire par un modele « un impact concret pour un citoyen ». Un impact invente par une
machine est un jugement sans source, sur un produit dont toute la valeur est de n'en porter
aucun. Le resume automatique reste possible — mais a l'etage AUTO seulement, sur un
brouillon qu'un humain reecrit. Ce script laisse donc le champ « Ce que ca change » VIDE,
exprès : c'est a l'humain de l'ecrire, ou de le laisser vide.

Usage :  python3 outils/candidats.py outils/scrutins_an.json data/auto [N]
"""
import sys, io, os, json, re, datetime

SRC = sys.argv[1] if len(sys.argv) > 1 else "outils/scrutins_an.json"
DEST = sys.argv[2] if len(sys.argv) > 2 else "data/auto"
COMBIEN = int(sys.argv[3]) if len(sys.argv) > 3 else 10

if not os.path.exists(SRC):
    sys.exit("source absente : %s" % SRC)

d = json.load(io.open(SRC, encoding="utf-8"))
assert d.get("v") == 1, "format inattendu"
os.makedirs(DEST, exist_ok=True)

def ardoise(t):
    t = re.sub(r"\s+", " ", t or "").strip()
    return t[:150]

SORTS = {"adopte": "adopté", "rejete": "rejeté"}

ecrits, deja = 0, 0
for e in sorted(d["r"], key=lambda x: x["d"], reverse=True)[:COMBIEN]:
    nom = "scrutin-%s-%s.md" % (e["d"], str(e["n"]).rjust(4, "0"))
    chemin = os.path.join(DEST, nom)
    # On n'ecrase JAMAIS : un candidat deja pose a peut-etre ete relu et corrige.
    if os.path.exists(chemin):
        deja += 1
        continue
    sort = SORTS.get(e.get("s", ""), e.get("sl") or e.get("s") or "")
    objet = ardoise(e.get("o") or e.get("t"))
    pour = e.get("dec", {}).get("pour", "")
    contre = e.get("dec", {}).get("contre", "")
    absten = e.get("dec", {}).get("abstentions", "")
    corps = (
        "L'Assemblée nationale a %s ce texte le %s.\n\n"
        "Pour : %s · Contre : %s · Abstentions : %s · Votants : %s\n\n"
        "Ce que ça change : \n"
    ) % (sort or "voté", e["d"], pour, contre, absten, e.get("nv", ""))
    texte = (
        "---\n"
        "titre: %s\n"
        "date: %s\n"
        "echelon: france\n"
        "source: https://www.assemblee-nationale.fr/dyn/17/scrutins/%s\n"
        "source_nom: Assemblée nationale — scrutin public n° %s\n"
        "confiance: a_confirmer\n"
        "valide: false\n"
        "---\n\n%s"
    ) % (objet.replace(":", " —"), e["d"], e["n"], e["n"], corps)
    io.open(chemin, "w", encoding="utf-8").write(texte)
    ecrits += 1

# controle : aucun candidat ne doit sortir marque valide
for f in sorted(os.listdir(DEST)):
    if f.endswith(".md"):
        t = io.open(os.path.join(DEST, f), encoding="utf-8").read()
        assert "valide: false" in t, "%s n'est pas marque comme brouillon" % f

print("candidats ecrits        : %d" % ecrits)
print("deja presents, intacts  : %d" % deja)
print("en attente de relecture : %d" % len([f for f in os.listdir(DEST) if f.endswith('.md')]))
print()
print("Pour en publier un : relis-le, complete « Ce que ca change », puis")
print("passe `valide: false` a `valide: true` et deplace le fichier dans data/evenements/.")
