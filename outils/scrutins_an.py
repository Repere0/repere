#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Scrutins publics de l'Assemblee : le vote de chaque depute, sans jugement.

CE QU'IL PRODUIT : outils/scrutins_an.json — les N derniers scrutins, avec pour chacun
la date, l'objet, le sort, les decomptes officiels, et la position de chaque depute
(pour / contre / abstention), designe par sa reference d'acteur.

CE QU'IL REFUSE DE PRODUIRE, ET CE N'EST PAS UN OUBLI :
  - AUCUNE liste nominative des « non votants ». Le fichier officiel la contient, et on
    l'ignore volontairement. Un non-vote n'est pas une absence : il couvre la delegation,
    la presidence de seance, une mission, un scrutin auquel le depute n'a pas ete appele.
    Republier ces listes ferait naitre, dans la semaine, un compteur d'absences — donc un
    classement, donc un jugement. La regle du projet est explicite : aucun classement,
    aucune note. On ne collecte pas ce qu'on ne veut pas voir affiche.
  - AUCUN agregat par depute (« a vote X fois comme son groupe »). Meme raison.
  - AUCUNE mise au point. Le fichier enregistre les corrections declarees apres coup par
    un depute ; elles ne modifient PAS le resultat du scrutin. Les afficher comme la
    position reelle serait faux, les afficher a cote demanderait une explication plus
    longue que le fait lui-meme. On les laisse a la source, et on donne le lien.

LE PIEGE DU FORMAT, releve dans le schema reel avant d'ecrire une ligne : le champ
`votant` est tantot une LISTE, tantot un OBJET SEUL — quand un seul depute d'un groupe
vote dans un sens, le convertisseur XML -> JSON de l'Assemblee supprime le tableau. Un
lecteur ecrit de memoire aurait plante, ou pire, ignore ces votes en silence. La fonction
`liste()` ci-dessous existe uniquement pour ca, et le banc l'eprouve.

Usage :  python3 outils/scrutins_an.py data/brut_Scrutins outils/scrutins_an.json [N]
"""
import sys, io, os, json, glob, datetime, collections

SOURCE = sys.argv[1] if len(sys.argv) > 1 else "data/brut_Scrutins"
SORTIE = sys.argv[2] if len(sys.argv) > 2 else "outils/scrutins_an.json"
GARDES = int(sys.argv[3]) if len(sys.argv) > 3 else 80

def liste(x):
    """Un champ qui vaut tantot une liste, tantot un objet, tantot rien."""
    if x is None or x == "":
        return []
    return x if isinstance(x, list) else [x]

def txt(d, *chemin, defaut=""):
    for c in chemin:
        if not isinstance(d, dict):
            return defaut
        d = d.get(c)
    return defaut if d is None else d

fichiers = sorted(glob.glob(os.path.join(SOURCE, "**", "*.json"), recursive=True))
if not fichiers:
    sys.exit("aucun .json sous %s — l'archive n'a pas ete depilee." % SOURCE)

brut_tous = []
for f in fichiers:
    d = json.load(io.open(f, encoding="utf-8")).get("scrutin")
    if not d:
        continue
    date = txt(d, "dateScrutin")
    if len(date) < 10:
        continue
    brut_tous.append((date, d))

brut_tous.sort(key=lambda x: (x[0], txt(x[1], "numero").rjust(6)))
retenus = brut_tous[-GARDES:]

acteurs, idx = [], {}
def ref(a):
    if a not in idx:
        idx[a] = len(acteurs)
        acteurs.append(a)
    return idx[a]

stats = collections.Counter()
sortie = []
for date, d in retenus:
    positions = {"p": [], "c": [], "a": []}
    # Les references des non-votants sont RELEVEES mais jamais ecrites : elles servent
    # uniquement au controle plus bas. Voir l'en-tete pour la raison du refus.
    non_votants = set()
    for g in liste(txt(d, "ventilationVotes", "organe", "groupes", "groupe", defaut=[])):
        nomin = txt(g, "vote", "decompteNominatif", defaut={})
        if not isinstance(nomin, dict):
            continue
        for cle, sens in (("pours", "p"), ("contres", "c"), ("abstentions", "a")):
            bloc = nomin.get(cle)
            if not isinstance(bloc, dict):
                continue                      # vide, ou chaine : rien a lire
            votants = liste(bloc.get("votant"))
            if len(votants) == 1 and not isinstance(bloc.get("votant"), list):
                stats["objet seul redresse"] += 1
            for v in votants:
                a = txt(v, "acteurRef")
                if a:
                    positions[sens].append(ref(a))
                    stats["positions " + sens] += 1
        for v in liste((nomin.get("nonVotants") or {}).get("votant")
                       if isinstance(nomin.get("nonVotants"), dict) else None):
            a_ = txt(v, "acteurRef")
            if a_:
                non_votants.add(a_)
    sortie.append({
        "u": txt(d, "uid"),
        "n": txt(d, "numero"),
        "d": date[:10],
        "t": txt(d, "titre"),
        "o": txt(d, "objet", "libelle"),
        "s": txt(d, "sort", "code"),
        "sl": txt(d, "sort", "libelle"),
        "tv": txt(d, "typeVote", "libelleTypeVote"),
        "dec": {k: txt(d, "syntheseVote", "decompte", k)
                for k in ("pour", "contre", "abstentions")},
        "nv": txt(d, "syntheseVote", "nombreVotants"),
        "p": positions["p"], "c": positions["c"], "a": positions["a"],
    })
    # LE GARDE-FOU, ici et pas ailleurs : aucune reference relevee parmi les non-votants
    # ne doit se retrouver dans les positions enregistrees. La premiere version de ce
    # controle cherchait la chaine « nonVotant » dans la sortie — elle n'y figure jamais,
    # puisque la sortie ne contient que des references d'acteurs. Un controle qui ne peut
    # pas echouer ne controle rien : celui-ci a ete eprouve en provoquant la fuite.
    ecrites = {acteurs[i] for s_ in "pca" for i in positions[s_]}
    fuite = ecrites & non_votants
    assert not fuite, ("le scrutin %s enregistre %d non-votant(s) comme votants : %s"
                       % (txt(d, "numero"), len(fuite), sorted(fuite)[:3]))
    stats["non-votants ecartes"] += len(non_votants)

paquet = {"v": 1,
          "maj": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
          "total_source": len(brut_tous),
          "acteurs": acteurs,
          "r": sortie}
brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))

# ---- controles independants : on relit la sortie sans reutiliser une variable
relu = json.loads(brut)
assert relu["v"] == 1 and len(relu["maj"]) == 10
assert len(relu["r"]) == len(retenus)
assert relu["r"] == sorted(relu["r"], key=lambda e: (e["d"], e["n"].rjust(6))), "non trie"
assert all(0 <= i < len(relu["acteurs"]) for e in relu["r"] for s in "pca" for i in e[s]), \
    "un index d'acteur sort de la table"
assert "miseAuPoint" not in brut and "numPlace" not in brut and "mandatRef" not in brut
for e in relu["r"]:
    doublons = [x for x in (e["p"] + e["c"] + e["a"])
                if (e["p"] + e["c"] + e["a"]).count(x) > 1]
    assert not doublons, "le scrutin %s compte un depute deux fois" % e["n"]

os.makedirs(os.path.dirname(SORTIE) or ".", exist_ok=True)
io.open(SORTIE, "w", encoding="utf-8").write(brut)

print("scrutins dans la source  : %d" % len(brut_tous))
print("scrutins retenus         : %d (du %s au %s)"
      % (len(sortie), sortie[0]["d"] if sortie else "-", sortie[-1]["d"] if sortie else "-"))
print("deputes distincts        : %d" % len(acteurs))
for k, v in stats.most_common():
    print("  %-24s %d" % (k, v))
print("poids                    : %.0f Ko" % (len(brut.encode("utf-8")) / 1024))
