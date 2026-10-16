#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le logo de Repere et ses declinaisons de marque — 16/10/2026.

DECISION DU PORTEUR (16/10/2026) : fond blanc, mairie noire, sans repere ni
accent au-dessus du batiment, et un tapis bleu-blanc-rouge qui mene aux marches.
C'est la SEULE exception a l'invariant 7 (palette gelee) : le bleu, le blanc et le
rouge du tapis sont reserves au logo et a ses declinaisons de marque (icone,
icone adaptative Android, ecran de lancement, favicon), jamais a l'interface ni a
une information. La garde est dans mono/tests/invariants.test.mjs.

LES COULEURS DU TAPIS sont declarees UNE fois, dans
mono/packages/data-utils/src/invariants.js (TRICOLORE_MARQUE). Ce script les
recopie, et le controle « le tricolore reste dans la marque » echoue si les deux
divergent. Valeurs : celles couramment employees pour representer le drapeau
(bleu #002395, rouge #ED2939), et NON celles de la charte de l'Etat (DSFR,
« bleu France », « rouge Marianne ») : Repere n'est pas un service de l'Etat et
ne doit pas en emprunter l'identite.

USAGE (depuis la racine du depot, Pillow requis) :
    python3 outils/marque_repere.py
Ecrit mono/apps/mobile/assets/{icon,android-icon-foreground,
android-icon-background,android-icon-monochrome,splash-icon,favicon}.png.
Le dessin est fait a 4x puis reduit : bords nets a toutes les tailles.
"""
import os
from PIL import Image, ImageDraw

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, "mono", "apps", "mobile", "assets")

# Recopie de TRICOLORE_MARQUE (invariants.js) : la garde compare les deux.
BLEU = "#002395"
BLANC = "#ffffff"
ROUGE = "#ed2939"
# Neutres de l'application (lib/theme.ts) : encre et fond blanc.
ENCRE = "#171614"
FOND = "#ffffff"

SUR = 4          # sur-echantillonnage
COTE = 1024      # cote de reference du dessin


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def dessiner(d, k, dx, dy, encre, tapis):
    """Mairie et tapis, coordonnees de reference 1024, mises a l'echelle k et
    decalees de (dx, dy) en pixels de sortie sur-echantillonnes."""
    P = lambda x, y: (dx + x * k, dy + y * k)
    R = lambda x0, y0, x1, y1: [P(x0, y0), P(x1, y1)]
    # fronton
    d.polygon([P(212, 342), P(812, 342), P(512, 162)], fill=encre)
    # entablement
    d.rectangle(R(212, 342, 812, 382), fill=encre)
    # quatre colonnes
    for x in (284, 416, 548, 680):
        d.rectangle(R(x, 398, x + 60, 612), fill=encre)
    # deux marches
    d.rectangle(R(188, 612, 836, 640), fill=encre)
    d.rectangle(R(164, 640, 860, 684), fill=encre)
    # le tapis : un trapeze en perspective, trois bandes verticales
    haut, bas = 684, 862
    xh0, xh1 = 330, 694          # bord haut, sous la derniere marche
    xb0, xb1 = 160, 864          # bord bas, elargi
    th = [xh0 + (xh1 - xh0) * i / 3 for i in range(4)]
    tb = [xb0 + (xb1 - xb0) * i / 3 for i in range(4)]
    for i, c in enumerate(tapis):
        if c is None:
            continue
        d.polygon([P(th[i], haut), P(th[i + 1], haut), P(tb[i + 1], bas), P(tb[i], bas)], fill=c)
    return P, th, tb, haut, bas


def contour_tapis(d, P, th, tb, haut, bas, encre, largeur):
    d.line([P(th[0], haut), P(tb[0], bas), P(tb[3], bas), P(th[3], haut)], fill=encre, width=largeur, joint="curve")


def image(cote, fond, echelle=1.0, mono=False):
    n = cote * SUR
    im = Image.new("RGBA", (n, n), fond)
    d = ImageDraw.Draw(im)
    k = n / COTE * echelle
    dx = dy = (n - COTE * k) / 2
    encre = (255, 255, 255, 255) if mono else rgb(ENCRE) + (255,)
    if mono:
        # Icone monochrome (Android 13+, theme du telephone) : une silhouette d'une seule
        # couleur. Le tapis est dit par trois bandes separees d'un jour.
        P, th, tb, haut, bas = dessiner(d, k, dx, dy, encre, (encre, None, encre))
        d.polygon([P(th[1] + 6, haut), P(th[2] - 6, haut), P(tb[2] - 6, bas), P(tb[1] + 6, bas)], fill=encre)
    else:
        P, th, tb, haut, bas = dessiner(d, k, dx, dy, encre, (rgb(BLEU) + (255,), rgb(BLANC) + (255,), rgb(ROUGE) + (255,)))
        # un trait d'encre fin autour du tapis : la bande blanche se lit sur le fond blanc
        contour_tapis(d, P, th, tb, haut, bas, encre, max(2, int(6 * k)))
    return im.resize((cote, cote), Image.LANCZOS)


def ecrire(nom, im, mode):
    chemin = os.path.join(SORTIE, nom)
    (im.convert(mode) if mode == "RGB" else im).save(chemin, optimize=True)
    print("ecrit", os.path.relpath(chemin, RACINE), im.size, mode)


def principal():
    blanc = rgb(FOND) + (255,)
    transparent = (0, 0, 0, 0)
    ecrire("icon.png", image(1024, blanc), "RGB")
    # Android adaptatif : le dessin tient dans la zone sure (cercle de 66/108 du cote),
    # avec une marge (mesure du 16/10 : 310 px de rayon pour 313 a l'echelle 0,62).
    ecrire("android-icon-foreground.png", image(1024, transparent, echelle=0.58), "RGBA")
    ecrire("android-icon-background.png", Image.new("RGB", (1024, 1024), rgb(FOND)), "RGB")
    ecrire("android-icon-monochrome.png", image(1024, transparent, echelle=0.58, mono=True), "RGBA")
    ecrire("splash-icon.png", image(1024, transparent, echelle=0.9), "RGBA")
    # 192 x 192 : la taille attendue pour le web (favicon et ecran d'accueil).
    ecrire("favicon.png", image(192, blanc), "RGB")


if __name__ == "__main__":
    principal()
