# -*- coding: utf-8 -*-
"""patch_30_pipeline_circos.py — la chaine produit et pose la table des circonscriptions.

L'ARBITRAGE EST TRANCHE, SUR DES CHIFFRES. La chaine collectait deux sources
candidates depuis le 20 aout, en attendant « la couverture mesuree contre le Code
officiel geographique ». Mesure faite le 25 aout sur le XLSX du ministere de
l'Interieur : 34 626 communes rattachees sur les 34 637 que l'application connait,
soit 99,97 %, et les huit collectivites d'outre-mer couvertes a 100 %. Provenance
directe, licence ouverte. Le CSV par bureau de vote, republie par un tiers a
partir des resultats de 2022, n'apporte pas assez pour justifier une provenance
indirecte sur une donnee civique. Il reste accepte en entree par circos.py, il
n'est plus la source de la chaine.

DEUX ETAPES AU LIEU D'UNE :
  - circos.py produit outils/circos.json et REFUSE de le produire si la couverture
    tombe sous 99 % ou si une collectivite d'outre-mer disparait ;
  - circos_injecter.py pose le bloc dans l'application, de facon idempotente : la
    chaine tourne chaque jour, et un bloc qui s'ajouterait au lieu de se remplacer
    ferait grossir le fichier de 341 Ko par jour sans que personne ne le voie.

NON BLOQUANTES, comme les autres chantiers neufs : un ingesteur ajoute ce matin ne
doit pas pouvoir empecher la publication d'un site que le banc a deja valide.
"""
import io

F = "outils/pipeline.sh"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancien = '''# ------------------------------ 3 ter. la table commune -> circonscription(s)
# Sans elle, un scrutin ne peut etre affiche que nationalement.
python3 outils/circos.py data/circos_bureaux_de_vote.csv outils/circos.json \\
  || echo "::warning::circos.py a echoue — la table des circonscriptions n'est pas produite"'''
assert s.count(ancien) == 1, "ancre introuvable ou multiple"

nouveau = '''# ------------------------------ 3 ter. la table commune -> circonscription(s)
# Sans elle, l'application affiche les neuf parlementaires d'un departement a
# quelqu'un sans pouvoir dire dans quelle circonscription il vote.
#
# SOURCE RETENUE : le XLSX du ministere de l'Interieur. Mesure du 25/08/2026 :
# 34 626 communes rattachees sur 34 637, soit 99,97 %, outre-mer a 100 %. Le CSV
# par bureau de vote reste accepte par circos.py mais n'est plus la source : sa
# provenance est indirecte, et il n'apportait pas assez pour la justifier.
# openpyxl n'est pas garanti sur le runner : on l'installe sans bruit, et si
# l'installation echoue, l'etape avertit au lieu de tomber.
APP_CIRC=$(ls -1 app_repere_v18_*.html | grep -v '\\.bak$' | sort -V | tail -1)
python3 -m pip install --quiet --disable-pip-version-check openpyxl >/dev/null 2>&1 \\
  || echo "::warning::openpyxl indisponible — la table des circonscriptions ne sera pas relue"
python3 outils/circos.py data/circos_ministere.xlsx outils/circos.json "$APP_CIRC" \\
  && python3 outils/circos_injecter.py "$APP_CIRC" outils/circos.json \\
  || echo "::warning::la table des circonscriptions n'a pas ete produite ou posee"'''
s = s.replace(ancien, nouveau, 1)

assert "circos_injecter.py" in s
assert s.count("outils/circos.py") == 1
io.open(F, "w", encoding="utf-8").write(s)
print("pipeline.sh : %d -> %d caracteres" % (n0, len(s)))
