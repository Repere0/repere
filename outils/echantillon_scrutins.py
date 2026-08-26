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
# On agrege sur PLUSIEURS fichiers : un seul suffirait a rater les champs qui
# n'apparaissent que dans certains cas (vote solennel, scrutin annule, delegations,
# ou — c'est le cas qui a fait ecrire ce bloc — un mandat en cours a l'Assemblee).
#
# POURQUOI PAS `fichiers[:60]`, QUI ETAIT LA JUSQU'AU 25/08/2026 : sur l'archive des
# acteurs, les soixante premiers par ordre alphabetique sont PA1001, PA1002... les
# acteurs les plus anciens. Aucun n'a de mandat en cours, donc aucun ne porte le
# numero de circonscription. Le document engendre etait juste et inutilisable.
BALAYAGE = 3000     # fichiers ouverts au plus, repartis dans toute l'archive
ELEMENTS = 50       # elements parcourus au plus DANS UNE LISTE. Les listes
                    # nominatives d'un scrutin comptent des centaines d'entrees
                    # homogenes ; cinquante suffisent a faire sortir une forme
                    # rare, et le cout reste borne.

def _compter(d):
    """Nombre de chemins de cles d'un document DEJA charge : sert a designer le
       fichier le plus riche sans le relire depuis le disque."""
    vu = set()
    def marche(noeud, prefixe=""):
        if isinstance(noeud, dict):
            for cle, val in noeud.items():
                marche(val, prefixe + "." + cle if prefixe else cle)
        elif isinstance(noeud, list):
            vu.add(prefixe + "[]")
            for x in noeud[:ELEMENTS]:
                marche(x, prefixe + "[]")
        else:
            vu.add(prefixe)
    marche(d)
    return len(vu)


# 1. Balayage a pas regulier : on ne depend plus de l'ordre alphabetique, et on ne
#    lit jamais plus de BALAYAGE fichiers, quelle que soit la taille de l'archive.
pas = max(1, len(fichiers) // BALAYAGE)
balayes = fichiers[::pas][:BALAYAGE]
# 2. TOUS les fichiers balayes sont decrits. Un tirage glouton « les soixante plus
#    riches » avait ete ecrit d'abord, puis retire : sur un echantillon choisi pour
#    sa DIVERSITE, la colonne « vu » ne mesure plus une frequence mais le nombre de
#    fichiers deliberement differents qui portaient la cle — et la legende du tableau
#    promet une frequence. On decrit donc tout ce qu'on a ouvert : la couverture est
#    maximale par construction, et « vu » redevient vrai.
ECHANTILLON = list(balayes)


chemins = collections.OrderedDict()

def parcourir(noeud, prefixe=""):
    if isinstance(noeud, dict):
        for cle, val in noeud.items():
            parcourir(val, prefixe + "." + cle if prefixe else cle)
    elif isinstance(noeud, list):
        # TOUS les elements, jusqu'a ELEMENTS. « Le reste a la meme forme » etait
        # l'hypothese ecrite ici jusqu'au 25/08/2026, et elle est fausse : la liste
        # des mandats d'un acteur melange des formes differentes, et celle qui porte
        # le numero de circonscription n'est presque jamais la premiere.
        note(prefixe + "[]", "liste", "", len(noeud))
        for x in noeud[:ELEMENTS]:
            parcourir(x, prefixe + "[]")
    else:
        t = {str: "texte", int: "entier", float: "decimal", bool: "booleen",
             type(None): "vide"}.get(type(noeud), type(noeud).__name__)
        note(prefixe, t, noeud)

def note(chemin, typ, exemple, taille=None):
    e = chemins.setdefault(chemin, {"types": set(), "exemples": [], "vu": 0,
                                    "min": None, "max": None})
    e["vu"] += 1
    e["types"].add(typ)
    # La LONGUEUR d'une liste n'est pas son type : la noter comme tel produisait une
    # variante par longueur rencontree, soit des milliers sur 3 000 fichiers. On garde
    # la plage, qui est ce dont a besoin qui ecrit une ingestion : la liste peut-elle
    # etre vide, et jusqu'ou monte-t-elle.
    if taille is not None:
        e["min"] = taille if e["min"] is None else min(e["min"], taille)
        e["max"] = taille if e["max"] is None else max(e["max"], taille)
    if len(e["exemples"]) < 2 and exemple not in ("", None):
        s = str(exemple)
        if len(s) > 90:
            s = s[:87] + "..."
        if s not in e["exemples"]:
            e["exemples"].append(s)

# Le fichier montre en entier est le PLUS RICHE de l'echantillon, pas le premier
# de l'alphabet : un exemple pauvre n'apprend rien a qui doit ecrire un lecteur.
riche, premier, exemple_nom = -1, None, ECHANTILLON[0]
for f in ECHANTILLON:
    try:
        d = json.load(io.open(f, encoding="utf-8"))
    except ValueError:
        continue
    parcourir(d)
    # Le fichier le plus riche est celui qui porte le plus de cles. On le mesure ici,
    # pendant le parcours, plutot que de relire chaque fichier une seconde fois.
    n = _compter(d)
    if n > riche:
        riche, premier, exemple_nom = n, d, f

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
    s.write("- Fichiers ouverts pour le tirage : **%d** (pas de %d)\n" % (len(balayes), pas))
    s.write("- Fichiers decrits : **%d** — tous ceux qui ont ete ouverts\n" % len(ECHANTILLON))
    s.write("- Cles distinctes trouvees : **%d**\n" % len(chemins))
    s.write("- Fichier montre en entier plus bas : `%s` (le plus riche de l'echantillon)\n\n"
            % os.path.relpath(exemple_nom, SOURCE))
    s.write("## Arborescence des cles\n\n")
    s.write("`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un\n"
            "nombre de fichiers : une cle situee dans une liste est comptee une fois par\n"
            "element. Une cle vue beaucoup moins souvent que les autres est un cas\n"
            "particulier, et l'ingestion doit la traiter comme facultative. Les cles vues\n"
            "une seule fois sont reprises a part, plus bas.\n\n")
    s.write("| chemin | type | vu | exemples |\n|---|---|---|---|\n")
    for chemin, e in chemins.items():
        ex = " · ".join(x.replace("|", "\\|") for x in e["exemples"])
        if e["max"] is not None:
            plage = ("%d entree(s)" % e["max"]) if e["min"] == e["max"] \
                    else ("de %d a %d entrees" % (e["min"], e["max"]))
            ex = (plage + (" · " + ex if ex else ""))
        s.write("| `%s` | %s | %d | %s |\n"
                % (chemin, "/".join(sorted(e["types"])), e["vu"], ex))
    rares = [c for c, e in chemins.items() if e["vu"] == 1]
    s.write("\n## Cles vues UNE SEULE FOIS\n\n")
    s.write("Ce sont les cas particuliers : elles n'existent que dans certains fichiers.\n"
            "C'est exactement ce que l'ancien tirage — les soixante premiers par ordre\n"
            "alphabetique — ratait par construction. Une ingestion doit les traiter\n"
            "comme facultatives.\n\n")
    if rares:
        for c in rares:
            s.write("- `%s`\n" % c)
    else:
        s.write("_Aucune : toutes les cles apparaissent au moins deux fois._\n")
    s.write("\n## Un fichier entier, listes tronquees a trois entrees\n\n```json\n")
    s.write(json.dumps(tronquer(premier), ensure_ascii=False, indent=2))
    s.write("\n```\n")

print("schema ecrit : %s (%d cles, %d fichiers dans l'archive)"
      % (SORTIE, len(chemins), len(fichiers)))
