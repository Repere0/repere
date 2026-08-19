#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decrit la structure reelle du fichier des scrutins de l'Assemblee, sans la deviner.

POURQUOI CE SCRIPT EXISTE : le conteneur de travail de Claude ne peut pas joindre
data.assemblee-nationale.fr, et la page officielle ne documente aucun nom de champ.
Ecrire l'ingestion sans avoir vu le fichier reviendrait a supposer. Or le runner GitHub,
lui, telecharge ce fichier chaque matin — il l'a fait le 19/08/2026 a 07:57, 26 Mo,
HTTP 200. Il suffit donc de lui demander de DECRIRE ce qu'il a sous la main.

CE QU'IL PRODUIT : docs/schema_scrutins.md — l'arborescence des cles avec leurs types
et un exemple de valeur, plus un scrutin complet dont les listes nominatives sont
tronquees a trois entrees. Quelques dizaines de kilo-octets, lisibles par un humain.

CE QU'IL NE PRODUIT PAS : le fichier entier. 26 Mo de votes nominatifs n'ont rien a
faire dans un depot de code, et l'echantillon suffit a etablir le schema.

Usage :  python3 outils/echantillon_scrutins.py data/brut_Scrutins docs/schema_scrutins.md
"""
import sys, io, os, json, glob, collections

SOURCE = sys.argv[1] if len(sys.argv) > 1 else "data/brut_Scrutins"
SORTIE = sys.argv[2] if len(sys.argv) > 2 else "docs/schema_scrutins.md"

fichiers = sorted(glob.glob(os.path.join(SOURCE, "**", "*.json"), recursive=True))
if not fichiers:
    sys.exit("Aucun .json sous %s — l'archive n'a pas ete depilee." % SOURCE)

# ------------------------------------------------------------------ l'arborescence
# On agrege sur PLUSIEURS scrutins : un seul suffirait a rater les champs qui
# n'apparaissent que dans certains cas (vote solennel, scrutin annule, delegations).
ECHANTILLON = fichiers[:60]
chemins = collections.OrderedDict()

def parcourir(noeud, prefixe=""):
    if isinstance(noeud, dict):
        for cle, val in noeud.items():
            parcourir(val, prefixe + "." + cle if prefixe else cle)
    elif isinstance(noeud, list):
        # On note la liste, puis on decrit son PREMIER element : le reste a la meme forme.
        note(prefixe + "[]", "liste (%d)" % len(noeud), "")
        if noeud:
            parcourir(noeud[0], prefixe + "[]")
    else:
        t = {str: "texte", int: "entier", float: "decimal", bool: "booleen",
             type(None): "vide"}.get(type(noeud), type(noeud).__name__)
        note(prefixe, t, noeud)

def note(chemin, typ, exemple):
    e = chemins.setdefault(chemin, {"types": set(), "exemples": [], "vu": 0})
    e["vu"] += 1
    e["types"].add(typ)
    if len(e["exemples"]) < 2 and exemple not in ("", None):
        s = str(exemple)
        if len(s) > 90:
            s = s[:87] + "..."
        if s not in e["exemples"]:
            e["exemples"].append(s)

premier = None
for f in ECHANTILLON:
    d = json.load(io.open(f, encoding="utf-8"))
    if premier is None:
        premier = d
    parcourir(d)

# ------------------------------------------ un scrutin entier, listes tronquees a 3
def tronquer(noeud, profondeur=0):
    if isinstance(noeud, dict):
        return {k: tronquer(v, profondeur + 1) for k, v in noeud.items()}
    if isinstance(noeud, list):
        coupe = [tronquer(x, profondeur + 1) for x in noeud[:3]]
        if len(noeud) > 3:
            coupe.append("... (%d entrees au total, tronque)" % len(noeud))
        return coupe
    return noeud

os.makedirs(os.path.dirname(SORTIE) or ".", exist_ok=True)
with io.open(SORTIE, "w", encoding="utf-8") as s:
    s.write("# Schema reel du fichier des scrutins de l'Assemblee nationale\n\n")
    s.write("Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge\n")
    s.write("par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**\n\n")
    s.write("- Fichiers dans l'archive : **%d**\n" % len(fichiers))
    s.write("- Scrutins analyses pour l'arborescence : **%d**\n" % len(ECHANTILLON))
    s.write("- Premier fichier : `%s`\n\n" % os.path.relpath(fichiers[0], SOURCE))
    s.write("## Arborescence des cles\n\n")
    s.write("`vu` = sur combien des %d scrutins analyses la cle est presente. Une cle vue\n"
            "moins de %d fois est optionnelle, et l'ingestion doit la traiter comme telle.\n\n"
            % (len(ECHANTILLON), len(ECHANTILLON)))
    s.write("| chemin | type | vu | exemples |\n|---|---|---|---|\n")
    for chemin, e in chemins.items():
        ex = " · ".join(x.replace("|", "\\|") for x in e["exemples"])
        s.write("| `%s` | %s | %d | %s |\n"
                % (chemin, "/".join(sorted(e["types"])), e["vu"], ex))
    s.write("\n## Un scrutin entier, listes tronquees a trois entrees\n\n```json\n")
    s.write(json.dumps(tronquer(premier), ensure_ascii=False, indent=2))
    s.write("\n```\n")

print("schema ecrit : %s (%d cles, %d fichiers dans l'archive)"
      % (SORTIE, len(chemins), len(fichiers)))
