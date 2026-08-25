#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pose (ou remplace) le bloc window.REPERE_CIRCOS dans l'application.

MEME MECANIQUE QUE LES BLOCS RNE ET OFGL : un bloc delimite par deux marqueurs,
ecrit par un script, jamais a la main. Le rendre idempotent est la condition
pour que la chaine quotidienne puisse le reecrire sans faire grossir le fichier
un peu plus chaque jour.

CE QUE LE BLOC CONTIENT : la table commune -> circonscription(s) legislative(s),
produite par outils/circos.py depuis le fichier du ministere de l'Interieur.
341 Ko sur 17 Mo. Il sera decoupe par departement en meme temps que le RNE ;
d'ici la, il est embarque comme le reste, et le fichier autonome reste autonome.

Usage :  python3 outils/circos_injecter.py <app.html> <outils/circos.json>
"""
import sys, io, os, json

if len(sys.argv) != 3:
    sys.exit(__doc__)
APP, SRC = sys.argv[1], sys.argv[2]

paquet = json.loads(io.open(SRC, encoding="utf-8").read())
assert paquet.get("v") == 1, "format inattendu"
assert len(paquet.get("communes") or {}) > 30000, \
    "seulement %d communes : on n'injecte pas une table vide" % len(paquet.get("communes") or {})

DEBUT = "/* REPERE_CIRCOS_DEBUT */"
FIN = "/* REPERE_CIRCOS_FIN */"

entete = (DEBUT + "\n"
  "/* Commune -> circonscription(s) legislative(s).\n"
  "   Producteur : " + paquet["source"] + "\n"
  "   Licence    : " + paquet["licence"] + " — decoupage de " + paquet["decoupage"] + "\n"
  "   Source     : " + paquet["source_url"] + "\n"
  "   Genere par outils/circos.py — NE PAS EDITER A LA MAIN.\n"
  "   Une valeur entiere = une seule circonscription. Une liste = commune partagee :\n"
  "   l'application les affiche TOUTES et dit qu'elle ne peut pas choisir, parce que\n"
  "   choisir demanderait l'adresse de la personne. */\n"
  "window.REPERE_CIRCOS = " + json.dumps(paquet, ensure_ascii=False, separators=(",", ":")) + ";\n"
  + FIN)

src = io.open(APP, encoding="utf-8").read()
avant = len(src)

if DEBUT in src:
    # Remplacement : on ne cumule pas. Sans ca, chaque passage de la chaine ajouterait
    # 341 Ko au fichier, et personne ne s'en apercevrait avant plusieurs semaines.
    i = src.index(DEBUT)
    j = src.index(FIN, i) + len(FIN)
    src = src[:i] + entete + src[j:]
    geste = "remplace"
else:
    ancre = "/* REPERE_OFGL_FIN */"
    assert src.count(ancre) == 1, "ancre d'insertion introuvable ou multiple"
    src = src.replace(ancre, ancre + "\n" + entete, 1)
    geste = "pose"

# Controles independants : on relit ce qu'on vient d'ecrire, sans reutiliser
# une variable d'au-dessus.
assert src.count(DEBUT) == 1 and src.count(FIN) == 1, "le bloc est en double"
i = src.index(DEBUT); j = src.index(FIN)
corps = src[i:j]
cle = "window.REPERE_CIRCOS = "
k = corps.index(cle) + len(cle)
relu = json.loads(corps[k:corps.rindex(";")])
assert relu["v"] == 1 and len(relu["communes"]) == len(paquet["communes"]), \
    "le bloc relu ne redonne pas la table injectee"

io.open(APP, "w", encoding="utf-8").write(src)
print("bloc CIRCOS %s : %d communes, %.0f Ko" %
      (geste, len(relu["communes"]), (len(entete.encode()) / 1024)))
print("application : %d -> %d caracteres" % (avant, len(src)))
