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
import sys, io, os, re, shutil, hashlib

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
for nom in os.listdir(REF):
    src = os.path.join(REF, nom)
    dst = os.path.join(SORTIE, nom)
    if os.path.isdir(src):
        shutil.rmtree(dst, ignore_errors=True); shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

src_app = lire(SOURCE)
index = engendrer(src_app)
io.open(os.path.join(SORTIE, "index.html"), "w", encoding="utf-8").write(index)

empreinte = hashlib.sha256(index.encode("utf-8")).hexdigest()[:12]
sw = lire(os.path.join(REF, "sw.js"))
ancienne = re.search(r'VERSION *= *"repere-([0-9a-f]{12})"', sw)
assert ancienne, "VERSION introuvable dans sw.js"
sw = sw.replace(ancienne.group(0), 'VERSION = "repere-%s"' % empreinte, 1)

# ------------------------------------------- sw.js : strategie de document (18 aout 2026)
# POURQUOI : index.html pese 16 Mo (6,2 Mo au transfert). En reseau-d'abord, chaque
# ouverture de l'app retelechargeait ces 6,2 Mo AVANT d'afficher quoi que ce soit. On
# passe en cache-d'abord + revalidation en fond : affichage immediat, version en ligne
# servie a l'ouverture suivante. Le navigateur revalide sw.js (4 ko) a chaque
# navigation, et un deploiement change VERSION : le retard maximum est d'une ouverture.
#
# PIEGE, paye une fois en production : en cache-d'abord, servir aveuglement index.html
# pour TOUTE navigation renvoie l'application a la place de /presentation et de
# /confidentialite.html. Le reseau-d'abord masquait le probleme tant qu'on etait en
# ligne. D'ou la table PAGES : chaque document servi par le site a SA cle de cache, et
# une adresse inconnue n'est pas interceptee du tout — elle part au reseau, et c'est
# l'hebergeur qui repond (404 comprise).
#
# Trois corrections viennent avec :
#   - "./" retire de la coquille : doublon exact de index.html, 32 Mo stockes au lieu de 16 ;
#   - estBonne() : une 404 ou une page d'erreur de l'hebergeur ne peut plus etre mise en
#     cache — l'ancien code cachait n'importe quelle reponse, l'app mourait hors ligne
#     sans rien dire ;
#   - cache: "reload" a l'installation : la coquille est prise au reseau, jamais au cache
#     HTTP du navigateur, sinon un deploiement peut installer une version deja perimee.
# Le sw.js de reference (REF) reste celui de la v18.9 : on transforme, on ne recopie pas.

SW_COQ_AV = 'var COQUILLE = [\n  "./",\n  "./index.html",'
SW_COQ_AP = ('var DOC = "./index.html";\n'
             '/* Les seules navigations que ce service worker intercepte, et la cle de cache de\n'
             '   chacune. "presentation" est l adresse propre servie par _redirects. Tout ce qui\n'
             '   n est pas dans cette table passe au reseau sans etre touche. */\n'
             'var PAGES = {\n'
             '  "": DOC,\n'
             '  "index.html": DOC,\n'
             '  "confidentialite.html": "./confidentialite.html"\n'
             '};\n'
             'var COQUILLE = [\n  "./index.html",')
assert sw.count(SW_COQ_AV) == 1, "la coquille du service worker a change"
sw = sw.replace(SW_COQ_AV, SW_COQ_AP, 1)

SW_INST_AV = ('self.addEventListener("install", function (e) {\n'
              '  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(COQUILLE); })\n'
              '    .then(function () { return self.skipWaiting(); }));\n'
              '});')
SW_INST_AP = ('self.addEventListener("install", function (e) {\n'
              '  e.waitUntil(caches.open(VERSION).then(function (c) {\n'
              '    /* cache: "reload" : on prend la coquille au reseau, jamais au cache HTTP du\n'
              '       navigateur - sinon un deploiement peut installer une version deja perimee. */\n'
              '    return c.addAll(COQUILLE.map(function (u) {\n'
              '      return new Request(u, { cache: "reload" });\n'
              '    }));\n'
              '  }).then(function () { return self.skipWaiting(); }));\n'
              '});')
assert sw.count(SW_INST_AV) == 1, "le gestionnaire d installation du service worker a change"
sw = sw.replace(SW_INST_AV, SW_INST_AP, 1)

SW_FETCH_AV = 'self.addEventListener("fetch", function (e) {'
SW_BONNE = ("/* Ne met en cache qu une reponse reellement valide : une 404 ou une page d erreur de\n"
            "   l hebergeur mise en cache rendrait l app morte hors ligne, silencieusement. */\n"
            "function estBonne(rep) {\n"
            '  return rep && rep.ok && rep.status === 200 && rep.type === "basic";\n'
            "}\n\n")
assert sw.count(SW_FETCH_AV) == 1, "le gestionnaire fetch du service worker a change"
sw = sw.replace(SW_FETCH_AV, SW_BONNE + SW_FETCH_AV, 1)

SW_NAV_AV = ("  /* Reseau d'abord pour le document : si une nouvelle version est en ligne, on la\n"
             "     prend ; sinon on retombe sur le cache et l'app s'ouvre quand meme hors ligne. */\n"
             '  if (r.mode === "navigate") {\n'
             "    e.respondWith(fetch(r).then(function (rep) {\n"
             "      var copie = rep.clone();\n"
             '      caches.open(VERSION).then(function (c) { c.put("./index.html", copie); });\n'
             "      return rep;\n"
             "    }).catch(function () {\n"
             '      return caches.match("./index.html").then(function (m) { return m || Response.error(); });\n'
             "    }));\n"
             "    return;\n"
             "  }")
SW_NAV_AP = ("  /* Cache d abord pour les documents connus, revalidation en fond. */\n"
             '  if (r.mode === "navigate") {\n'
             '    var cle = PAGES[new URL(r.url).pathname.split("/").pop()];\n'
             "    /* Adresse inconnue : on ne l intercepte pas. Servir index.html ici masquerait\n"
             "       les 404 de l hebergeur et casserait toute page ajoutee plus tard. */\n"
             "    if (!cle) return;\n"
             "    e.respondWith(caches.match(cle).then(function (m) {\n"
             "      var reseau = fetch(r).then(function (rep) {\n"
             "        if (estBonne(rep)) {\n"
             "          var copie = rep.clone();\n"
             "          caches.open(VERSION).then(function (c) { c.put(cle, copie); });\n"
             "        }\n"
             "        return rep;\n"
             "      });\n"
             "      if (m) {\n"
             "        /* On sert le cache tout de suite ; la requete reseau continue seule.\n"
             "           waitUntil la maintient en vie apres la reponse, sans bloquer l affichage. */\n"
             "        e.waitUntil(reseau.catch(function () {}));\n"
             "        return m;\n"
             "      }\n"
             "      /* Premiere visite, ou cache vide : il n y a que le reseau. */\n"
             "      return reseau.catch(function () { return Response.error(); });\n"
             "    }));\n"
             "    return;\n"
             "  }")
assert sw.count(SW_NAV_AV) == 1, "le gestionnaire de navigation du service worker a change"
sw = sw.replace(SW_NAV_AV, SW_NAV_AP, 1)
assert sw.count("var cle =") == 1 and "PAGES[" in sw

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

# ------------------------------------------------------------- sw.js : accueil.html
# La landing a sa propre cle de cache : sous "./index.html" elle remplacerait
# l application par la page de presentation dans le cache hors ligne, et en
# cache-d abord une visite sur /presentation renverrait l application. Les deux
# adresses (accueil.html et l adresse propre /presentation) pointent sur la meme cle.
ENTREE_AV = '  "confidentialite.html": "./confidentialite.html"\n'
ENTREE_AP = ('  "confidentialite.html": "./confidentialite.html",\n'
             '  "accueil.html": "./accueil.html",\n'
             '  "presentation": "./accueil.html"\n')
assert sw.count(ENTREE_AV) == 1, "la table PAGES du service worker a change"
sw = sw.replace(ENTREE_AV, ENTREE_AP, 1)
assert sw.count('"./accueil.html"') == 2
sw = sw.replace('  "./confidentialite.html",', '  "./confidentialite.html",\n  "./accueil.html",', 1)
assert '"./accueil.html"' in sw

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
