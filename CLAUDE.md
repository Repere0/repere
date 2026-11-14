# Repère — ce que tout agent doit savoir avant d'agir

Ce fichier est chargé à chaque session : il est **court exprès** (plafond 120
lignes, gardé par `outils/derive_contexte.mjs`). Le détail se lit **à la demande**
(section « Lire à la demande »). `AGENTS.md` en est une copie exacte, pour Codex.

## Le projet

- Application civique française, **neutre**, qui répond à deux questions pour
  une commune : **qui décide chez moi** et **où va mon argent**. Chaque affirmation
  est sourcée, aucune opinion.
- Cap : bêta **Île-de-France** (1 262 communes), utilisable par un banc de
  **10 testeurs en décembre 2026** ; présidentielle d'avril 2027 en toile de fond.
- Un seul développeur, budget quasi nul : **aucune dépense sans la signaler et la
  justifier d'abord**.
- Repère est une **interface citoyenne** : ni média, ni réseau social, ni
  classement, ni jeu politique. Donner une information n'est pas dire quoi penser.
  Promesse ≠ position ≠ vote ≠ action.

## Ce que le porteur du projet demande, mot pour mot

> « Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse
> une règle du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie
> plutôt que de supposer, et quand tu ne peux pas vérifier, écris-le au lieu de
> l'arrondir. »

## Les invariants — lecture seule

Un agent ne les modifie **jamais** de sa propre initiative. Seule une décision
explicite du porteur les change ; la PR qui l'applique met alors à jour
`.claude/invariants.sha256` (sinon `outils/derive_contexte.mjs` échoue).

<!-- INVARIANTS:DEBUT -->
1. **Autonomie.** L'application fonctionne hors ligne, sans serveur applicatif.
2. **Deux clés de stockage local, nommées, rien d'autre.** `repere.departement` (la commune,
   `{d, v}` depuis le 23/09/2026) et `repere.profil` (réglages de lecture : taille, contraste,
   espacement, police, animations, daltonisme, images, et depuis D57 `themes` : les thèmes d'intérêt choisis, parmi une liste fixe ; depuis D67 `mode` : auto, clair ou sombre ; et depuis le 13/11/2026 `prenom` : un prénom FACULTATIF, jamais deviné, ce qui n'en est pas un n'étant pas gardé — ADR 0009 ; `points` : les points du quiz civique, jamais transmis — ADR 0010 ; et depuis le 14/11/2026 `onboardingVu` : la bienvenue a été terminée sur cet appareil, rien d'autre — ADR 0011). Ni l'une ni l'autre n'est
   transmise : aucun compte, email, traceur, cookie. Le magasin de données (IndexedDB sur le
   site, cache de l'application sur le téléphone) ne garde que les fichiers publics publiés
   par Repère, sous une garde unique (`store.js`). Aucune adresse réseau ne porte un code de
   commune ni un réglage : données découpées **par département**.
3. **Aucun classement**, score, ou tri numérique de personnes, de partis ou de territoires.
   ADR 0009 (13/11/2026) : hémicycle dessiné d'après le PLAN RÉEL de l'Assemblée, légende de gauche à droite
   de la salle (un lieu, pas un rang) ; sans ce plan, arc alphabétique dit indicatif à l'écran.
   Amendé (D23, 30/10/2026, ADR 0002) : comparaisons FACTUELLES entre communes permises
   (moyenne IDF ou régionale, « comme X communes sur Y », année N-1), annoncées comme calcul ;
   « comme », « plus que », « moins que » oui ; « mieux », « pire », « top », « note », « score » non.
4. **Chaque chiffre porte sa source officielle et sa date** (producteur, licence,
   mise à jour, URL). Un calcul dérivé s'annonce comme un calcul. D28 (ADR 0005) : site de mairie en lien externe, HTML jamais lu.
   D81 (ADR 0007) : flux RSS officiel de mairie lisible (titre, deux phrases au plus, date, lien), jamais l'article entier.
5. **Doctrine du vide.** Une absence de donnée produit une phrase vraie et un lien,
   jamais une forme vide, un zéro ou une barre minuscule.
6. **Rien qui gamifie le vote ou l'opinion** : aucun score, aucune récompense, aucune série, aucun gain ni son de réussite lié à un vote, une position, un élu, un parti, un territoire ou un partage. Les effets de mouvement sont permis pour lire et naviguer (porteur, 13/10/2026). **Amendé (porteur, 13/11/2026, ADR 0010)** : points, rangs et séries sont permis AU SEUL module de culture civique (quiz du dictionnaire), parce qu'une définition a une bonne réponse publiée ; points dans `repere.profil`, jamais transmis, aucun rang comparé entre lecteurs. `MOTS_GAMIFICATION` et `MOTS_CLASSEMENT` restent interdits partout, quiz compris.
7. **Invariant 7 (amendé les 30/10, 01/11 (D99), 08/11, 09/11/2026 (« tout Stitch »), 12/11/2026 (ADR 0008), puis 13/11/2026 (ADR 0009) par le porteur)** :
   couleurs de groupes politiques pour l'identification des élus seulement (badges, cartes de partage) ; elles ne codent
   JAMAIS un vote, une opinion, un score ou un classement. Votes (Stitch) : émeraude `#00A896` (pour), corail `#BE123C`
   (contre), ardoise `#94A3B8` (abstention) ; ils codent un FAIT, jamais un jugement, la position reste écrite en toutes
   lettres ; variante daltonienne (D56) : `#0072B2`, `#B35900`, `#6E7781`. Jauge du budget : clair `#8B9DC3` / `#A3C9A8` /
   `#D3D3D3` (pastels), sombre `#D4AF37` / `#818CF8` / `#475569` (salaires / investissements / fonctionnement), jamais politiques.
   Émeraude réservée aux données de vote, jamais en texte ; l'interface reste neutre (noir, ivoire, gris). Quiz (ADR 0009) :
   `#4A7C59` juste / `#AA4A4A` faux, au quiz seul, jamais un vote ni une opinion, jamais sans la coche et le mot écrits ;
   groupes du Sénat : aucune couleur neuve, la teinte de la même famille, correspondance dans palette.ts. Tout dans palette.ts. D27 (ADR 0004) : photo d'élu sous licence libre Wikimedia Commons, crédit affiché ; jamais celles de l'AN. D27 étendu aux candidats à la présidentielle (ADR 0008, 12/11/2026) ; jamais une couleur de parti sur un candidat.
8. **Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence.**
9. **Fraîcheur** (décision du porteur, 30/09/2026). Une donnée gardée sur
   l'appareil peut être affichée pour préserver l'accès hors ligne, mais jamais
   présentée comme actuelle si elle ne l'est pas. Trois états, toujours
   distinguables à l'écran : **actuelle** (publication courante, vérifiée),
   **publication précédente** (le lecteur le comprend immédiatement), **impossible
   à vérifier** (on ne prétend pas que c'est à jour). La confiance passe avant
   l'impression de fluidité.
<!-- INVARIANTS:FIN -->

## Où vit quoi (état du 29/09/2026)

- **Production** : `mono/` (React/Vite, sortie statique). `outils/pipeline.sh` la
  construit et l'éprouve ; `.github/workflows/collecte.yml` la publie chaque matin
  sur Netlify. Cloudflare Pages est la cible décidée, **non commencée**.
- **Source des données** : les blocs `REPERE_*` de `app_repere_v18_20.html`, lus
  par `mono/scripts/extract-html.js`. Ne jamais éditer un bloc à la main.
- **Fil éditorial** : `data/evenements/*.md` (validés par le porteur) ; `data/auto/*.md` = brouillons machine, jamais affichés.
- **`main` est protégée** : tout passe par une pull request, que
  `.github/workflows/epreuve.yml` rejoue sans publier. Ne jamais fusionner ni
  pousser sur `main` sans l'accord du porteur.
- **Banc** : l'ordre exact est celui de la fin de `outils/pipeline.sh` (build de
  `mono/`, puis `pnpm test`, puis `test_repere.mjs` sur le fichier autonome).
  Jamais `playwright install` dans le conteneur (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
  Poids du premier écran : plafond 120 Ko, gardé par `mono/tests/runtime.test.mjs`.
- **Réseau** : le conteneur cloud ne joint pas les sources françaises (data.gouv.fr,
  assemblee-nationale.fr, senat.fr) ; seul le runner GitHub télécharge. Décrire avant de deviner.

## Lire à la demande — ne pas charger d'office

| besoin | fichier |
|---|---|
| pièges déjà rencontrés | `CONTEXTE_PROJET.md` § 9 |
| ce qui a été refusé, et pourquoi | `CONTEXTE_PROJET.md` § 10 |
| architecture du monorepo, décisions | `CONTEXTE_PROJET.md` § 14 |
| histoire de l'ère mono-fichier (avant le 23/09) | `CONTEXTE_PROJET.md` § 4 à 8 et 12 |
| carte produit, questions citoyennes | `docs/PRODUCT_MAP_V1_2026-09-23.md` |
| retour arrière de la production, couche éditoriale | `docs/MONO_PRODUCTION_ROLLBACK.md`, `docs/COUCHE_EDITORIALE.md` |
| décisions qui ont amendé un invariant | `docs/adr/` (0001 à 0011) |

## Procédures — skills de `.claude/skills/`

- `modifier-repere` : toute modification du code ou des données.
- `prouver-une-garde` : écrire un contrôle et le voir échouer avant de s'y fier.
- `ingerer-une-source` : brancher une donnée publique avec sa provenance.
- `valider-un-fait` : préparer un fait du fil pour la validation du porteur.
- `rapport-de-session` : terminer une session et laisser le contexte vrai.
- `consolider-le-contexte` : relecture hebdomadaire hors session (« dreaming »).

## Règles courtes

- Mesurer plutôt que supposer ; un chiffre non mesuré s'écrit comme non mesuré.
- Un garde-fou se prouve en le cassant.
- Apostrophe typographique `’` interdite dans le code ; accents obligatoires dans tout texte affiché.
- Un fait durable va dans `CONTEXTE_PROJET.md`, une procédure dans une skill, jamais dans ce fichier.
- Avant toute PR qui touche ce fichier, `AGENTS.md`, une skill ou `CONTEXTE_PROJET.md` :
  `node outils/derive_contexte.mjs`.
