#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LIENS SORTANTS — le robot qui verifie qu'ils repondent (05/11/2026).

POURQUOI : Repere renvoie le lecteur vers des sites officiels (service-public, prefectures,
textes de loi) et vers le site de sa mairie (data/mairies-idf.json, 1 262 communes de la
beta). Un lien mort ne se voit qu'en le touchant : le lecteur conclut que Repere est faux.

CE QUE LE SCRIPT FAIT : une requete HEAD par adresse (GET sans lire le corps si HEAD est
refuse), delai 8 s, au plus 16 en parallele. Il ne lit jamais le contenu d'un site (ADR 0005).
Il ECRIT un bilan (journal de la CI et resume du job) et ne bloque JAMAIS la publication :
un site de mairie en panne une matinee n'est pas une erreur de Repere.

QUOI : les adresses ecrites dans le code de l'application (mono/apps/mobile/src) ; et les
sites des mairies seulement pendant la collecte planifiee (GITHUB_EVENT_NAME=schedule), pour
ne pas solliciter 1 262 sites a chaque pull request.

Usage : python3 outils/verifier_liens.py [--mairies chemin/mairies-idf.json]
"""
import concurrent.futures, json, os, re, sys, urllib.error, urllib.request

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE = os.path.join(RACINE, "mono", "apps", "mobile", "src")
URL = re.compile(r"https://[A-Za-z0-9./_?=&%#:~+-]+")
# Adresses de base (prefixes que l'application complete), pas des liens offerts au lecteur.
PAS_DES_LIENS = {"https://repereapp.netlify.app/data"}
AGENT = "Repere-verificateur-de-liens (application civique ; contact dans les mentions legales)"


def liens_du_code(racine=CODE):
    """Adresses https ecrites en dur dans le code ; jamais celles construites (${...})."""
    vus = set()
    for dossier, _, fichiers in os.walk(racine):
        for nom in fichiers:
            if not nom.endswith((".ts", ".tsx")):
                continue
            texte = open(os.path.join(dossier, nom), encoding="utf-8").read()
            for m in URL.finditer(texte):
                fin = texte[m.end():m.end() + 2]
                if fin.startswith("${") or "${" in m.group(0):
                    continue
                vus.add(m.group(0).rstrip(".,);"))
    return sorted(vus - PAS_DES_LIENS)


def liens_des_mairies(chemin):
    d = json.load(open(chemin, encoding="utf-8"))
    return sorted({c["site"] for c in (d.get("communes") or {}).values()
                   if isinstance(c, dict) and isinstance(c.get("site"), str) and c["site"].startswith("http")})


def verifier(url, ouvrir=urllib.request.urlopen, delai=8):
    """Retourne (url, code, erreur). code 0 : aucune reponse."""
    for methode in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=methode, headers={"User-Agent": AGENT})
        try:
            with ouvrir(req, timeout=delai) as r:
                return (url, getattr(r, "status", 200), None)
        except urllib.error.HTTPError as e:
            if methode == "HEAD" and e.code in (403, 405, 501):
                continue                      # HEAD refuse : on retente en GET, sans lire le corps
            return (url, e.code, None)
        except Exception as e:                # delai, DNS, TLS : aucune reponse
            return (url, 0, type(e).__name__)
    return (url, 0, "aucune methode acceptee")


def bilan(resultats):
    morts = [r for r in resultats if r[1] == 0 or r[1] >= 400]
    lignes = ["%d lien(s) verifie(s), %d sans reponse correcte" % (len(resultats), len(morts))]
    for url, code, err in morts:
        lignes.append("  %s  %s" % (code or err, url))
    return morts, lignes


def main(argv):
    liens = liens_du_code()
    if "--mairies" in argv:
        chemin = argv[argv.index("--mairies") + 1]
        if os.environ.get("GITHUB_EVENT_NAME") == "schedule" and os.path.exists(chemin):
            liens += liens_des_mairies(chemin)
    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        resultats = list(ex.map(verifier, liens))
    morts, lignes = bilan(resultats)
    print("\n".join(lignes))
    for url, code, err in morts:
        print("::warning::lien sortant sans reponse correcte (%s) : %s" % (code or err, url))
    resume = os.environ.get("GITHUB_STEP_SUMMARY")
    if resume:
        with open(resume, "a", encoding="utf-8") as f:
            f.write("### Liens sortants\n\n" + "\n".join("- " + l.strip() for l in lignes) + "\n")
    return 0                                   # jamais bloquant


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
