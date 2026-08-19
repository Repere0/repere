#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch 14 — trois corrections juridiques, aucune fonctionnalite touchee.

1. « Repere ne met en oeuvre aucun traitement » etait vrai pour l'utilisateur et FAUX
   en droit : publier des fiches nominatives d'elus, des donnees HATVP et des votes
   individuels EST un traitement de donnees a caractere personnel (art. 4.2 RGPD), dont
   l'editeur est responsable. L'exemption « activite personnelle ou domestique »
   (art. 2.2.c) ne couvre pas une diffusion publique. Le regime defendable est
   l'exception d'expression et d'information (art. 85 RGPD, art. 80 loi 78-17) — mais
   il faut le revendiquer, pas nier le traitement. Une demande d'effacement d'un elu se
   heurterait sinon a un texte affirmant qu'aucun traitement n'existe.

2. Le droit de reponse etait annonce sous la loi du 29 juillet 1881, qui vise la presse
   ecrite. Pour un service de communication au public en ligne, c'est l'art. 6 IV de la
   LCEN et le decret n° 2007-1527.

3. La page de confidentialite portait l'adresse personnelle de l'auteur, quand l'app et
   la page d'accueil en donnent une autre. Une personne qui exerce un droit ne sait pas
   ou ecrire, et l'adresse personnelle affaiblit l'anonymat que le regime de l'editeur
   non professionnel (art. 6 III-2 LCEN) permet de conserver.

Je ne suis pas juriste : ces formulations reduisent une exposition evidente, elles ne
remplacent pas une relecture par un avocat avant toute ouverture au public.
"""
import sys, io, re

CIBLE = sys.argv[1]
CONF = sys.argv[2]

# ------------------------------------------------------------------ 1 et 2 : l'app
src = io.open(CIBLE, encoding="utf-8").read()
R = []

# -- le droit de reponse, sous le bon texte
R.append(("lcen-defs", "(loi de 1881)", "(art. 6 IV de la LCEN)"))

# -- le traitement : on distingue « aucune donnee SUR VOUS » et « des donnees sur des
#    personnes publiques », au lieu de nier les deux d'un coup.
ANCRE = '<p style="margin-top:10px;"><b>Sources et licences.</b>'
NOUVEAU_P = (
    '<p style="margin-top:10px;"><b>Données des personnes citées.</b> Repère publie des '
    'données à caractère personnel concernant des <b>personnes publiques</b> — élus, '
    'candidats, représentants d\'intérêts — issues exclusivement de sources officielles '
    'et republiées à des fins d\'information du public (art. 85 du RGPD, art. 80 de la loi '
    'du 6 janvier 1978). C\'est un traitement de données, et l\'éditeur en est responsable. '
    'Toute personne citée peut demander l\'accès, la rectification, l\'effacement ou '
    's\'opposer à la publication, à l\'adresse ci-dessus. Repère ne publie jamais le '
    'patrimoine d\'un élu, ni aucune donnée relative à sa vie privée.</p>\n            '
)
R.append(("traitement", ANCRE, NOUVEAU_P + ANCRE))

# -- la version affichee
# La version affichee etait restee a v18.15 : le patch 13 ne l'avait pas bougee.
# Elle apparait deux fois (mentions legales et pied de l'ecran Sources).
assert src.count("Repère v18.15 — bêta fermée") == 2, src.count("Repère v18.15 — bêta fermée")

for etiquette, ancien, nouveau in R:
    assert src.count(ancien) == 1, "ancre « %s » vue %d fois" % (etiquette, src.count(ancien))

out = src
for etiquette, ancien, nouveau in R:
    out = out.replace(ancien, nouveau, 1)
out = out.replace("Repère v18.15 — bêta fermée", "Repère v18.17 — bêta fermée")
assert out.count("Repère v18.17 — bêta fermée") == 2
# Le sujet du courriel de retour de test porte aussi la version, encodee pour une URL.
assert out.count("v18.15%20") == 2, out.count("v18.15%20")
out = out.replace("v18.15%20", "v18.17%20")
assert "v18.15" not in out

assert out.count(ANCRE) == 1, "build_pwa exige que cette ancre reste unique"
assert "loi de 1881" not in out
assert "art. 6 IV de la LCEN" in out
assert out.count("Données des personnes citées") == 1
io.open(CIBLE, "w", encoding="utf-8").write(out)
print("app : %d corrections" % len(R))

# ---------------------------------------------------- 3 : la page de confidentialite
conf = io.open(CONF, encoding="utf-8").read()
assert conf.count("arthurpinardpro@gmail.com") == 1, "adresse personnelle introuvable"
conf = conf.replace("arthurpinardpro@gmail.com", "repere0@protonmail.com", 1)

motif = re.compile(r"Repère n'en met en œuvre aucun\s*:.*?</p>", re.S)
trouve = motif.findall(conf)
assert len(trouve) == 1, "la phrase du traitement a change : %d occurrence(s)" % len(trouve)
conf = motif.sub(
    "Repère ne détient <b>aucune donnée vous concernant</b> : il n'existe donc aucun fichier "
    "à consulter, corriger ou effacer vous concernant. En revanche, Repère publie des données "
    "à caractère personnel concernant des <b>personnes publiques</b> — élus, candidats, "
    "représentants d'intérêts — issues de sources officielles et republiées à des fins "
    "d'information du public (art. 85 du RGPD, art. 80 de la loi du 6 janvier 1978). Ce "
    "traitement-là existe, et l'éditeur en est responsable : toute personne citée peut exercer "
    "ses droits d'accès, de rectification, d'effacement et d'opposition à l'adresse ci-dessous. "
    "Le droit de réponse s'exerce dans les conditions de l'article 6 IV de la LCEN et du décret "
    "n° 2007-1527.</p>", conf, count=1)

assert "n'en met en œuvre aucun" not in conf
assert "@gmail" not in conf
io.open(CONF, "w", encoding="utf-8").write(conf)
print("confidentialite : 2 corrections")
