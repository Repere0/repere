#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controles SANS RESEAU de outils/collecte.py — 07/10/2026.

Le telechargement de l'Assemblee etait verifie uniquement... en appelant
l'Assemblee. Ici chaque reponse est simulee : archive valide, panne reseau,
404, 500, page HTML en 200, archive tronquee. Le dossier de destination est
temporaire et vide, comme un runner GitHub neuf.

Usage : python3 outils/test_collecte.py
"""
import io, os, sys, tempfile, unittest, urllib.error, zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import collecte  # noqa: E402

SRC = {"cle": "agenda_an", "titre": "test", "url": "https://data.assemblee-nationale.fr/x/Agenda.json.zip",
       "fichier": "Agenda.json.zip"}


def archive_valide():
    tampon = io.BytesIO()
    with zipfile.ZipFile(tampon, "w") as z:
        z.writestr("json/reunion.json", '{"x": "%s"}' % ("a" * 20000))
    return tampon.getvalue()


class Reponse:
    def __init__(self, corps, status=200):
        self._b, self.status = io.BytesIO(corps), status
    def read(self, n=-1):
        return self._b.read(n)
    def __enter__(self):
        return self
    def __exit__(self, *a):
        return False


def reseau(*suite):
    """Faux urlopen qui rejoue une suite de reponses ou d'exceptions."""
    appels = []
    def ouvrir(req, timeout=None):
        r = suite[min(len(appels), len(suite) - 1)]
        appels.append(req.full_url)
        if isinstance(r, Exception):
            raise r
        return r
    ouvrir.appels = appels
    return ouvrir


def http(code):
    return urllib.error.HTTPError(SRC["url"], code, "x", {}, None)


class Telechargement(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp(prefix="repere-collecte-")
        self.ancien, collecte.DEST = collecte.DEST, self.d
        self.dest = os.path.join(self.d, SRC["fichier"])

    def tearDown(self):
        collecte.DEST = self.ancien

    def lancer(self, ouvrir):
        return collecte.telecharger(SRC, ouvrir=ouvrir, dormir=lambda s: None)

    def test_runner_neuf_source_ok(self):
        r = self.lancer(reseau(Reponse(archive_valide())))
        self.assertTrue(r["ok"])
        self.assertTrue(zipfile.is_zipfile(self.dest))
        self.assertEqual(r["tentatives"], ["ok"])

    def test_runner_neuf_source_indisponible(self):
        o = reseau(OSError("Connection reset"))
        r = self.lancer(o)
        self.assertFalse(r["ok"])
        self.assertEqual(r["nature"], "echec")
        self.assertEqual(len(o.appels), 3, "panne passagere : relancee, dans une limite fixe")
        self.assertFalse(os.path.exists(self.dest), "aucune archive laissee : rien a depiler comme si c'etait du jour")

    def test_404_introuvable_non_relance(self):
        o = reseau(http(404))
        r = self.lancer(o)
        self.assertEqual((r["ok"], r["nature"], len(o.appels)), (False, "introuvable", 1))

    def test_500_puis_reussite(self):
        o = reseau(http(500), Reponse(archive_valide()))
        r = self.lancer(o)
        self.assertTrue(r["ok"])
        self.assertEqual(len(o.appels), 2)
        self.assertTrue(r["tentatives"][0].startswith("echec"))

    def test_200_html_invalide(self):
        page = b"<!DOCTYPE html><html>" + b"maintenance " * 2000 + b"</html>"
        r = self.lancer(reseau(Reponse(page)))
        self.assertEqual((r["ok"], r["nature"]), (False, "invalide"))
        self.assertFalse(os.path.exists(self.dest))

    def test_archive_tronquee_invalide(self):
        r = self.lancer(reseau(Reponse(archive_valide()[:15000])))
        self.assertEqual((r["ok"], r["nature"]), (False, "invalide"))
        self.assertFalse(os.path.exists(self.dest))

    def test_ancienne_archive_et_source_ko(self):
        """Une archive laissee par une execution precedente (poste de developpement)
        ne doit pas etre depilee comme celle du jour quand le telechargement echoue."""
        open(self.dest, "wb").write(archive_valide())
        r = self.lancer(reseau(OSError("timeout")))
        self.assertFalse(r["ok"])
        self.assertFalse(os.path.exists(self.dest))

    def test_403_refuse_non_relance(self):
        o = reseau(http(403))
        r = self.lancer(o)
        self.assertEqual((r["nature"], len(o.appels)), ("refuse", 1))


if __name__ == "__main__":
    unittest.main(verbosity=1)
