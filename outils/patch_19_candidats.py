# -*- coding: utf-8 -*-
"""patch_19_candidats.py — trois defauts trouves sur la sortie REELLE du 25 aout.

Le run du jour a dit « les candidats n'ont pas pu etre fabriques ». En lisant les dix
brouillons deja poses, trois choses, dont deux sont de ma main :

 1. DUPLICATION. candidats.py cherchait le sort du scrutin dans une table dont les cles
    etaient ecrites SANS ACCENT (« adopte »), alors que la source ecrit « adopté ». La
    recherche echouait toujours, le script retombait sur le libelle long, et produisait :
        « L'Assemblee nationale a l'Assemblee nationale a adopte ce texte »
    C'est exactement la faute que la methode du projet doit empecher : j'ai devine la
    valeur au lieu de la mesurer. Mesuree, elle vaut « adopté » (46 fois) et « rejeté »
    (34 fois) sur les 80 scrutins du fichier.

 2. TITRE. L'objet du scrutin commence en minuscule et finit par un point : « le
    sous-amendement n° 1233 de Mme ... ». Ca se lit comme un extrait de proces-verbal,
    pas comme un titre de carte.

 3. LA GARDE SE TROMPAIT DE CIBLE. Elle refusait tout fichier de data/auto/ non marque
    « valide: false » — y compris ceux qu'un humain venait de valider a la main, ce qui
    est un etat de travail parfaitement normal. Elle faisait donc echouer la chaine pour
    un geste correct. Une garde doit proteger ce que CE RUN vient d'ecrire, pas juger le
    travail en cours de quelqu'un. Elle devient : assertion sur les fichiers ecrits par
    ce run, et RAPPEL (non bloquant) sur ceux qui attendent d'etre deplaces.

 4. Et dans evenements.py : un corps ou « Ce que ca change » est reste vide passait le
    controle « corps vide », puisque la phrase d'entete existe. Publier un intertitre
    suivi de rien, c'est la doctrine du vide bafouee a l'endroit le plus visible.
"""
import io

# --------------------------------------------------------------- candidats.py
F = "outils/candidats.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a1 = 'SORTS = {"adopte": "adopté", "rejete": "rejeté"}'
assert s.count(a1) == 1, "ancre 1"
b1 = '''def sansAccent(t):
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
    return (t[:1].upper() + t[1:]) if t else t'''
s = s.replace(a1, b1, 1)

a2 = '    sort = SORTS.get(e.get("s", ""), e.get("sl") or e.get("s") or "")'
assert s.count(a2) == 1, "ancre 2"
b2 = '    sort = SORTS.get(sansAccent(e.get("s", "")), "") or e.get("s") or ""'
s = s.replace(a2, b2, 1)

a3 = '    objet = ardoise(e.get("o") or e.get("t"))'
assert s.count(a3) == 1, "ancre 3"
b3 = '    objet = titre_de(ardoise(e.get("o") or e.get("t")))'
s = s.replace(a3, b3, 1)

# --- la phrase produite, controlee AVANT d'etre ecrite
a4 = '    io.open(chemin, "w", encoding="utf-8").write(texte)\n    ecrits += 1'
assert s.count(a4) == 1, "ancre 4"
b4 = '''    # La faute du 25 aout, rendue impossible : le verbe ne doit jamais reintroduire
    # le sujet que la phrase porte deja.
    assert "nationale a l" not in corps and "nationale a L" not in corps, \\
        "phrase dupliquee pour le scrutin %s : %r" % (e["n"], corps[:90])
    io.open(chemin, "w", encoding="utf-8").write(texte)
    ecrits += 1
    poses.append(chemin)'''
s = s.replace(a4, b4, 1)

a5 = 'ecrits, deja = 0, 0'
assert s.count(a5) == 1, "ancre 5"
s = s.replace(a5, 'ecrits, deja, poses = 0, 0, []', 1)

# --- la garde, recentree sur ce que ce run a ecrit
a6 = '''# controle : aucun candidat ne doit sortir marque valide
for f in sorted(os.listdir(DEST)):
    if f.endswith(".md"):
        t = io.open(os.path.join(DEST, f), encoding="utf-8").read()
        assert "valide: false" in t, "%s n'est pas marque comme brouillon" % f'''
assert s.count(a6) == 1, "ancre 6"
b6 = '''# Controle : aucun candidat ECRIT PAR CE RUN ne doit sortir marque valide. La garde
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
            a_deplacer.append(f)'''
s = s.replace(a6, b6, 1)

a7 = 'print("en attente de relecture : %d" % len([f for f in os.listdir(DEST) if f.endswith(\'.md\')]))'
assert s.count(a7) == 1, "ancre 7"
b7 = (a7 + '''
if a_deplacer:
    print()
    print("%d candidat(s) sont marques « valide: true » mais encore dans %s :"
          % (len(a_deplacer), DEST))
    for f in a_deplacer:
        print("   - %s" % f)
    print("Tant qu'ils sont la, l'application ne les voit PAS. Deplace-les dans")
    print("data/evenements/ pour qu'ils soient publies.")''')
s = s.replace(a7, b7, 1)

assert "’" not in s, "apostrophe typographique"
io.open(F, "w", encoding="utf-8").write(s)
print("candidats.py : %d -> %d octets" % (n0, len(s)))

# -------------------------------------------------------------- evenements.py
G = "outils/evenements.py"
t = io.open(G, encoding="utf-8").read()
m0 = len(t)

a8 = '''    if not corps:
        refus["corps vide"] += 1; detail.append((nom, "aucun texte")); continue'''
assert t.count(a8) == 1, "ancre 8"
b8 = '''    if not corps:
        refus["corps vide"] += 1; detail.append((nom, "aucun texte")); continue
    # « Ce que ca change » est le seul endroit de la carte ecrit par un humain, et le
    # seul qui reponde a « en quoi ca me concerne ». Un brouillon valide sans l'avoir
    # rempli publierait un intertitre suivi de rien — un contenant sans contenu, ce que
    # la doctrine du vide interdit precisement. On refuse, on ne complete pas.
    m_chg = re.search(r"Ce que [cç]a change\\s*:(.*)$", corps, re.S)
    if m_chg is not None and not m_chg.group(1).strip():
        refus["« ce que ca change » vide"] += 1
        detail.append((nom, "l'intertitre est la, le texte manque")); continue'''
t = t.replace(a8, b8, 1)

assert "’" not in b8
io.open(G, "w", encoding="utf-8").write(t)
print("evenements.py : %d -> %d octets" % (m0, len(t)))
