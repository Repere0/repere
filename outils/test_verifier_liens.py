#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle sans reseau de outils/verifier_liens.py (05/11/2026)."""
import io, os, sys, tempfile, urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import verifier_liens as v


class Rep:
    def __init__(self, status): self.status = status
    def __enter__(self): return self
    def __exit__(self, *a): return False


def ouvreur(table):
    def ouvrir(req, timeout=0):
        r = table[(req.full_url, req.get_method())]
        if isinstance(r, Exception):
            raise r
        return Rep(r)
    return ouvrir


def erreur(code):
    return urllib.error.HTTPError("u", code, "x", {}, io.BytesIO(b""))


def main():
    ok = ouvreur({("https://a.fr", "HEAD"): 200})
    assert v.verifier("https://a.fr", ouvrir=ok) == ("https://a.fr", 200, None)

    # HEAD refuse (405) : le robot retente en GET
    repli = ouvreur({("https://b.fr", "HEAD"): erreur(405), ("https://b.fr", "GET"): 200})
    assert v.verifier("https://b.fr", ouvrir=repli)[1] == 200

    # 404 : signale, sans GET inutile
    mort = ouvreur({("https://c.fr", "HEAD"): erreur(404)})
    assert v.verifier("https://c.fr", ouvrir=mort)[1] == 404

    # aucune reponse : code 0 et nom de l'erreur
    panne = ouvreur({("https://d.fr", "HEAD"): TimeoutError()})
    assert v.verifier("https://d.fr", ouvrir=panne) == ("https://d.fr", 0, "TimeoutError")

    morts, douteux, lignes = v.bilan([("https://a.fr", 200, None), ("https://c.fr", 404, None),
                                      ("https://d.fr", 0, "TimeoutError"), ("https://e.fr", 403, None)])
    assert [m[0] for m in morts] == ["https://c.fr"], morts
    assert [d[0] for d in douteux] == ["https://d.fr", "https://e.fr"], douteux
    assert lignes[0].startswith("4 lien(s) verifie(s) : 1 mort(s), 2 a verifier"), lignes[0]
    assert "Mozilla" not in v.AGENT and "Chrome" not in v.AGENT, "le robot ne se deguise pas en navigateur"

    # les adresses construites (${...}) ne sont jamais prises pour des liens
    with tempfile.TemporaryDirectory() as t:
        open(os.path.join(t, "x.tsx"), "w").write(
            'const a = "https://ok.fr/page";\nconst b = `https://www.x.fr/dossiers/${ref}`;\n')
        assert v.liens_du_code(t) == ["https://ok.fr/page"], v.liens_du_code(t)
    print("ok    liens sortants : HEAD, repli GET, 404, panne, adresses construites ignorees")


if __name__ == "__main__":
    main()
