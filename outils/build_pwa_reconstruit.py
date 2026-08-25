#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generateur de la PWA — reconstruit, puis PROUVE.

Le script d'origine (outils/build_pwa.py) n'est pas dans cette session. Plutot que de
fabriquer le site a la main — ce que l'invariant interdit — ce script deduit la
transformation de la seule preuve disponible : le zip deja livre, qui contient la
sortie du vrai script pour la v18.9.

La preuve : on regenere index.html a partir de app_repere_v18_9.html d'origine et on
compare l'empreinte au fichier du zip. Si les deux md5 sont identiques, la
transformation reconstruite est byte-pour-byte celle du script d'origine. Le script
s'arrete si la preuve echoue — il ne produit alors AUCUN fichier.

Quatre transformations mesurees :
  1. les liens d'icone et de manifeste en data-URI deviennent des fichiers ;
  2. un bloc CSS « mode installe » est insere avant </style> ;
  3. le bloc <div class="pitch"> est SUPPRIME (il n'a de sens que sur la page PC) ;
  4. l'enregistrement du service worker est ajoute apres le drapeau de fin de fichier.
Puis sw.js recoit VERSION = "repere-" + sha256(index.html)[:12].

Usage :
  python3 outils/build_pwa_reconstruit.py <app_source.html> <dossier_site_de_reference> <dossier_sortie>
"""
import sys, io, os, re, json, shutil, hashlib

if len(sys.argv) != 4:
    sys.exit(__doc__)
SOURCE, REF, SORTIE = sys.argv[1], sys.argv[2], sys.argv[3]

lire = lambda p: io.open(p, "r", encoding="utf-8").read()

ref_index = lire(os.path.join(REF, "index.html"))

# ---------------------------------------------------------------- les morceaux
# On ne recopie pas ces blocs a la main : on les DECOUPE dans la sortie de reference,
# c'est-a-dire dans le fichier produit par le vrai script.
M_LIENS_NEUFS = '''<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icones/favicon-32.png">
<link rel="manifest" href="manifest.webmanifest">'''
assert ref_index.count(M_LIENS_NEUFS) == 1, "les liens d'icone du site de reference ont change"

D_CSS = "/* ======================================================================\n   MODE INSTALLE (PWA)"
i = ref_index.index(D_CSS)
j = ref_index.index("</style>", i)
BLOC_CSS = ref_index[i:j]
assert "display-mode:standalone" in BLOC_CSS and len(BLOC_CSS) < 4000

D_SW = '<script>\n/* Enregistrement du service worker.'
i = ref_index.index(D_SW)
j = ref_index.index("</script>", ref_index.index("classList.add(\"installe\")", i)) + len("</script>")
BLOC_SW = ref_index[i:j]
assert 'navigator.serviceWorker.register("sw.js"' in BLOC_SW and len(BLOC_SW) < 3000


LANDING = []


def engendrer(html, lien_confidentialite=True):
    """Applique les quatre transformations, dans l'ordre du script d'origine."""
    # 1 — les liens en data-URI deviennent des fichiers
    lignes = html.split("\n")
    debut = next(k for k, l in enumerate(lignes) if l.startswith('<link rel="apple-touch-icon" href="data:'))
    fin = next(k for k, l in enumerate(lignes) if l.startswith('<link rel="manifest" href="data:'))
    assert fin == debut + 1, "les deux liens en data-URI ne se suivent pas"
    html = "\n".join(lignes[:debut] + M_LIENS_NEUFS.split("\n") + lignes[fin + 1:])

    # 2 — le bloc CSS du mode installe, juste avant </style>
    # une ligne vide precede le bloc dans la sortie du script d'origine
    k = html.index("</style>")
    html = html[:k] + "\n" + BLOC_CSS + html[k:]

    # 3 — les blocs de landing disparaissent : ils n'ont de sens que sur la page PC.
    # Depuis la v18.12 il y en a DEUX (avant et apres le telephone) et leur classe
    # porte un suffixe. On les retire tous, en fermant chacun sur son </div> de
    # colonne zero — les </div> internes sont indentes, ils ne peuvent pas etre pris
    # pour la fermeture du bloc.
    blocs = []
    while True:
        a = html.find('<div class="pitch')
        if a < 0:
            break
        fin = html.index("\n</div>\n", a) + len("\n</div>\n")
        assert fin - a < 20000, "bloc de landing anormal : %d octets" % (fin - a)
        blocs.append(html[a:fin])
        html = html[:a] + html[fin:]
        assert len(blocs) <= 3, "trop de blocs de landing"
    assert blocs, "aucun bloc de landing trouve"
    LANDING.extend(blocs)

    # 4 — l'enregistrement du service worker, apres le drapeau de fin de fichier
    ancre = "<script>\nwindow.REPERE_COMPLET = true;\n</script>"
    assert html.count(ancre) == 1, "le drapeau de fin de fichier est introuvable"
    html = html.replace(ancre, ancre + "\n" + BLOC_SW, 1)

    if not lien_confidentialite:
        return html

    # 5 — AJOUT hors preuve : le site sert une page confidentialite.html que rien ne
    # liait. Elle etait mise en cache par le service worker et atteignable seulement
    # en tapant son adresse. Le lien n'est pose QUE dans la version servie, parce que
    # le fichier autonome ouvert depuis un telephone n'a pas cette page a cote de lui.
    ancre_legal = '<p style="margin-top:10px;"><b>Sources et licences.</b>'
    assert html.count(ancre_legal) == 1, "le repli des mentions legales est introuvable"
    lien = ('<p style="margin-top:10px;"><b>Politique de confidentialité.</b> '
            '<a href="confidentialite.html" style="color:var(--ink);text-decoration:underline;'
            'text-underline-offset:2px;">Lire la page complète</a>.</p>\n            ')
    html = html.replace(ancre_legal, lien + ancre_legal, 1)
    return html


# ------------------------------------------------------------------- la preuve
PREUVE_SRC = "app_repere_v18_9.html.bak"
if os.path.exists(PREUVE_SRC):
    obtenu = engendrer(lire(PREUVE_SRC), lien_confidentialite=False)
    a = hashlib.md5(obtenu.encode("utf-8")).hexdigest()
    b = hashlib.md5(ref_index.encode("utf-8")).hexdigest()
    assert a == b, ("PREUVE ECHOUEE : la transformation reconstruite ne redonne pas le "
                    "fichier du zip (%s != %s). Aucun fichier produit." % (a[:12], b[:12]))
    print("preuve : v18.9 regeneree = index.html du zip, byte pour byte (md5 %s)" % a[:12])
    LANDING.clear()
else:
    sys.exit("PREUVE IMPOSSIBLE : %s absent. On ne produit rien sans preuve." % PREUVE_SRC)

# ------------------------------------------------------------------ production
os.makedirs(SORTIE, exist_ok=True)
# Le dossier de reference peut contenir des sauvegardes (sw.js.v18_9, index.html.bak).
# Les copier reviendrait a servir publiquement une version perimee du service worker,
# que n'importe qui pourrait charger a la main. On refuse par la forme du nom.
SUSPECT = (".bak", ".old", ".orig", ".tmp")
for nom in os.listdir(REF):
    if nom.endswith(SUSPECT) or ".v18_" in nom or nom.startswith("."):
        print("ignore (sauvegarde) : %s" % nom)
        continue
    src = os.path.join(REF, nom)
    dst = os.path.join(SORTIE, nom)
    if os.path.isdir(src):
        shutil.rmtree(dst, ignore_errors=True); shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

src_app = lire(SOURCE)
index = engendrer(src_app)
sw = lire(os.path.join(REF, "sw.js"))

# ------------------------------------------------- l'agenda, servi a part
# POURQUOI : la collecte quotidienne met agenda_an.json a jour chaque matin. Embarque
# dans les 17 Mo, il faudrait redeployer le fichier entier pour qu'il atteigne
# quelqu'un. Extrait, il se remplace seul — 77 Ko servis au lieu de 6 Mo.
# Le fichier autonome, lui, garde ses donnees : c'est ici, et seulement ici, qu'on
# les sort. Une source, deux sorties.
D_AG = "window.REPERE_AGENDA_AN = "
if D_AG in index:
    i = index.index(D_AG)
    j = index.index(";\n</script>", i)
    donnees_agenda = index[i + len(D_AG):j]
    assert donnees_agenda.startswith("{") and len(donnees_agenda) > 100000, \
        "le bloc de donnees de l'agenda n'a pas la forme attendue"
    # LA COLLECTE PASSE DEVANT L'EMBARQUE. Sans cette regle, le job quotidien mettait
    # a jour outils/agenda_an.json chaque matin et le site continuait a servir la copie
    # figee dans les 17 Mo : une collecte dont le resultat n'atteint personne. On ne
    # substitue QUE si le fichier collecte est valide — un JSON tronque par un
    # telechargement interrompu ne doit pas remplacer des donnees qui marchent.
    collecte = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agenda_an.json")
    origine, maj = "les donnees embarquees dans l'application", None
    if os.path.exists(collecte):
        brut_collecte = lire(collecte)
        try:
            d = json.loads(brut_collecte)
        except ValueError as e:
            sys.exit("agenda collecte illisible (%s). Rien n'est produit." % e)
        assert d.get("v") == 1, "version de format inattendue dans l'agenda collecte"
        assert isinstance(d.get("r"), list) and len(d["r"]) > 5000, \
            "l'agenda collecte ne contient que %d reunions" % len(d.get("r") or [])
        assert isinstance(d.get("org"), list) and d["org"], "table des instances vide"
        assert all(0 <= e["o"] < len(d["org"]) for e in d["r"]), "index d'instance hors table"
        assert "acteurRef" not in brut_collecte, "une presence nominative a fuite"
        donnees_agenda = brut_collecte
        maj = d.get("maj")
        origine = "la collecte" + (" du " + maj if maj else " (sans date)")
    os.makedirs(os.path.join(SORTIE, "donnees"), exist_ok=True)
    io.open(os.path.join(SORTIE, "donnees", "agenda_an.json"), "w",
            encoding="utf-8").write(donnees_agenda)
    # A la place : l'adresse a aller chercher. L'application ne fait la requete que
    # si cette variable existe — le fichier autonome ne la declare jamais.
    index = index[:i] + 'window.REPERE_AGENDA_URL = "donnees/agenda_an.json"' + index[j:]
    # `window.REPERE_AGENDA_AN = d;` subsiste dans anCharger, et c'est normal :
    # ce qui doit disparaitre, c'est le BLOC DE DONNEES, pas toute mention du nom.
    assert "REPERE_AGENDA_URL" in index
    assert 'window.REPERE_AGENDA_AN = {"v":1' not in index, "le bloc de donnees subsiste"
    print("agenda servi : %.0f Ko, depuis %s" % (len(donnees_agenda) / 1024, origine))

    # ---------------------------------------- les evenements editoriaux, servis aussi
    # Meme mecanique que l'agenda, meme raison : le fichier autonome n'a pas d'adresse a
    # aller chercher, la version servie en recoit une. Sans ce bloc, la couche editoriale
    # produit un fichier que personne ne lit — ce qui a ete le cas pendant deux jours.
    ev = os.path.join(os.path.dirname(os.path.abspath(__file__)), "evenements.json")
    if os.path.exists(ev):
        brut_ev = lire(ev)
        d_ev = json.loads(brut_ev)
        assert d_ev.get("v") == 1 and isinstance(d_ev.get("r"), list), \
            "evenements.json n'a pas la forme attendue"
        io.open(os.path.join(SORTIE, "donnees", "evenements.json"), "w",
                encoding="utf-8").write(brut_ev)
        ancre_ev = 'window.REPERE_AGENDA_URL = "donnees/agenda_an.json"'
        assert index.count(ancre_ev) == 1, "l'adresse de l'agenda est introuvable"
        index = index.replace(
            ancre_ev,
            ancre_ev + ';\nwindow.REPERE_EVENEMENTS_URL = "donnees/evenements.json"', 1)
        # On s'ancre sur accueil.html et non sur l'agenda : a cet endroit du script,
        # la ligne de l'agenda n'a pas encore ete posee dans le service worker.
        assert '"./accueil.html",' in sw, "la coquille du service worker a change"
        sw = sw.replace('"./accueil.html",',
                        '"./accueil.html",\n  "./donnees/evenements.json",', 1)
        assert '"./donnees/evenements.json"' in sw
        print("evenements servis : %d fait(s) valide(s)" % len(d_ev["r"]))
    else:
        print("evenements : aucun fichier — le fil garde ses cartes ecrites a la main")

    # Le service worker doit le connaitre, sinon l'app installee perd son agenda
    # des qu'elle est hors ligne — un manque invisible, le pire des cas.
    assert '"./accueil.html",' in sw, "la coquille du service worker a change"
    sw = sw.replace('"./accueil.html",', '"./accueil.html",\n  "./donnees/agenda_an.json",', 1)
    assert '"./donnees/agenda_an.json"' in sw

# index.html n'est ecrit qu'APRES l'extraction : sinon le fichier servi
# garderait les donnees que l'on vient d'en sortir, et pesserait 671 Ko de trop.
io.open(os.path.join(SORTIE, "index.html"), "w", encoding="utf-8").write(index)

# L'empreinte porte sur index.html ET sur le service worker lui-meme. Sans le second,
# corriger un defaut du service worker sans toucher a l'application laisserait le nom
# du cache inchange — et `activate` n'efface que les caches d'un AUTRE nom. Le cache
# fautif survivrait donc au correctif cense le vider. C'est exactement ce qui serait
# arrive avec le correctif de navigation du 12 aout.
ancienne = re.search(r'VERSION *= *"repere-([0-9a-f]{12})"', sw)
assert ancienne, "VERSION introuvable dans sw.js"
sw_nu = sw.replace(ancienne.group(0), "")   # sans la ligne de version : pas de circularite
empreinte = hashlib.sha256((index + sw_nu).encode("utf-8")).hexdigest()[:12]
sw = sw.replace(ancienne.group(0), 'VERSION = "repere-%s"' % empreinte, 1)


# ------------------------------------------------------- accueil.html (la landing)
# POURQUOI une page separee : build_pwa.py retire la landing de index.html — c'est
# volontaire, index.html EST l'application. La landing est donc engendree ici, depuis
# le MEME fichier source : une seule verite, deux sorties. Rien n'est recopie a la main.
D_CSS_LD = "/* ------- landing (visible seulement hors installation"
i = src_app.index(D_CSS_LD)
j = src_app.index("\n}\n", src_app.index("@media(max-width:640px){", i)) + 3
CSS_LD = src_app[i:j]
assert ".ld-h1{" in CSS_LD and "@media(max-width:640px)" in CSS_LD and len(CSS_LD) < 6000, \
    "le CSS de la landing n'a pas ete decoupe correctement"

# Sur la landing, le bouton n'ouvre pas un telephone dessine : il ouvre l'application,
# avec la commune deja saisie. C'est le seul endroit ou ldGo() differe.
JS_ACCUEIL = """<script>
/* La demonstration ouvre l'application avec la commune deja saisie : l'habitant ne
   tape son nom de commune qu'une seule fois. Rien n'est stocke ici, rien n'est envoye :
   la valeur passe dans l'adresse, l'application la lit puis l'efface de la barre. */
function ldGo(id) {
  var champ = document.getElementById(id || "ld-input");
  var valeur = champ ? champ.value.trim() : "";
  if (!valeur) { if (champ) champ.focus(); return; }
  window.location.href = "index.html?c=" + encodeURIComponent(valeur);
}
</script>"""

TETE = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Repere — qui decide chez vous, et ou va votre argent</title>
<meta name="description" content="Les decisions publiques qui vous concernent, de votre conseil municipal a l'Assemblee nationale. Resumees, sourcees, sans opinion. Aucun compte, aucune donnee collectee.">
<meta name="theme-color" content="#0b0a09">
<link rel="icon" type="image/png" sizes="32x32" href="icones/favicon-32.png">
<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">
<style>
*{box-sizing:border-box;}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Helvetica,Arial,sans-serif;
  background:radial-gradient(120% 90% at 50% 0%,#1c1917 0%,#0b0a09 62%);color:#a1a1a6;
  min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;
  padding:38px 16px 64px;-webkit-font-smoothing:antialiased;}
.pitch{max-width:760px;text-align:center;color:#a1a1a6;margin-bottom:30px;}
.pitch h1{font-size:25px;color:#f5f5f7;font-weight:700;letter-spacing:-.02em;}
.pitch p{font-size:13.5px;line-height:1.65;margin-top:10px;}
a{color:#a1a1a6;}
.ld-pied{max-width:760px;font-size:12px;color:#6b6560;text-align:center;margin-top:10px;line-height:1.6;}
__CSS_LANDING__
</style>
</head>
<body>
""".replace("__CSS_LANDING__", CSS_LD)

PIED = """<p class="ld-pied">
  Repere — projet individuel, en beta fermee. Mentions legales, CGU et confidentialite :
  <a href="confidentialite.html">politique de confidentialite</a> &middot;
  <a href="mailto:repere0@protonmail.com">repere0@protonmail.com</a><br>
  Donnees publiques reutilisees sous licence ouverte : Repertoire national des elus,
  INSEE, Observatoire des finances et de la gestion publique locales, Assemblee nationale, Senat.
</p>
"""

corps = "\n".join(LANDING)
# Dans le fichier source, la landing surplombe le telephone dessine et le dit. Sur
# accueil.html il n y a pas de telephone en dessous : l application est sur une autre
# page. La phrase serait fausse, donc elle change ici — vu sur une capture, pas par
# une assertion.
FAUX = '<p class="ld-micro" style="margin-top:22px;">L\'application est juste en dessous. Elle fonctionne, avec de vraies donnees.</p>'
FAUX = FAUX.replace("donnees", "donn\u00e9es").replace("L'application", "L'application")
assert corps.count('L\'application est juste en dessous') == 1, "la phrase du telephone dessine a change"
i_f = corps.index('<p class="ld-micro" style="margin-top:22px;">')
j_f = corps.index('</p>', i_f) + 4
corps = corps[:i_f] + ('<p class="ld-micro" style="margin-top:22px;">Tapez votre commune : '
                       'l\'application s\'ouvre directement sur vos donn\u00e9es, sans inscription.</p>') + corps[j_f:]
assert 'juste en dessous' not in corps
accueil = TETE + corps + "\n" + PIED + JS_ACCUEIL + "\n</body>\n</html>\n"
assert accueil.count("function ldGo") == 1
assert 'id="ld-input"' in accueil and 'id="ld-input2"' in accueil
assert "index.html?c=" in accueil
io.open(os.path.join(SORTIE, "accueil.html"), "w", encoding="utf-8").write(accueil)
print("accueil.html : %d Ko, %d bloc(s) de landing" % (len(accueil.encode("utf-8")) / 1024, len(LANDING)))

# ------------------------------------------------------------- sw.js
# La garde de navigation vit desormais DANS la reference (site/sw.js) : elle limite
# les adresses considerees comme des documents et exige un content-type text/html.
# Le generateur ne fait plus que poser la VERSION — une transformation, un endroit.
assert "estDocument" in sw and "cleDocument" in sw, \
    "le sw.js de reference n'a pas le correctif de navigation du 12 aout"
assert '"./accueil.html"' in sw, "accueil.html absent de la coquille du sw.js de reference"

# ------------------------------------------------------ une adresse propre a partager
# On ne redirige PAS "/" : le manifeste declare start_url "./", donc une redirection de
# la racine ouvrirait la landing dans l'application deja installee chez les gens.
io.open(os.path.join(SORTIE, "_redirects"), "w", encoding="utf-8").write(
    "# /presentation sert la landing sans toucher a la racine : start_url du manifeste\n"
    "# vaut ./ , et rediriger / ouvrirait la landing dans l app installee.\n"
    "/presentation  /accueil.html  200\n")
print("_redirects ecrit : /presentation -> accueil.html")

io.open(os.path.join(SORTIE, "sw.js"), "w", encoding="utf-8").write(sw)

print("index.html : %.2f Mo" % (len(index.encode("utf-8")) / 1048576))
print("sw.js : VERSION repere-%s (etait repere-%s)" % (empreinte, ancienne.group(1)))
print("site ecrit dans %s" % SORTIE)
