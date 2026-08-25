# -*- coding: utf-8 -*-
"""patch_22_accents.py — le texte affiche par le patch 21 n'avait pas d'accents.

Vu sur une CAPTURE, pas dans une assertion : « Les memes comptes », « depenses »,
« impots », « l'etat civil », « Repere ». La regle du projet interdit l'apostrophe
typographique dans le code ecrit a la main ; je l'avais appliquee aux ACCENTS, qui
n'ont jamais ete concernes. Le reste de l'application ecrit un francais correct.
Une carte qui explique la langue des comptes publics ne peut pas etre la seule a
ecrire sans accents.

METHODE : fragments de TEXTE AFFICHE, sans les guillemets du code — chacun compte
pour exactement une occurrence dans les 17 Mo, verifie avant toute ecriture.
Aucune logique ne change.
"""
import io

F = "app_repere_v18_20.html"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

PAIRES = [
 ("Les memes comptes, exercice ", "Les mêmes comptes, exercice "),
 (", rapportes les uns aux autres", ", rapportés les uns aux autres"),

 ("il lui faudrait \"\n       + \"ce temps-la. Ce n'est pas ce qui se passe : une dette se rembourse sur des annees, et \"\n       + \"un emprunt sert le plus souvent a payer un equipement qui durera plus longtemps que lui.",
  "il lui faudrait \"\n       + \"ce temps-là. Ce n'est pas ce qui se passe : une dette se rembourse sur des années, et \"\n       + \"un emprunt sert le plus souvent à payer un équipement qui durera plus longtemps que lui."),

 ('l: "Sur 100 € depenses",\n      v: argPourCent(sal.m, dep.m)',
  'l: "Sur 100 € dépensés",\n      v: argPourCent(sal.m, dep.m)'),
 ("Ce sont les agents qui tiennent l'ecole, la cantine, l'etat civil, les espaces verts. ",
  "Ce sont les agents qui tiennent l'école, la cantine, l'état civil, les espaces verts. "),
 ("Une part elevee n'est pas un gaspillage : c'est souvent le signe d'une commune qui rend ",
  "Une part élevée n'est pas un gaspillage : c'est souvent le signe d'une commune qui rend "),
 ("ses services elle-meme plutot que de les acheter a l'exterieur.",
  "ses services elle-même plutôt que de les acheter à l'extérieur."),

 ('l: "Sur 100 € depenses",\n      v: argPourCent(inv.m, dep.m)',
  'l: "Sur 100 € dépensés",\n      v: argPourCent(inv.m, dep.m)'),
 ("L'investissement, ce sont les travaux et les equipements : une ecole, une voirie, une ",
  "L'investissement, ce sont les travaux et les équipements : une école, une voirie, une "),
 ("salle. Cette part bouge beaucoup d'une annee a l'autre — haute l'annee d'un chantier, ",
  "salle. Cette part bouge beaucoup d'une année à l'autre — haute l'année d'un chantier, "),
 ("basse ensuite. Une seule annee ne dit rien d'une tendance.",
  "basse ensuite. Une seule année ne dit rien d'une tendance."),

 ('l: "Sur 100 € encaisses",', 'l: "Sur 100 € encaissés",'),
 ('" € d\'impots et taxes"', '" € d\'impôts et taxes"'),
 ("€ restants viennent d'ailleurs : dotations versees par l'Etat, ",
  "€ restants viennent d'ailleurs : dotations versées par l'État, "),
 ("subventions d'autres collectivites, sommes payees par les usagers de certains services. ",
  "subventions d'autres collectivités, sommes payées par les usagers de certains services. "),
 ("Repere ne detaille pas cette composition — le fichier embarque ne la porte pas.",
  "Repère ne détaille pas cette composition — le fichier embarqué ne la porte pas."),

 ('l: "Ce qu\'elle depense",', 'l: "Ce qu\'elle dépense",'),
 ("Moyenne sur l'annee, pas un rythme reel : les depenses d'une commune sont tres ",
  "Moyenne sur l'année, pas un rythme réel : les dépenses d'une commune sont très "),
 ("irregulieres. C'est une facon de rendre un total annuel imaginable, rien de plus.",
  "irrégulières. C'est une façon de rendre un total annuel imaginable, rien de plus."),

 ("Les rapports ci-dessous se calculent a partir de plusieurs lignes a la fois ; ",
  "Les rapports ci-dessous se calculent à partir de plusieurs lignes à la fois ; "),
 ("Les montants disponibles restent affiches au-dessus, tels que la source les publie.",
  "Les montants disponibles restent affichés au-dessus, tels que la source les publie."),

 ("Ce ne sont pas des chiffres publies : ce sont des divisions.",
  "Ce ne sont pas des chiffres publiés : ce sont des divisions."),
 ("Repere les calcule a partir des montants affiches juste au-dessus, qui viennent, eux, du ",
  "Repère les calcule à partir des montants affichés juste au-dessus, qui viennent, eux, du "),
 ("fichier officiel. Aucun de ces rapports ne compare ce territoire a un autre : ils ne divisent ",
  "fichier officiel. Aucun de ces rapports ne compare ce territoire à un autre : ils ne divisent "),
]

for avant, apres in PAIRES:
    n = s.count(avant)
    assert n == 1, "ancre non unique (%d) : %r" % (n, avant[:70])
    assert "’" not in apres, "apostrophe typographique : %r" % apres[:50]
    s = s.replace(avant, apres, 1)

# Controle independant : plus aucune des fautes d'origine ne subsiste.
for faute in ("Les memes comptes", "Sur 100 € depenses", "l'etat civil", "d'impots et taxes",
              "chiffres publies", "Repere les calcule", "Moyenne sur l'annee"):
    assert faute not in s, "faute restante : %r" % faute

io.open(F, "w", encoding="utf-8").write(s)
print("patch 22 : %d chaines corrigees, %d -> %d caracteres" % (len(PAIRES), n0, len(s)))
