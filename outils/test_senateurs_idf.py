#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle de outils/senateurs_idf.py sur un fichier factice (13/10/2026).

Le fichier reel du Senat n'a pas ete lu en entier depuis ce conteneur : les noms de colonnes
ci-dessous viennent de l'en-tete partiel publie. Le runner dira si le vrai fichier correspond.

Lancer : python3 -m unittest outils/test_senateurs_idf.py
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "senateurs_idf.py")

ENTETE = ("Matricule,Qualité,Nom usuel,Prénom usuel,État,Date naissance,Date de décès,"
          "Groupe politique,Type d'app au grp politique,Circonscription,"
          "Commission permanente,Description de la profession")

LIGNES = [
    "1000A,M.,Dupont,Anne,ACTIF,1960-01-01,,GRP-TEST,Membre,Paris,Lois,Avocate",
    "1000B,M.,Martin,Jean,ANCIEN,1930-01-01,2001-01-01,GRP-TEST,Membre,Essonne,Lois,Notaire",
    "1000C,Mme,Durand,Léa,ACTIF,1970-01-01,,GRP-TEST,Membre,Hautes-Pyrénées,Lois,Médecin",
    "1000D,M.,Petit,Paul,ACTIF,1965-01-01,,GRP-TEST,Membre,Seine-et-Marne,Finances,Ingénieur",
]


def ecrire_csv(lignes, entete=ENTETE):
    dossier = tempfile.mkdtemp(prefix="repere-senat-")
    chemin = os.path.join(dossier, "ODSEN_GENERAL.csv")
    with open(chemin, "w", encoding="cp1252", newline="") as f:
        f.write(entete + "\n" + "\n".join(lignes) + "\n")
    return dossier, chemin


def lancer(chemin, sortie, minimum=1):
    return subprocess.run([sys.executable, SCRIPT, chemin, sortie, str(minimum)],
                          capture_output=True, text=True)


class SenateursIdf(unittest.TestCase):
    def test_seuls_les_actifs_d_idf_sont_retenus(self):
        dossier, chemin = ecrire_csv(LIGNES)
        sortie = os.path.join(dossier, "senateurs.json")
        pr = lancer(chemin, sortie)
        self.assertEqual(pr.returncode, 0, pr.stderr)
        with open(sortie, encoding="utf-8") as f:
            noms = [s["nom"] for s in json.load(f)["senateurs"]]
        self.assertEqual(noms, ["Dupont", "Petit"])

    def test_pas_de_date_de_naissance_ni_de_profession(self):
        dossier, chemin = ecrire_csv(LIGNES)
        sortie = os.path.join(dossier, "senateurs.json")
        lancer(chemin, sortie)
        with open(sortie, encoding="utf-8") as f:
            brut = f.read()
        for interdit in ("1960", "1965", "Avocate", "Ingénieur", "naissance", "profession"):
            self.assertNotIn(interdit, brut)

    def test_colonne_absente_arrete_tout_et_dit_laquelle(self):
        dossier, chemin = ecrire_csv(LIGNES, entete=ENTETE.replace("Circonscription", "Lieu"))
        sortie = os.path.join(dossier, "senateurs.json")
        pr = lancer(chemin, sortie)
        self.assertNotEqual(pr.returncode, 0)
        self.assertIn("circonscription", pr.stderr)
        self.assertFalse(os.path.exists(sortie), "aucun fichier partiel ne doit etre ecrit")

    def test_sous_le_minimum_rien_n_est_ecrit(self):
        dossier, chemin = ecrire_csv(LIGNES)
        sortie = os.path.join(dossier, "senateurs.json")
        pr = lancer(chemin, sortie, minimum=5)
        self.assertNotEqual(pr.returncode, 0)
        self.assertFalse(os.path.exists(sortie))


if __name__ == "__main__":
    unittest.main()
