# -*- coding: utf-8 -*-
"""patch_28_article.py — « des Paris ».

VU EN OUVRANT LES TROIS CAS, pas dans une assertion. La phrase fabriquait son
article a partir de la premiere lettre du nom du departement : « des » devant une
consonne, « d' » devant une voyelle. Ca marche pour « des Pyrenees-Atlantiques »
et ca produit « des Paris », « des Calvados », « d'Ain ».

L'article des noms de departements est irregulier — du Calvados, de l'Ain, de la
Manche, des Landes, de Paris, de Mayotte — et aucune regle ne le derive du nom.
Deux issues : porter une table de 101 articles, ou ne pas ecrire d'article.

ON N'ECRIT PAS D'ARTICLE. Le titre de la carte porte deja le departement, en
capitales, deux lignes au-dessus : « DEPUTES ET SENATEURS — PYRENEES-ATLANTIQUES ».
Le repeter dans la phrase etait une redondance ; la supprimer supprime le probleme
au lieu de le contourner. Une table de 101 articles serait un fichier de plus a
tenir a jour pour resoudre un besoin qui n'existait pas.

DEUXIEME CORRECTION, MEME FAMILLE : « Paris est partagee ». Le genre d'un nom de
commune n'est pas derivable non plus (le Havre, la Rochelle, Paris). La phrase est
reecrite sans accord : « Paris : 18 circonscriptions legislatives ».

TROISIEME : une liste de dix-huit ordinaux separes par des virgules ne se lit pas.
Quand les numeros se suivent sans trou — c'est le cas de Paris, de Marseille et de
la plupart des villes partagees — on ecrit « 1re a 18e ».
"""
import io

F = "app_repere_v18_20.html"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a1 = '''function circoPhrase(insee, nomCommune, nomTerritoire) {
  const r = circoDe(insee);
  if (!r) return "";
  const ou = nomTerritoire ? " " + (/^[AEIOUY]/i.test(nomTerritoire) ? "d'" : "des ") + nomTerritoire : "";
  const com = rneEsc(nomCommune || "Votre commune");'''
assert s.count(a1) == 1, "ancre 1"
b1 = '''/* « 1re a 18e » quand les numeros se suivent, la liste sinon. Dix-huit ordinaux
   separes par des virgules ne se lisent pas. */
function circoListe(l) {
  const suite = l.every((n, i) => i === 0 || n === l[i - 1] + 1);
  return (suite && l.length > 2)
    ? circoOrdinal(l[0]) + " à " + circoOrdinal(l[l.length - 1])
    : l.map(circoOrdinal).join(", ");
}

/* AUCUN ARTICLE devant le nom du departement, et AUCUN ACCORD sur le nom de la
   commune : ni l'un ni l'autre ne se derive du nom (du Calvados, de l'Ain, des
   Landes, de Paris ; le Havre, la Rochelle, Paris). Le titre de la carte porte
   deja le departement juste au-dessus. */
function circoPhrase(insee, nomCommune, nomTerritoire) {
  const r = circoDe(insee);
  if (!r) return "";
  const com = rneEsc(nomCommune || "Votre commune");'''
s = s.replace(a1, b1, 1)

a2 = '''    return "<b>" + com + " est partagée entre " + r.n.length + " circonscriptions législatives</b> ("
      + r.n.map(circoOrdinal).join(", ") + ou + "). Laquelle est la vôtre dépend de votre "
      + "adresse — Repère ne la demande pas, et ne la devinera pas.";'''
assert s.count(a2) == 1, "ancre 2"
b2 = '''    return "<b>" + com + " : " + r.n.length + " circonscriptions législatives</b> ("
      + circoListe(r.n) + "). Laquelle est la vôtre dépend de votre adresse — Repère "
      + "ne la demande pas, et ne la devinera pas.";'''
s = s.replace(a2, b2, 1)

a3 = '''  return "<b>" + com + " vote dans la " + circoOrdinal(r.n[0]) + " circonscription" + ou + ".</b> "'''
assert s.count(a3) == 1, "ancre 3"
b3 = '''  return "<b>" + com + " vote dans la " + circoOrdinal(r.n[0]) + " circonscription législative.</b> "'''
s = s.replace(a3, b3, 1)

# La variable « ou » ne doit plus exister nulle part : sa disparition est la preuve
# que l'article fabrique a bien ete retire, pas seulement contourne.
assert " + ou + " not in s, "l'article fabrique subsiste quelque part"
assert 'nomTerritoire ? " " + (/^[AEIOUY]/i' not in s

io.open(F, "w", encoding="utf-8").write(s)
print("patch 28 : %d -> %d caracteres" % (n0, len(s)))
