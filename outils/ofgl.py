#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les comptes des collectivites, repris a la source (OFGL) — blocker 8.

POURQUOI CE FICHIER EXISTE (29/09/2026). Le bloc REPERE_OFGL embarque dans
app_repere_v18_20.html (8,8 Mo) se dit « genere par outils/ofgl_ingerer.py » :
ce script n'existe sur AUCUNE branche du depot. Les comptes publies sont donc un
artefact fige du 29/07/2026, que plus rien ne sait refaire, et la regle V-2 de
extract-html.js a montre qu'il contient 151 exercices ou la population d'une
collectivite porte les montants d'une autre.

CE QUE FAIT CE SCRIPT, PAR ETAPES (on ne produit rien avant d'avoir decrit) :

  --decrire   Le conteneur de travail ne joint pas data.ofgl.fr ; seul le runner
              GitHub le peut. Ce mode interroge l'API publique de l'OFGL et ecrit
              ce qu'il voit sous forme d'annotations GitHub (::notice::), seul
              canal que l'on peut relire depuis le conteneur : jeux de donnees
              disponibles, champs, un enregistrement temoin. Il n'ecrit aucun
              fichier et n'a aucun effet sur le site.

  --produire  (a ecrire APRES lecture de --decrire, sur schema mesure)

Usage : python3 outils/ofgl.py --decrire
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
    annoncer("export", "%d lignes lues" % len(lignes))
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
                if len(ex_diff) < 12 or code[:2] in ("75", "93"):
                    if len(ex_diff) < 30:
                        ex_diff.append("%s/%s fige=%s source=%s" % (code, an, a[:5], b[:5]))
    annoncer("comparaison", "exercices identiques %d ; differents %d ; seulement dans le bloc fige %d ; seulement a la source %d ; differences par position [pop, m0,h0 ...] %s" % (
        egaux, diff, len(seul_fige), len(seul_src), postes))
    annoncer("exemples de differences", " ; ".join(ex_diff))
    annoncer("seulement fige / seulement source", "%s || %s" % (", ".join(seul_fige[:25]), ", ".join(seul_src[:25])))


if __name__ == "__main__":
    if "--produire" in sys.argv:
        try:
            t = produire()
            annoncer("releve", "%d collectivites" % len(t))
            import glob
            comparer(t, sorted(glob.glob("app_repere_v18_*.html"))[-1])
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
