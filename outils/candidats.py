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
    """Coupe a 150 signes, mais sur une FRONTIERE DE MOT : la coupe brute produisait
       des titres finissant au milieu d'un mot (« ... souverainete agrico »)."""
    t = re.sub(r"\s+", " ", t or "").strip()
    if len(t) <= 150:
        return t
    coupe = t[:150].rsplit(" ", 1)[0].rstrip(" ,;:-")
    return coupe + "\u2026"

def sansAccent(t):
    """Pour comparer sans dependre de la graphie de la source."""
    paires = (("é", "e"), ("è", "e"), ("ê", "e"), ("à", "a"), ("ô", "o"), ("û", "u"))
    t = (t or "").lower()
    for x, y in paires:
        t = t.replace(x, y)
    return t

# MESURE du 25 aout 2026 sur outils/scrutins_an.json (80 scrutins) : le champ « s » vaut
# « adopté » 46 fois et « rejeté » 34 fois — DEJA accentue. La table precedente etait
# indexee sans accent : elle ne trouvait jamais rien, et le script retombait sur le
# libelle long « l'Assemblée nationale a adopté », qu'il inserait dans une phrase
# commencant deja par « L'Assemblée nationale a ». Table indexee sur la forme mesuree.
SORTS = {"adopte": "adopté", "rejete": "rejeté"}


def titre_de(objet):
    """L'objet du scrutin est une phrase de proces-verbal : minuscule initiale et point
       final. Un titre de carte n'est ni l'un ni l'autre."""
    t = (objet or "").strip().rstrip(".").strip()
    return (t[:1].upper() + t[1:]) if t else t

ecrits, deja, poses = 0, 0, []
for e in sorted(d["r"], key=lambda x: x["d"], reverse=True)[:COMBIEN]:
    nom = "scrutin-%s-%s.md" % (e["d"], str(e["n"]).rjust(4, "0"))
    chemin = os.path.join(DEST, nom)
    # On n'ecrase JAMAIS : un candidat deja pose a peut-etre ete relu et corrige.
    if os.path.exists(chemin):
        deja += 1
        continue
    sort = SORTS.get(sansAccent(e.get("s", "")), "") or e.get("s") or ""
    objet = titre_de(ardoise(e.get("o") or e.get("t")))
    pour = e.get("dec", {}).get("pour", "")
    contre = e.get("dec", {}).get("contre", "")
    absten = e.get("dec", {}).get("abstentions", "")
    corps = (
        "Résultat du scrutin : %s, le %s.\n\n"
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
    # La faute du 25 aout, rendue impossible : le verbe ne doit jamais reintroduire
    # le sujet que la phrase porte deja.
    assert "Assemblée nationale a" not in corps, \
        "le sujet reintroduit dans le verbe, scrutin %s : %r" % (e["n"], corps[:90])
    assert corps.count("adopté") + corps.count("rejeté") <= 1, \
        "sort enonce deux fois, scrutin %s" % e["n"]
    io.open(chemin, "w", encoding="utf-8").write(texte)
    ecrits += 1
    poses.append(chemin)

# Controle : aucun candidat ECRIT PAR CE RUN ne doit sortir marque valide. La garde
# precedente jugeait TOUT le dossier — elle faisait donc echouer la chaine des qu'un
# humain avait valide un brouillon a la main, ce qui est le geste qu'on lui demande.
# Un fichier valide encore present ici est sans danger : evenements.py ne lit que
# data/evenements/. Ce n'est pas une faute, c'est un rappel.
for chemin in poses:
    t = io.open(chemin, encoding="utf-8").read()
    assert "valide: false" in t, "%s sort marque valide alors que ce run vient de l'ecrire" % chemin

a_deplacer = []
for f in sorted(os.listdir(DEST)):
    if f.endswith(".md"):
        t = io.open(os.path.join(DEST, f), encoding="utf-8").read()
        if "valide: true" in t:
            a_deplacer.append(f)

print("candidats ecrits        : %d" % ecrits)
print("deja presents, intacts  : %d" % deja)
print("en attente de relecture : %d" % len([f for f in os.listdir(DEST) if f.endswith('.md')]))
if a_deplacer:
    print()
    print("%d candidat(s) sont marques « valide: true » mais encore dans %s :"
          % (len(a_deplacer), DEST))
    for f in a_deplacer:
        print("   - %s" % f)
    print("Tant qu'ils sont la, l'application ne les voit PAS. Deplace-les dans")
    print("data/evenements/ pour qu'ils soient publies.")
print()
print("Pour en publier un : relis-le, complete « Ce que ca change », puis")
print("passe `valide: false` a `valide: true` et deplace le fichier dans data/evenements/.")
