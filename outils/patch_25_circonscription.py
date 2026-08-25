# -*- coding: utf-8 -*-
"""patch_25_circonscription.py — dire dans quelle circonscription on vote.

LE TROU QUE CA BOUCHE. La carte « Deputes et senateurs » affiche aujourd'hui les
NEUF parlementaires des Pyrenees-Atlantiques a un habitant d'Ustaritz, sans un
mot sur celui qui le represente. La chaine annoncee par le produit — du conseil
municipal a l'Assemblee — s'arretait la, pour 34 636 communes sur 34 637 : la
table CIRCOS ecrite a la main dans le fichier en couvrait une seule.

CE QUE CE PATCH DIT, ET CE QU'IL REFUSE DE DIRE :
  - il dit la circonscription : « Ustaritz vote dans la 6e circonscription des
    Pyrenees-Atlantiques ». C'est un fait, il est sourcable, et la plupart des
    gens l'ignorent ;
  - il ne NOMME PAS le depute. Le rattachement d'un depute a un numero de
    circonscription n'est pas dans le Repertoire national des elus (mesure du
    25/08/2026 : ses 577 lignes « Depute » portent un departement, un nom, une
    fonction, rien d'autre). Nommer quelqu'un au jugé serait faux une fois sur
    six dans ce departement. On dit le fait qu'on a, et on ecrit qu'il manque
    l'autre ;
  - pour une commune partagee — Paris 18, Marseille 7, Toulouse 5 — il les
    affiche TOUTES et dit pourquoi il ne choisit pas : choisir demanderait
    l'adresse, que Repere ne demande pas. C'est la seule reponse honnete, et
    elle explique au passage quelque chose de vrai sur le decoupage ;
  - pour les onze communes nouvelles absentes du fichier de 2017, il dit que le
    fichier ne les porte pas — surtout pas qu'elles n'ont pas de circonscription.
    Deux vides differents, deux phrases differentes (invariant 5).
"""
import io

F = "app_repere_v18_20.html"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

# --------------------------------------------------- 1. le module de lecture
ancre = "function rneQuiCarte(couleur, titre, tete, liste, sousTitre, opts){"
assert s.count(ancre) == 1, "ancre 1 introuvable ou multiple"

module = '''/* ------------------------------------------------ CIRCONSCRIPTIONS
   Bloc window.REPERE_CIRCOS, pose par outils/circos_injecter.py. Absent = le
   module se tait : aucune phrase, aucun encadre vide. */
function circoOk() {
  return !!(window.REPERE_CIRCOS && window.REPERE_CIRCOS.communes);
}
/* 1re, 2e, 3e... « 1er » serait faux : on dit LA circonscription. */
function circoOrdinal(n) { return n === 1 ? "1re" : (n + "e"); }

function circoDe(insee) {
  if (!circoOk() || !insee) return null;
  const C = window.REPERE_CIRCOS;
  const v = C.communes[insee];
  if (v === undefined) {
    const sc = C.sans_circonscription || {};
    return (insee in sc) ? { absente: true, nom: sc[insee] } : null;
  }
  const l = (typeof v === "number") ? [v] : v.slice();
  return { n: l, partagee: l.length > 1 };
}

function circoMention() {
  const C = window.REPERE_CIRCOS || {};
  return (C.source || "") + (C.licence ? " — " + C.licence : "")
       + (C.decoupage ? " — decoupage de " + C.decoupage : "");
}

/* La phrase affichee en tete de la carte des parlementaires. Trois etats, trois
   phrases : une circonscription, plusieurs, ou un fichier qui ne porte pas la
   commune. Le quatrieme etat — pas de bloc du tout — ne produit rien. */
function circoPhrase(insee, nomCommune, nomTerritoire) {
  const r = circoDe(insee);
  if (!r) return "";
  const ou = nomTerritoire ? " " + (/^[AEIOUY]/i.test(nomTerritoire) ? "d'" : "des ") + nomTerritoire : "";
  const com = rneEsc(nomCommune || "Votre commune");
  if (r.absente) {
    return "<b>" + com + " n'est pas dans le decoupage electoral que Repere embarque.</b> "
      + "Ce decoupage date de 2010 et le fichier du ministere de 2017 : les communes "
      + "nouvelles creees depuis n'y figurent pas encore. Sa circonscription existe ; "
      + "ce fichier ne la porte pas.";
  }
  if (r.partagee) {
    return "<b>" + com + " est partagee entre " + r.n.length + " circonscriptions legislatives</b> ("
      + r.n.map(circoOrdinal).join(", ") + ou + "). Laquelle est la votre depend de votre "
      + "adresse — Repere ne la demande pas, et ne la devinera pas.";
  }
  return "<b>" + com + " vote dans la " + circoOrdinal(r.n[0]) + " circonscription" + ou + ".</b> "
    + "Repere ne peut pas encore dire lequel de ces parlementaires y a ete elu : ce lien "
    + "n'existe pas dans le Repertoire national des elus, et il ne sera pas devine.";
}

'''
s = s.replace(ancre, module + ancre, 1)

# ------------------------------------- 2. la phrase entre dans la carte « nat »
a2 = '''    rneNat = rneQuiCarte("var(--c-france-aplat)",
      "Députés et sénateurs" + (terrNat ? " — " + rneEsc(terrNat) : ""), lst[0], lst,
      "Autres parlementaires du territoire");'''
assert s.count(a2) == 1, "ancre 2 introuvable ou multiple"
b2 = '''    /* La circonscription en tete de carte : c'est le seul endroit de l'ecran ou
       « qui decide chez moi » descend jusqu'au niveau national. */
    const circoTxt = (typeof circoPhrase === "function")
      ? circoPhrase(STATE.insee, nom, terrNat) : "";
    rneNat = rneQuiCarte("var(--c-france-aplat)",
      "Députés et sénateurs" + (terrNat ? " — " + rneEsc(terrNat) : ""), lst[0], lst,
      "Autres parlementaires du territoire", circoTxt ? { intro: circoTxt } : undefined);'''
s = s.replace(a2, b2, 1)

# ------------------------------------------------------------- garde-fous
assert s.count("function circoPhrase") == 1
assert s.count("circoPhrase(STATE.insee, nom, terrNat)") == 1
assert "’" not in module, "apostrophe typographique dans le code ecrit"
for interdit in ("votre depute est", "Votre depute :"):
    assert interdit not in module, "le module nomme un depute : " + interdit

io.open(F, "w", encoding="utf-8").write(s)
print("patch 25 : %d -> %d caracteres" % (n0, len(s)))
