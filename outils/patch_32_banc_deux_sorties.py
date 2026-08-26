# -*- coding: utf-8 -*-
"""patch_32_banc_deux_sorties.py — la chaine n'eprouvait qu'une sortie sur deux.

TROUVE PAR LE CONTRADICTEUR, VERIFIE. `pipeline.sh` appelait le banc une seule
fois, sur site_engendre/index.html. Le projet produit pourtant DEUX sorties a
partir d'une seule source : le fichier autonome, qui embarque tout et ne demande
rien, et la version servie, qui va chercher son agenda, ses evenements et bientot
son departement. Ce sont deux comportements differents, et un seul etait garde.

Le banc sait deja distinguer les deux cas — il ne monte son serveur HTTP que si
la source declare une adresse d'agenda, et teste en file:// sinon. Il ne lui
manquait qu'une invocation.

Mesure du 25/08/2026 : le fichier autonome passe 55 controles, la version servie
en passe 64 — les neuf de plus sont ceux de l'invariant 1, qui n'ont de sens que
la ou il y a un service worker. Les deux sont au vert avant que cette ligne soit
ecrite : on ajoute un verrou sur un etat sain, pas un chantier a reparer.
"""
import io

F = "outils/pipeline.sh"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancien = '''# ------------------------------------------------------------ 6. eprouver
# LE VERROU DE L'AUTOMATISATION. Si un seul des 40 controles tombe, `set -e` arrete
# tout ici et le deploiement n'a pas lieu. C'est ce qui autorise a publier sans
# qu'un humain regarde.
echo "== banc =="
node test_repere.mjs site_engendre/index.html'''
assert s.count(ancien) == 1, "ancre introuvable ou multiple"

nouveau = '''# ------------------------------------------------------------ 6. eprouver
# LE VERROU DE L'AUTOMATISATION. Si un seul controle tombe, `set -e` arrete tout
# ici et le deploiement n'a pas lieu. C'est ce qui autorise a publier sans qu'un
# humain regarde.
#
# DEUX SORTIES, DEUX PASSAGES. Le projet produit un fichier autonome qui embarque
# tout et ne demande rien, et une version servie qui va chercher son agenda, ses
# evenements et bientot son departement. Jusqu'au 25/08/2026 seule la seconde etait
# eprouvee : la divergence entre les deux n'etait gardee par rien. Le banc sait les
# distinguer tout seul — il ne monte son serveur HTTP que si la source declare une
# adresse — il ne lui manquait qu'une invocation.
echo "== banc : le fichier autonome =="
node test_repere.mjs "$APP"

echo "== banc : la version servie =="
node test_repere.mjs site_engendre/index.html'''
s = s.replace(ancien, nouveau, 1)

assert s.count("node test_repere.mjs") == 2, "il faut exactement deux invocations du banc"
io.open(F, "w", encoding="utf-8").write(s)
print("pipeline.sh : %d -> %d caracteres" % (n0, len(s)))
