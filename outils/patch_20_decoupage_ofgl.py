# -*- coding: utf-8 -*-
"""patch_20_decoupage_ofgl.py — le decoupage OFGL ne decoupait rien.

TROUVE PAR L'EQUIPE, CONFIRME PAR LA MESURE. `decouper.py` ecrivait :

    com_ofgl = OFGL["ech"].get("commune", {})
    sous = {c: v for c, v in com_ofgl.items() if departement(c) == d}

Or `ech.commune` ne porte PAS les communes : il porte trois cles,
{terr, exercices, source}. La boucle iterait donc sur ces trois mots.
`departement("terr")` vaut « te », qui n'est le code d'aucun departement.
Resultat mesure : les 103 fichiers OFGL font 23 octets — {"d":"64","commune":{}}.

CE QUI A LAISSE PASSER LE DEFAUT : le cote RNE porte un controle independant
(total_com == len(RNE["com"])) et le cote OFGL n'en portait AUCUN. Le defaut
n'est pas la ligne fausse, c'est l'assertion absente. On corrige les deux, et
l'assertion d'abord.

DEUXIEME DEFAUT, meme famille : `departement()` ecrit ici et `deptFromInsee()`
ecrit dans l'application ne composent pas le meme code. L'application rend 987
et 988 sur trois chiffres ; ce script rendait 98 sur deux. 65 communes de
Polynesie et de Nouvelle-Caledonie demanderaient un fichier qui n'existe pas.
Une seule regle desormais, celle de l'application, et une assertion qui compare
les deux ensembles.
"""
import io

F = "outils/decouper.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

# ------------------------------------------------------------------- 1. la regle
a1 = '''def departement(insee):
    """Regle officielle : 97x sur trois chiffres (outre-mer), 2A/2B pour la Corse."""
    if insee[:2] == "97":
        return insee[:3]'''
assert s.count(a1) == 1, "ancre 1"
b1 = '''def departement(insee):
    """MEME REGLE QUE L'APPLICATION, mot pour mot. `deptFromInsee()` y ecrit :
           c.startsWith("97") || c.startsWith("98") ? c.slice(0,3) : c.slice(0,2)
       Ce script ecrivait 97x sur trois chiffres et 98x sur DEUX. Les 32 communes
       de Polynesie et les 33 de Nouvelle-Caledonie demandaient donc un fichier
       que le decoupage n'ecrivait pas — 404, et une phrase accusant le reseau du
       lecteur d'une faute de notre chaine. Deux endroits derivaient un code de
       departement ; il n'y en a plus qu'un qui fasse foi, et une assertion plus
       bas verifie que les deux ensembles coincident."""
    if insee[:2] in ("97", "98"):
        return insee[:3]'''
s = s.replace(a1, b1, 1)

# --------------------------------------------------------------- 2. la source OFGL
a2 = 'com_ofgl = OFGL["ech"].get("commune", {})'
assert s.count(a2) == 1, "ancre 2"
b2 = '''# `ech.commune` porte {terr, exercices, source} — les communes sont sous « terr ».
# Iterer sur ech.commune lui-meme produisait trois cles ("terr", "exercices",
# "source") dont aucune n'est un code INSEE : les 103 fichiers sortaient vides.
com_ofgl = OFGL["ech"].get("commune", {}).get("terr", {})
assert isinstance(com_ofgl, dict) and len(com_ofgl) > 30000, \\
    "ech.commune.terr ne porte que %d entrees — la forme du bloc OFGL a change" % len(com_ofgl)'''
s = s.replace(a2, b2, 1)

# --------------------------- 3. la forme ecrite : celle que ofglTerr() sait relire
a3 = '''    brut = json.dumps({"d": d, "commune": sous}, ensure_ascii=False, separators=(",", ":"))'''
assert s.count(a3) == 1, "ancre 3"
b3 = '''    # La forme rendue doit etre celle que `ofglTerr()` lit dans l'application :
    # window.REPERE_OFGL.ech.commune.terr[code]. On rend donc un sous-arbre « terr »,
    # pas un dictionnaire nu — sinon la fusion devrait deviner ou le ranger.
    brut = json.dumps({"d": d, "commune": {"terr": sous}},
                      ensure_ascii=False, separators=(",", ":"))'''
s = s.replace(a3, b3, 1)

# ------------------- 4. le socle garde exercices et source, qui ne sont pas communaux
a4 = '''ofgl_socle = {"v": OFGL.get("v"), "meta": OFGL.get("meta"),
              "departement": OFGL["ech"].get("departement"),
              "region": OFGL["ech"].get("region")}'''
assert s.count(a4) == 1, "ancre 4"
b4 = '''# `exercices` et `source` decrivent l'ECHELON, pas une commune : ils restent au
# socle. Sans eux, `ofglDernierEchelon("ville")` rendrait null et l'application ne
# pourrait plus dire « 2025 n'est pas encore la pour cette commune ».
_com = OFGL["ech"].get("commune", {})
ofgl_socle = {"v": OFGL.get("v"), "meta": OFGL.get("meta"),
              "commune": {"exercices": _com.get("exercices"), "source": _com.get("source")},
              "departement": OFGL["ech"].get("departement"),
              "region": OFGL["ech"].get("region")}'''
s = s.replace(a4, b4, 1)

# ------------------------------------------- 5. les assertions qui manquaient
a5 = '''paquets = sorted((tailles[d] + tailles_ofgl[d], d) for d in depts)'''
assert s.count(a5) == 1, "ancre 5"
b5 = '''# CONTROLE INDEPENDANT DU COTE OFGL — son absence est la cause du defaut corrige
# le 25 aout : le cote RNE en portait un, le cote OFGL n'en portait aucun, et les
# 103 fichiers sont sortis vides pendant des jours sans que rien ne le dise.
total_ofgl = 0
for d in depts:
    r = json.loads(io.open(os.path.join(SORTIE, "ofgl", "%s.json" % d), encoding="utf-8").read())
    total_ofgl += len(r["commune"]["terr"])
assert total_ofgl == len(com_ofgl), \\
    "%d communes OFGL reparties sur %d attendues" % (total_ofgl, len(com_ofgl))
assert total_ofgl > 30000, "seulement %d communes OFGL ecrites" % total_ofgl

# Les deux regles de derivation du code de departement doivent donner le MEME
# ensemble. Sans cette egalite, un territoire a statut particulier ajoute demain
# rouvrira exactement le trou des 65 communes du Pacifique.
depts_rne = sorted({departement(c) for c in RNE["cl"]})
assert depts_rne == sorted(depts), \\
    "desaccord sur les departements : %r" % (set(depts_rne) ^ set(depts))

paquets = sorted((tailles[d] + tailles_ofgl[d], d) for d in depts)'''
s = s.replace(a5, b5, 1)

assert "’" not in s, "apostrophe typographique"
io.open(F, "w", encoding="utf-8").write(s)
print("decouper.py : %d -> %d octets" % (n0, len(s)))
