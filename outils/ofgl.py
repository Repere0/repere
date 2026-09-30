#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les comptes des collectivites, repris a la source (OFGL) — blocker 8.

POURQUOI CE FICHIER EXISTE (29/09/2026). Le bloc REPERE_OFGL embarque dans
app_repere_v18_20.html (8,8 Mo) se dit « genere par outils/ofgl_ingerer.py » :
ce script n'existe sur AUCUNE branche du depot. Les comptes publies sont donc un
artefact fige du 29/07/2026, que plus rien ne sait refaire, et la regle V-2 de
extract-html.js a montre qu'il contient 151 exercices ou la population d'une
collectivite porte les montants d'une autre.

CE QUE FAIT CE SCRIPT :

  --produire  Releve les comptes des communes a la source (API publique de
              l'OFGL, jeu `ofgl-base-communes`), budget principal, six agregats,
              exercices 2021, 2024 et 2025. Ecrit mono/scripts/comptes-communes.json,
              que extract-html.js prefere au bloc fige quand il est present et
              complet. Compare le releve au bloc fige, commune par commune, et
              ECRIT l'ecart en annotations GitHub. Ne touche ni aux departements
              ni aux regions (a reprendre de la meme facon ensuite).
              Mesure du 29/09/2026 sur le runner : 628 050 lignes, 34 977
              collectivites ; 69 815 exercices identiques au bloc fige ; les
              34 690 autres different presque tous par UN poste, les frais de
              personnel 2021, que le bloc fige portait a zero pour toutes les
              communes (regle V-1) et que la source publie ; ~85 differences
              restantes = les fusions de communes (voir plus bas).

  --decrire   Decrit la source (champs, temoins) en annotations. Sans effet.

Le conteneur de travail ne joint pas data.ofgl.fr : ce script tourne sur le
runner GitHub (outils/pipeline.sh). S'il echoue, la chaine avertit et
extract-html.js garde le bloc fige : un releve rate n'empeche jamais la
publication de ce qui marche deja.

Usage : python3 outils/ofgl.py --produire | --decrire
"""
import json, sys, urllib.parse, urllib.request

API = "https://data.ofgl.fr/api/explore/v2.1"
UA = {"User-Agent": "Repere/ofgl.py (application civique, donnees publiques)"}


def lire(chemin, **params):
    url = API + chemin + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def annoncer(titre, texte):
    """Une annotation GitHub : sur une seule ligne, % et retours echappes."""
    t = (titre + " | " + texte)[:3800]
    t = t.replace("%", "%25").replace("\r", "").replace("\n", "%0A")
    print("::notice title=ofgl-decrire::" + t, flush=True)


def decrire():
    # 1. Catalogue et champs : relus le 29/09/2026 (run 36505362880) et ecrits
    #    dans le docstring de --produire ; plus d'annotation ici, GitHub n'en
    #    garde que dix par etape.
    # 2. Un temoin concret : Saint-Denis (93066) et Pierrefitte (93059), fusionnees
    #    au 1er janvier 2025 — c'est exactement le cas qui a casse l'ancien bloc.
    #    `exer` est un champ DATE : on filtre par intervalle, pas par egalite.
    ds = "ofgl-base-communes"
    an = lambda a: "exer >= date'%d-01-01' and exer < date'%d-01-01'" % (a, a + 1)
    for code in ():
        for a in ():
            r = lire("/catalog/datasets/%s/records" % ds, limit=40,
                     select="insee, com_code, com_name, exer, type_de_budget, lbudg, agregat, montant, ptot, euros_par_habitant",
                     where='(insee="%s" or com_code="%s") and %s and agregat in ("Recettes totales","Encours de dette")' % (code, code, an(a)))
            annoncer("temoin %s %d" % (code, a), "%s lignes : %s" % (
                r.get("total_count"), json.dumps(r.get("results", []), ensure_ascii=False)))
    g = lire("/catalog/datasets/%s/records" % ds, group_by="type_de_budget", limit=20,
             select="type_de_budget, count(*) as n", where=an(2024))
    annoncer("types de budget 2024", json.dumps(g.get("results", []), ensure_ascii=False))
    g = lire("/catalog/datasets/%s/records" % ds, group_by="agregat", limit=100,
             select="agregat, count(*) as n", where=an(2024) + ' and type_de_budget="Budget principal"')
    annoncer("agregats 2024 budget principal", json.dumps(g.get("results", []), ensure_ascii=False))
    g = lire("/catalog/datasets/%s/records" % ds, group_by="year(exer) as a", limit=20,
             select="year(exer) as a, count(*) as n")
    annoncer("exercices", json.dumps(g.get("results", []), ensure_ascii=False))
    # 3. L'export complet est-il joignable, et combien de lignes ferait le releve utile ?
    n = lire("/catalog/datasets/%s/records" % ds, limit=0,
             where='type_de_budget="Budget principal" and agregat in ("Recettes totales","Dépenses totales","Encours de dette","Dépenses d\'investissement","Frais de personnel","Impôts et taxes") and (%s or %s or %s)' % (an(2021), an(2024), an(2025)))
    annoncer("volume utile", "lignes budget principal, 6 agregats, 2021/2024/2025 : %s" % n.get("total_count"))


# ---------------------------------------------------------------- produire
# SCHEMA MESURE SUR LE RUNNER LE 29/09/2026 (runs 36505362880 et 36506444166) :
#   jeu `ofgl-base-communes`, 21 857 255 lignes, modifie le 2026-07-29 ;
#   une ligne = (exer [date], insee, com_code, type_de_budget, agregat, montant,
#   ptot, euros_par_habitant) ; `type_de_budget` vaut « Budget principal » ou
#   « Budget annexe » ; les six agregats de Repere existent sous ces libelles
#   exacts, pour 34 932 budgets principaux en 2024.
# LE PIEGE QUI A CASSE L'ANCIEN BLOC, MESURE SUR SAINT-DENIS 2024 : deux lignes
#   par agregat sous com_code = 93066 — Saint-Denis (insee 93066, ptot 114 782)
#   et Pierrefitte-sur-Seine (insee 93059, ptot 32 426). `com_code` est le code
#   de la commune D'AUJOURD'HUI, `insee` celui de la collectivite qui a tenu le
#   budget cette annee-la. L'ancien bloc indexait par com_code : il a garde la
#   population de l'une et les montants de l'autre. On indexe donc par `insee`,
#   et une cle vue deux fois pour le meme exercice et le meme agregat ARRETE le
#   releve au lieu d'ecraser.
AGREGATS = ["Recettes totales", "Dépenses totales", "Encours de dette",
            "Dépenses d'investissement", "Frais de personnel", "Impôts et taxes"]
EXERCICES = (2021, 2024, 2025)


def exporter(ds, select, where):
    url = API + "/catalog/datasets/%s/exports/csv?" % ds + urllib.parse.urlencode(
        {"select": select, "where": where, "delimiter": ";"})
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=900) as r:
        return r.read().decode("utf-8-sig")


def produire():
    import csv, io
    ans = " or ".join("(exer >= date'%d-01-01' and exer < date'%d-01-01')" % (a, a + 1) for a in EXERCICES)
    ags = ", ".join('"%s"' % a for a in AGREGATS)
    texte = exporter("ofgl-base-communes",
                     "insee, com_code, exer, agregat, montant, ptot, euros_par_habitant",
                     'type_de_budget="Budget principal" and agregat in (%s) and (%s)' % (ags, ans))
    lignes = list(csv.DictReader(io.StringIO(texte), delimiter=";"))
    terr, doublons, pops = {}, [], {}
    for l in lignes:
        code, an = l["insee"], str(l["exer"])[:4]
        k = AGREGATS.index(l["agregat"])
        ex = terr.setdefault(code, {}).setdefault(an, [None] * (1 + 2 * len(AGREGATS)))
        if ex[1 + 2 * k] is not None:
            doublons.append("%s/%s/%s" % (code, an, l["agregat"]))
            continue
        m = float(l["montant"]) if l["montant"] not in ("", None) else None
        h = float(l["euros_par_habitant"]) if l["euros_par_habitant"] not in ("", None) else None
        ex[1 + 2 * k] = round(m) if m is not None else None
        ex[2 + 2 * k] = round(h) if h is not None else None
        p = int(float(l["ptot"])) if l["ptot"] not in ("", None) else None
        if ex[0] is None:
            ex[0] = p
        elif p is not None and p != ex[0]:
            pops.setdefault(code + "/" + an, set()).update({p, ex[0]})
    if doublons:
        annoncer("ARRET doublons", "%d cles vues deux fois, ex. %s" % (len(doublons), ", ".join(doublons[:10])))
        raise SystemExit(3)
    if pops:
        annoncer("ARRET populations", "%d exercices avec deux populations, ex. %s" % (len(pops), list(pops.items())[:5]))
        raise SystemExit(3)
    return terr


def comparer(terr, html):
    s = open(html, encoding="utf-8", errors="ignore").read()
    i = s.index("window.REPERE_OFGL =", s.index("/* REPERE_OFGL_DEBUT */"))
    i = s.index("=", i) + 1
    bloc = json.loads(s[i:s.index("/* REPERE_OFGL_FIN */", i)].strip().rstrip(";"))
    fige = bloc["ech"]["commune"]["terr"]
    egaux = diff = 0
    ex_diff, seul_fige, seul_src = [], [], []
    postes = [0] * 13
    for code in sorted(set(fige) | set(terr)):
        for an in ("2021", "2024", "2025"):
            a = (fige.get(code) or {}).get("ex", {}).get(an)
            b = (terr.get(code) or {}).get(an)
            if a is None and b is None:
                continue
            if a is None:
                seul_src.append(code + "/" + an); continue
            if b is None:
                seul_fige.append(code + "/" + an); continue
            if list(a) == list(b):
                egaux += 1
            else:
                diff += 1
                for j in range(13):
                    if a[j] != b[j]:
                        postes[j] += 1
                autres = [j for j in range(13) if a[j] != b[j] and j not in (9, 10)]
                if autres and len(ex_diff) < 20:
                    ex_diff.append("%s/%s postes %s fige=%s source=%s" % (code, an, autres, a[:3], b[:3]))
    annoncer("comparaison", "exercices identiques %d ; differents %d ; seulement dans le bloc fige %d ; seulement a la source %d ; differences par position [pop, m0,h0 ...] %s" % (
        egaux, diff, len(seul_fige), len(seul_src), postes))
    annoncer("exemples de differences", " ; ".join(ex_diff))
    annoncer("seulement fige / seulement source", "%s || %s" % (", ".join(seul_fige[:15]), ", ".join(seul_src[:15])))


DEST = "mono/scripts/comptes-communes.json"


def ecrire(terr):
    import datetime, os
    meta = lire("/catalog/datasets/ofgl-base-communes")
    m = meta.get("metas", {}).get("default", {})
    modifie = str(m.get("modified") or m.get("data_processed") or "")[:10]
    # ON N'ECRASE PAS UN RELEVE VALIDE PAR UN RELEVE MAIGRE : la France compte
    # environ 34 900 communes ; en dessous de 30 000, la source a change de forme.
    if len(terr) < 30000 or not modifie:
        annoncer("ARRET", "releve maigre (%d collectivites) ou date absente (%r) : rien n'est ecrit" % (len(terr), modifie))
        raise SystemExit(4)
    paquet = {
        "v": 1,
        "source": {
            "producteur": "Observatoire des finances et de la gestion publique locales (OFGL)",
            "licence": "Licence Ouverte 2.0",
            "url": "https://data.ofgl.fr/explore/dataset/ofgl-base-communes/",
            "jeu": "ofgl-base-communes",
            "budget": "Budget principal seulement (budgets annexes exclus)",
            "cle": "insee (collectivite qui a tenu le budget cet exercice-la)",
            "modifie": modifie,
            "releve_le": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        },
        "exercices": [str(a) for a in EXERCICES],
        "terr": {c: terr[c] for c in sorted(terr)},
    }
    os.makedirs(os.path.dirname(DEST), exist_ok=True)
    with open(DEST, "w", encoding="utf-8") as f:
        json.dump(paquet, f, ensure_ascii=False, separators=(",", ":"))
    # CONTROLE INDEPENDANT : relire le fichier, pas la variable.
    relu = json.load(open(DEST, encoding="utf-8"))
    assert len(relu["terr"]) == len(terr), "le fichier relu ne porte pas le meme nombre de collectivites"
    assert relu["terr"]["75056"]["2025"][0] > 2000000, "temoin Paris 2025 : population invraisemblable"
    annoncer("ecrit", "%s : %d collectivites, source modifiee le %s, %.1f Mo" % (
        DEST, len(terr), modifie, os.path.getsize(DEST) / 1e6))


# ------------------------------------------------ departements et regions
# Meme methode que les communes (29/09/2026, reprise du matin) : le bloc fige
# porte aussi 101 departements et 17 regions, exercices 2012 a 2025, et la
# regle V-2 en ecarte 9 (Alsace « 67A ») et 28 (regions d'avant la fusion de
# 2016) : population d'une collectivite, montants d'une autre.
# MESURE SUR LE RUNNER (run 36534374379) : la source elle-meme range sous le code
# ACTUEL les collectivites d'avant la fusion — `dep_code` 67A porte le Bas-Rhin
# ET le Haut-Rhin jusqu'en 2020, `reg_code` 27, 28, 32, 44, 75 portent les
# anciennes regions jusqu'en 2015. Il n'existe donc PAS de comptes « de
# l'Alsace » en 2018 : il en existe deux. Hors de ces exercices, le releve est
# identique au bloc (1 366 exercices departementaux, 210 regionaux).
# Regle : un exercice ou plusieurs collectivites (plusieurs SIREN) partagent le
# code n'est pas publie — ses valeurs sont null et son annee est listee dans
# `ecartes`, pour que l'ecran puisse dire pourquoi.
DEST_TERR = "mono/scripts/comptes-territoires.json"
TERRITOIRES = (
    ("departement", "ofgl-base-departements", ("dep_code", "code_dep")),
    ("region", "ofgl-base-regions", ("reg_code", "code_reg", "region_code")),
)


def releve_territoire(ds, champs_cle):
    import csv, io
    meta = lire("/catalog/datasets/" + ds)
    noms = {f.get("name") for f in meta.get("fields", [])}
    cle = next((c for c in champs_cle if c in noms), None)
    ident = next((c for c in ("siren", "ident", "lbudg") if c in noms), None)
    if not cle or not ident or "type_de_budget" not in noms:
        raise RuntimeError("%s : champs inattendus %s" % (ds, sorted(noms)))
    m = meta.get("metas", {}).get("default", {})
    modifie = str(m.get("modified") or m.get("data_processed") or "")[:10]
    ags = ", ".join('"%s"' % a for a in AGREGATS)
    texte = exporter(ds, "%s, %s, exer, agregat, montant, ptot, euros_par_habitant" % (cle, ident),
                     'type_de_budget="Budget principal" and agregat in (%s)' % ags)
    lignes = list(csv.DictReader(io.StringIO(texte), delimiter=";"))
    identites = {}
    for l in lignes:
        identites.setdefault((l[cle], str(l["exer"])[:4]), set()).add(l[ident])
    partages = {k for k, v in identites.items() if len(v) > 1}
    terr, doublons, ecartes = {}, [], {}
    for code, an in sorted(partages):
        terr.setdefault(code, {})[an] = [None] * (1 + 2 * len(AGREGATS))
        ecartes.setdefault(code, []).append(an)
    for l in lignes:
        code, an = l[cle], str(l["exer"])[:4]
        if (code, an) in partages:
            continue
        k = AGREGATS.index(l["agregat"])
        ex = terr.setdefault(code, {}).setdefault(an, [None] * (1 + 2 * len(AGREGATS)))
        if ex[1 + 2 * k] is not None:
            doublons.append("%s/%s/%s" % (code, an, l["agregat"]))
            continue
        num = lambda v: float(v) if v not in ("", None) else None
        mo, h, pt = num(l["montant"]), num(l["euros_par_habitant"]), num(l["ptot"])
        ex[1 + 2 * k] = round(mo) if mo is not None else None
        ex[2 + 2 * k] = round(h) if h is not None else None
        if ex[0] is None and pt is not None:
            ex[0] = int(pt)
    return cle, modifie, terr, doublons, ecartes


def comparer_territoire(ech, terr, bloc):
    fige = bloc["ech"][ech]["terr"]
    egaux = diff = 0
    exemples = []
    for code in sorted(set(fige) | set(terr)):
        for an in sorted(set((fige.get(code) or {}).get("ex", {})) | set(terr.get(code) or {})):
            a = (fige.get(code) or {}).get("ex", {}).get(an)
            b = (terr.get(code) or {}).get(an)
            if a is not None and b is not None and list(a) == list(b):
                egaux += 1
                continue
            if b is not None and all(v is None for v in b):
                continue
            diff += 1
            if len(exemples) < 12:
                exemples.append("%s/%s fige=%s source=%s" % (code, an, (a or [None])[:3], (b or [None])[:3]))
    return "%s : identiques %d, differents ou absents d'un cote %d ; codes fige %s ; codes source %s ; ex. %s" % (
        ech, egaux, diff, len(fige), len(terr), " ; ".join(exemples))


def produire_territoires():
    import datetime, glob, os
    html = sorted(glob.glob("app_repere_v18_*.html"))[-1]
    s = open(html, encoding="utf-8", errors="ignore").read()
    i = s.index("window.REPERE_OFGL =", s.index("/* REPERE_OFGL_DEBUT */"))
    i = s.index("=", i) + 1
    bloc = json.loads(s[i:s.index("/* REPERE_OFGL_FIN */", i)].strip().rstrip(";"))
    sortie, lignes, arret = {}, [], False
    for ech, ds, champs in TERRITOIRES:
        try:
            cle, modifie, terr, doublons, ecartes = releve_territoire(ds, champs)
        except Exception as e:
            lignes.append("%s : echec %r" % (ech, e)); arret = True; continue
        if doublons:
            lignes.append("%s : ARRET, %d doublons (cle %s), ex. %s" % (ech, len(doublons), cle, doublons[:6])); arret = True
        lignes.append(comparer_territoire(ech, terr, bloc) + " ; ecartes (plusieurs collectivites sous un code) : %s" % (
            ", ".join("%s/%s" % (c, "+".join(a)) for c, a in sorted(ecartes.items())) or "aucun"))
        sortie[ech] = {"jeu": ds, "cle": cle, "modifie": modifie, "terr": terr, "ecartes": ecartes}
    annoncer("territoires", " || ".join(lignes))
    if arret or len(sortie.get("departement", {}).get("terr", {})) < 90 or len(sortie.get("region", {}).get("terr", {})) < 13:
        annoncer("territoires ARRET", "rien n'est ecrit")
        return
    paquet = {
        "v": 1,
        "source": {
            "producteur": "Observatoire des finances et de la gestion publique locales (OFGL)",
            "licence": "Licence Ouverte 2.0",
            "url": "https://data.ofgl.fr/",
            "budget": "Budget principal seulement (budgets annexes exclus)",
            "releve_le": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        },
        "echelons": sortie,
    }
    os.makedirs(os.path.dirname(DEST_TERR), exist_ok=True)
    with open(DEST_TERR, "w", encoding="utf-8") as f:
        json.dump(paquet, f, ensure_ascii=False, separators=(",", ":"))
    relu = json.load(open(DEST_TERR, encoding="utf-8"))
    assert relu["echelons"]["departement"]["terr"], "relu vide"


if __name__ == "__main__":
    if "--produire" in sys.argv:
        try:
            t = produire()
            import glob
            comparer(t, sorted(glob.glob("app_repere_v18_*.html"))[-1])
            ecrire(t)
            try:
                produire_territoires()
            except Exception as e:  # les communes sont ecrites : un echec ici ne les annule pas
                annoncer("territoires echec", repr(e))
        except SystemExit:
            raise
        except Exception as e:
            annoncer("echec produire", repr(e))
            sys.exit(1)
    elif "--decrire" in sys.argv:
        try:
            decrire()
        except Exception as e:
            annoncer("echec", repr(e))
            sys.exit(1)
    else:
        print(__doc__)
        sys.exit(2)
