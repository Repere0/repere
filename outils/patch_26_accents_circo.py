# -*- coding: utf-8 -*-
"""patch_26_accents_circo.py — meme faute qu'au patch 21, deuxieme fois.

Le texte affiche par le patch 25 est ecrit sans accents : « decoupage »,
« partagee », « Repere », « depute », « legislative », « Repertoire ». La regle
du projet interdit l'APOSTROPHE typographique dans le code ecrit a la main ;
elle n'a jamais concerne les accents. Je l'ai mal appliquee une premiere fois le
25 aout au matin sur la carte des comptes, corrige, puis refaite l'apres-midi.

Corriger ne suffit donc pas : le patch 27 ajoute au banc un controle qui relit
le TEXTE AFFICHE et refuse une liste de mots francais prives de leurs accents.
Une faute qui revient deux fois est une faute de methode, pas d'inattention.
"""
import io

F = "app_repere_v18_20.html"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

PAIRES = [
 ('return n === 1 ? "1re" : (n + "e");', 'return n === 1 ? "1re" : (n + "e");'),

 ('       + (C.decoupage ? " — decoupage de " + C.decoupage : "");',
  '       + (C.decoupage ? " — découpage de " + C.decoupage : "");'),

 ('''    return "<b>" + com + " n'est pas dans le decoupage electoral que Repere embarque.</b> "
      + "Ce decoupage date de 2010 et le fichier du ministere de 2017 : les communes "
      + "nouvelles creees depuis n'y figurent pas encore. Sa circonscription existe ; "
      + "ce fichier ne la porte pas.";''',
  '''    return "<b>" + com + " n'est pas dans le découpage électoral que Repère embarque.</b> "
      + "Ce découpage date de 2010 et le fichier du ministère de 2017 : les communes "
      + "nouvelles créées depuis n'y figurent pas encore. Sa circonscription existe ; "
      + "ce fichier ne la porte pas.";'''),

 ('''    return "<b>" + com + " est partagee entre " + r.n.length + " circonscriptions legislatives</b> ("
      + r.n.map(circoOrdinal).join(", ") + ou + "). Laquelle est la votre depend de votre "
      + "adresse — Repere ne la demande pas, et ne la devinera pas.";''',
  '''    return "<b>" + com + " est partagée entre " + r.n.length + " circonscriptions législatives</b> ("
      + r.n.map(circoOrdinal).join(", ") + ou + "). Laquelle est la vôtre dépend de votre "
      + "adresse — Repère ne la demande pas, et ne la devinera pas.";'''),

 ('''  return "<b>" + com + " vote dans la " + circoOrdinal(r.n[0]) + " circonscription" + ou + ".</b> "
    + "Repere ne peut pas encore dire lequel de ces parlementaires y a ete elu : ce lien "
    + "n'existe pas dans le Repertoire national des elus, et il ne sera pas devine.";''',
  '''  return "<b>" + com + " vote dans la " + circoOrdinal(r.n[0]) + " circonscription" + ou + ".</b> "
    + "Repère ne peut pas encore dire lequel de ces parlementaires y a été élu : ce lien "
    + "n'existe pas dans le Répertoire national des élus, et il ne sera pas deviné.";'''),
]

for avant, apres in PAIRES:
    n = s.count(avant)
    assert n == 1, "ancre non unique (%d) : %r" % (n, avant[:70])
    assert "’" not in apres, "apostrophe typographique"
    if avant != apres:
        s = s.replace(avant, apres, 1)

# Controle CIBLE sur le texte affiche. Les commentaires du fichier sont
# volontairement sans accents (regle du projet) : chercher « Repertoire national
# des elus » tout court frapperait deux commentaires anciens et ferait echouer
# un patch juste. On cherche donc les fragments propres aux chaines affichees.
for faute in ("decoupage electoral", "est partagee entre",
              "dans le Repertoire national des elus, et il",
              "circonscriptions legislatives", "y a ete elu"):
    assert faute not in s, "faute restante : %r" % faute

io.open(F, "w", encoding="utf-8").write(s)
print("patch 26 : %d -> %d caracteres" % (n0, len(s)))
