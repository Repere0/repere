#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""audit_rc.py — l'instrument de la release candidate. Il ne corrige rien.

POURQUOI IL EXISTE. Les chiffres de docs/release_candidate_idf.md doivent etre
refaits par quelqu'un d'autre, sans me croire. Ce script les refait tous, sur les
fichiers reellement servis, et sort 1 si l'un des controles de VERITE echoue.

CE QU'IL CONTROLE, et pourquoi chacun manquait :

  1. ZERO STRUCTUREL. Un poste nul pour la quasi-totalite d'une population n'est
     pas une mesure, c'est une colonne absente ecrite comme un montant. Aucun
     controle du depot ne comparait une valeur a sa population : la doctrine du
     vide interdit un zero A L'ECRAN, rien n'interdisait un zero DANS LA DONNEE.

  2. COMPARABILITE. Deux exercices ne se comparent que si les deux portent le
     meme poste. Un ecran d'evolution construit sur un poste absent d'un des deux
     millesimes produit une phrase fausse avec une source officielle a cote.

  3. COHERENCE INTER-SOURCES. Le cumul depute / maire d'une commune est interdit
     par la loi : une personne presente dans les deux fichiers signale qu'un des
     deux relevés est perime. C'est la seule preuve de fraicheur gratuite.

  4. FRAICHEUR DECLAREE. L'index porte sa date de generation et chaque source sa
     date de relevé. Un ecart qui grandit est la signature d'une collecte morte.

  5. ABSENCE DE FICHIER PRISE POUR UNE ABSENCE DE FAIT. Si une famille de faits
     n'est pas servie du tout, l'application ne doit pas l'imputer a la source.

Usage :  python3 outils/audit_rc.py [racine]
Sortie : 0 si aucun controle de verite n'echoue, 1 sinon.
"""
import io, os, sys, json, glob, datetime, collections

RACINE = sys.argv[1] if len(sys.argv) > 1 else "."
chemin = lambda *p: os.path.join(RACINE, *p)
AGREGATS = ["recettes", "depenses", "dette", "invest", "personnel", "impots"]
SEUIL_POPULATION = 0.95     # au-dela, un poste nul est une colonne absente
ECHECS, AVERTIS = [], []

def echec(quoi, detail):
    ECHECS.append((quoi, detail)); print("ECHEC   | %-34s %s" % (quoi, detail))

def avert(quoi, detail):
    AVERTIS.append((quoi, detail)); print("ATTENTION| %-33s %s" % (quoi, detail))

def ok(quoi, detail=""):
    print("ok      | %-34s %s" % (quoi, detail))

def valeur(ex, i):
    """Le montant du poste i, ou None si le tableau ne le porte pas."""
    j = 1 + i * 2
    if not isinstance(ex, list) or len(ex) <= j: return None
    return ex[j] if isinstance(ex[j], (int, float)) else None

# ------------------------------------------------------------------ chargement
paquets = sorted(glob.glob(chemin("mono", "data", "departments", "*.json")))
if not paquets:
    print("aucun paquet departemental : rien a auditer"); sys.exit(1)
communes = {}
for p in paquets:
    d = json.load(io.open(p, encoding="utf-8"))
    for insee, com in (d.get("communes") or {}).items():
        communes[insee] = com
index = json.load(io.open(chemin("mono", "data", "index.json"), encoding="utf-8"))
print("\n%d communes servies, %d paquets\n" % (len(communes), len(paquets)))

# ------------------------------------------- 1. le zero qui n'est pas une donnee
print("--- 1. zeros structurels " + "-" * 36)
par_exercice = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0]))
for com in communes.values():
    for an, ex in (com.get("comptes") or {}).items():
        for i, nom in enumerate(AGREGATS):
            v = valeur(ex, i)
            if v is None: continue
            par_exercice[an][nom][1] += 1
            if v == 0: par_exercice[an][nom][0] += 1
postes_casses = set()
for an in sorted(par_exercice):
    for nom in AGREGATS:
        z, t = par_exercice[an][nom]
        if not t: continue
        part = z / t
        if part >= SEUIL_POPULATION:
            postes_casses.add((an, nom))
            echec("zero structurel", "exercice %s, poste « %s » : %d/%d nuls (%.1f %%) — "
                  "une colonne absente, pas un montant" % (an, nom, z, t, part * 100))
if not postes_casses:
    ok("zero structurel", "aucun poste nul au-dela de %.0f %% d'une population" % (SEUIL_POPULATION * 100))

# ----------------------------------------------------- 2. comparabilite des paires
print("\n--- 2. comparabilite des exercices " + "-" * 26)
annees = sorted({a for com in communes.values() for a in (com.get("comptes") or {})})
print("exercices servis : %s" % ", ".join(annees))
for i in range(len(annees) - 1):
    a, b = annees[i], annees[i + 1]
    if int(b) - int(a) != 1:
        avert("exercices non consecutifs", "%s -> %s : %d ans d'ecart, une evolution sur cette "
              "paire saute des annees" % (a, b, int(b) - int(a)))
for an, nom in sorted(postes_casses):
    autres = [x for x in annees if x != an]
    echec("paire incomparable", "poste « %s » : l'exercice %s ne le porte pas, toute evolution "
          "%s -> %s est une phrase fausse" % (nom, an, an, autres[-1] if autres else "?"))
# la paire la plus recente, celle qu'un ecran d'evolution devrait utiliser
if len(annees) >= 2:
    a, b = annees[-2], annees[-1]
    comparables = sum(1 for c in communes.values()
                      if a in (c.get("comptes") or {}) and b in (c.get("comptes") or {}))
    casses = [n for (x, n) in postes_casses if x in (a, b)]
    if casses:
        echec("paire recommandee", "%s -> %s porte des postes casses : %s" % (a, b, ", ".join(casses)))
    else:
        ok("paire recommandee", "%s -> %s : %d/%d communes comparables, aucun poste casse"
           % (a, b, comparables, len(communes)))

# ------------------------------------------------ 3. coherence entre les sources
print("\n--- 3. coherence inter-sources " + "-" * 30)
fd = chemin("mono", "data", "deputes.json")
if os.path.exists(fd):
    deputes = json.load(io.open(fd, encoding="utf-8")).get("deputes") or {}
    norm = lambda s: " ".join(str(s or "").replace("-", " ").split()).upper()
    par_depute = {}
    for siege, d in deputes.items():
        par_depute[norm(d.get("prenom", "") + " " + d.get("nom", ""))] = siege
    # UN NOM N'EST PAS UNE IDENTITE. La premiere version de ce controle comparait
    # les noms sur la France entiere et rendait 21 « cumuls » : « Philippe BRUN »
    # y apparaissait maire de DEUX communes, ce qui est impossible et prouve que
    # la coincidence de nom suffit a produire le signal. Un homonyme n'est pas un
    # cumul, et publier 21 accusations de cumul serait exactement le defaut que ce
    # script cherche. On restreint donc au seul cas ou la coincidence est
    # improbable : la commune est dans le departement du siege. Les homonymes
    # inter-departements sont listes a part, comme a verifier, jamais comme un fait.
    def dep_insee(i): return i[:3] if i[:2] == "97" else i[:2]
    memes, ailleurs = [], []
    for insee, com in communes.items():
        m = (com.get("maire") or {}).get("nom")
        if not m or norm(m) not in par_depute: continue
        siege = par_depute[norm(m)]
        (memes if siege.split("-")[0] == dep_insee(insee) else ailleurs).append(
            (insee, com.get("nom"), m, siege))
    for t in memes:
        echec("cumul interdit", "%s (%s) : « %s » est aussi le depute du siege %s, MEME "
              "departement — l'un des deux relevés est perime" % (t[1], t[0], t[2], t[3]))
    if ailleurs:
        avert("homonyme a verifier", "%d maires portent le nom d'un depute d'un AUTRE "
              "departement (%s...) — homonymie probable, a ne pas afficher comme un cumul"
              % (len(ailleurs), ", ".join(t[2] for t in ailleurs[:3])))
    if not memes:
        ok("cumul interdit", "aucun maire n'est depute du meme departement")
else:
    avert("cumul interdit", "deputes.json absent : controle non execute")

# ------------------------------------------------------- 4. fraicheur declaree
print("\n--- 4. fraicheur declaree " + "-" * 35)
SEUILS = {"elus": 120, "comptes": 550, "deputes": 90, "scrutins": 90,
          "communes": 400, "territoires": 400}
auj = datetime.date.today()
genere = index.get("genere_le")
print("genere_le : %s" % genere)
for cle, src in (index.get("sources") or {}).items():
    if src is None:
        echec("source absente", "index.sources.%s vaut null : une famille de faits n'est pas "
              "servie, et l'ecran ne doit pas l'imputer a la source" % cle)
        continue
    entrees = src if isinstance(src, list) else [src]
    for s in entrees:
        d = s.get("releve_le") or s.get("maj")
        if not d:
            avert("date absente", "source %s : ni releve_le ni maj" % cle); continue
        try: jour = datetime.date.fromisoformat(d)
        except ValueError:
            avert("date illisible", "source %s : %r" % (cle, d)); continue
        age = (auj - jour).days
        seuil = SEUILS.get(cle)
        etiquette = "%s, %d jours" % (d, age)
        if seuil and age > seuil:
            echec("source perimee", "%s : %s (seuil %d j)" % (cle, etiquette, seuil))
        elif seuil and age > seuil // 3:
            avert("source vieillissante", "%s : %s (seuil %d j)" % (cle, etiquette, seuil))
        else:
            ok("fraicheur %s" % cle, etiquette)

# ------------------------------------------- 5. les champs qui valent zero a tort
print("\n--- 5. champs entiers nuls " + "-" * 34)
for champ in ("adjoints",):
    zeros = [(i, c.get("nom")) for i, c in communes.items() if c.get(champ) == 0]
    if zeros:
        deps = collections.Counter(i[:2] for i, _ in zeros)
        echec("champ nul suspect", "%s == 0 pour %d communes, concentrees sur %s — un zero "
              "juridiquement impossible est une absence de relevé"
              % (champ, len(zeros), dict(deps)))
    else:
        ok("champ nul suspect", "%s : aucun zero" % champ)

# --------------------------------------------------------------------- verdict
print("\n" + "-" * 62)
print("%d echec(s) de verite, %d attention(s)." % (len(ECHECS), len(AVERTIS)))
print("VERDICT : " + ("NO-GO — un fait affiche serait faux" if ECHECS else "aucun echec de verite"))
sys.exit(1 if ECHECS else 0)
