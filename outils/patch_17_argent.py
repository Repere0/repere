#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch 17 — LOT 2 : l'ecran de l'argent cesse d'etre vide partout.

TROIS DEFAUTS MESURES, et trois corrections separees.

1. ARGENT_SERIE etait declare vide et jamais ecrit : le graphique d'evolution affichait
   son etat vide POUR LES 34 875 COMMUNES, pose sur 8,42 Mo de comptes reels deja
   embarques. Ce n'etait pas un manque de donnees, c'etait un cablage absent. Il est
   desormais rempli depuis OFGL, pour le territoire affiche, agregat « Depenses
   totales », en euros par habitant.

2. ARGENT_CMP, meme chose. Mais ici on NE FORCE PAS l'affichage : la comparaison exige
   les cinq echelons, et deux manquent structurellement — l'intercommunalite (absente du
   fichier OFGL embarque) et l'Etat (aucun montant par habitant comparable dans les
   donnees). La regle « cinq ou rien » est juste et on la garde : quatre barres et un
   trou ne comparent rien, elles font passer l'echelon manquant pour un echelon qui ne
   depense rien. Ce qui change, c'est la PHRASE : elle disait « pas encore releves pour
   Ustaritz », ce qui fait porter a la commune un manque qui n'est pas le sien. Elle
   nomme maintenant les deux echelons qui manquent, et pourquoi.

3. L'intercommunalite etait escamotee de la rangee des echelons : `ordre` valait
   ["ville","dept","region","etat"]. L'onboarding annonce pourtant cinq niveaux, la
   couleur de l'agglo est figee dans la palette, et deux questions du jeu y renvoient.
   Un echelon qu'on retire sans un mot, c'est exactement ce que la doctrine du vide
   interdit. Il revient, avec la phrase qui dit ce qui manque et le lien officiel.
"""
import sys, io

CIBLE = sys.argv[1]
src = io.open(CIBLE, encoding="utf-8").read()
R = []

# ------------------------------------------------------- 1 et 2 : le remplissage
ANCRE = "function argSerie() {"
assert src.count(ANCRE) == 1
BLOC = '''/* Remplit ARGENT_CMP et ARGENT_SERIE depuis les comptes OFGL embarques, pour le
   territoire actuellement choisi. Appele a chaque rendu de l'ecran : la commune peut
   changer entre deux affichages.
   AGREGAT RETENU : « Depenses totales », indice 1 de meta.agregats. C'est le seul qui
   reponde a la question posee par l'ecran — « ou va mon argent » — et le seul qui ait
   le meme sens aux trois echelons. */
var ARG_AGREGAT = 1;

function argRemplir() {
  ARGENT_SERIE.length = 0;
  Object.keys(ARGENT_CMP).forEach(function (k) { delete ARGENT_CMP[k]; });
  if (typeof ofglTerr !== "function" || typeof ofglVal !== "function") return;

  ["ville", "dept", "region"].forEach(function (k) {
    var r = null;
    try { r = ofglTerr(k); } catch (e) { r = null; }
    if (!r) return;
    var ans = ofglExercices(r);
    for (var i = ans.length - 1; i >= 0; i--) {
      var v = ofglVal(r.ex[ans[i]], ARG_AGREGAT);
      if (v && typeof v.hab === "number") {
        ARGENT_CMP[k] = { hab: v.hab, an: ans[i] };
        break;
      }
    }
  });

  /* L'evolution porte sur l'echelon AFFICHE, et sur lui seul : comparer une commune a
     elle-meme n'est pas un classement, la comparer a une autre en serait un. */
  var rk = (typeof argKey === "string" && OFGL_ECH[argKey]) ? argKey : "ville";
  var rr = null;
  try { rr = ofglTerr(rk); } catch (e) { rr = null; }
  if (rr) {
    ofglExercices(rr).forEach(function (a) {
      var v = ofglVal(rr.ex[a], ARG_AGREGAT);
      if (v && typeof v.hab === "number") ARGENT_SERIE.push([a, v.hab]);
    });
  }
}

function argSerie() {'''
R.append(("remplissage", ANCRE, BLOC))

# ------------------------------------------- la phrase de l'etat vide du comparatif
ANCIEN_V = ("        : '<div class=\"ig-vide\"><b>Montants pas encore relevés pour ' + lieu + '.</b>'\n"
            "        + 'Repère n\\'affiche la comparaison que lorsque les cinq échelons sont connus : quatre chiffres et un trou '\n"
            "        + 'ne comparent rien, ils font passer l\\'échelon manquant pour un échelon qui ne dépense rien. '\n"
            "        + 'En attendant, le lien ci-dessous donne accès aux comptes officiels.</div>')")
assert src.count(ANCIEN_V) == 1, "la phrase de l'etat vide a change"
NOUVEAU_V = ("        : '<div class=\"ig-vide\"><b>Deux échelons sur cinq manquent encore.</b>'\n"
             "        + 'Les comptes de votre commune, de votre département et de votre région sont là. '\n"
             "        + 'Manquent <b>l\\'intercommunalité</b>, absente du fichier des comptes que Repère embarque, '\n"
             "        + 'et <b>l\\'État</b>, dont aucun montant par habitant comparable ne figure dans ces données. '\n"
             "        + 'Repère n\\'affiche la comparaison que lorsque les cinq échelons sont connus : quatre barres et un trou '\n"
             "        + 'ne comparent rien, ils font passer l\\'échelon manquant pour un échelon qui ne dépense rien. '\n"
             "        + 'Le lien ci-dessous donne accès aux comptes officiels, tous échelons compris.</div>')")
R.append(("phrase-vide", ANCIEN_V, NOUVEAU_V))

# --------------------------------------------------- l'appel au rendu de l'ecran
ANCIEN_R = ("function renderArgent() {\n"
            "  const ch = document.getElementById(\"arg-chips\"); if (!ch) return;\n"
            "  const ordre = [\"ville\", \"dept\", \"region\", \"etat\"];")
assert src.count(ANCIEN_R) == 1
NOUVEAU_R = ("function renderArgent() {\n"
             "  const ch = document.getElementById(\"arg-chips\"); if (!ch) return;\n"
             "  if (typeof argRemplir === \"function\") argRemplir();\n"
             "  /* v18.20 — l'agglo revient dans la rangee. Elle en avait ete retiree sans un mot,\n"
             "     alors que l'accueil annonce cinq niveaux, que sa couleur est figee dans la\n"
             "     palette et que deux questions du jeu y renvoient. Un echelon escamote est\n"
             "     exactement ce que la doctrine du vide interdit : il revient, et il dit ce qui\n"
             "     manque. */\n"
             "  const ordre = [\"ville\", \"agglo\", \"dept\", \"region\", \"etat\"];")
R.append(("ordre", ANCIEN_R, NOUVEAU_R))

# ------------------------------------------------------- l'echelon agglo lui-meme
ANCRE_A = "function renderArgent() {"
NOUVEAU_A = '''/* L'intercommunalite : declaree pour exister dans la rangee, et honnete sur ce qu'elle
   n'a pas. Le fichier OFGL embarque ne porte que les communes, les departements et les
   regions ; les comptes des groupements existent, ils ne sont pas encore collectes. */
if (typeof ARGENT === "object" && ARGENT && !ARGENT.agglo) {
  ARGENT.agglo = { label: "Mon agglo", couleur: "var(--c-agglo-aplat)",
                   unite: "€ par habitant", lignes: [], confiance: "a_confirmer",
                   quoi: "L'intercommunalité gère souvent les transports, les déchets, l'eau et l'assainissement." };
}

function argAggloVide() {
  var t = (typeof terr === "function") ? terr() : {};
  var nom = t.agglo || "votre intercommunalité";
  return '<div class="arg-card" style="border-left-color:var(--c-agglo-aplat);">'
    + '<div class="ig-vide"><b>Les comptes de ' + nom + ' ne sont pas encore collectés.</b>'
    + 'Ils existent : l\\'Observatoire des finances locales publie les comptes des groupements '
    + 'de communes comme ceux des communes. Repère n\\'embarque aujourd\\'hui que les communes, '
    + 'les départements et les régions. Tant que ce n\\'est pas fait, cet échelon reste vide '
    + 'plutôt que rempli avec autre chose.</div>'
    + '<div class="ig-src"><span>Comptes des collectivités (DGFiP) · Observatoire des finances '
    + 'et de la gestion publique locales</span>'
    + '<a href="https://data.ofgl.fr/" target="_blank" rel="noopener">Voir à la source ↗</a></div>'
    + '</div>';
}

function renderArgent() {'''
assert src.count(ANCRE_A) == 1
R.append(("agglo-vide", ANCRE_A, NOUVEAU_A))

# --------------------------------------- l'aiguillage vers l'etat vide de l'agglo
ANCIEN_B = ("  if (OFGL_ECH[argKey]) {\n"
            "    document.getElementById(\"arg-body\").innerHTML =\n"
            "      ofglBloc(argKey) + argComparatif() + renderArgentLocal();\n"
            "    return;\n"
            "  }")
assert src.count(ANCIEN_B) == 1
NOUVEAU_B = ("  if (argKey === \"agglo\") {\n"
             "    document.getElementById(\"arg-body\").innerHTML = argAggloVide() + argComparatif();\n"
             "    return;\n"
             "  }\n"
             "  if (OFGL_ECH[argKey]) {\n"
             "    document.getElementById(\"arg-body\").innerHTML =\n"
             "      ofglBloc(argKey) + argComparatif() + renderArgentLocal();\n"
             "    return;\n"
             "  }")
R.append(("aiguillage", ANCIEN_B, NOUVEAU_B))

# --------------------------------------------------------------- verifications
for etiquette, ancien, nouveau in R:
    assert src.count(ancien) == 1, "ancre « %s » vue %d fois" % (etiquette, src.count(ancien))
    assert "’" not in nouveau, "apostrophe typographique dans « %s »" % etiquette

out = src
for etiquette, ancien, nouveau in R:
    out = out.replace(ancien, nouveau, 1)
assert out != src
assert out.count("function argRemplir") == 1
assert out.count("function argAggloVide") == 1
assert out.count('const ordre = ["ville", "agglo", "dept", "region", "etat"]') == 1
assert "Montants pas encore relevés pour" not in out
io.open(CIBLE, "w", encoding="utf-8").write(out)
print("patch 17 applique : %d -> %d octets" % (len(src.encode()), len(out.encode())))
