#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les senateurs d'Ile-de-France, releves a la source du Senat (13/10/2026).

SOURCE. Base « Senateurs » du Senat, open data : https://data.senat.fr/les-senateurs/
Fichier utilise : ODSEN_GENERAL (dernier etat connu de chaque senateur, CSV).
Licence : la page renvoie a la licence ouverte d'Etalab (fichier ETALAB-Licence-Ouverte-v2.0),
mais le texte de la page ne nomme pas la version : a confirmer avant publication.

CE QUI EST GARDE, ET CE QUI NE L'EST PAS.
  - gardes : matricule, prenom, nom, departement (circonscription), groupe politique.
  - jamais publies : date de naissance, date de deces, description de la profession. Ce ne
    sont pas des faits de mandat, et la fiche n'en a pas besoin.
  - seuls les senateurs en exercice (etat « actif ») : un ancien senateur n'est pas une personnalite
    en fonction, et son groupe d'hier ne dit rien d'aujourd'hui.

NOMS DE COLONNES. Lus sur la premiere ligne du fichier, pas supposes. Si une colonne attendue
manque, le script s'arrete en disant laquelle et liste les en-tetes reellement trouves. Il ne
produit jamais un fichier partiel.

Usage : python3 outils/senateurs_idf.py <ODSEN_GENERAL.csv> <sortie.json> [minimum]
"""
import csv
import datetime
import io
import json
import sys
import unicodedata

DEPARTEMENTS_IDF = {
    "paris", "seine-et-marne", "yvelines", "essonne", "hauts-de-seine",
    "seine-saint-denis", "val-de-marne", "val-d'oise",
}
COLONNES = {
    "matricule": ["matricule"],
    "nom": ["nom usuel"],
    "prenom": ["prenom usuel"],
    "etat": ["etat"],
    "groupe": ["groupe politique"],
    "circonscription": ["circonscription"],
}


def normaliser(texte):
    sans = unicodedata.normalize("NFD", str(texte)).encode("ascii", "ignore").decode("ascii")
    return " ".join(sans.lower().replace("�", "").split())


def lire(chemin):
    brut = open(chemin, "rb").read()
    for enc in ("utf-8-sig", "cp1252"):
        try:
            return io.StringIO(brut.decode(enc))
        except UnicodeDecodeError:
            continue
    sys.exit("senateurs : fichier illisible (ni UTF-8 ni cp1252) : %s" % chemin)


def colonnes(entetes):
    trouvees = {}
    for cle, motsCles in COLONNES.items():
        pos = [i for i, h in enumerate(entetes) if normaliser(h) in motsCles]
        if not pos:
            sys.exit("senateurs : colonne « %s » introuvable. En-tetes lus : %s" % (
                motsCles[0], " | ".join(entetes)))
        trouvees[cle] = pos[0]
    return trouvees


def principal(entree, sortie, minimum=10):
    lecteur = csv.reader(lire(entree), delimiter=",")
    entetes = next(lecteur)
    c = colonnes(entetes)

    retenus, vus = [], 0
    for ligne in lecteur:
        if not ligne or len(ligne) <= max(c.values()):
            continue
        vus += 1
        if normaliser(ligne[c["etat"]]) != "actif":
            continue
        dep = normaliser(ligne[c["circonscription"]])
        if dep not in DEPARTEMENTS_IDF:
            continue
        retenus.append({
            "matricule": ligne[c["matricule"]].strip(),
            "prenom": ligne[c["prenom"]].strip(),
            "nom": ligne[c["nom"]].strip(),
            "departement": ligne[c["circonscription"]].strip(),
            "groupe": ligne[c["groupe"]].strip() or None,
        })

    if len(retenus) < minimum:
        sys.exit("senateurs : %d senateur(s) d'Ile-de-France retenu(s) sur %d lignes, minimum %d : rien n'est ecrit" % (
            len(retenus), vus, minimum))

    retenus.sort(key=lambda s: (normaliser(s["nom"]), normaliser(s["prenom"])))
    paquet = {
        "v": 1,
        "source": {
            "producteur": "Sénat — base Sénateurs (open data)",
            "licence": "Licence ouverte (Etalab), version à confirmer",
            "url": "https://data.senat.fr/les-senateurs/",
            "fichier": "ODSEN_GENERAL",
            "releve_le": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        },
        "senateurs": retenus,
    }
    with open(sortie, "w", encoding="utf-8") as f:
        json.dump(paquet, f, ensure_ascii=False, separators=(",", ":"))
    print("senateurs d'Ile-de-France : %d retenu(s) sur %d lignes" % (len(retenus), vus))


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    principal(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) == 4 else 10)
