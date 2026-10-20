#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decrit, sans rien ecrire dans le depot, les deux jeux de donnees du simulateur
« Mon impact personnel » (decision du porteur, 20/10/2026) : les balances des communes
par nature et fonction (repartition des charges par domaine) et les taux des impots
locaux par commune (DGFiP).

POURQUOI (procedure ingerer-une-source, « decrire avant de deviner ») : le conteneur de
travail ne joint pas ces hotes. Ce script tourne sur le runner GitHub et remonte le
releve (champs avec leur type, valeurs distinctes, quelques enregistrements) en
annotations de controle, lisibles par l'API GitHub. Aucun champ n'est suppose : le
normaliseur ne sera ecrit qu'a partir de ce releve.

Usage : python3 outils/decrire_sources_fiscales.py
"""
import json, sys, urllib.parse, urllib.request

UA = {"User-Agent": "Repere/decrire_sources_fiscales.py (application civique, donnees publiques)"}
HOTE = "https://data.economie.gouv.fr/api/explore/v2.1"
BALANCE = "balances-comptables-des-collectivites-et-des-etablissements-publics-locaux-avec-la-presentation-croisee-nature-fonction-2025"
FISCAL = "fiscalite-locale-des-particuliers-geo"
# Valeurs distinctes des champs qui decident de la suite : fonction, exercice, nomenclature.
GROUPES = {BALANCE: ["exer", "fonction", "nomen"], FISCAL: ["exercice"]}
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


def lire(chemin, **params):
    url = HOTE + chemin + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def decrire_jeu(identifiant):
    emettre("=== %s" % identifiant[:60])
    meta = lire("/catalog/datasets/" + identifiant)
    m = (meta.get("metas") or {}).get("default") or {}
    emettre("modifie: %s | licence: %s" % (m.get("modified") or m.get("data_processed"), m.get("license")))
    champs = meta.get("fields") or []
    emettre("champs (%d): %s" % (len(champs), " ; ".join(
        "%s[%s]" % (c.get("name"), c.get("type")) for c in champs)))
    total = lire("/catalog/datasets/%s/records" % identifiant, limit=0)
    emettre("enregistrements: %s" % total.get("total_count"))
    exemples = lire("/catalog/datasets/%s/records" % identifiant, limit=1)
    for r in exemples.get("results", []):
        emettre("exemple: %s" % json.dumps(r, ensure_ascii=False)[:900])
    for champ in GROUPES.get(identifiant, []):
        try:
            r = lire("/catalog/datasets/%s/records" % identifiant,
                     select="%s, count(*) as n" % champ, group_by=champ, limit=100)
            lignes = ["%s=%s" % (x.get(champ), x.get("n")) for x in r.get("results", [])]
            emettre("valeurs de %s (%d): %s" % (champ, len(lignes), " ; ".join(lignes)))
        except Exception as e:
            emettre("ECHEC valeurs de %s: %s" % (champ, e))


def main():
    for identifiant in (BALANCE, FISCAL):
        try:
            decrire_jeu(identifiant)
        except Exception as e:
            emettre("ECHEC %s: %s" % (identifiant[:60], e))
    annoncer_releve()
    return 0


if __name__ == "__main__":
    sys.exit(main())
