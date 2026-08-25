#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Commune -> circonscription(s) legislative(s), a partir des bureaux de vote.

CE QUE CETTE TABLE PERMET : passer de « l'Assemblee a vote ceci » a « votre depute a
vote cela ». Sans elle, un scrutin ne peut etre affiche que nationalement, et ne repond
donc pas a « qui decide chez moi ». La table CIRCOS embarquee dans l'application couvre
UNE commune : mesure faite le 20/08/2026.

CE QUE CETTE TABLE NE PERMET PAS, ET IL FAUT LE DIRE : designer LE depute d'une commune.
Une commune peut etre a cheval sur plusieurs circonscriptions — Paris, Marseille, Lyon,
et beaucoup de villes moyennes. Determiner laquelle demanderait l'adresse de la personne,
que Repere ne demandera jamais. La sortie conserve donc TOUTES les circonscriptions d'une
commune, et l'application devra afficher tous les deputes concernes en disant que la
commune est partagee — plutot que d'en choisir un et d'avoir tort une fois sur deux.

SOURCE : un CSV par bureau de vote (69 682 lignes), derive des resultats officiels des
legislatives de 2022. Republie par un tiers : cette provenance doit etre ecrite telle
quelle dans l'application si cette table est retenue.

Usage :  python3 outils/circos.py data/circos_bureaux_de_vote.csv outils/circos.json
"""
import sys, io, os, csv, json, collections

SRC = sys.argv[1] if len(sys.argv) > 1 else "data/circos_bureaux_de_vote.csv"
OUT = sys.argv[2] if len(sys.argv) > 2 else "outils/circos.json"

if not os.path.exists(SRC):
    sys.exit("source absente : %s — la collecte ne l'a pas telechargee." % SRC)

REQUISES = ["codeCommune", "codeCirconscription", "codeDepartement", "nomCirconscription"]

# Le delimiteur se devine sur l'en-tete, comme le fait le descripteur. L'ecrire en dur
# etait exactement le defaut que la methode « lire avant d'ecrire » devait empecher.
_tete = io.open(SRC, encoding="utf-8", errors="replace").readline()
DELIM = max([";", ",", "\t", "|"], key=lambda d: _tete.count(d))

par_commune = collections.defaultdict(set)
noms = {}
lignes = 0
with io.open(SRC, encoding="utf-8", errors="replace", newline="") as f:
    lect = csv.DictReader(f, delimiter=DELIM)
    manquantes = [c for c in REQUISES if c not in (lect.fieldnames or [])]
    assert not manquantes, ("colonnes absentes : %s (delimiteur devine : %r, colonnes "
                            "vues : %s) — relire docs/schema_circos_bv.md"
                            % (", ".join(manquantes), DELIM, lect.fieldnames))
    for l in lect:
        lignes += 1
        insee = (l["codeCommune"] or "").strip()
        circo = (l["codeCirconscription"] or "").strip()
        if not insee or not circo:
            continue
        # Les codes INSEE de Corse et d'outre-mer ne sont pas numeriques : on ne
        # normalise pas, on garde la chaine telle que le producteur l'ecrit.
        par_commune[insee].add(circo)
        noms.setdefault(circo, (l.get("nomCirconscription") or "").strip()
                        + " de " + (l.get("nomDepartement") or "").strip())

assert lignes > 50000, "seulement %d lignes : fichier tronque ?" % lignes
assert len(par_commune) > 30000, "seulement %d communes" % len(par_commune)

partagees = {k: sorted(v) for k, v in par_commune.items() if len(v) > 1}
table = {k: sorted(v) for k, v in sorted(par_commune.items())}

brut = json.dumps({
    "v": 1,
    "source": "bureaux de vote / resultats legislatives 2022, republie sur data.gouv.fr",
    "communes": table,
    "noms": {k: v.strip(" de") for k, v in sorted(noms.items())},
}, ensure_ascii=False, separators=(",", ":"))

# Controle independant : on relit sans reutiliser une variable d'au-dessus.
relu = json.loads(brut)
assert len(relu["communes"]) == len(par_commune)
assert all(isinstance(v, list) and v for v in relu["communes"].values())
assert all(c in relu["noms"] for v in relu["communes"].values() for c in v), \
    "une circonscription citee n'a pas de nom"

os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
io.open(OUT, "w", encoding="utf-8").write(brut)

circos = {c for v in table.values() for c in v}
print("communes                : %d" % len(table))
print("circonscriptions         : %d" % len(circos))
print("communes partagees entre plusieurs circonscriptions : %d (%.2f %%)"
      % (len(partagees), 100.0 * len(partagees) / len(table)))
print("le plus partage          : %s"
      % ", ".join("%s (%d)" % (k, len(v))
                  for k, v in sorted(partagees.items(), key=lambda x: -len(x[1]))[:5]))
print("poids                    : %.0f Ko" % (len(brut.encode("utf-8")) / 1024))
