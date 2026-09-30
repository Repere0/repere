#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les maires et leurs adjoints, releves a la source (RNE) — 29/09/2026.

POURQUOI. Le bloc REPERE_RNE du mono-HTML se dit « genere par
outils/rne_ingerer.py », script qui n'existe sur aucune branche. Mesure faite
sur le runner le 29/09/2026 (outils/rne_fraicheur.py, run 36506969090), en
comparant le bloc a la table des maires du Repertoire national des elus :

  - 62 communes affichent un maire qui n'est plus celui de la source (0,18 %),
    dont 2 en Ile-de-France : Mouy-sur-Seine (77325), ou le maire a demissionne
    et Julian Gauthier a ete elu en juin 2026, et Saint-Brice (77403) ;
  - 230 communes de la source sont absentes du bloc, dont Barbey (77021) et
    Lissy (77253) en Seine-et-Marne — deux des quatre communes que la beta
    declarait « absentes du Repertoire national des elus ». Elles n'en sont pas
    absentes : c'est le bloc qui les a perdues.

CE QUE FAIT CE SCRIPT (sur le runner : le conteneur ne joint pas data.gouv.fr) :
telecharge la table des maires et celle des conseillers municipaux du RNE,
ecrit mono/scripts/maires.json :

    { source: {...}, communes: { insee: { maire, debut, adjoints } } }

  - `maire`  : « Prenom NOM », tel que le RNE l'ecrit ;
  - `debut`  : date de debut de la fonction, telle que publiee ;
  - `adjoints` : nombre de conseillers municipaux dont la fonction contient
    « adjoint », ou null si la table des conseillers n'a pas pu etre lue.

Rien d'autre n'est garde : ni date de naissance, ni sexe, ni profession, ni
etiquette — Repere n'en a pas l'usage (invariant 8, et le bloc d'origine s'y
tenait deja). Les annotations GitHub (::notice::) disent ce qui a ete lu.

Usage : python3 outils/rne.py --produire
"""
import csv, datetime, io, json, os, re, sys, unicodedata, urllib.request

JEU = "https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-elus-1/"
UA = {"User-Agent": "Repere/rne.py (application civique, donnees publiques)"}
DEST = "mono/scripts/maires.json"


def annoncer(titre, texte):
    t = (titre + " | " + texte)[:3800].replace("%", "%25").replace("\r", "").replace("\n", "%0A")
    print("::notice title=rne::" + t, flush=True)


def telecharger(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=600) as r:
        return r.read()


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z]", "", s.upper())


def table(ressource):
    texte = telecharger(ressource["url"]).decode("utf-8-sig", errors="replace")
    sep = ";" if texte[:3000].count(";") > texte[:3000].count(",") else ","
    lecteur = csv.reader(io.StringIO(texte), delimiter=sep)
    entete = next(lecteur)
    return entete, lecteur


def colonne(entete, *mots, sauf=()):
    for i, h in enumerate(entete):
        hn = norm(h)
        if all(norm(m) in hn for m in mots) and not any(norm(x) in hn for x in sauf):
            return i
    return None


def code_commune(l, c_dep, c_com):
    code = l[c_com].strip()
    if len(code) < 5 and c_dep is not None:
        code = l[c_dep].strip().zfill(2) + code.zfill(3)
    return code


def produire():
    meta = json.loads(telecharger(JEU))
    ress = {(r.get("title") or "").lower(): r for r in meta.get("resources", [])}
    r_mai = next((r for t, r in ress.items() if "maires" in t), None)
    r_cm = next((r for t, r in ress.items() if "conseillers-municipaux" in t), None)
    if not r_mai:
        annoncer("ARRET", "table des maires introuvable dans le jeu")
        raise SystemExit(3)

    entete, lignes = table(r_mai)
    c_dep, c_com = colonne(entete, "code", "departement"), colonne(entete, "code", "commune")
    c_nom, c_pre = colonne(entete, "nom", "elu", sauf=("prenom",)), colonne(entete, "prenom")
    c_deb = colonne(entete, "debut", "fonction")
    if None in (c_com, c_nom, c_pre):
        annoncer("ARRET", "colonnes des maires non reconnues : %s" % json.dumps(entete, ensure_ascii=False))
        raise SystemExit(3)
    communes, doublons = {}, []
    for l in lignes:
        if len(l) <= max(c_com, c_nom, c_pre):
            continue
        code = code_commune(l, c_dep, c_com)
        if code in communes:
            doublons.append(code)
            continue
        communes[code] = {"maire": ("%s %s" % (l[c_pre].strip(), l[c_nom].strip())).strip(),
                          "debut": l[c_deb].strip() if c_deb is not None else None,
                          "adjoints": None}
    if doublons:
        annoncer("ARRET", "%d communes avec deux maires, ex. %s" % (len(doublons), doublons[:10]))
        raise SystemExit(3)

    adjoints_lus = False
    if r_cm:
        try:
            entete, lignes = table(r_cm)
            annoncer("conseillers municipaux", "%s, modifie %s, entete=%s" % (
                r_cm.get("title"), r_cm.get("last_modified"), json.dumps(entete, ensure_ascii=False)))
            d_dep, d_com = colonne(entete, "code", "departement"), colonne(entete, "code", "commune")
            d_fon = colonne(entete, "libelle", "fonction")
            if d_com is None or d_fon is None:
                raise ValueError("colonnes commune/fonction non reconnues")
            compte = {}
            for l in lignes:
                if len(l) <= max(d_com, d_fon):
                    continue
                if "adjoint" in (l[d_fon] or "").lower():
                    code = code_commune(l, d_dep, d_com)
                    compte[code] = compte.get(code, 0) + 1
            for code, c in communes.items():
                c["adjoints"] = compte.get(code, 0)
            adjoints_lus = True
        except Exception as e:  # les adjoints manquent : on le dit, les maires restent
            annoncer("adjoints non lus", repr(e))

    if len(communes) < 30000:
        annoncer("ARRET", "releve maigre : %d maires, rien n'est ecrit" % len(communes))
        raise SystemExit(4)
    paquet = {
        "v": 1,
        "source": {
            "producteur": "Ministère de l'Intérieur — Répertoire national des élus",
            "licence": "ODbL 1.0",
            "url": "https://www.data.gouv.fr/datasets/repertoire-national-des-elus-1/",
            "table": r_mai.get("title"),
            "modifie": str(r_mai.get("last_modified") or "")[:10],
            "adjoints_depuis": (r_cm.get("title") if adjoints_lus else None),
            "releve_le": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        },
        "communes": {c: communes[c] for c in sorted(communes)},
    }
    os.makedirs(os.path.dirname(DEST), exist_ok=True)
    with open(DEST, "w", encoding="utf-8") as f:
        json.dump(paquet, f, ensure_ascii=False, separators=(",", ":"))
    relu = json.load(open(DEST, encoding="utf-8"))
    assert len(relu["communes"]) == len(communes)
    assert relu["communes"]["75056"]["maire"], "temoin Paris sans maire"
    annoncer("ecrit", "%s : %d maires, source modifiee le %s, adjoints %s, %.1f Mo" % (
        DEST, len(communes), paquet["source"]["modifie"], "lus" if adjoints_lus else "NON lus",
        os.path.getsize(DEST) / 1e6))


if __name__ == "__main__":
    if "--produire" in sys.argv:
        try:
            produire()
        except SystemExit:
            raise
        except Exception as e:
            annoncer("echec", repr(e))
            sys.exit(1)
    else:
        print(__doc__)
        sys.exit(2)
