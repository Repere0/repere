#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch 13 — mise en veille de tout ce qui n'est pas vrai, pour la beta fermee.

LA REGLE QUI GOUVERNE : la beta ne montre que ce qui est vrai. Tout ecran, tout bloc
dont le contenu porte une etiquette DEMO, APERCU ou A RECROISER sort de la beta.

CE QUE LA MESURE A CORRIGE dans le plan initial : « 7 ecrans » etait une granularite
fausse. Ce sont cinq ecrans entiers (offres, paiement, activation d'acces, gestion
d'acces, notifications) et une dizaine de blocs a l'interieur d'ecrans par ailleurs
vrais. Eteindre « Qui influence » ou le haut de « Debats » aurait supprime du contenu
sourcé et exact : ce sont des retraits chirurgicaux, pas des extinctions d'ecran.

CE QUE LA RELECTURE ADVERSE A AJOUTE, et qui ne figurait pas dans le plan :
  - le paragraphe « Abonnement » des mentions legales annoncait un prix, une duree et
    un droit de retractation. Delier les ecrans l'aurait laisse seul a vendre.
  - le bloc OFFRE de la page d'accueil (class ld-offre) est EXTRAIT du fichier par
    build_pwa et publie dans accueil.html : aucun mecanisme JavaScript ne peut
    l'eteindre. Il fallait le reecrire en dur.
  - l'interrupteur de notification de l'onboarding, la banniere iOS et la ligne
    « Digest quotidien active » promettaient un envoi qui n'existe pas, en dehors de
    l'ecran Notifications.
  - le seul bloc estampille SUIVI REEL etait perime : il annoncait une decision du
    Conseil constitutionnel « attendue vers le 15 aout ». Elle a ete rendue le
    14 aout 2026 (n° 2026-910 DC). Corrige ici, sources verifiees.
  - la repartition cible des revenus (45 % d'abonnements) chiffrait un revenu
    inexistant, et « Sponsors locaux 5 % » contredisait la charte des refus douze
    lignes plus bas.

MECANISME : une constante BETA_RESTREINTE, une table EN_VEILLE, un attribut
data-veille sur les noeuds concernes, une fonction qui les retire du DOM au demarrage,
et une garde dans show()/showTab()/goBack() pour les liens profonds et la pile de
retour. Remettre en service n'est PAS un simple passage a false : les textes reecrits
doivent etre revus un par un. C'est ecrit dans le code, a l'endroit ou on le lira.
"""
import sys, io, re

CIBLE = sys.argv[1] if len(sys.argv) > 1 else "app_repere_v18_15.html"
src = io.open(CIBLE, "r", encoding="utf-8").read()
R = []   # (etiquette, ancien, nouveau)

def bloc(debut, fin, etiquette):
    """Retourne le texte exact allant de `debut` a `fin` inclus, sans le transcrire."""
    assert src.count(debut) == 1, "ancre de debut « %s » : %d" % (etiquette, src.count(debut))
    assert src.count(fin) == 1, "ancre de fin « %s » : %d" % (etiquette, src.count(fin))
    i = src.index(debut); j = src.index(fin)
    assert i < j, "ancres croisees dans « %s »" % etiquette
    return src[i:j + len(fin)]

def rempl(etiquette, ancien, nouveau):
    R.append((etiquette, ancien, nouveau))

# =========================================================== 1. LE MECANISME
ANCRE_SHOWTAB = "function showTab(id, title) {\n  currentTab = id;"
MECANISME = '''/* ============================ MISE EN VEILLE (beta fermee) ============================
   POURQUOI : rien n'est en vente — aucune structure juridique, aucun encaissement — et
   aucune notification n'est envoyee. Montrer un prix, un tunnel de paiement ou un
   reglage de notification serait promettre ce qui n'existe pas. La regle est simple :
   la beta ne montre que ce qui est vrai.

   POUR REMETTRE EN SERVICE : passer BETA_RESTREINTE a false NE SUFFIT PAS. Les textes
   reecrits par le patch 13 (mentions legales, page d'accueil, onboarding, « Mes
   lieux ») disent aujourd'hui la verite d'une application gratuite ; il faut les
   reprendre un par un. Le booleen rouvre les portes, il ne repose pas les phrases. */
const BETA_RESTREINTE = true;
const EN_VEILLE = ["s-abo", "s-paiement", "s-compte-login", "s-compte-gestion", "s-notifs"];

function enVeille(id) { return BETA_RESTREINTE && EN_VEILLE.indexOf(id) !== -1; }

/* On RETIRE du DOM au lieu de masquer : un ecran en display:none reste dans la page,
   lisible par qui ouvre le fichier, et un jour quelqu'un le rallume par accident.
   Le code des fonctions, lui, reste — seule la porte se ferme. */
function appliquerVeille() {
  if (!BETA_RESTREINTE) return;
  var n = document.querySelectorAll("[data-veille]");
  for (var i = 0; i < n.length; i++) {
    if (n[i].parentNode) n[i].parentNode.removeChild(n[i]);
  }
}

'''
assert src.count(ANCRE_SHOWTAB) == 1
rempl("mecanisme", ANCRE_SHOWTAB, MECANISME + ANCRE_SHOWTAB)

# garde de showTab : jamais un geste sans reponse, on retombe sur le fil
rempl("garde-showtab",
      "function showTab(id, title) {\n  currentTab = id;",
      'function showTab(id, title) {\n'
      '  /* Un onglet ne peut pas etre en veille aujourd\'hui, mais la garde est ici pour\n'
      '     que l\'invariant tienne meme si la table change. */\n'
      '  if (enVeille(id)) { showTab("s-fil", "Mon fil"); return; }\n'
      '  currentTab = id;')

# garde de show : on ne laisse jamais un bouton sans reponse
rempl("garde-show",
      "function show(id, title, remplace) { /* écran secondaire avec retour */",
      'function show(id, title, remplace) { /* écran secondaire avec retour */\n'
      '  /* Lien profond ou cran de retour vers un ecran retire : on ne fait pas « rien »\n'
      '     — un bouton qui ne repond pas se lit comme une application plantee. On revient\n'
      '     a l\'onglet courant, qui existe toujours. */\n'
      '  if (enVeille(id)) { showTab(currentTab || "s-fil", "Mon fil"); return; }')

# goBack : depiler tant que le sommet est en veille
rempl("garde-goback",
      "  NAV_STACK.pop();                                   /* l'écran courant */\n"
      "  const prev = NAV_STACK.pop();                      /* celui d'avant */",
      "  NAV_STACK.pop();                                   /* l'écran courant */\n"
      "  let prev = NAV_STACK.pop();                        /* celui d'avant */\n"
      "  /* Un cran pose avant la veille pointerait vers un ecran retire : on saute. */\n"
      "  while (prev && enVeille(prev.id)) prev = NAV_STACK.pop();")

# activate : chercher l'ecran AVANT d'eteindre les autres, sinon un id inconnu
# laisse une page entierement blanche.
rempl("activate-ordre",
      'function activate(id, title) {\n'
      '  document.querySelectorAll(".screen").forEach(x => { x.classList.remove("active"); });\n'
      '  const el = document.getElementById(id);',
      'function activate(id, title) {\n'
      '  /* v18.16 — l\'ordre compte : eteindre les 21 ecrans avant de verifier que la\n'
      '     cible existe rendait la page entierement blanche pour un id inconnu, avec\n'
      '     pour seul signal un console.warn. On cherche d\'abord. */\n'
      '  const el = document.getElementById(id);\n'
      '  document.querySelectorAll(".screen").forEach(x => { x.classList.remove("active"); });')

# les trois fonctions de paiement dereferencent des noeuds retires
rempl("garde-paiement",
      "function startPayment() {\n  const offer = OFFERS[STATE.selectedOffer] || OFFERS.premium;",
      "function startPayment() {\n"
      "  /* Les noeuds de l'ecran de paiement n'existent plus en beta : sans cette garde,\n"
      "     un appel residuel jetterait un TypeError et le banc verrait une erreur JS. */\n"
      "  if (BETA_RESTREINTE) return;\n"
      "  const offer = OFFERS[STATE.selectedOffer] || OFFERS.premium;")
rempl("garde-paystep",
      'function payGoStep(n) {\n  document.querySelectorAll(".pay-step")',
      'function payGoStep(n) {\n  if (BETA_RESTREINTE) return;\n  document.querySelectorAll(".pay-step")')
rempl("garde-confirm",
      "function confirmPayment() {\n",
      "function confirmPayment() {\n  if (BETA_RESTREINTE) return;\n")

# =========================================================== 2. LES CINQ ECRANS
for eid in ["s-abo", "s-paiement", "s-compte-login", "s-compte-gestion", "s-notifs"]:
    rempl("ecran-" + eid,
          '<div class="screen" id="%s">' % eid,
          '<div class="screen" id="%s" data-veille="commerce">' % eid)

# =========================================================== 3. LES BLOCS
# -- s-moi : la zone « Mon acces » n'est pas retiree, elle est remplacee par la verite.
ZONE_MOI = bloc('        <div class="zone">\n          <div class="section-title">Mon accès</div>',
                '<span class="b">Abonnement, code, résiliation, mes données</span></span>\n'
                '            <span class="chev">\u203a</span>\n          </button>\n        </div>',
                "zone Mon acces")
rempl("zone-moi", ZONE_MOI,
      '        <div class="zone">\n'
      '          <div class="section-title">Ce que coûte Repère</div>\n'
      '          <!-- POURQUOI cette zone reste, au lieu de disparaitre avec le reste :\n'
      '               retirer toute mention d\'argent laisse la question ouverte — « quand\n'
      '               est-ce qu\'on va me demander de payer ? » — et c\'est elle qui\n'
      '               reviendrait dans les retours de test au lieu du produit. -->\n'
      '          <div class="src-block" style="padding-top:10px;padding-bottom:10px;">\n'
      '            <p style="margin:0;">Rien. <b>Repère est gratuit, en entier, et ne vend rien.</b>\n'
      '            Il n\'y a ni compte, ni paiement, ni abonnement — pas même caché quelque part.</p>\n'
      '          </div>\n'
      '        </div>')

# -- s-moi : la rangee Notifications
RANG_NOTIFS = bloc('          <button class="moi-row" onclick="show(\'s-notifs\',\'Notifications\',true)">',
                   '<span class="b">1 par jour maximum · digest à 18 h · tout est réglable</span></span>\n'
                   '            <span class="chev">\u203a</span>\n          </button>',
                   "rangee notifications")
rempl("rangee-notifs", RANG_NOTIFS,
      RANG_NOTIFS.replace('<button class="moi-row" onclick="show(\'s-notifs\',\'Notifications\',true)">',
                          '<button class="moi-row" data-veille="notifs" onclick="show(\'s-notifs\',\'Notifications\',true)">', 1))

# -- s-suivis : la carte « fin de vie », seul contenu marque SUIVI REEL, etait perimee.
rempl("fin-de-vie-sub",
      '<div class="sub">Adoptée le 15 juillet 2026. Au Conseil constitutionnel depuis cette date — décision attendue vers le 15 août.</div>',
      '<div class="sub">Adoptée le 15 juillet 2026. Le Conseil constitutionnel l\'a déclarée conforme, '
      'avec réserves, le 14 août 2026 (décision n° 2026-910 DC). La promulgation n\'est pas vérifiée à ce jour.</div>')
rempl("fin-de-vie-etapes",
      '<div class="step now"><div class="b"></div><div class="l">Conseil<br>constit.</div></div>\n'
      '            <div class="step"><div class="b"></div><div class="l"><span class="gl" onclick="openDef(\'promulgation\')">Signature<br>du président</span></div></div>',
      '<div class="step done"><div class="b"><svg viewBox="0 0 24 24"><path d="m5 13 4 4 10-10"/></svg></div><div class="l">Conseil<br>constit.<br>14 août</div></div>\n'
      '            <div class="step now"><div class="b"></div><div class="l"><span class="gl" onclick="openDef(\'promulgation\')">Signature<br>du président</span></div></div>')

# -- s-suivis : la cloche « M'alerter a chaque etape » promet un envoi inexistant
CLOCHE = bloc('          <div class="bellrow">', '</div>\n          <div class="impact" style="margin-top:12px;">', "cloche etape")
rempl("cloche", CLOCHE,
      CLOCHE.replace('<div class="bellrow">', '<div class="bellrow" data-veille="notifs">', 1))

# -- s-suivis : « Digest quotidien active » — aucun digest n'existe
rempl("digest-lieu",
      '<div class="c">Digest quotidien activé</div>',
      '<div class="c">Commune suivie</div>')

# -- s-suivis : la rangee « Ajouter un lieu / inclus avec Premium »
AJOUT_LIEU = bloc('          <div class="place">\n            <div><div class="n">Ajouter un lieu</div>',
                  '<button class="btn" onclick="show(\'s-abo\',\'Offres\')">Les offres</button>\n          </div>',
                  "ajouter un lieu")
rempl("ajout-lieu", AJOUT_LIEU,
      '          <div class="place">\n'
      '            <div><div class="n">Une seule commune pour l\'instant</div><div class="c">Suivre plusieurs communes n\'est pas encore fait.</div></div>\n'
      '          </div>')

# -- s-suivis : le repli « Alertes de ma rue » (APERCU, opacite .55, renvoi vers l'offre)
ALERTES = bloc('        <details class="repli">\n          <summary><span>Alertes de ma rue</span>',
               '<button class="abo-sec" onclick="show(\'s-abo\',\'Offres\')">Découvrir Premium — 1,99 € / mois</button>\n'
               '          </div>\n        </details>',
               "alertes de ma rue")
rempl("alertes", ALERTES,
      ALERTES.replace('<details class="repli">', '<details class="repli" data-veille="commerce">', 1))

# -- onboarding : l'interrupteur de notification
NOTIFOPT = bloc('        <div class="notifopt">', '<button class="sw" id="ob-sw" role="switch" aria-checked="false" aria-label="Recevoir l\'essentiel du jour" onclick="toggleSw(this)"></button>\n        </div>', "notifopt onboarding")
rempl("notifopt", NOTIFOPT, NOTIFOPT.replace('<div class="notifopt">', '<div class="notifopt" data-veille="notifs">', 1))

# -- banniere d'installation : la phrase iOS parle de notifications inexistantes
rempl("banniere-ios",
      ' Nécessaire pour recevoir les notifications sur iOS.', '')

# -- s-debats : l'exemple de synthese DEMO
rempl("debat-demo",
      '        <div class="section-title">Exemple de synthèse — débat d\'entre-deux-tours <span class="demo-tag">DÉMO</span></div>\n'
      '        <div id="debat-synth"></div>',
      '        <div class="section-title">Aucun débat n\'a encore eu lieu</div>\n'
      '        <!-- Doctrine du vide : plutot qu\'un exemple fabrique range au meme gabarit\n'
      '             que les contenus vrais, une phrase et une date. -->\n'
      '        <div class="src-block" style="padding-top:10px;padding-bottom:10px;">\n'
      '          <p style="margin:0;">Le premier résumé paraîtra ici après le débat d\'entre-deux-tours, '
      'entre le 18 avril et le 2 mai 2027. Tant qu\'aucun débat n\'a eu lieu, il n\'y a rien à résumer.</p>\n'
      '        </div>\n'
      '        <div id="debat-synth" hidden></div>')

# -- s-influence : le repli 2 (chiffres AGORA « A RECROISER ») et la renumerotation
LOBBY = bloc('        <details class="repli">\n          <summary><span>2 · Le lobbying, en chiffres</span>',
             'target="_blank" rel="noopener">hatvp.fr ↗</a></div>\n          </div>\n        </details>',
             "repli lobbying")
rempl("lobby", LOBBY, LOBBY.replace('<details class="repli">', '<details class="repli" data-veille="demo">', 1))
rempl("numero-1", '<summary><span>1 · Qui doit déclarer ses intérêts ?</span>',
      '<summary><span>Qui doit déclarer ses intérêts ?</span>')
rempl("numero-3", '<summary><span>3 · Qui finance la vie politique</span>',
      '<summary><span>Qui finance la vie politique</span>')

# -- s-sources : la repartition cible des revenus
MONEY = bloc('            <p style="margin-bottom:6px;">Répartition <b>cible</b> des revenus.',
             '<i style="background:var(--n-70)"></i>Ateliers éducation 10 % · <i style="background:var(--n-86)"></i>Sponsors locaux 5 %\n            </div>',
             "repartition des revenus")
rempl("money", MONEY,
      '            <!-- POURQUOI ce graphique est parti : il chiffrait cinq revenus dont\n'
      '                 aucun n\'existe, et le dernier d\'entre eux ouvrait precisement la\n'
      '                 porte que la charte des refus, douze lignes plus bas, ferme. -->\n'
      '            <p style="margin-bottom:6px;">Aujourd\'hui, <b>Repère n\'a aucun revenu</b> et aucune\n'
      '            structure juridique pour en percevoir. Le projet est financé par son auteur.\n'
      '            Le jour où cela changera, la répartition sera écrite ici, chiffrée et datée.</p>')
rempl("charte-alertes",
      '              <li>Les alertes d\'urgence restent toujours gratuites</li>\n', '')

# -- mentions legales : le paragraphe « Abonnement »
ABO_LEGAL = bloc('            <p style="margin-top:10px;"><b>Abonnement.</b>', '</p>\n            <a class="abo-sec" style="display:block;text-align:center;text-decoration:none;margin-top:14px;"', "abonnement legal")
rempl("abo-legal", ABO_LEGAL,
      '            <p style="margin-top:10px;"><b>Prix.</b> Repère est gratuit, intégralement, dans cette version. '
      'Rien n\'est en vente : aucun paiement n\'est possible, aucun abonnement n\'existe, aucun écran de paiement '
      'n\'est présent dans l\'application. Toute mise en vente future sera précédée de la publication de l\'identité '
      'de l\'éditeur et de son statut juridique, ci-dessus.</p>\n'
      '            <a class="abo-sec" style="display:block;text-align:center;text-decoration:none;margin-top:14px;"')

# -- la page d'accueil (extraite hors de l'application par build_pwa : aucun JavaScript
#    ne peut l'eteindre, il faut la reecrire en dur)
OFFRE_LD = bloc('  <!-- 7 — OFFRE.', '<b>La vente n\'est pas encore ouverte</b> — l\'application le dit aussi à l\'écran.</p>\n  </div>', "bloc offre landing")
rempl("offre-landing", OFFRE_LD,
      '  <!-- 7 — GRATUITE. Ce bloc est EXTRAIT du fichier par build_pwa et publie dans\n'
      '       accueil.html : aucune mise en veille JavaScript ne l\'atteint. Il annoncait\n'
      '       un prix pour un service qu\'aucune structure ne peut vendre. Reecrit en dur. -->\n'
      '  <div class="ld-offre">\n'
      '    <h2 style="font-size:19px;color:#f5f5f7;margin:0 0 8px;">Gratuit. Sans compte. Sans publicité.</h2>\n'
      '    <p style="font-size:14px;line-height:1.6;margin:0 0 10px;">Qui décide, où va votre\n'
      '    argent, comment votre député a voté, le calendrier, le dictionnaire : gratuit, sans\n'
      '    compte, pour les 34 875 communes. <b>Aucune décision, aucun élu, aucun budget et\n'
      '    aucun vote ne passera jamais derrière un paiement.</b></p>\n'
      '    <p style="font-size:14px;line-height:1.6;margin:0;">Repère est aujourd\'hui en bêta fermée.\n'
      '    <b>Rien n\'est en vente</b> : il n\'existe ni abonnement, ni paiement, ni structure pour\n'
      '    encaisser quoi que ce soit. Si cela change un jour, ce sera écrit ici avant de l\'être ailleurs.</p>\n'
      '  </div>')

# -- l'onboarding promettait « sans compte POUR COMMENCER »
rempl("tagline", 'Sans compte pour commencer.', 'Sans compte, et sans rien à payer.')

# -- le bouton « Demander l'ouverture de mon territoire » menait a un ecran sans rapport
rempl("territoire",
      '<button class="src" onclick="showTab(\'s-suivis\',\'Mes suivis\')">Demander l\'ouverture de mon territoire</button>',
      '<a class="src" href="mailto:repere0@protonmail.com?subject=Rep%C3%A8re%20%E2%80%94%20ouverture%20de%20ma%20commune" '
      'target="_blank" rel="noopener">Demander l\'ouverture de ma commune ↗</a>')

# -- s-suivis n'est pas un onglet : showTab() y efface le bouton retour
rempl("suivis-nav-1",
      '<button class="moi-row" onclick="showTab(\'s-suivis\',\'Mes suivis\')">\n'
      '            <span class="ic"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>\n'
      '            <span class="tt"><span class="a">Mes lieux</span>',
      '<button class="moi-row" onclick="show(\'s-suivis\',\'Mes suivis\',true)">\n'
      '            <span class="ic"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>\n'
      '            <span class="tt"><span class="a">Mes lieux</span>')
rempl("suivis-nav-2",
      'onclick="closeSheet2();showTab(\'s-suivis\',\'Mes suivis\')"',
      'onclick="closeSheet2();show(\'s-suivis\',\'Mes suivis\')"')

# -- DEFS : six definitions qui decrivent Stripe, un lien cadeau, des codes partenaires
#    et des notifications, tous inexistants, et dont plus aucun appelant ne subsiste.
DEFS_MORTES = bloc('  prepermission: [', '  methode: ["Notre méthode"', "defs commerciales")
rempl("defs-mortes", DEFS_MORTES,
      '  /* v18.16 — six definitions retirees : prepermission, email, stripe, offrir,\n'
      '     resilier, codepartenaire. Elles decrivaient un tunnel Stripe, un lien cadeau,\n'
      '     des « mediatheques et lycees partenaires » et un digest par courriel : rien de\n'
      '     tout cela n\'existe, et plus aucun appelant ne subsistait apres la mise en veille. */\n'
      '  methode: ["Notre méthode"')

# -- le seul « 34 945 » encore visible (le chiffre juste, denombre au COG 2026, est 34 875)
rempl("communes-defs", 'tous les élus de France — les 34 945 communes',
      'tous les élus de France — les 34 875 communes')

# -- journal public des corrections
rempl("journal",
      '            <div class="fresh"><span>Aucune correction de fait publiée à ce jour.</span><span class="d">journal ouvert</span></div>',
      '            <div class="fresh"><span>Le suivi de la loi sur la fin de vie annonçait une décision du Conseil '
      'constitutionnel « attendue vers le 15 août ». Elle a été rendue le 14 août 2026 (n° 2026-910 DC) : conformité '
      'avec réserves. Corrigé.</span><span class="d">18 août 2026</span></div>\n'
      '            <div class="fresh"><span>Les écrans décrivant une offre payante, un paiement et des réglages de '
      'notification ont été retirés : rien de tout cela n\'existe. Repère est gratuit et n\'encaisse rien.</span>'
      '<span class="d">18 août 2026</span></div>\n'
      '            <div class="fresh"><span>Aucune correction de fait publiée à ce jour.</span><span class="d">journal ouvert</span></div>')

# ===================================================== VERIFICATIONS AVANT ECRITURE
vus = set()
for etiquette, ancien, nouveau in R:
    assert etiquette not in vus, "etiquette dupliquee : %s" % etiquette
    vus.add(etiquette)
    assert src.count(ancien) == 1, "ancre « %s » vue %d fois" % (etiquette, src.count(ancien))
    assert ancien != nouveau, "remplacement vide : %s" % etiquette

out = src
for etiquette, ancien, nouveau in R:
    assert out.count(ancien) == 1, "ancre « %s » perdue en cours de route" % etiquette
    out = out.replace(ancien, nouveau, 1)

# --- l'appel au demarrage, une fois les fonctions definies et le balisage analyse
ANCRE_APPEL = 'document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showTab(t.dataset.s, t.dataset.t)));'
assert out.count(ANCRE_APPEL) == 1
out = out.replace(ANCRE_APPEL, ANCRE_APPEL + "\nappliquerVeille();", 1)

# --- proprietes de sortie
assert out.count('const BETA_RESTREINTE = true;') == 1
assert out.count('data-veille=') == 10, out.count('data-veille=')
assert out.count('appliquerVeille()') == 2
assert "1,99" not in out.split('<div class="ld-offre">')[1].split("</div>")[0], "la page d'accueil affiche encore un prix"
assert "Le prix est ecrit" not in out
assert out.count("34 945") == 4, out.count("34 945")   # ne restent que des commentaires de code
assert "Nécessaire pour recevoir les notifications sur iOS" not in out
assert "OBJECTIF À 3 ANS" not in out
assert out.count('<div class="money-bar"') == 0 and out.count('class="money-leg"') == 0
assert out.count('class="demo-tag">DÉMO</span></div>') == 0
assert 'REPERE_AGENDA_URL = ' not in out
for _e in ["s-abo", "s-paiement", "s-compte-login", "s-compte-gestion", "s-notifs"]:
    assert 'id="%s" data-veille="commerce"' % _e in out, _e
# Il reste UN showTab('s-suivis') : celui de s-compte-gestion, ecran retire du DOM au
# demarrage. On ne le corrige pas pour ne pas donner a croire que cet ecran est vivant.
assert out.count("showTab('s-suivis'") == 1

io.open(CIBLE, "w", encoding="utf-8").write(out)
print("patch 13 applique : %d remplacements, %d -> %d octets"
      % (len(R), len(src.encode("utf-8")), len(out.encode("utf-8"))))
