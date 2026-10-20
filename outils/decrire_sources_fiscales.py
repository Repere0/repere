#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decrit, sans rien ecrire, les jeux de donnees servant au simulateur « Mon impact
personnel » (decision du porteur, 20/10/2026) : la repartition des depenses par
fonction (OFGL) et les taux des impots locaux par commune (DGFiP).

POURQUOI (procedure ingerer-une-source, « decrire avant de deviner ») : le conteneur
de travail ne joint pas ces hotes. Ce script tourne sur le runner GitHub, imprime le
catalogue utile, les champs (noms et types) et quelques enregistrements. Aucun champ
n'est suppose : l'ingesteur ne sera ecrit qu'a partir de ce releve.

Sortie : stdout uniquement. Aucun fichier du depot n'est modifie.

Usage : python3 outils/decrire_sources_fiscales.py
"""
import json, re, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Repere/decrire_sources_fiscales.py (application civique, donnees publiques)"}
HOTES = {
    "ofgl": "https://data.ofgl.fr/api/explore/v2.1",
    "economie": "https://data.economie.gouv.fr/api/explore/v2.1",
}
# Mots qui designent, dans un identifiant ou un titre, une repartition par fonction
# ou des taux d'impots locaux. Filtre d'affichage seulement : rien n'est retenu ici.
MOTS = re.compile(r"fonction|fonctionnel|balance|budget|taux|fiscal|impot|taxe|foncier|ordure|teom|comptes", re.I)
PRINCIPAUX = ["ofgl-base-communes"]
FISCAL = ["fiscalite-locale-des-particuliers-geo"]


def lire(hote, chemin, **params):
    url = HOTES[hote] + chemin + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def titre_de(x):
    m = (x.get("metas") or {}).get("default") or {}
    return m.get("title") or x.get("title") or ""


def catalogue(hote):
    """Tous les jeux du portail (pagination), sans filtre serveur."""
    jeux, decalage = [], 0
    while True:
        page = lire(hote, "/catalog/datasets", limit=100, offset=decalage)
        res = page.get("results", [])
        jeux.extend(res)
        decalage += len(res)
        if not res or decalage >= page.get("total_count", 0):
            return jeux


def decrire_jeu(hote, identifiant, nb_exemples=3):
    print("\n=== %s / %s" % (hote, identifiant), flush=True)
    meta = lire(hote, "/catalog/datasets/" + identifiant)
    m = (meta.get("metas") or {}).get("default") or {}
    print("titre     : %s" % m.get("title"), flush=True)
    print("modifie   : %s" % (m.get("modified") or m.get("data_processed")), flush=True)
    print("licence   : %s" % m.get("license"), flush=True)
    print("page      : %s" % HOTES[hote].split("/api/")[0] + "/explore/dataset/" + identifiant + "/", flush=True)
    champs = meta.get("fields") or []
    print("champs (%d) :" % len(champs), flush=True)
    for c in champs:
        print("  - %-40s %-12s %s" % (c.get("name"), c.get("type"), (c.get("label") or "")[:80]), flush=True)
    total = lire(hote, "/catalog/datasets/%s/records" % identifiant, limit=0)
    print("enregistrements : %s" % total.get("total_count"), flush=True)
    exemples = lire(hote, "/catalog/datasets/%s/records" % identifiant, limit=nb_exemples)
    for i, r in enumerate(exemples.get("results", [])):
        texte = json.dumps(r, ensure_ascii=False)
        print("exemple %d : %s" % (i + 1, texte[:1200]), flush=True)


def main():
    for hote in HOTES:
        try:
            jeux = catalogue(hote)
        except Exception as e:  # un portail muet ne doit pas cacher l'autre
            print("ECHEC catalogue %s : %s" % (hote, e), flush=True)
            continue
        print("\n##### %s : %d jeux au catalogue" % (hote, len(jeux)), flush=True)
        for x in jeux:
            identifiant = x.get("dataset_id") or ""
            titre = titre_de(x)
            if MOTS.search(identifiant) or MOTS.search(titre):
                print("candidat  %-70s | %s" % (identifiant, titre[:90]), flush=True)
    # Les jeux par fonction : leurs identifiants ne sont pas supposes, ils sont lus au
    # catalogue. Quatre au plus par portail, pour rester lisible dans le journal.
    par_fonction = re.compile(r"fonction|fonctionnel|balance", re.I)
    for hote in HOTES:
        try:
            trouves = [x.get("dataset_id") for x in catalogue(hote)
                       if par_fonction.search((x.get("dataset_id") or "") + " " + titre_de(x))]
        except Exception:
            trouves = []
        for identifiant in trouves[:4]:
            try:
                decrire_jeu(hote, identifiant, nb_exemples=2)
            except Exception as e:
                print("ECHEC %s / %s : %s" % (hote, identifiant, e), flush=True)
    for hote, liste in (("ofgl", PRINCIPAUX), ("economie", FISCAL)):
        for identifiant in liste:
            try:
                decrire_jeu(hote, identifiant)
            except Exception as e:
                print("ECHEC %s / %s : %s" % (hote, identifiant, e), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
