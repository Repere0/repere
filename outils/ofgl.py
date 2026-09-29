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
    # 1. Les jeux de donnees de l'OFGL qui parlent de comptes par collectivite.
    cat = lire("/catalog/datasets", limit=100, select="dataset_id")
    ids = sorted(d.get("dataset_id") for d in cat.get("results", []))
    annoncer("catalogue", "%d jeux : %s" % (len(ids), ", ".join(ids)))

    candidats = [i for i in ids if i and i.startswith("ofgl-base-")]
    for ds in candidats[:6]:
        try:
            meta = lire("/catalog/datasets/" + ds)
        except Exception as e:  # un jeu illisible ne doit pas arreter la description
            annoncer(ds, "illisible : %s" % e)
            continue
        champs = [(f.get("name"), f.get("type")) for f in meta.get("fields", [])]
        m = meta.get("metas", {}).get("default", {})
        annoncer(ds, "titre=%s ; modifie=%s ; licence=%s ; %d enregistrements ; champs=%s" % (
            m.get("title"), m.get("modified") or m.get("data_processed"), m.get("license"),
            m.get("records_count") or 0, json.dumps(champs, ensure_ascii=False)))

    # 2. Un temoin concret : Saint-Denis (93066) et Pierrefitte (93059), fusionnees
    #    au 1er janvier 2025 — c'est exactement le cas qui a casse l'ancien bloc.
    #    `exer` est un champ DATE : on filtre par intervalle, pas par egalite.
    ds = "ofgl-base-communes"
    an = lambda a: "exer >= date'%d-01-01' and exer < date'%d-01-01'" % (a, a + 1)
    for code in ("93066", "93059"):
        for a in (2024, 2025):
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


if __name__ == "__main__":
    if "--decrire" in sys.argv:
        try:
            decrire()
        except Exception as e:
            annoncer("echec", repr(e))
            sys.exit(1)
    else:
        print(__doc__)
        sys.exit(2)
