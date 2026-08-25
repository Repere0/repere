#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DATA -> PIPELINE -> JSON : decoupe les donnees embarquees en un fichier par departement.

LE PROBLEME MESURE : l'application embarque 16,3 Mo de donnees dont 95,9 % du fichier.
Quelqu'un qui ouvre Repere pour Ustaritz telecharge les elus et les comptes des 34 875
communes de France pour en lire une. Sur un reseau mobile moyen, c'est plusieurs dizaines
de secondes avant le premier mot lisible — et le produit se juge en cinq secondes.

CE QUE FAIT CE SCRIPT, et ce qu'il ne fait pas :
  - il DECOUPE : un socle commun, puis un fichier par departement ;
  - il REINDEXE les tables partagees. Le RNE stocke les personnes par index dans deux
    tables globales (7 821 prenoms, 74 728 noms). Decouper sans reindexer obligerait a
    servir les 805 Ko de noms de France entiere a chaque lecteur. Chaque departement
    porte donc SES prenoms et SES noms, renumerotes ;
  - il ne touche PAS au fichier autonome. L'invariant 1 tient : app_repere_vXX.html garde
    tout embarque et fonctionne hors ligne, sans une requete. C'est la version SERVIE, et
    elle seule, qui va chercher son departement.

Usage :  python3 outils/decouper.py app_repere_v18_19.html site_engendre/donnees
"""
import sys, io, os, re, json, collections

SOURCE = sys.argv[1]
SORTIE = sys.argv[2] if len(sys.argv) > 2 else "donnees"

def departement(insee):
    """MEME REGLE QUE L'APPLICATION, mot pour mot. `deptFromInsee()` y ecrit :
           c.startsWith("97") || c.startsWith("98") ? c.slice(0,3) : c.slice(0,2)
       Ce script ecrivait 97x sur trois chiffres et 98x sur DEUX. Les 32 communes
       de Polynesie et les 33 de Nouvelle-Caledonie demandaient donc un fichier
       que le decoupage n'ecrivait pas — 404, et une phrase accusant le reseau du
       lecteur d'une faute de notre chaine. Deux endroits derivaient un code de
       departement ; il n'y en a plus qu'un qui fasse foi, et une assertion plus
       bas verifie que les deux ensembles coincident."""
    if insee[:2] in ("97", "98"):
        return insee[:3]
    return insee[:2]

src = io.open(SOURCE, encoding="utf-8").read()

def extraire(nom):
    m = re.search(r"window\." + nom + r"\s*=\s*", src)
    assert m, "structure %s introuvable" % nom
    i = m.end(); prof = 0; j = i
    while True:
        c = src[j]
        if c in "[{": prof += 1
        elif c in "]}":
            prof -= 1
            if prof == 0: break
        j += 1
    return json.loads(src[i:j+1])

RNE = extraire("REPERE_RNE")
OFGL = extraire("REPERE_OFGL")

# --------------------------------------------------------------- reindexation
class Table:
    """Une table locale qui ne retient que ce qu'on lui demande, dans l'ordre d'arrivee."""
    def __init__(self, source):
        self.source = source
        self.vals = []
        self.idx = {}
    def __call__(self, i):
        if i is None: return None
        if i not in self.idx:
            self.idx[i] = len(self.vals)
            self.vals.append(self.source[i])
        return self.idx[i]

def personne(t_p, t_n, e):
    """[prenom, nom, fonction] -> memes champs, index locaux. La fonction reste globale :
       104 valeurs, 2 Ko, la dupliquer coute moins cher que la reindexer."""
    if not isinstance(e, list) or len(e) < 2: return e
    return [t_p(e[0]), t_n(e[1])] + list(e[2:])

# LA FORME DE CHAQUE CLE, RELEVEE ET NON DEVINEE (mesure du 25/08/2026) :
#   com   : [p, n, f]                      une personne
#   adj   : [[p, n, f], ...]               une liste
#   ecc   : [epci, x, [[p, n, f], ...]]    la liste est au TROISIEME rang
#   dep / reg / nat / csp / arr : [[p, n, f, ...], ...]
# Une heuristique « si c'est une liste de listes » plantait sur ecc, dont le premier
# element est un entier. On declare donc la forme, cle par cle.
FORME = {"com": "une", "adj": "liste", "ecc": "ecc",
         "dep": "liste", "reg": "liste", "nat": "liste",
         "csp": "liste", "arr": "liste"}

def personnes(t_p, t_n, v, forme):
    if forme == "une":
        return personne(t_p, t_n, v)
    if forme == "liste":
        return [personne(t_p, t_n, x) for x in v]
    if forme == "ecc":
        out = list(v)
        out[2] = [personne(t_p, t_n, x) for x in v[2]]
        return out
    return v

PAR_COMMUNE = ["com", "adj", "ecc", "ccan", "cl", "dcom", "dadj"]
PAR_DEPT    = ["dep", "depcan", "ddep"]
SOCLE       = ["v", "meta", "f", "e", "cn", "d", "reg", "nat", "csp", "csplib",
               "dreg", "dnat", "dcsp", "arr"]

# quelles cles portent des personnes a reindexer (les autres sont des libelles ou des dates)
PERSONNES = {"com", "adj", "ecc", "dep", "reg", "nat", "csp", "arr"}

communes = sorted(RNE["com"])
depts = sorted({departement(c) for c in communes})

os.makedirs(os.path.join(SORTIE, "rne"), exist_ok=True)
os.makedirs(os.path.join(SORTIE, "ofgl"), exist_ok=True)

# ------------------------------------------------------------------- le socle
t_p, t_n = Table(RNE["p"]), Table(RNE["n"])
socle = {}
for k in SOCLE:
    if k not in RNE: continue
    v = RNE[k]
    if k in PERSONNES and isinstance(v, dict):
        socle[k] = {kk: personnes(t_p, t_n, vv, FORME[k]) for kk, vv in v.items()}
    else:
        socle[k] = v
socle["p"], socle["n"] = t_p.vals, t_n.vals
socle_brut = json.dumps(socle, ensure_ascii=False, separators=(",", ":"))
io.open(os.path.join(SORTIE, "rne", "socle.json"), "w", encoding="utf-8").write(socle_brut)

# ------------------------------------------------------- un fichier par departement
tailles = {}
for d in depts:
    ses = [c for c in communes if departement(c) == d]
    tp, tn = Table(RNE["p"]), Table(RNE["n"])
    paquet = {"d": d}
    for k in PAR_COMMUNE:
        if k not in RNE: continue
        sous = {}
        for c in ses:
            if c in RNE[k]:
                sous[c] = personnes(tp, tn, RNE[k][c], FORME[k]) if k in PERSONNES else RNE[k][c]
        if sous: paquet[k] = sous
    for k in PAR_DEPT:
        if k in RNE and d in RNE[k]:
            paquet[k] = personnes(tp, tn, RNE[k][d], FORME[k]) if k in PERSONNES else RNE[k][d]
    paquet["p"], paquet["n"] = tp.vals, tn.vals
    brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))
    io.open(os.path.join(SORTIE, "rne", "%s.json" % d), "w", encoding="utf-8").write(brut)
    tailles[d] = len(brut.encode())

# ------------------------------------------------------------------------- OFGL
# `exercices` et `source` decrivent l'ECHELON, pas une commune : ils restent au
# socle. Sans eux, `ofglDernierEchelon("ville")` rendrait null et l'application ne
# pourrait plus dire « 2025 n'est pas encore la pour cette commune ».
_com = OFGL["ech"].get("commune", {})
ofgl_socle = {"v": OFGL.get("v"), "meta": OFGL.get("meta"),
              "commune": {"exercices": _com.get("exercices"), "source": _com.get("source")},
              "departement": OFGL["ech"].get("departement"),
              "region": OFGL["ech"].get("region")}
ofgl_brut = json.dumps(ofgl_socle, ensure_ascii=False, separators=(",", ":"))
io.open(os.path.join(SORTIE, "ofgl", "socle.json"), "w", encoding="utf-8").write(ofgl_brut)

# `ech.commune` porte {terr, exercices, source} — les communes sont sous « terr ».
# Iterer sur ech.commune lui-meme produisait trois cles ("terr", "exercices",
# "source") dont aucune n'est un code INSEE : les 103 fichiers sortaient vides.
com_ofgl = OFGL["ech"].get("commune", {}).get("terr", {})
assert isinstance(com_ofgl, dict) and len(com_ofgl) > 30000, \
    "ech.commune.terr ne porte que %d entrees — la forme du bloc OFGL a change" % len(com_ofgl)
tailles_ofgl = {}
for d in depts:
    sous = {c: v for c, v in com_ofgl.items() if departement(c) == d}
    # La forme rendue doit etre celle que `ofglTerr()` lit dans l'application :
    # window.REPERE_OFGL.ech.commune.terr[code]. On rend donc un sous-arbre « terr »,
    # pas un dictionnaire nu — sinon la fusion devrait deviner ou le ranger.
    brut = json.dumps({"d": d, "commune": {"terr": sous}},
                      ensure_ascii=False, separators=(",", ":"))
    io.open(os.path.join(SORTIE, "ofgl", "%s.json" % d), "w", encoding="utf-8").write(brut)
    tailles_ofgl[d] = len(brut.encode())

# ---------------------------------------------------------------- le manifeste
manifeste = {"v": 1, "departements": depts,
             "rne": {"socle": len(socle_brut.encode()), "dep": tailles},
             "ofgl": {"socle": len(ofgl_brut.encode()), "dep": tailles_ofgl}}
io.open(os.path.join(SORTIE, "manifeste.json"), "w", encoding="utf-8").write(
    json.dumps(manifeste, ensure_ascii=False, separators=(",", ":")))

# --------------------------------------------------- controle independant, sans confiance
relu = json.loads(io.open(os.path.join(SORTIE, "rne", "%s.json" % depts[0]), encoding="utf-8").read())
un = sorted(relu["com"])[0]
i_p, i_n = relu["com"][un][0], relu["com"][un][1]
attendu = [RNE["p"][RNE["com"][un][0]], RNE["n"][RNE["com"][un][1]]]
obtenu = [relu["p"][i_p], relu["n"][i_n]]
assert obtenu == attendu, "la reindexation a casse un nom : %r vs %r" % (obtenu, attendu)
total_com = sum(len(json.loads(io.open(os.path.join(SORTIE, "rne", "%s.json" % d),
                encoding="utf-8").read()).get("com", {})) for d in depts)
assert total_com == len(RNE["com"]), "%d communes reparties sur %d" % (total_com, len(RNE["com"]))

# CONTROLE INDEPENDANT DU COTE OFGL — son absence est la cause du defaut corrige
# le 25 aout : le cote RNE en portait un, le cote OFGL n'en portait aucun, et les
# 103 fichiers sont sortis vides pendant des jours sans que rien ne le dise.
total_ofgl = 0
for d in depts:
    r = json.loads(io.open(os.path.join(SORTIE, "ofgl", "%s.json" % d), encoding="utf-8").read())
    total_ofgl += len(r["commune"]["terr"])
assert total_ofgl == len(com_ofgl), \
    "%d communes OFGL reparties sur %d attendues" % (total_ofgl, len(com_ofgl))
assert total_ofgl > 30000, "seulement %d communes OFGL ecrites" % total_ofgl

# Les deux regles de derivation du code de departement doivent donner le MEME
# ensemble. Sans cette egalite, un territoire a statut particulier ajoute demain
# rouvrira exactement le trou des 65 communes du Pacifique.
depts_rne = sorted({departement(c) for c in RNE["cl"]})
assert depts_rne == sorted(depts), \
    "desaccord sur les departements : %r" % (set(depts_rne) ^ set(depts))

paquets = sorted((tailles[d] + tailles_ofgl[d], d) for d in depts)
avant = os.path.getsize(SOURCE)
apres = len(socle_brut.encode()) + len(ofgl_brut.encode()) + paquets[len(paquets)//2][0]
print("departements                 : %d" % len(depts))
print("socle RNE                    : %6.0f Ko" % (len(socle_brut.encode())/1024))
print("socle OFGL                   : %6.0f Ko" % (len(ofgl_brut.encode())/1024))
print("departement le plus leger    : %6.0f Ko  (%s)" % (paquets[0][0]/1024, paquets[0][1]))
print("departement median           : %6.0f Ko  (%s)" % (paquets[len(paquets)//2][0]/1024, paquets[len(paquets)//2][1]))
print("departement le plus lourd    : %6.0f Ko  (%s)" % (paquets[-1][0]/1024, paquets[-1][1]))
print()
print("ce qu'un lecteur telecharge  : %.0f Ko  (socles + son departement, cas median)" % (apres/1024))
print("ce qu'il telechargeait avant : %.1f Mo" % (avant/1048576))
print("rapport                      : %.0f fois moins" % (avant/apres))
