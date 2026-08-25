#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch 16 — LOT 1 : le fil lit enfin les evenements valides.

CE QUI N'ALLAIT PAS : la couche editoriale produisait outils/evenements.json, le coffre
Obsidian faisait valider des faits, la chaine les publiait — et le mot « evenements »
n'apparaissait AUCUNE fois dans l'application. L'atelier avait ete bati avant la sortie.

LA FORME RETENUE, calquee sur l'agenda (patch 12), et pour la meme raison :
  - le fichier autonome ne declare aucune adresse : il affiche FEED, comme aujourd'hui,
    et ne fait aucune requete. L'invariant 1 tient ;
  - la version SERVIE recoit `window.REPERE_EVENEMENTS_URL`, posee par build_pwa, et va
    chercher le fichier une fois ;
  - en cas d'echec, aucune roue qui tourne, aucun bloc vide : le fil reste ce qu'il etait.
    Un fil ampute est pire qu'un fil court.

TROIS DECISIONS, ecrites ici parce qu'elles se discutent :
  1. Les evenements sont places EN TETE de FEED, pas fusionnes puis retries. Retrier tout
     le fil deplacerait treize cartes dont les dates ne sont pas toutes analysables
     (« Mars 2026 », « 2025-2026 ») et les enverrait au fond sans qu'on l'ait voulu. Les
     faits valides sont plus recents que l'existant : les mettre devant est a la fois
     juste et sans effet de bord.
  2. Un evenement dont l'`insee` est celui de la commune choisie est TOUJOURS visible,
     meme si `coverage()` ne connait pas cette commune. La liste PILOTE de six communes
     decrivait ce que l'auteur avait ecrit a la main ; elle n'a pas a masquer ce qu'il
     vient de valider pour une septieme.
  3. Rien n'est invente au passage. Si « Ce que ca change » est vide dans le fichier, la
     carte n'affiche pas de bloc « CONCRETEMENT » — elle montre le corps. C'est prevu.
"""
import sys, io

CIBLE = sys.argv[1]
src = io.open(CIBLE, encoding="utf-8").read()
R = []

# ------------------------------------------------------- 1. le chargeur et la fusion
ANCRE = "function renderFeed() {\n  const el = document.getElementById(\"feed\");"
assert src.count(ANCRE) == 1, "l'entree de renderFeed a change"

BLOC = '''/* ===================== LES EVENEMENTS VALIDES, SERVIS A PART =====================
   Etat : "absent" (fichier autonome), "en cours", "servi", "echec". */
var EV_ETAT = "absent";

function evCharger() {
  if (!window.REPERE_EVENEMENTS_URL) return;   /* fichier autonome : rien a chercher */
  if (EV_ETAT === "en cours" || EV_ETAT === "servi") return;
  EV_ETAT = "en cours";
  fetch(window.REPERE_EVENEMENTS_URL, { credentials: "omit" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (d) {
      /* Une page d'erreur renvoyee en 200 par un hebergeur ne doit pas passer pour un fil. */
      if (!d || d.v !== 1 || !Array.isArray(d.r)) throw new Error("format inattendu");
      evFusionner(d.r);
      EV_ETAT = "servi";
      if (currentTab === "s-fil" && typeof renderFeed === "function") renderFeed();
      if (typeof renderThemes === "function") renderThemes();
      if (typeof majFraicheur === "function") majFraicheur();
    })
    .catch(function () { EV_ETAT = "echec"; });   /* le fil reste ce qu'il etait */
}

/* Les echelons du fichier editorial et ceux du fil ne portent pas les memes noms :
   la table est ici, explicite, plutot qu'un remplacement de chaine dissemine. */
var EV_ECH = { ville: "ville", agglo: "agglo", departement: "dept",
               region: "region", france: "france" };

function evJour(iso) {
  var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  return Number(m[3]) + " " + MOIS[Number(m[2]) - 1] + " " + m[1];
}

/* Le corps d'un evenement porte deux parties : le fait, puis « Ce que ca change ».
   On les separe sans rien inventer — si la seconde manque, elle reste vide. */
function evCorps(txt) {
  var t = String(txt || "")
    .replace(/<!--[\\s\\S]*?-->/g, "")           /* commentaires du gabarit */
    .replace(/^#+\\s*Le fait\\s*$/gim, "")
    .trim();
  var i = t.search(/^#*\\s*Ce que .a change\\s*:?\\s*$/im);
  if (i < 0) {
    var j = t.search(/Ce que .a change\\s*:/i);
    if (j < 0) return { corps: t, impact: "" };
    return { corps: t.slice(0, j).trim(),
             impact: t.slice(j).replace(/^Ce que .a change\\s*:\\s*/i, "").trim() };
  }
  var apres = t.slice(i);
  return { corps: t.slice(0, i).trim(),
           impact: apres.replace(/^#*\\s*Ce que .a change\\s*:?\\s*/im, "").trim() };
}

function evDomaine(url) {
  var m = /^https?:\\/\\/([^\\/]+)/i.exec(String(url || ""));
  return m ? m[1].replace(/^www\\./, "") : "";
}

function evFusionner(liste) {
  var nouveaux = [];
  for (var i = 0; i < liste.length; i++) {
    var e = liste[i];
    if (!e || !e.t || !e.d || !e.src) continue;     /* sans preuve, on n'affiche pas */
    var c = evCorps(e.txt);
    nouveaux.push({
      lvl: EV_ECH[e.e] || "france",
      date: evJour(e.d),
      iso: e.d,
      theme: e.theme || "Institution",
      title: e.t,
      body: c.corps || e.t,
      impact: c.impact,
      vote: e.srcn || evDomaine(e.src),
      verif: e.conf === "verifie" ? "Verifie le " + evJour(e.d) : "A confirmer",
      src: evDomaine(e.src),
      url: e.src,
      insee: e.insee || "",
      now: ""
    });
  }
  /* Entre eux, du plus recent au plus ancien. Devant les treize cartes ecrites a la
     main, qui sont toutes plus anciennes. */
  nouveaux.sort(function (a, b) { return a.iso < b.iso ? 1 : (a.iso > b.iso ? -1 : 0); });
  if (nouveaux.length) FEED.unshift.apply(FEED, nouveaux);
}

'''
R.append(("chargeur", ANCRE, BLOC + ANCRE))

# ------------------------------------------------- 2. l'ouverture du fil declenche
ANCRE2 = "  const el = document.getElementById(\"feed\");\n  harvestReports();"
assert src.count(ANCRE2) == 1
R.append(("appel", ANCRE2,
          "  const el = document.getElementById(\"feed\");\n"
          "  if (typeof evCharger === \"function\") evCharger();\n"
          "  harvestReports();"))

# ------------------------- 3. un fait valide pour MA commune est toujours visible
ANCIEN_F = ("  const visible = FEED.filter(f => lvlCovered(f.lvl, cov)\n"
            "    && (activeChip === \"tous\" || f.lvl === activeChip)\n"
            "    && (activeTheme === \"tous\" || f.theme === activeTheme));")
assert src.count(ANCIEN_F) == 1, "le filtre du fil a change"
NOUVEAU_F = ("  /* `f.insee` : un fait valide a la main pour la commune choisie ne peut pas etre\n"
             "     masque par coverage(), dont la liste de six communes decrit seulement ce que\n"
             "     l'auteur avait deja ecrit a la main. */\n"
             "  const visible = FEED.filter(f => (lvlCovered(f.lvl, cov) || (f.insee && f.insee === STATE.insee))\n"
             "    && (activeChip === \"tous\" || f.lvl === activeChip)\n"
             "    && (activeTheme === \"tous\" || f.theme === activeTheme));")
R.append(("visibilite", ANCIEN_F, NOUVEAU_F))

# --------------------------------------------------------------- verifications
for etiquette, ancien, nouveau in R:
    assert src.count(ancien) == 1, "ancre « %s » vue %d fois" % (etiquette, src.count(ancien))
    assert "’" not in nouveau, "apostrophe typographique dans « %s »" % etiquette

out = src
for etiquette, ancien, nouveau in R:
    out = out.replace(ancien, nouveau, 1)

assert out != src
assert out.count("function evCharger") == 1
assert out.count("function evFusionner") == 1
assert out.count("REPERE_EVENEMENTS_URL") == 2
# le fichier autonome ne doit declarer AUCUNE adresse a aller chercher
assert "REPERE_EVENEMENTS_URL = " not in out, \
    "la source ne declare pas d'adresse : c'est build_pwa qui la pose"
assert out.count("FEED.unshift") == 1
io.open(CIBLE, "w", encoding="utf-8").write(out)
print("patch 16 applique : %d -> %d octets" % (len(src.encode()), len(out.encode())))
