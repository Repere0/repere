#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DE QUOI PARLE LE TEXTE — controle sans reseau de scrutins_an.py (05/11/2026).

Deux scrutins solennels factices, de la forme mesuree sur l'archive reelle
(docs/schema_scrutins.md) : l'un porte objet.dossierLegislatif {libelle, dossierRef}
et un demandeur, l'autre porte dossierLegislatif null et un demandeur vide. La sortie
doit garder les trois champs du premier, et n'en ecrire aucun pour le second.

Usage : python3 outils/test_scrutins_an_dossier.py
"""
import json, os, subprocess, sys, tempfile

ICI = os.path.dirname(os.path.abspath(__file__))


def scrutin(numero, date, dossier, demandeur):
    return {"scrutin": {
        "uid": "VTANR5L17V" + numero, "numero": numero, "dateScrutin": date,
        "titre": "l'ensemble du projet de loi visant a essayer (premiere lecture).",
        "objet": {"libelle": "l'ensemble du projet de loi visant a essayer (premiere lecture).",
                  "dossierLegislatif": dossier, "referenceLegislative": None},
        "demandeur": {"texte": demandeur, "referenceLegislative": None},
        "sort": {"code": "adopté", "libelle": "l'Assemblée nationale a adopté"},
        "typeVote": {"libelleTypeVote": "scrutin public solennel"},
        "syntheseVote": {"nombreVotants": "3", "decompte": {"pour": "2", "contre": "1", "abstentions": "0"}},
        "ventilationVotes": {"organe": {"groupes": {"groupe": [{"vote": {"decompteNominatif": {
            "pours": {"votant": [{"acteurRef": "PA1"}, {"acteurRef": "PA2"}]},
            "contres": {"votant": {"acteurRef": "PA3"}},
            "abstentions": None, "nonVotants": None}}}]}}},
    }}


def main():
    with tempfile.TemporaryDirectory() as t:
        src = os.path.join(t, "brut")
        os.makedirs(src)
        avec = scrutin("101", "2026-10-01",
                       {"libelle": "Simplifier la sortie de l'indivision successorale", "dossierRef": "DLR5L17N51329"},
                       'Président du groupe "Les Démocrates"')
        sans = scrutin("102", "2026-10-02", None, "")
        for nom, d in (("a.json", avec), ("b.json", sans)):
            with open(os.path.join(src, nom), "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False)
        # Le dossier du scrutin 101, de la forme mesuree (docs/schema_dossiers.md) :
        # acte de tete sans date, descendants dates, un doublon, un acte sans date.
        dd = os.path.join(t, "brut_Dossiers_Legislatifs", "json", "dossierParlementaire")
        os.makedirs(dd)
        def acte(code, court, date, enfants=None):
            a = {"codeActe": code, "libelleActe": {"nomCanonique": court + " (long)", "libelleCourt": court}, "dateActe": date}
            if enfants is not None:
                a["actesLegislatifs"] = {"acteLegislatif": enfants}
            return a
        dossier = {"dossierParlementaire": {"uid": "DLR5L17N51329", "actesLegislatifs": {"acteLegislatif": [
            acte("AN1", "1ère lecture", None, [
                acte("AN1-DEPOT", "Dépôt", "2026-03-02T00:00:00.000+01:00"),
                acte("AN1-COM", "Commission", None, acte("AN1-COM-FOND", "Rapport", "2026-04-01T00:00:00.000+02:00")),
                acte("AN1-DEPOT", "Dépôt", "2026-03-02T00:00:00.000+01:00"),
                acte("AN1-COM-NOM", "Nomination de rapporteur budgétaire", "2026-03-05T00:00:00.000+01:00"),
                acte("AN1-COM-REU", "Réunion de commission", "2026-03-10T00:00:00.000+01:00"),
            ]),
            acte("AN1S", "1ère lecture", None, [
                acte("AN1-DEBATS-SEANCE", "Discussion en séance publique", "2026-04-20T00:00:00.000+02:00"),
                acte("AN1-DEBATS-SEANCE", "Discussion en séance publique", "2026-04-22T00:00:00.000+02:00"),
            ]),
            acte("SN1", "1ère lecture", None, [acte("SN1-DEPOT", "Transmission", "2026-05-10T00:00:00.000+02:00")]),
        ]}}}
        with open(os.path.join(dd, "DLR5L17N51329.json"), "w", encoding="utf-8") as f:
            json.dump(dossier, f, ensure_ascii=False)
        sortie = os.path.join(t, "sortie.json")
        r = subprocess.run([sys.executable, os.path.join(ICI, "scrutins_an.py"), src, sortie, "12"],
                           capture_output=True, text=True)
        assert r.returncode == 0, "scrutins_an.py a echoue : " + r.stderr[-500:]
        relu = json.load(open(sortie, encoding="utf-8"))
        par_n = {e["n"]: e for e in relu["r"]}
        a, b = par_n["101"], par_n["102"]
        assert a.get("dl") == "Simplifier la sortie de l'indivision successorale", a
        assert a.get("dr") == "DLR5L17N51329", a
        assert a.get("dm") == 'Président du groupe "Les Démocrates"', a
        assert a.get("dq") == 1 and b.get("dq") == 1, "le marqueur de lecture dq manque"
        assert a.get("eq") == 1, "dossier lu : marqueur eq attendu"
        assert a.get("et") == [
            {"d": "2026-03-02", "l": "1ère lecture · Dépôt", "c": "AN1-DEPOT"},
            {"d": "2026-04-01", "l": "1ère lecture · Rapport", "c": "AN1-COM-FOND"},
            {"d": "2026-04-20", "l": "1ère lecture · Discussion en séance publique", "c": "AN1-DEBATS-SEANCE", "f": "2026-04-22"},
            {"d": "2026-05-10", "l": "1ère lecture · Transmission", "c": "SN1-DEPOT"},
        ], a.get("et")
        assert "eq" not in b and "et" not in b, "sans dossier : aucune etape ecrite"
        for cle in ("dl", "dr", "dm"):
            assert cle not in b, "le scrutin sans dossier porte %s : %r" % (cle, b.get(cle))
    print("ok    de quoi parle le texte : intitule, reference, demandeur et etapes datees releves ; absents non ecrits")


if __name__ == "__main__":
    main()
