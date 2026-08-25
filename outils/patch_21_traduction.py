# -*- coding: utf-8 -*-
"""patch_21_traduction.py — traduire les comptes, au lieu de les afficher.

POURQUOI. Le contradicteur d'usage l'a ecrit sans menagement : « les chiffres bruts
(935 545 EUR de recettes, 1 058 EUR/habitant) ne veulent rien dire pour personne ».
Repere se donne pour un TRADUCTEUR ; sur son ecran le plus factuel, il recopiait.

CE QUE FAIT CE PATCH. Cinq phrases, calculees a partir des SEULS montants deja
affiches juste au-dessus. Aucune source nouvelle, aucun telechargement, aucune
comparaison entre territoires.

CE QU'IL NE FAIT PAS, ET POURQUOI :
  - il ne compare RIEN a une autre commune (invariant 3). Tous les rapports
    divisent les chiffres d'un territoire par ses propres chiffres ;
  - il ne juge pas. Une part de salaires elevee n'est pas un gaspillage, une
    annee d'investissement haute n'est pas une gestion dispendieuse : chaque
    phrase porte ce qu'elle ne veut PAS dire ;
  - il ne fait pas passer une division pour une donnee publiee. La carte le dit
    en toutes lettres : « ce ne sont pas des chiffres publies, ce sont des
    divisions » (invariant 4) ;
  - il n'ecrit pas « recettes moins depenses ». L'ecart entre les deux, sur un
    budget principal, se lit avec l'emprunt et les reserves, que le fichier
    embarque ne porte pas. Une phrase du type « elle depense plus qu'elle
    n'encaisse » serait fausse sans cette explication, et l'explication n'a pas
    de source ici. On se tait plutot que d'arrondir ;
  - si moins de deux rapports sont calculables, la carte ne s'affiche pas en
    squelette : elle affiche une phrase (doctrine du vide, invariant 5).

REFACTOR PREALABLE. `ofglBloc` choisissait l'exercice affiche par une boucle
interne. La traduction a besoin du MEME exercice ; recopier la boucle aurait
autorise les deux cartes a parler de deux annees differentes. La boucle est donc
extraite dans `ofglExerciceAffiche(k)`, appelee par les deux.
"""
import io

F = "app_repere_v18_20.html"
src = io.open(F, encoding="utf-8").read()
n0 = len(src)

# =========================================================== 1. le refactor
ancien = '''  const ans = ofglExercices(r);
  const ordre = window.REPERE_OFGL.meta.agregats || [];
  /* Exercice affiche : le plus recent OU CE TERRITOIRE a des donnees. Une centaine
     de communes n'ont pas encore de comptes 2025 definitifs ; on retombe sur 2024
     et on le dit, plutot que de laisser croire a un compte a jour. */
  let an = null, ex = null;
  for (let i = ans.length - 1; i >= 0; i--) {
    const cand = r.ex[ans[i]];
    if (ordre.some((p, j) => ofglVal(cand, j))) { an = ans[i]; ex = cand; break; }
  }
  if (!an) return ofglVide(k, "vide", r.nom);'''
assert src.count(ancien) == 1, "ancre 1 introuvable ou multiple"

nouveau = '''  const ans = ofglExercices(r);
  const ordre = window.REPERE_OFGL.meta.agregats || [];
  const choisi = ofglExerciceAffiche(k);
  if (!choisi) return ofglVide(k, "vide", r.nom);
  const an = choisi.an, ex = choisi.ex;'''
src = src.replace(ancien, nouveau, 1)

# --------------------------------------------- la fonction extraite, posee avant
ancre_avant = "function ofglBloc(k) {"
assert src.count(ancre_avant) == 1, "ancre 2"

extrait = '''/* Exercice affiche : le plus recent OU CE TERRITOIRE a des donnees. Une centaine
   de communes n'ont pas encore de comptes 2025 definitifs ; on retombe sur 2024
   et on le dit, plutot que de laisser croire a un compte a jour.

   EXTRAIT DE ofglBloc LE 25 AOUT : la carte de traduction a besoin du meme
   exercice que le tableau des montants. Recopier la boucle aurait autorise les
   deux cartes a parler de deux annees differentes sans que rien ne le dise. */
function ofglExerciceAffiche(k) {
  const r = ofglTerr(k);
  if (!r) return null;
  const ans = ofglExercices(r);
  const ordre = (window.REPERE_OFGL && window.REPERE_OFGL.meta
                 && window.REPERE_OFGL.meta.agregats) || [];
  for (let i = ans.length - 1; i >= 0; i--) {
    const cand = r.ex[ans[i]];
    if (ordre.some((p, j) => ofglVal(cand, j))) return { r: r, an: ans[i], ex: cand };
  }
  return null;
}

/* ------------------------------------------------------------------ TRADUIRE
   Cinq divisions, et rien d'autre. Chaque phrase porte ce qu'elle ne veut PAS
   dire : c'est la moitie du travail, et c'est celle qui manque partout ailleurs.
   Aucun rapport ne sort du territoire affiche — invariant 3. */
function argPourCent(a, b) { return Math.round(a / b * 100); }

function argRatios(ex) {
  const v = i => ofglVal(ex, i);
  const rec = v(0), dep = v(1), det = v(2), inv = v(3), sal = v(4), imp = v(5);
  const nn = x => (x && typeof x.m === "number" && x.m > 0);
  const out = [];

  if (nn(det) && nn(rec)) {
    const mois = det.m / (rec.m / 12);
    out.push({
      l: "Sa dette",
      v: mois.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
         + " mois de recettes",
      d: "Si la commune consacrait tout ce qu'elle encaisse au remboursement, il lui faudrait "
       + "ce temps-la. Ce n'est pas ce qui se passe : une dette se rembourse sur des annees, et "
       + "un emprunt sert le plus souvent a payer un equipement qui durera plus longtemps que lui. "
       + "Le rapport donne un ordre de grandeur, pas un diagnostic."
    });
  }

  if (nn(sal) && nn(dep)) {
    out.push({
      l: "Sur 100 € depenses",
      v: argPourCent(sal.m, dep.m) + " € de salaires",
      d: "Ce sont les agents qui tiennent l'ecole, la cantine, l'etat civil, les espaces verts. "
       + "Une part elevee n'est pas un gaspillage : c'est souvent le signe d'une commune qui rend "
       + "ses services elle-meme plutot que de les acheter a l'exterieur."
    });
  }

  if (nn(inv) && nn(dep)) {
    out.push({
      l: "Sur 100 € depenses",
      v: argPourCent(inv.m, dep.m) + " € d'investissement",
      d: "L'investissement, ce sont les travaux et les equipements : une ecole, une voirie, une "
       + "salle. Cette part bouge beaucoup d'une annee a l'autre — haute l'annee d'un chantier, "
       + "basse ensuite. Une seule annee ne dit rien d'une tendance."
    });
  }

  if (nn(imp) && nn(rec)) {
    const p = argPourCent(imp.m, rec.m);
    out.push({
      l: "Sur 100 € encaisses",
      v: p + " € d'impots et taxes",
      d: "Les " + (100 - p) + " € restants viennent d'ailleurs : dotations versees par l'Etat, "
       + "subventions d'autres collectivites, sommes payees par les usagers de certains services. "
       + "Repere ne detaille pas cette composition — le fichier embarque ne la porte pas."
    });
  }

  if (nn(dep)) {
    out.push({
      l: "Ce qu'elle depense",
      v: ofglNb(dep.m / 365) + " € par jour",
      d: "Moyenne sur l'annee, pas un rythme reel : les depenses d'une commune sont tres "
       + "irregulieres. C'est une facon de rendre un total annuel imaginable, rien de plus."
    });
  }

  return out;
}

function argTraduction(k) {
  if (!OFGL_ECH[k]) return "";
  const choisi = ofglExerciceAffiche(k);
  if (!choisi) return "";
  const lignes = argRatios(choisi.ex);
  const c = OFGL_ECH_COULEUR[k] || "var(--c-region-aplat)";
  /* Doctrine du vide : sous deux rapports, la carte n'a rien a traduire. On ecrit
     la phrase et on s'arrete — surtout pas une carte a moitie remplie. */
  if (lignes.length < 2) {
    return '<div class="arg-card" style="border-left-color:' + c + ';">'
      + '<div class="ig-vide"><b>Pas assez de montants pour traduire ces comptes.</b>'
      + 'Les rapports ci-dessous se calculent a partir de plusieurs lignes a la fois ; '
      + 'pour l\\'exercice ' + ofglEsc(choisi.an) + ', le fichier officiel n\\'en porte pas assez. '
      + 'Les montants disponibles restent affiches au-dessus, tels que la source les publie.</div>'
      + '</div>';
  }
  return '<div class="arg-card" style="border-left-color:' + c + ';">'
    + '<div class="arg-h"><div><div class="arg-t" style="color:' + c + ';">Ce que ces chiffres veulent dire</div>'
    + '<div class="arg-s">Les memes comptes, exercice ' + ofglEsc(choisi.an) + ', rapportes les uns aux autres</div></div></div>'
    + lignes.map(function (o) {
        return '<div class="arg-row">'
          + '<div class="arg-l"><span>' + o.l + '</span><b>' + o.v + '</b></div>'
          + '<div class="arg-d">' + o.d + '</div>'
          + '</div>';
      }).join("")
    + '<p class="tx-note"><b>Ce ne sont pas des chiffres publies : ce sont des divisions.</b> '
    + 'Repere les calcule a partir des montants affiches juste au-dessus, qui viennent, eux, du '
    + 'fichier officiel. Aucun de ces rapports ne compare ce territoire a un autre : ils ne divisent '
    + 'que ses propres montants entre eux, et aucun ne dit si c\\'est bien ou mal.</p>'
    + '</div>';
}

'''
src = src.replace(ancre_avant, extrait + ancre_avant, 1)

# ================================================== 2. la carte entre dans l'ecran
a3 = '''    document.getElementById("arg-body").innerHTML =
      ofglBloc(argKey) + argComparatif() + renderArgentLocal();'''
assert src.count(a3) == 1, "ancre 3"
b3 = '''    /* La traduction vient JUSTE APRES les montants et AVANT le comparatif :
       on lit un chiffre, puis ce qu'il veut dire, avant de passer aux echelons. */
    document.getElementById("arg-body").innerHTML =
      ofglBloc(argKey) + argTraduction(argKey) + argComparatif() + renderArgentLocal();'''
src = src.replace(a3, b3, 1)

# --------------------------------------------------------------- garde-fous
assert src.count("function ofglExerciceAffiche") == 1
assert src.count("function argTraduction") == 1
assert src.count("argTraduction(argKey)") == 1
for mot in ("bien gere", "mal gere", "moyenne nationale", "comparee a", "classement"):
    assert mot not in extrait, "vocabulaire interdit : " + mot
assert "’" not in extrait, "apostrophe typographique dans le code ecrit"

io.open(F, "w", encoding="utf-8").write(src)
print("patch 21 applique : %d -> %d octets" % (n0, len(src)))
