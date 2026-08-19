#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Normalise l'agenda de l'Assemblee nationale pour Repere.

Entrees, toutes sous Licence ouverte, a telecharger depuis data.assemblee-nationale.fr
(le domaine est bloque depuis le conteneur : passer par le navigateur) :
  - Agenda.json.zip                                        -> le jeu « Reunions »
  - AMO30_tous_acteurs_tous_mandats_tous_organes_historique -> le nom des instances

AMO30 est le SEUL referentiel qui convienne, mesure a l'appui :
  AMO10 (organes actifs)  -> 39,0 % des reunions sans nom
  AMO50 (acteurs divises) -> 54,1 %
  AMO30 (historique)      -> 12,2 %   <- retenu
AMO10 n'apporte rien de plus qu'AMO30 (union identique) : il ne sert a rien de croiser.

Regles d'ingestion — chacune a une raison, et la raison compte plus que la regle :
  - « Supprime »  : ecarte. La reunion n'a pas eu lieu et n'a pas ete annoncee.
  - « Annule »    : garde, marque. L'annonce puis l'annulation est une information.
  - instance non nommee : ecartee, et COMPTEE. Afficher « PO847238 » ne renseigne
    personne ; taire le nombre manquant serait pire. Doctrine du vide.
  - presences nominatives : jamais embarquees, alors que la source en porte pour
    83,8 % des reunions. On liste ce qu'un elu a fait, jamais ce qu'il n'a pas fait.
  - objets a l'ordre du jour : recopies litteralement, jamais resumes.

Usage : python3 outils/agenda_an.py <dossier_agenda> <dossier_amo30> <sortie.json>
"""
import sys, io, json, glob, collections
import datetime

if len(sys.argv) != 4:
    sys.exit(__doc__)
AGENDA, AMO30, SORTIE = sys.argv[1], sys.argv[2], sys.argv[3]

noms = {}
for p in glob.glob(AMO30 + "/organe/*.json"):
    o = json.load(open(p))["organe"]
    noms[o["uid"]] = (o.get("codeType"), (o.get("libelle") or o.get("libelleAbrege") or "").strip())
assert len(noms) > 8000, "referentiel AMO30 anormalement petit : %d organes" % len(noms)

TYPE = {"seance_type": "seance", "reunionCommission_type": "commission",
        "reunionInitParlementaire_type": "initiative"}


def objets(odj):
    if not odj or not odj.get("pointsODJ"):
        return []
    pts = odj["pointsODJ"].get("pointODJ")
    if pts is None:
        return []
    if isinstance(pts, dict):
        pts = [pts]
    out = []
    for p in pts:
        if (p.get("cycleDeVie") or {}).get("etat") == "Supprimé":
            continue
        o = (p.get("objet") or "").strip()
        if o:
            out.append(o)
    return out


stats = collections.Counter()
lignes = []
for p in glob.glob(AGENDA + "/reunion/*.json"):
    r = json.load(open(p))["reunion"]
    stats["total"] += 1
    etat = (r.get("cycleDeVie") or {}).get("etat")
    org = r.get("organeReuniRef")
    ts = r.get("timeStampDebut") or ""
    if org not in noms:
        stats["ecartee : instance non nommee"] += 1
        continue
    if etat == "Supprimé":
        stats["ecartee : supprimee"] += 1
        continue
    if not ts:
        stats["ecartee : sans date"] += 1
        continue
    e = {"d": ts[:16], "t": TYPE.get(r.get("@xsi:type"), "?"), "o": org}
    if etat == "Annulé":
        e["x"] = 1
        stats["annulee"] += 1
    ob = objets(r.get("ODJ"))
    if ob:
        e["j"] = ob
        stats["avec ordre du jour"] += 1
    if r.get("compteRenduRef"):
        e["c"] = r["compteRenduRef"]
    lignes.append(e)
    stats["retenue"] += 1

lignes.sort(key=lambda e: e["d"])

# Table des instances : le nom complet, repete a chaque ligne, pesait le double.
table, idx = [], {}
for e in lignes:
    u = e["o"]
    if u not in idx:
        idx[u] = len(table)
        table.append([noms[u][0], noms[u][1]])
    e["o"] = idx[u]

# UNE REUNION PAR LIGNE, et c'est un choix de stockage, pas de style. En une seule
# ligne de 630 Ko, git ne sait pas calculer de difference utile : chaque collecte
# quotidienne recommettrait le fichier entier, soit ~230 Mo de depot en un an. Avec
# un retour a la ligne par reunion, git ne garde que les lignes qui changent. Le
# poids servi ne bouge pas : la compression du serveur absorbe les retours a la ligne.
paquet_org = json.dumps(table, ensure_ascii=False, separators=(",", ":"))
corps = ",\n".join(json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in lignes)
# POURQUOI une date de collecte DANS le fichier : sans elle, l'application ne peut pas
# dire a quand remontent ses donnees, et une donnee dont on ignore l'age vaut une
# donnee fausse. Elle est en UTC, au format ISO, et c'est la seule valeur du fichier
# qui ne vienne pas du referentiel de l'Assemblee.
maj = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
brut = '{"v":1,"maj":"' + maj + '","org":' + paquet_org + ',"r":[\n' + corps + '\n]}'
paquet = json.loads(brut)

# Controle independant : on relit la sortie sans reutiliser une variable d'au-dessus.
relu = json.loads(brut)
assert len(relu["r"]) == stats["retenue"]
assert all(0 <= e["o"] < len(relu["org"]) for e in relu["r"]), "un index d'instance sort de la table"
assert "presence" not in brut and "acteurRef" not in brut, "une presence nominative a fuite"
assert relu["r"] == sorted(relu["r"], key=lambda e: e["d"]), "les reunions ne sont pas triees"
assert relu["maj"] == maj, "la date de collecte n'a pas ete relue"
assert len(relu["maj"]) == 10

io.open(SORTIE, "w", encoding="utf-8").write(brut)
for k, v in stats.most_common():
    print("%-30s %6d" % (k, v))
print("\n%d instances distinctes | %.2f Mo | %s -> %s"
      % (len(table), len(brut.encode("utf-8")) / 1048576, lignes[0]["d"], lignes[-1]["d"]))
