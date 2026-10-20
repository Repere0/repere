#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decrit, sans rien ecrire dans le depot, les jeux de donnees servant au simulateur
« Mon impact personnel » (decision du porteur, 20/10/2026) : la repartition des depenses
par fonction (OFGL) et les taux des impots locaux par commune (DGFiP).

POURQUOI (procedure ingerer-une-source, « decrire avant de deviner ») : le conteneur de
travail ne joint pas ces hotes. Ce script tourne sur le runner GitHub et remonte le
releve (catalogue utile, champs avec leur type, quelques enregistrements) en annotations
de controle, lisibles par l'API GitHub. Aucun champ n'est suppose : l'ingesteur ne sera
ecrit qu'a partir de ce releve.

Usage : python3 outils/decrire_sources_fiscales.py
"""
import json, re, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Repere/decrire_sources_fiscales.py (application civique, donnees publiques)"}
HOTES = {
    "ofgl": "https://data.ofgl.fr/api/explore/v2.1",
    "economie": "https://data.economie.gouv.fr/api/explore/v2.1",
}
# Filtre d'affichage seulement : rien n'est retenu ici.
MOTS = re.compile(r"fonction|fonctionnel|balance|taux|fiscal|impot|taxe|foncier|ordure|teom", re.I)
PAR_FONCTION = re.compile(r"fonction|fonctionnel|balance", re.I)
PRINCIPAUX = [("ofgl", "ofgl-base-communes"), ("economie", "fiscalite-locale-des-particuliers-geo")]
TAMPON = []


def emettre(texte):
    print(texte, flush=True)
    TAMPON.append(texte)


def annoncer_releve():
    """GitHub ne garde que dix annotations par etape, de 3 800 caracteres au plus."""
    texte = "\n".join(TAMPON)
    morceaux = [texte[i:i + 3500] for i in range(0, len(texte), 3500)][:10]
    for n, m in enumerate(morceaux, 1):
        t = m.replace("%", "%25").replace("\r", "").replace("\n", "%0A")
        print("::notice title=releve-%d-%d::%s" % (n, len(morceaux), t), flush=True)


def lire(hote, chemin, **params):
    url = HOTES[hote] + chemin + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def titre_de(x):
    m = (x.get("metas") or {}).get("default") or {}
    return m.get("title") or x.get("title") or ""


def catalogue(hote):
    jeux, decalage = [], 0
    while True:
        page = lire(hote, "/catalog/datasets", limit=100, offset=decalage)
        res = page.get("results", [])
        jeux.extend(res)
        decalage += len(res)
        if not res or decalage >= page.get("total_count", 0):
            return jeux


def decrire_jeu(hote, identifiant, nb_exemples=2):
    emettre("=== %s / %s" % (hote, identifiant))
    meta = lire(hote, "/catalog/datasets/" + identifiant)
    m = (meta.get("metas") or {}).get("default") or {}
    emettre("titre: %s | modifie: %s | licence: %s" % (
        m.get("title"), m.get("modified") or m.get("data_processed"), m.get("license")))
    champs = meta.get("fields") or []
    emettre("champs (%d): %s" % (len(champs), " ; ".join(
        "%s[%s]" % (c.get("name"), c.get("type")) for c in champs)))
    total = lire(hote, "/catalog/datasets/%s/records" % identifiant, limit=0)
    emettre("enregistrements: %s" % total.get("total_count"))
    exemples = lire(hote, "/catalog/datasets/%s/records" % identifiant, limit=nb_exemples)
    for i, r in enumerate(exemples.get("results", []), 1):
        emettre("exemple %d: %s" % (i, json.dumps(r, ensure_ascii=False)[:600]))


def main():
    for hote in HOTES:
        try:
            jeux = catalogue(hote)
        except Exception as e:
            emettre("ECHEC catalogue %s: %s" % (hote, e))
            continue
        emettre("##### %s : %d jeux au catalogue" % (hote, len(jeux)))
        for x in jeux:
            identifiant = x.get("dataset_id") or ""
            titre = titre_de(x)
            if MOTS.search(identifiant) or MOTS.search(titre):
                emettre("candidat: %s | %s" % (identifiant, titre[:80]))
    # Jeux par fonction : identifiants lus au catalogue, jamais supposes. Quatre au plus.
    for hote in HOTES:
        try:
            trouves = [x.get("dataset_id") for x in catalogue(hote)
                       if PAR_FONCTION.search((x.get("dataset_id") or "") + " " + titre_de(x))]
        except Exception:
            trouves = []
        for identifiant in trouves[:4]:
            try:
                decrire_jeu(hote, identifiant)
            except Exception as e:
                emettre("ECHEC %s / %s: %s" % (hote, identifiant, e))
    for hote, identifiant in PRINCIPAUX:
        try:
            decrire_jeu(hote, identifiant)
        except Exception as e:
            emettre("ECHEC %s / %s: %s" % (hote, identifiant, e))
    annoncer_releve()
    return 0


if __name__ == "__main__":
    sys.exit(main())
