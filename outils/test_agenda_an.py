#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle de outils/agenda_an.py sur un agenda factice (13/10/2026).

Verifie que l'heure de fin publiee par la source est recopiee quand elle est coherente,
qu'elle n'est jamais devinee quand elle manque, et qu'une fin anterieure au debut est
ecartee. Le referentiel AMO30 doit depasser 8000 organes : on en fabrique 8001 vides.

Lancer : python3 -m unittest outils/test_agenda_an.py
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "agenda_an.py")


def ecrire(chemin, contenu):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(contenu, f)


def reunion(uid, debut, fin=None, type_="seance_type", etat="Prévu"):
    r = {
        "uid": uid, "@xsi:type": type_, "organeReuniRef": "PO1",
        "timeStampDebut": debut, "cycleDeVie": {"etat": etat},
    }
    if fin is not None:
        r["timeStampFin"] = fin
    return {"reunion": r}


class AgendaAN(unittest.TestCase):
    def setUp(self):
        self.dossier = tempfile.mkdtemp(prefix="repere-agenda-")
        self.agenda = os.path.join(self.dossier, "agenda")
        self.amo = os.path.join(self.dossier, "amo30")
        for i in range(8001):
            ecrire(os.path.join(self.amo, "organe", "PO%d.json" % (i + 1)),
                   {"organe": {"uid": "PO%d" % (i + 1), "codeType": "ASSEMBLEE",
                               "libelle": "Assemblée nationale de la 17ème législature" if i == 0 else "Instance %d" % i}})

    def lancer(self, reunions):
        for i, r in enumerate(reunions):
            ecrire(os.path.join(self.agenda, "reunion", "R%02d.json" % i), r)
        sortie = os.path.join(self.dossier, "sortie.json")
        pr = subprocess.run([sys.executable, SCRIPT, self.agenda, self.amo, sortie],
                            capture_output=True, text=True)
        self.assertEqual(pr.returncode, 0, pr.stderr)
        with open(sortie, encoding="utf-8") as f:
            return json.load(f)

    def test_fin_coherente_recopiee(self):
        sortie = self.lancer([reunion("A", "2099-10-13T17:00:00", "2099-10-13T18:30:00")])
        (r,) = sortie["r"]
        self.assertEqual(r["d"], "2099-10-13T17:00")
        self.assertEqual(r["f"], "2099-10-13T18:30")

    def test_sans_fin_rien_n_est_devine(self):
        sortie = self.lancer([reunion("B", "2099-10-13T21:30:00")])
        (r,) = sortie["r"]
        self.assertNotIn("f", r, "une seance sans fin publiee ne doit pas recevoir de fin")

    def test_fin_anterieure_ecartee(self):
        sortie = self.lancer([reunion("C", "2099-10-13T23:30:00", "2099-10-13T22:00:00")])
        (r,) = sortie["r"]
        self.assertNotIn("f", r)

    def test_type_conserve_pour_le_filtre_du_site(self):
        # Le filtre « séance publique » se fait dans scripts/agenda-an.mjs : ici, chaque
        # réunion garde son type, et seule la fin est ajoutée quand elle est publiée.
        sortie = self.lancer([
            reunion("D", "2099-10-13T10:00:00", "2099-10-13T12:00:00", type_="reunionCommission_type"),
            reunion("E", "2099-10-13T17:00:00", "2099-10-13T18:00:00"),
        ])
        self.assertEqual([(r["d"], r["t"], r.get("f")) for r in sortie["r"]],
                         [("2099-10-13T10:00", "commission", "2099-10-13T12:00"),
                          ("2099-10-13T17:00", "seance", "2099-10-13T18:00")])


    def test_horaire_avec_decalage_lu_a_l_heure_de_paris(self):
        # 13 h UTC en juillet = 15 h à Paris (heure d'été) ; fin à 16 h 30 UTC = 18 h 30.
        sortie = self.lancer([reunion("F", "2099-07-14T13:00:00+00:00", "2099-07-14T16:30:00+00:00")])
        (r,) = sortie["r"]
        self.assertEqual(r["d"], "2099-07-14T15:00")
        self.assertEqual(r["f"], "2099-07-14T18:30")

    def test_horaire_d_hiver_avec_decalage_inchange(self):
        # 14 h à Paris en janvier s'écrit 13 h UTC : le résultat doit être 14 h.
        sortie = self.lancer([reunion("G", "2099-01-13T14:00:00+01:00")])
        (r,) = sortie["r"]
        self.assertEqual(r["d"], "2099-01-13T14:00")


if __name__ == "__main__":
    unittest.main()
