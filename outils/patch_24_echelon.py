# -*- coding: utf-8 -*-
"""patch_24_echelon.py — la carte de traduction parlait de « la commune » sur
l'ecran du departement et sur celui de la region.

VU EN OUVRANT LES TROIS ECHELONS, pas en relisant le code. La rangee de puces
permet de passer de « Ma commune » a « Mon departement » et « Ma region » : la
meme carte s'affichait alors, en ecrivant « Si la commune consacrait tout ce
qu'elle encaisse » sous les comptes d'un departement, et « Ce qu'elle depense »
d'un objet masculin.

DEUX CORRECTIONS, DE NATURE DIFFERENTE :

 1. Le GENRE. Les tournures qui portent un pronom sont reecrites sans pronom :
    « Ses depenses » plutot que « Ce qu'elle depense », « Si tout ce qui est
    encaisse » plutot que « Si la commune consacrait ce qu'elle encaisse ».
    Vrai aux trois echelons, sans conditionnelle.

 2. L'EXEMPLE CONCRET. « L'ecole, la cantine, l'etat civil, les espaces verts »
    est ce qui rend la phrase des salaires comprehensible — et c'est faux pour un
    departement, qui paie des agents de colleges, de routes et d'aide sociale.
    Une phrase generique serait vraie partout et n'apprendrait plus rien. On
    garde donc trois exemples, un par echelon : la valeur de traduction tient
    entierement dans le concret.
"""
import io

F = "app_repere_v18_20.html"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

# ----------------------------------------------- 1. argRatios recoit l'echelon
a1 = "function argRatios(ex) {"
assert s.count(a1) == 1, "ancre 1"
b1 = '''/* Les agents qu'une collectivite paie ne sont pas les memes selon l'echelon.
   Trois exemples concrets valent mieux qu'une phrase generique vraie partout et
   utile nulle part. */
const ARG_AGENTS = {
  ville:  "l'école, la cantine, l'état civil, les espaces verts",
  dept:   "les collèges, les routes départementales, l'aide sociale",
  region: "les lycées, les trains régionaux, la formation professionnelle"
};

function argRatios(ex, k) {'''
s = s.replace(a1, b1, 1)

a2 = "  const lignes = argRatios(choisi.ex);"
assert s.count(a2) == 1, "ancre 2"
s = s.replace(a2, "  const lignes = argRatios(choisi.ex, k);", 1)

# ------------------------------------------------------- 2. les tournures neutres
PAIRES = [
 ('      d: "Si la commune consacrait tout ce qu\'elle encaisse au remboursement, il lui faudrait "\n       + "ce temps-là. Ce n\'est pas ce qui se passe :',
  '      d: "Si tout ce qui est encaissé allait au remboursement, il faudrait ce temps-là. "\n       + "Ce n\'est pas ce qui se passe :'),

 ('      d: "Ce sont les agents qui tiennent l\'école, la cantine, l\'état civil, les espaces verts. "\n       + "Une part élevée n\'est pas un gaspillage : c\'est souvent le signe d\'une commune qui rend "\n       + "ses services elle-même plutôt que de les acheter à l\'extérieur."',
  '      d: "Ce sont les agents qui tiennent " + (ARG_AGENTS[k] || "les services au quotidien")\n       + ". Une part élevée n\'est pas un gaspillage : c\'est souvent le signe d\'une collectivité qui "\n       + "rend ses services elle-même plutôt que de les acheter à l\'extérieur."'),

 ('      l: "Ce qu\'elle dépense",', '      l: "Ses dépenses",'),

 ('      d: "Moyenne sur l\'année, pas un rythme réel : les dépenses d\'une commune sont très "',
  '      d: "Moyenne sur l\'année, pas un rythme réel : les dépenses d\'une collectivité sont très "'),
]
for avant, apres in PAIRES:
    n = s.count(avant)
    assert n == 1, "ancre non unique (%d) : %r" % (n, avant[:70])
    assert "’" not in apres
    s = s.replace(avant, apres, 1)

# --------------------------------------------------------------- garde-fous
assert "argRatios(choisi.ex, k)" in s
assert s.count("function argRatios(ex, k)") == 1
for reste in ("Si la commune consacrait", "Ce qu'elle dépense\",", "dépenses d'une commune sont"):
    assert reste not in s, "tournure non neutre restante : %r" % reste

io.open(F, "w", encoding="utf-8").write(s)
print("patch 24 : %d -> %d caracteres" % (n0, len(s)))
