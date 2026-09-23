#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le nom officiel de chaque commune, tel qu'il s'ecrit vraiment.

CE QU'IL PRODUIT : mono/scripts/noms-communes.json — code INSEE -> libelle
officiel, avec sa source.

LA MESURE QUI A DECIDE DE CE FICHIER (13/09/2026). Les noms affiches venaient du
Repertoire national des elus, qui les ecrit EN CAPITALES. Le produit les
recapitalisait lettre par lettre, et cette transformation est fautive deux fois :

  - les articles et prepositions internes prenaient une majuscule —
    « Choisy-Le-Roi » au lieu de « Choisy-le-Roi », « Beauvais-Sur-Matha » au lieu
    de « Beauvais-sur-Matha » ;
  - les initiales accentuees perdaient leur accent — « Evry-Courcouronnes » au
    lieu d'« Évry-Courcouronnes », « Epinay-Sous-Senart » au lieu d'« Épinay-sous-
    Sénart », « Ile-D'Aix » au lieu d'« Île-d'Aix ».

Mesure : 9 198 communes sur 34 637, soit UNE SUR QUATRE, affichaient un nom mal
orthographie. Le nom de sa commune est la premiere chose qu'un lecteur reconnait ;
l'ecrire faux est le premier signal qu'un produit n'est pas serieux.

POURQUOI UNE SOURCE ET PAS UNE REGLE. On aurait pu remettre les particules en
minuscules avec une liste de mots — cela n'aurait rien invente. Mais AUCUNE regle
ne peut savoir que « Evry » prend un accent et « Ermont » n'en prend pas : le
restaurer serait deviner, et l'invariant l'interdit. On prend donc le libelle
officiel, entier, ou on ne touche a rien.

LA SOURCE EST DEJA CELLE DU PRODUIT : le decoupage administratif d'Etalab / DINUM,
derive du Code officiel geographique de l'INSEE, deja declare dans index.json pour
les noms de territoires. Il est pris ici par le registre npm, que le runner sait
joindre, et non par une API : le build, lui, ne touche jamais au reseau — il lit le
fichier versionne que ce script vient d'ecrire.

Usage :  python3 outils/noms_communes.py [racine du depot]
"""
import io, os, sys, json, glob, shutil, tarfile, tempfile, subprocess, datetime

RACINE = sys.argv[1] if len(sys.argv) > 1 else "."
PAQUET = "@etalab/decoupage-administratif"
DEST = os.path.join(RACINE, "mono", "scripts", "noms-communes.json")

def recuperer():
    """Telecharge le paquet et rend le contenu de data/communes.json."""
    dossier = tempfile.mkdtemp(prefix="repere-cog-")
    try:
        subprocess.run(["npm", "pack", PAQUET], cwd=dossier, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, timeout=300)
        archives = glob.glob(os.path.join(dossier, "*.tgz"))
        if not archives:
            raise RuntimeError("npm pack n'a produit aucune archive")
        with tarfile.open(archives[0]) as t:
            membre = t.extractfile("package/data/communes.json")
            communes = json.load(membre)
            version = json.load(t.extractfile("package/package.json"))["version"]
        return communes, version
    finally:
        shutil.rmtree(dossier, ignore_errors=True)

try:
    communes, version = recuperer()
except Exception as e:
    print("::warning::les noms officiels des communes n'ont pas pu etre recuperes (%s) — "
          "le fichier existant est conserve" % e)
    sys.exit(1)

noms = {c["code"]: c["nom"] for c in communes if c.get("type") == "commune-actuelle" and c.get("nom")}

# ON N'ECRASE PAS UN FICHIER VALIDE PAR UN FICHIER MAIGRE. La France compte environ
# 34 900 communes ; en dessous de 30 000, la source a change de forme et il vaut
# mieux garder le releve de la veille que publier des noms manquants.
if len(noms) < 30000:
    print("::warning::seulement %d communes relevees, on n'ecrase pas" % len(noms))
    sys.exit(1)

paquet = {
    "v": 1,
    "source": {
        "producteur": "Etalab / DINUM — decoupage administratif (%s)" % PAQUET,
        "producteur_affiche": "Etalab / DINUM — découpage administratif",
        "licence": "Licence Ouverte 2.0",
        "url": "https://www.insee.fr/fr/information/2560452",
        "amont": "Code officiel géographique de l'INSEE",
        "version": version,
        "releve_le": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        "portee": "libellé officiel des %d communes actuelles" % len(noms),
    },
    "noms": dict(sorted(noms.items())),
}
os.makedirs(os.path.dirname(DEST), exist_ok=True)
brut = json.dumps(paquet, ensure_ascii=False, separators=(",", ":"))
io.open(DEST, "w", encoding="utf-8").write(brut)

# CONTROLE INDEPENDANT : on relit le fichier ecrit, sans reutiliser une variable.
relu = json.load(io.open(DEST, encoding="utf-8"))
assert relu["source"]["licence"] and relu["source"]["releve_le"], "source incomplete"
assert len(relu["noms"]) == len(noms), "le fichier relu ne porte pas le meme nombre de communes"
temoins = {"91228": "Évry-Courcouronnes", "94022": "Choisy-le-Roi", "75056": "Paris"}
for code, attendu in temoins.items():
    obtenu = relu["noms"].get(code)
    assert obtenu == attendu, "temoin %s : « %s » au lieu de « %s »" % (code, obtenu, attendu)

print("noms officiels             %s  (%.0f Ko, %d communes, paquet %s)"
      % (DEST, len(brut.encode("utf-8")) / 1024, len(noms), version))
