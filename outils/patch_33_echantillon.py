# -*- coding: utf-8 -*-
"""patch_33_echantillon.py — l'echantillonneur regardait toujours les memes soixante.

CE QUI S'EST PASSE. Pour ecrire la jointure « depute -> circonscription », il faut
le nom du champ qui porte le numero de circonscription dans le referentiel des
acteurs de l'Assemblee. Ce nom devait etre dans docs/schema_acteurs.md, qui existe
exactement pour ca : permettre d'ecrire un lecteur sans avoir la donnee sous la
main. Il n'y etait pas.

LA CAUSE, MESUREE. `ECHANTILLON = fichiers[:60]` prend les SOIXANTE PREMIERS
fichiers par ordre alphabetique. Sur l'archive des acteurs, ce sont PA1001.json,
PA1002.json... : les acteurs les plus anciens, dont aucun n'a de mandat en cours a
l'Assemblee. Le champ existe dans le fichier ; il n'existe dans aucun des soixante
que le descripteur a ouverts. Le document engendre etait donc juste, complet sur ce
qu'il decrivait, et muet sur ce dont on avait besoin.

CE QUE LE PATCH CHANGE. Le tirage n'est plus « les soixante premiers » mais
« soixante fichiers choisis pour couvrir le plus de cles possible » :
  1. on balaie l'archive par pas reguliers (jusqu'a 3 000 fichiers), pour ne pas
     dependre de l'ordre alphabetique ni lire des giga-octets ;
  2. on retient gloutonnement ceux qui apportent des cles encore jamais vues.
Un fichier qui n'apporte rien n'entre pas dans l'echantillon ; un fichier rare qui
porte a lui seul une branche entiere y entre forcement.

CE QUE LE DOCUMENT DIRA EN PLUS : combien de fichiers ont ete balayes, combien
retenus, et surtout LES CLES VUES UNE SEULE FOIS — celles qui n'existent que dans
un cas particulier, et que la methode precedente ratait par construction.

CE QUI N'EST PAS VERIFIE, ET IL FAUT LE DIRE : ce conteneur ne peut pas joindre
data.assemblee-nationale.fr (le mandataire repond 403 sur les cinq sources). Le
tirage est donc eprouve sur une archive fabriquee ici qui reproduit exactement la
pathologie — 3 000 fichiers dont trois seulement, tres loin dans l'ordre
alphabetique, portent la branche recherchee — et NON sur l'archive reelle. La
preuve sur donnees reelles arrivera avec le prochain passage de la chaine.
"""
import io

F = "outils/echantillon_scrutins.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a1 = '''# ------------------------------------------------------------------ l'arborescence
# On agrege sur PLUSIEURS scrutins : un seul suffirait a rater les champs qui
# n'apparaissent que dans certains cas (vote solennel, scrutin annule, delegations).
ECHANTILLON = fichiers[:60]
chemins = collections.OrderedDict()'''
assert s.count(a1) == 1, "ancre 1"

b1 = '''# ------------------------------------------------------------------ l'arborescence
# On agrege sur PLUSIEURS fichiers : un seul suffirait a rater les champs qui
# n'apparaissent que dans certains cas (vote solennel, scrutin annule, delegations,
# ou — c'est le cas qui a fait ecrire ce bloc — un mandat en cours a l'Assemblee).
#
# POURQUOI PAS `fichiers[:60]`, QUI ETAIT LA JUSQU'AU 25/08/2026 : sur l'archive des
# acteurs, les soixante premiers par ordre alphabetique sont PA1001, PA1002... les
# acteurs les plus anciens. Aucun n'a de mandat en cours, donc aucun ne porte le
# numero de circonscription. Le document engendre etait juste et inutilisable.
CIBLE = 60          # taille de l'echantillon retenu
BALAYAGE = 3000     # fichiers ouverts au plus, repartis dans toute l'archive

def cles_de(chemin):
    """L'ensemble des chemins de cles d'un fichier, sans les valeurs."""
    vu = set()
    def marche(noeud, prefixe=""):
        if isinstance(noeud, dict):
            for cle, val in noeud.items():
                marche(val, prefixe + "." + cle if prefixe else cle)
        elif isinstance(noeud, list):
            vu.add(prefixe + "[]")
            if noeud:
                marche(noeud[0], prefixe + "[]")
        else:
            vu.add(prefixe)
    try:
        marche(json.load(io.open(chemin, encoding="utf-8")))
    except ValueError:
        return set()
    return vu

# 1. Balayage a pas regulier : on ne depend plus de l'ordre alphabetique, et on ne
#    lit jamais plus de BALAYAGE fichiers, quelle que soit la taille de l'archive.
pas = max(1, len(fichiers) // BALAYAGE)
balayes = fichiers[::pas][:BALAYAGE]
inventaire = [(f, cles_de(f)) for f in balayes]

# 2. Tirage glouton : a chaque tour on prend le fichier qui apporte le plus de cles
#    encore jamais vues. Un fichier qui n'apporte rien n'entre pas. Un fichier rare
#    qui porte a lui seul une branche entiere entre forcement.
ECHANTILLON, connues = [], set()
restants = list(inventaire)
while restants and len(ECHANTILLON) < CIBLE:
    restants.sort(key=lambda p: len(p[1] - connues), reverse=True)
    f, k = restants[0]
    if not (k - connues) and ECHANTILLON:
        break                      # plus rien de neuf : inutile d'ouvrir davantage
    ECHANTILLON.append(f)
    connues |= k
    restants.pop(0)
ECHANTILLON.sort()

chemins = collections.OrderedDict()'''
s = s.replace(a1, b1, 1)

# --- le fichier montre en entier : le plus riche, pas le premier de l'alphabet
a2 = '''premier = None
for f in ECHANTILLON:
    d = json.load(io.open(f, encoding="utf-8"))
    if premier is None:
        premier = d
    parcourir(d)'''
assert s.count(a2) == 1, "ancre 2"
b2 = '''# Le fichier montre en entier est le PLUS RICHE de l'echantillon, pas le premier
# de l'alphabet : un exemple pauvre n'apprend rien a qui doit ecrire un lecteur.
riche, premier = -1, None
for f in ECHANTILLON:
    d = json.load(io.open(f, encoding="utf-8"))
    n = len(cles_de(f))
    if n > riche:
        riche, premier, exemple_nom = n, d, f
    parcourir(d)'''
s = s.replace(a2, b2, 1)

# --- ce que le document raconte de son propre tirage
a3 = '''    s.write("- Fichiers dans l'archive : **%d**\\n" % len(fichiers))
    s.write("- Scrutins analyses pour l'arborescence : **%d**\\n" % len(ECHANTILLON))
    s.write("- Premier fichier : `%s`\\n\\n" % os.path.relpath(fichiers[0], SOURCE))'''
assert s.count(a3) == 1, "ancre 3"
b3 = '''    s.write("- Fichiers dans l'archive : **%d**\\n" % len(fichiers))
    s.write("- Fichiers ouverts pour le tirage : **%d** (pas de %d)\\n" % (len(balayes), pas))
    s.write("- Fichiers retenus dans l'echantillon : **%d**, choisis pour couvrir "
            "le plus de cles possible\\n" % len(ECHANTILLON))
    s.write("- Cles distinctes trouvees : **%d**\\n" % len(connues))
    s.write("- Fichier montre en entier plus bas : `%s` (le plus riche de l'echantillon)\\n\\n"
            % os.path.relpath(exemple_nom, SOURCE))'''
s = s.replace(a3, b3, 1)

# --- les cles rares, listees a part : ce sont elles qu'on ratait
a4 = '''    s.write("\\n## Un scrutin entier, listes tronquees a trois entrees\\n\\n```json\\n")'''
assert s.count(a4) == 1, "ancre 4"
b4 = '''    rares = [c for c, e in chemins.items() if e["vu"] == 1]
    s.write("\\n## Cles vues UNE SEULE FOIS\\n\\n")
    s.write("Ce sont les cas particuliers : elles n'existent que dans certains fichiers.\\n"
            "C'est exactement ce que l'ancien tirage — les soixante premiers par ordre\\n"
            "alphabetique — ratait par construction. Une ingestion doit les traiter\\n"
            "comme facultatives.\\n\\n")
    if rares:
        for c in rares:
            s.write("- `%s`\\n" % c)
    else:
        s.write("_Aucune : toutes les cles apparaissent au moins deux fois._\\n")
    s.write("\\n## Un fichier entier, listes tronquees a trois entrees\\n\\n```json\\n")'''
s = s.replace(a4, b4, 1)

# La garde cherche l'AFFECTATION, pas la chaine : le commentaire ecrit plus haut
# cite l'ancien tirage pour l'expliquer, et une garde qui trebuche sur son propre
# commentaire est une garde fausse. C'est la troisieme fois dans ce projet.
assert "ECHANTILLON = fichiers[:60]" not in s, "l'ancien tirage subsiste"
assert s.count("def cles_de") == 1
io.open(F, "w", encoding="utf-8").write(s)
print("echantillon_scrutins.py : %d -> %d caracteres" % (n0, len(s)))
