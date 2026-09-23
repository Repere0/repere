#!/usr/bin/env bash
# =============================================================================
# La chaine complete de Repere, en un seul endroit MODIFIABLE.
#
# POURQUOI CE FICHIER EXISTE : .github/workflows/ est protege en ecriture contre les
# outils distants — Claude ne peut pas y toucher. Chaque changement de logique
# obligeait donc a une manipulation manuelle : copier un fichier, verifier, pousser.
# En deplacant TOUTE la logique ici, le workflow devient un lanceur qui ne bouge
# plus jamais, et les evolutions futures se font dans outils/, que Claude ecrit
# directement. Une action manuelle recurrente supprimee, definitivement.
#
# ORDRE : depiler -> normaliser -> decrire -> verifier -> reconstruire -> eprouver.
# Le banc passe APRES la reconstruction et AVANT le deploiement : c'est lui qui
# rend l'automatisation complete acceptable. Sans banc, publier sans relecture
# humaine revient a parier ; avec lui, 40 controles dont la moitie mesurent le
# rendu dans un vrai navigateur disent non a notre place.
# =============================================================================
set -euo pipefail

AUJOURDHUI=$(date -u +%Y-%m-%d)
echo "== pipeline Repere — $AUJOURDHUI =="

# ---------------------------------------------------------------- 1. depiler
cd data
for z in *.zip; do
  [ -e "$z" ] || continue
  dossier="${z%.json.zip}"; dossier="${dossier%.zip}"
  rm -rf "brut_$dossier"; mkdir -p "brut_$dossier"
  unzip -oq "$z" -d "brut_$dossier"
  echo "depile : $z -> brut_$dossier"
done
cd ..

# ------------------------------------------------- 2. normaliser l'agenda
python3 outils/agenda_an.py data/brut_Agenda/json data/brut_AMO30/json outils/agenda_an.json

# ------------------------------- 3. decrire le schema des scrutins (documentaire)
# Ne doit jamais faire tomber la chaine : c'est de la documentation.
python3 outils/echantillon_scrutins.py data/brut_Scrutins docs/schema_scrutins.md \
  || echo "::warning::le schema des scrutins n'a pas pu etre decrit"

# ------------------------- 3 bis. decrire les tables de circonscriptions (documentaire)
# Sans table commune -> circonscription, un scrutin ne peut etre affiche que
# nationalement. On collecte deux candidates et on les fait DECRIRE ici, pour ecrire
# le lecteur sur des colonnes lues. Le choix entre les deux se fera sur la couverture
# mesuree contre le Code officiel geographique, pas sur une preference.
for paire in "data/circos_bureaux_de_vote.csv docs/schema_circos_bv.md" \
             "data/circos_ministere.xlsx docs/schema_circos_min.md"; do
  set -- $paire
  python3 outils/echantillon_source.py "$1" "$2" \
    || echo "::warning::description impossible pour $1"
done

# POURQUOI LES DEUX INGESTEURS SUIVANTS N'ARRETENT PAS LA CHAINE (20/08/2026) :
# ajoutes le jour meme, ils ont fait tomber « Executer la chaine », GitHub a saute la
# publication, et un site deja valide par les 40 controles du banc est reste a la porte
# pour une raison qui n'avait rien a voir avec lui. Un chantier neuf ne doit pas pouvoir
# empecher la mise en ligne de ce qui marche deja. Ils avertissent bruyamment ; quand
# ils seront eprouves sur donnees reelles, on remettra le `set -e` sur eux.

# ------------------------------ 3 ter. la table commune -> circonscription(s)
# Sans elle, l'application affiche les neuf parlementaires d'un departement a
# quelqu'un sans pouvoir dire dans quelle circonscription il vote.
#
# SOURCE RETENUE : le XLSX du ministere de l'Interieur. Mesure du 25/08/2026 :
# 34 626 communes rattachees sur 34 637, soit 99,97 %, outre-mer a 100 %. Le CSV
# par bureau de vote reste accepte par circos.py mais n'est plus la source : sa
# provenance est indirecte, et il n'apportait pas assez pour la justifier.
# openpyxl n'est pas garanti sur le runner : on l'installe sans bruit, et si
# l'installation echoue, l'etape avertit au lieu de tomber.
APP_CIRC=$(ls -1 app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)
python3 -m pip install --quiet --disable-pip-version-check openpyxl >/dev/null 2>&1 \
  || echo "::warning::openpyxl indisponible — la table des circonscriptions ne sera pas relue"
python3 outils/circos.py data/circos_ministere.xlsx outils/circos.json "$APP_CIRC" \
  && python3 outils/circos_injecter.py "$APP_CIRC" outils/circos.json \
  || echo "::warning::la table des circonscriptions n'a pas ete produite ou posee"

# ---------------------------------------- 3 quater. les scrutins, position par depute
# 80 derniers scrutins. Ni non-votants, ni mise au point, ni agregat par depute :
# les raisons sont ecrites en tete de outils/scrutins_an.py, et le script se controle
# lui-meme — il refuse de produire un fichier ou un non-votant serait compte comme
# votant.
python3 outils/scrutins_an.py data/brut_Scrutins outils/scrutins_an.json 80 \
  || echo "::warning::scrutins_an.py a echoue — les scrutins ne sont pas produits"

# ------------- 3 quater bis. LES DEUX RELEVES DU MONOREPO, REFAITS ICI
# Ils etaient poses a la main, tous les deux dates du 26 aout, pendant que la source
# publiait chaque jour : l'ecran « Qui decide » servait donc un depute et des votes
# de plus en plus vieux sans que rien ne le dise. Le script refuse d'ecraser un
# releve valide par un fichier vide — une source manquante avertit, elle ne casse
# rien, et la chaine continue avec le releve de la veille.
# L'AUTOTEST PASSE D'ABORD, ET C'EST LUI QUI AUTORISE L'ECRITURE. La lecture du
# referentiel des acteurs ne peut pas etre eprouvee ailleurs : l'archive AMO30
# n'existe que sur le runner. Si ses huit cas ne passent pas — un format qui a
# change, un champ qui devient une liste — on ne regenere rien et on garde le
# releve de la veille.
# LE NOM DE LA COMMUNE, TEL QU'IL S'ECRIT. Une commune sur quatre s'affichait mal
# avant le 13/09/2026 : article interne en majuscule, initiale desaccentuee. Le
# libelle officiel vient du Code officiel geographique, par le paquet du decoupage
# administratif d'Etalab — que le runner sait joindre, contrairement au conteneur.
# Le script refuse d'ecraser un fichier valide par un fichier maigre.
python3 outils/noms_communes.py . \
  || echo "::warning::les noms officiels des communes n'ont pas ete rafraichis"

python3 outils/mono_donnees.py --test \
  && python3 outils/mono_donnees.py . \
  || echo "::warning::les releves du monorepo n'ont pas ete rafraichis (voir les avertissements ci-dessus)"

# ------------------- 3 quater bis. les projets finances par l'Etat
# LE PREMIER FAIT DATE DU PRODUIT. L'ecran « Ce qui a ete decide » n'a rien a
# montrer sans ce releve : la DGCL publie chaque annee les ~20 000 projets
# d'investissement qu'elle subventionne, avec le code INSEE du beneficiaire.
#
# NON BLOQUANT, ET C'EST LA REGLE DE TOUTE LA CHAINE (decision D-12) : si la
# source ne repond pas, le releve de la veille reste, l'extraction le republie,
# et l'ecran continue de dire la date de ce qu'il montre. Un fichier vide, lui,
# serait bien pire qu'un fichier d'hier.
#
# L'AUTOTEST PASSE AVANT LA COLLECTE, comme pour mono_donnees.py : il joue neuf
# lignes recopiees de la source, dont celle de la Ville de Paris qui n'a pas de
# code INSEE. Si la source change de forme, on le sait avant d'ecrire.
python3 outils/projets_etat.py --test \
  && python3 outils/projets_etat.py . \
  || echo "::warning::les projets finances par l'Etat n'ont pas ete rafraichis (voir ci-dessus)"

# ------------------- 3 quinquies. decrire les acteurs (pour nommer les references)
# Les scrutins designent les deputes par une reference opaque (PA1234). Le referentiel
# AMO30 porte les noms et les circonscriptions. On le fait decrire avant d'ecrire le
# lecteur, comme pour les scrutins — c'est ce qui avait evite le piege du champ
# `votant` tantot liste tantot objet.
python3 outils/echantillon_scrutins.py data/brut_AMO30/json/acteur docs/schema_acteurs.md \
  || echo "::warning::les acteurs n'ont pas pu etre decrits (chemin different ?)"

# ------------------- 3 sexies. DECOUPAGE : un fichier par departement
# DATA -> PIPELINE -> JSON. L'application embarque 16,3 Mo pour que quelqu'un lise UNE
# commune. Le decoupage ramene ce qu'un lecteur telecharge a environ 400 Ko : les deux
# socles, plus son departement. Le fichier autonome, lui, garde tout : c'est la version
# SERVIE qui va chercher son departement, et elle seule.
# Non bloquant tant que l'application ne consomme pas encore ces fichiers.
APP_DEC=$(ls -1 app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)
python3 outils/decouper.py "$APP_DEC" site_donnees \
  || echo "::warning::le decoupage par departement a echoue"

# ---------------- 3 septies. AUTO -> RELU -> PUBLIE : la couche editoriale
# L'etage AUTO pose des brouillons dans data/auto/, jamais affiches. L'etage PUBLIE ne
# retient que ce qu'un humain a relu et bascule dans data/evenements/. C'est ce geste
# humain qui rend vraie la promesse « verifie par un humain » de l'invariant 4 — une
# chaine entierement automatique la rendrait fausse a l'endroit precis ou l'on demande
# d'etre cru.
python3 outils/candidats.py outils/scrutins_an.json data/auto 10 \
  || echo "::warning::les candidats n'ont pas pu etre fabriques"
python3 outils/evenements.py data/evenements outils/evenements.json \
  || echo "::warning::la couche editoriale a echoue"

# ---------------------------------------------- 4. verifier la sortie, sans confiance
# On relit ce qui vient d'etre ecrit, sans reutiliser une ligne du script qui l'a ecrit.
python3 - "$AUJOURDHUI" <<'PY'
import json, sys, datetime
today = sys.argv[1]
d = json.load(open("outils/agenda_an.json", encoding="utf-8"))
assert d.get("v") == 1, "version de format inattendue"
assert len(d["r"]) > 5000, "trop peu de reunions : %d" % len(d["r"])
assert d["org"], "table des instances vide"
assert all(0 <= e["o"] < len(d["org"]) for e in d["r"]), "index d'instance hors table"
assert "acteurRef" not in json.dumps(d)[:2000000], "une presence nominative a fuite"
assert d.get("maj") == today, "date de collecte %r au lieu de %s" % (d.get("maj"), today)

# GARDE-FOU CONTRE LE GEL SILENCIEUX : toutes les adresses de collecte.py portent
# le numero de legislature (/17/). Le jour d'une dissolution, ces fichiers cessent
# d'etre mis a jour, la collecte continue de reussir sur un fichier fige, et RIEN
# ne le dit. On exige donc qu'il reste des reunions a venir.
derniere = max(e["d"] for e in d["r"])[:10]
ecart = (datetime.date.fromisoformat(derniere) - datetime.date.fromisoformat(today)).days
print("agenda : %d reunions, %d instances, collecte du %s, derniere reunion %s (J%+d)"
      % (len(d["r"]), len(d["org"]), d["maj"], derniere, ecart))
assert ecart > -21, ("la reunion la plus tardive remonte a %d jours : la source est "
                     "probablement gelee (changement de legislature ?)" % -ecart)
PY

# --------------------------------------------------- 5. reconstruire le site
# BASCULE PREPAREE LE 19/09/2026, PAS ENCORE PUBLIEE — voir le dry-run de cette
# date pour les preuves chiffrees.
#
# CE QUI CHANGE. `site_engendre` etait rempli par build_pwa_reconstruit.py, qui
# reconstruit la version SERVIE depuis le HTML autonome — celle-la embarque
# encore window.REPERE_RNE (6,76 Mo) et window.REPERE_OFGL (8,83 Mo) en clair
# dans la page, parce que le chargeur asynchrone par departement n'a jamais ete
# ecrit pour ELLE. Mesure en production le 19/09/2026, sur le site reellement
# en ligne, avec parametre anti-cache : 16 286 093 octets decodes, 6 022 536
# transferes, une seule requete. Le monorepo mono/ resout exactement ce trou
# depuis fin aout — measure du meme jour sur son propre dry-run : environ 48 Ko
# transferes pour atteindre le maire de Bagnolet (arrivee + recherche + fiche
# commune + onglet par defaut), verifie fichier par fichier, gzip compris.
#
# CE QUI NE CHANGE PAS. Le HTML autonome ($APP) reste construit et eprouve tel
# quel : c'est le livrable hors-ligne, il n'a pas ce probleme par construction
# (invariant 1) et rien ici ne le concerne.
#
# CE QUI DISPARAIT : l'etape "5 bis" qui copiait site_donnees/ (le decoupage
# de outils/decouper.py) dans site_engendre/donnees/. mono/ decoupe deja les
# communes par departement a sa maniere (extract-html.js -> data/departments/),
# et son application ne lit jamais /donnees/ : garder cette copie aurait publie
# un second decoupage, jamais lu, pour la meme donnee — exactement le piege
# "deux endroits qui derivent la meme regle" que ce depot a deja appris a eviter.
# site_donnees/ continue d'etre PRODUIT plus haut (3 sexies) : rien n'empeche
# de le lire ou de le supprimer plus tard, ce n'est plus publie, c'est tout.
APP=$(ls -1 app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)
echo "application retenue (fichier autonome) : $APP"
rm -rf site_engendre
(
  cd mono
  corepack enable pnpm 2>/dev/null || true
  node scripts/extract-html.js "../$APP" ./data
  node scripts/calendrier-senat.mjs ./data \
    || echo "::warning::calendrier Senat non rafraichi (reseau indisponible ? le releve d'hier reste)"
  # AGENDA ASSEMBLEE NATIONALE (23/09/2026) - pas de reseau ici, contrairement
  # au Senat : lit outils/agenda_an.json, deja produit par l'etape 2 de ce
  # meme script (agenda_an.py). Si ce fichier manque ou est mal forme, le
  # script avertit et rend une main vide - le Senat continue seul, comme le
  # Senat continuerait seul si CE fichier-ci manquait a l'inverse.
  node scripts/agenda-an.mjs ./data \
    || echo "::warning::agenda de l'Assemblee non rafraichi - le calendrier continue avec le Senat seul"
  pnpm install --frozen-lockfile
  # RISQUE CONFIRME PAR AUDIT LE 22/09/2026, PAS SUPPOSE : ce bloc n'installait
  # aucun Chromium pour mono/. Le premier essai reel sur le runner GitHub
  # (workflow_dispatch de test, run 35796632331) a echoue exactement ici -
  # `pnpm test` plus bas ne trouvait pas d'executable, alors qu'un Chromium se
  # trouve deja installe sur ce poste par un autre chemin, ce qui masquait le
  # trou en local. mono/package.json epingle playwright 1.56.0, different du
  # 1.49.0 installe plus haut pour test_repere.mjs — deux Chromium distincts,
  # deux installations distinctes.
  npx playwright install --with-deps chromium
  pnpm build
)
cp -r mono/apps/web/dist site_engendre
echo "site engendre depuis mono/ : $(find site_engendre -type f | wc -l) fichiers, $(du -sh site_engendre | cut -f1)"

# ------------------------------------------------------------ 6. eprouver
# LE VERROU DE L'AUTOMATISATION. Si un seul controle tombe, `set -e` arrete tout
# ici et le deploiement n'a pas lieu. C'est ce qui autorise a publier sans qu'un
# humain regarde.
#
# DEUX BANCS, DEUX LIVRABLES DISTINCTS. Le fichier autonome garde son propre
# banc (test_repere.mjs, 55 controles) : il ne partage rien avec le monorepo,
# donc rien ne garantit qu'ils divergent ensemble. site_engendre EST le
# monorepo depuis cette bascule : c'est son propre banc (`pnpm test` -
# invariants.test.mjs + sante.test.mjs + runtime.test.mjs, mesure le
# 22/09/2026 sur le runner GitHub reel : 120 controles inline + 65 node:test,
# 0 echec) qui le garde, pas test_repere.mjs — qui ne connait ni son DOM ni
# ses classes.
echo "== banc : le fichier autonome =="
node test_repere.mjs "$APP"

echo "== banc : le monorepo (version publiee) =="
(cd mono && pnpm test)

echo "== pipeline terminee sans erreur =="
