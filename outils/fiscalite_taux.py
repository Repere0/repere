#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Taux des impots locaux par commune, pour les departements de la beta.

CE QU'IL PRODUIT :
  mono/data/fiscalite/<dep>.json   { insee : {tfb, teom, th} } + bloc de provenance.
  tfb : taux global de la taxe fonciere sur les proprietes baties, en %.
  teom : taux plein de la taxe d'enlevement des ordures menageres, en %, ou null
         quand la source laisse le champ vide (la commune ne la leve pas).
  th  : taux global de la taxe d'habitation (residences secondaires), en %, ou null.

SOURCE : DGFiP, « Fiscalite locale des particuliers, geo » (data.economie.gouv.fr),
  exercice 2025. Donnees publiees sous Licence Ouverte 2.0 (Etalab). Verifiee sur le
  runner GitHub le 20/10/2026 : 174 668 lignes, 34 874 communes en 2025.
  Le conteneur de travail ne joint pas cet hote : le script ne tourne que sur le runner.

REFUS, ET ILS SONT LA RAISON D'ETRE DU SCRIPT :
  1. On n'ecrit RIEN si la source est absente ou manifestement tronquee (moins de
     MIN_LIGNES communes). Un releve valide d'hier vaut mieux qu'un fichier faux.
  2. Un champ vide n'est jamais un zero. Un taux absent reste null : la page dit
     « non publie », jamais « 0 % ».
  3. On ne rattache une ligne qu'a un code INSEE a cinq caracteres valide.
  4. On n'ecrit pas un departement sans aucune commune.

Usage :
  python3 outils/fiscalite_taux.py --test                  (autotest, sans reseau)
  python3 outils/fiscalite_taux.py <racine du depot>       (lit la source, ecrit)
"""
import json
import os
import re
import sys
import datetime
import urllib.parse
import urllib.request

HOTE = "https://data.economie.gouv.fr/api/explore/v2.1"
JEU = "fiscalite-locale-des-particuliers-geo"
EXERCICE = 2025
DEPARTEMENTS_BETA = ["75", "77", "78", "91", "92", "93", "94", "95"]
MIN_LIGNES = 30000   # 34 874 communes en 2025 ; en dessous, la source est tronquee
CHAMPS = ["insee_com", "exercice", "taux_global_tfb", "taux_plein_teom", "taux_global_th"]
UA = {"User-Agent": "Repere/fiscalite_taux.py (application civique, donnees publiques)"}
PRODUCTEUR = "Direction générale des Finances publiques (DGFiP)"


def nombre(v):
    """Un taux publie, ou None. Un champ vide reste vide : jamais 0."""
    if v is None:
        return None
    texte = str(v).strip().replace(",", ".")
    if texte == "":
        return None
    try:
        return float(texte)
    except ValueError:
        return None


def code_insee_valide(insee):
    return re.fullmatch(r"\d{5}|2[AB]\d{3}", insee) is not None


def normaliser(lignes, departements=DEPARTEMENTS_BETA):
    """Lignes brutes -> {dep: {insee: {tfb, teom, th}}}. Leve si la source est tronquee."""
    if len(lignes) < MIN_LIGNES:
        raise ValueError("source tronquee : %d lignes, %d attendues au minimum" % (len(lignes), MIN_LIGNES))
    par_dep = {}
    ecartes = {"insee_invalide": 0, "hors_beta": 0, "sans_tfb": 0}
    for r in lignes:
        insee = str(r.get("insee_com") or "").strip()
        if not code_insee_valide(insee):
            ecartes["insee_invalide"] += 1
            continue
        dep = insee[:2]
        if dep not in departements:
            ecartes["hors_beta"] += 1
            continue
        tfb = nombre(r.get("taux_global_tfb"))
        if tfb is None:
            ecartes["sans_tfb"] += 1
            continue
        par_dep.setdefault(dep, {})[insee] = {
            "tfb": tfb,
            "teom": nombre(r.get("taux_plein_teom")),
            "th": nombre(r.get("taux_global_th")),
        }
    return par_dep, ecartes


def ecrire_departement(racine, dep, communes, mise_a_jour, licence, releve):
    dossier = os.path.join(racine, "mono", "data", "fiscalite")
    os.makedirs(dossier, exist_ok=True)
    chemin = os.path.join(dossier, dep + ".json")
    paquet = {
        "v": 1, "d": dep, "exercice": EXERCICE,
        "source": {"producteur": PRODUCTEUR, "licence": licence, "mis_a_jour_le": mise_a_jour,
                   "releve_le": releve, "jeu": JEU, "url": HOTE + "/catalog/datasets/" + JEU},
        "communes": communes,
    }
    tmp = chemin + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(paquet, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    os.replace(tmp, chemin)
    return chemin


def lire_source():
    def get(chemin, **params):
        url = HOTE + chemin + ("?" + urllib.parse.urlencode(params) if params else "")
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode("utf-8"))
    meta = get("/catalog/datasets/" + JEU)
    m = (meta.get("metas") or {}).get("default") or {}
    lignes = get("/catalog/datasets/%s/exports/json" % JEU,
                 where="exercice=%d" % EXERCICE, select=",".join(CHAMPS))
    if isinstance(lignes, dict):
        lignes = lignes.get("results", [])
    return lignes, m.get("modified"), m.get("license")


def test():
    """Autotest sans reseau : un jeu de lignes connu, et les refus."""
    import tempfile
    faux = [{"insee_com": "77001", "taux_global_tfb": "25,3", "taux_plein_teom": "9.5", "taux_global_th": None},
            {"insee_com": "77002", "taux_global_tfb": "18", "taux_plein_teom": None, "taux_global_th": "12"},
            {"insee_com": "2A004", "taux_global_tfb": "10", "taux_plein_teom": None, "taux_global_th": None},
            {"insee_com": "", "taux_global_tfb": "10"},
            {"insee_com": "69123", "taux_global_tfb": "10"},
            {"insee_com": "78001", "taux_global_tfb": None}]
    grand = [{"insee_com": "77%03d" % (i % 999 + 1), "taux_global_tfb": "10"} for i in range(MIN_LIGNES)]
    par_dep, ec = normaliser(grand + faux)
    echecs = []
    c = par_dep["77"]["77001"]
    if c != {"tfb": 25.3, "teom": 9.5, "th": None}:
        echecs.append("virgule ou vide mal lus : %r" % c)
    if par_dep["77"]["77002"]["teom"] is not None:
        echecs.append("TEOM vide devenue zero ou nombre : %r" % par_dep["77"]["77002"])
    if "2A" in par_dep:
        echecs.append("Corse acceptee alors que hors beta")
    if "69" in par_dep:
        echecs.append("departement hors beta accepte")
    if "78001" in par_dep.get("78", {}):
        echecs.append("commune sans taux TFB acceptee")
    try:
        normaliser(faux)
        echecs.append("source tronquee acceptee")
    except ValueError:
        pass
    with tempfile.TemporaryDirectory() as d:
        ecrire_departement(d, "77", par_dep["77"], "2026-05-21", "Licence Ouverte 2.0", "2026-10-20")
        relu = json.load(open(os.path.join(d, "mono", "data", "fiscalite", "77.json"), encoding="utf-8"))
        if relu["communes"]["77001"]["teom"] != 9.5:
            echecs.append("ecriture relue differente")
    if echecs:
        print("ECHEC autotest :")
        for e in echecs:
            print("  -", e)
        return 1
    print("autotest fiscalite_taux : tous les controles passent")
    return 0


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        return test()
    racine = sys.argv[1] if len(sys.argv) > 1 else "."
    try:
        lignes, mise_a_jour, licence = lire_source()
    except Exception as e:
        print("source injoignable, rien n'est ecrit : %s" % e)
        return 1
    try:
        par_dep, ecartes = normaliser(lignes)
    except ValueError as e:
        print("refus : %s — rien n'est ecrit" % e)
        return 1
    releve = datetime.date.today().isoformat()
    for dep in DEPARTEMENTS_BETA:
        communes = par_dep.get(dep)
        if not communes:
            print("%s : aucune commune, fichier non ecrit" % dep)
            continue
        ecrire_departement(racine, dep, communes, mise_a_jour, licence or "Licence Ouverte 2.0", releve)
        print("%s : %d communes ecrites" % (dep, len(communes)))
    print("ecartes :", json.dumps(ecartes, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
