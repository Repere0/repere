#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les maires publies par Repere sont-ils encore les bons ? — mesure, pas correction.

POURQUOI (29/09/2026). Le bloc REPERE_RNE embarque dans app_repere_v18_20.html se
dit « genere par outils/rne_ingerer.py » : ce script n'existe sur aucune branche.
Les elus affiches sont un instantane de la source du 11/08/2026 que plus rien ne
rafraichit. Un maire change a tout moment (demission, deces, election
partielle) ; afficher le mauvais nom sous « qui decide chez moi » est la faute la
plus visible que le produit puisse commettre.

CE QUE FAIT CE SCRIPT : il telecharge la table des maires du Repertoire national
des elus (data.gouv.fr, ministere de l'Interieur, ODbL), la compare au bloc
embarque, commune par commune, et ECRIT l'ecart sous forme d'annotations GitHub
(le seul canal lisible depuis le conteneur de travail). Il ne modifie rien.

La comparaison se fait sur le nom et le prenom normalises (majuscules, sans
accents ni tirets) : une difference de graphie n'est pas un changement de maire.

Usage : python3 outils/rne_fraicheur.py [fichier_html]
"""
import csv, io, json, re, sys, unicodedata, urllib.request

JEU = "https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-elus-1/"
UA = {"User-Agent": "Repere/rne_fraicheur.py (application civique, donnees publiques)"}
IDF = ("75", "77", "78", "91", "92", "93", "94", "95")


def annoncer(titre, texte):
    t = (titre + " | " + texte)[:3800].replace("%", "%25").replace("\r", "").replace("\n", "%0A")
    print("::notice title=rne-fraicheur::" + t, flush=True)


def telecharger(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z]", "", s.upper())


def bloc_rne(html):
    s = open(html, encoding="utf-8", errors="ignore").read()
    i = s.index("window.REPERE_RNE =", s.index("/* REPERE_RNE_DEBUT */"))
    i = s.index("=", i) + 1
    j = s.index("/* REPERE_RNE_FIN */", i)
    return json.loads(s[i:j].strip().rstrip(";"))


def main():
    html = sys.argv[1] if len(sys.argv) > 1 else sorted(
        __import__("glob").glob("app_repere_v18_*.html"))[-1]
    rne = bloc_rne(html)
    embarque = {}
    for insee, (ip, inn, _f) in rne["com"].items():
        embarque[insee] = (rne["p"][ip], rne["n"][inn])
    annoncer("bloc embarque", "%s : %d maires, source datee %s" % (
        html, len(embarque), rne.get("meta", {}).get("maj")))

    meta = json.loads(telecharger(JEU))
    ress = [r for r in meta.get("resources", []) if "maire" in (r.get("title") or "").lower()]
    annoncer("ressources", json.dumps([(r.get("title"), r.get("last_modified"), r.get("format"))
                                       for r in meta.get("resources", [])], ensure_ascii=False))
    if not ress:
        annoncer("echec", "aucune ressource dont le titre contient « maire »")
        return 1
    r = ress[0]
    brut = telecharger(r["url"])
    texte = brut.decode("utf-8-sig", errors="replace")
    sep = ";" if texte[:2000].count(";") > texte[:2000].count(",") else ","
    lignes = list(csv.reader(io.StringIO(texte), delimiter=sep))
    entete = lignes[0]
    annoncer("table des maires", "%s, modifiee %s, %d lignes, entete=%s" % (
        r.get("title"), r.get("last_modified"), len(lignes) - 1, json.dumps(entete, ensure_ascii=False)))

    def col(*mots):
        for i, h in enumerate(entete):
            hn = norm(h)
            if all(norm(m) in hn for m in mots):
                return i
        return None
    c_dep = col("code", "departement")
    c_com = col("code", "commune")
    c_nom = col("nom", "elu")
    c_pre = col("prenom")
    if None in (c_com, c_nom, c_pre):
        annoncer("echec", "colonnes non reconnues : commune=%s nom=%s prenom=%s" % (c_com, c_nom, c_pre))
        return 1

    source = {}
    for l in lignes[1:]:
        if len(l) <= max(c_com, c_nom, c_pre):
            continue
        code = l[c_com].strip()
        if c_dep is not None and len(code) < 5:
            code = l[c_dep].strip().zfill(2) + code.zfill(3)
        source[code] = (l[c_pre], l[c_nom])

    communs = set(source) & set(embarque)
    diff = sorted(c for c in communs if (norm(source[c][0]), norm(source[c][1])) != (norm(embarque[c][0]), norm(embarque[c][1])))
    diff_idf = [c for c in diff if c[:2] in IDF]
    annoncer("ecart", "communes comparees %d ; maire different %d (%.2f %%) ; en Ile-de-France %d ; absentes de la source %d ; absentes du bloc %d" % (
        len(communs), len(diff), 100.0 * len(diff) / max(1, len(communs)), len(diff_idf),
        len(set(embarque) - set(source)), len(set(source) - set(embarque))))
    annoncer("ecart IDF", "; ".join("%s : %s %s -> %s %s" % (c, embarque[c][0], embarque[c][1], source[c][0], source[c][1])
                                     for c in diff_idf[:40]))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        annoncer("echec", repr(e))
        sys.exit(1)
