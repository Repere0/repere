#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch 15 — l'agenda dit a quand remontent ses donnees.

LE PROBLEME : depuis le patch 12, le panneau de couverture affichait « Origine des
donnees : telechargees » ou « embarquees ». C'est vrai et inutile : ce que le lecteur
veut savoir n'est pas d'ou viennent les donnees, c'est de QUAND elles datent. Une
donnee dont on ignore l'age vaut une donnee fausse — c'est la doctrine du projet,
appliquee jusqu'au bout.

CE QUI LE PERMET : agenda_an.py inscrit desormais une cle `maj` (date de collecte, UTC,
ISO) dans le fichier, et build_pwa sert le fichier collecte plutot que la copie figee
dans les 17 Mo. La date existe donc reellement ; il ne reste qu'a l'afficher.

CE QUE CE PATCH NE FAIT PAS : inventer une date quand il n'y en a pas. Le fichier
autonome n'a pas de cle `maj` — il affiche alors « embarquees dans l'application »,
sans date, ce qui est exactement la verite.
"""
import sys, io

CIBLE = sys.argv[1]
src = io.open(CIBLE, encoding="utf-8").read()

ANCIEN = """      + '<div class="fresh"><span>Origine des donnees</span><span class="d">'
        + (AN_ETAT === "servi" ? "telechargees" : "embarquees dans l\\'application") + '</span></div>'"""
NOUVEAU = """      + '<div class="fresh"><span>' + (AN_MAJ ? "Dernière collecte" : "Origine des donnees")
        + '</span><span class="d">' + (AN_MAJ ? anJour(AN_MAJ)
          : (AN_ETAT === "servi" ? "telechargees" : "embarquees dans l\\'application")) + '</span></div>'"""
assert src.count(ANCIEN) == 1, "l'origine des donnees a change (%d)" % src.count(ANCIEN)

# la date lue dans le fichier, et sa mise en francais
ANCRE_ETAT = 'var AN_ETAT = "absent";'
assert src.count(ANCRE_ETAT) == 1
BLOC = '''var AN_ETAT = "absent";
/* Date de collecte, telle qu'elle est ecrite dans le fichier servi. Jamais devinee :
   si la cle manque, la variable reste vide et l'ecran n'annonce aucune date. */
var AN_MAJ = (window.REPERE_AGENDA_AN && window.REPERE_AGENDA_AN.maj) || "";
var AN_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin",
               "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function anJour(iso) {
  var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(iso || ""));
  if (!m) return String(iso || "");          /* format inattendu : on rend tel quel */
  return Number(m[3]) + " " + AN_MOIS[Number(m[2]) - 1] + " " + m[1];
}'''

# la date doit etre relue apres un chargement reseau, pas seulement au demarrage
ANCIEN_SERVI = '      window.REPERE_AGENDA_AN = d;\n      AN_ETAT = "servi";'
assert src.count(ANCIEN_SERVI) == 1
NOUVEAU_SERVI = ('      window.REPERE_AGENDA_AN = d;\n'
                 '      AN_MAJ = d.maj || "";\n'
                 '      AN_ETAT = "servi";')

out = src.replace(ANCIEN, NOUVEAU, 1).replace(ANCRE_ETAT, BLOC, 1).replace(ANCIEN_SERVI, NOUVEAU_SERVI, 1)
assert out != src
assert out.count("AN_MAJ") == 5, out.count("AN_MAJ")
assert out.count("function anJour") == 1
assert "’" not in BLOC and "’" not in NOUVEAU
# le fichier autonome ne doit pas se retrouver avec une date en dur
assert 'AN_MAJ = "20' not in out
io.open(CIBLE, "w", encoding="utf-8").write(out)
print("patch 15 applique : %d -> %d octets" % (len(src.encode()), len(out.encode())))
