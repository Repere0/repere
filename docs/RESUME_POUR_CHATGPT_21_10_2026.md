# Repère — état réel au 21 octobre 2026, 13 h (Paris)

Document destiné à ChatGPT (rôle CEO / CTO produit) pour qu'il rédige un prompt
de reprise à donner à Claude. Tout ce qui suit est **mesuré ou cité**, jamais
estimé ; les incertitudes sont écrites comme telles.

---

## 1. Le produit, en trois phrases

Application civique française, neutre, qui répond à deux questions pour une
commune : **qui décide chez moi**, **où va mon argent**. Chaque affirmation porte
sa source officielle et sa date ; aucune opinion, aucun classement.

Cap : bêta **Île-de-France** (1 262 communes), utilisable par **10 testeurs en
décembre 2026**. Présidentielle d'avril 2027 en toile de fond.

Un seul développeur (Arthur Pinard), budget quasi nul. L'application mobile est
le produit principal (React Native / Expo, testée via Expo Go sur iPhone) ; le
site web est un support secondaire et **explicitement déprioritisé** par le
porteur le 21/10 : « priorise l'app mobile, le web on s'en fout ».

## 2. Les règles que le porteur impose, mot pour mot

> « Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix
> casse une règle du produit ou m'expose juridiquement, dis-le **avant**
> d'exécuter. Vérifie plutôt que de supposer, et **quand tu ne peux pas vérifier,
> écris-le au lieu de l'arrondir**. »

S'y ajoutent, tirés de ses consignes répétées :

- **Carte blanche sur le travail local**, ne le consulter que pour les décisions
  vraiment critiques. Il a reproché explicitement de revenir trop souvent.
- **Montrer le résultat en image, avant/après.** C'est une consigne ancienne que
  l'agent n'avait pas appliquée, et c'est la cause directe de sa déception du
  21/10 au matin : du travail décrit au lieu d'être montré, donc jamais vérifié.
- **Aucune dépense sans la signaler et la justifier d'abord.**
- **Ne jamais fusionner ni pousser sur `main` sans son accord explicite.**
- Un garde-fou se prouve **en le cassant**. Une garde qui ne mesure rien ne garde
  rien.

## 3. Les invariants (lecture seule, 9 au total)

Un agent ne les modifie jamais de lui-même ; seule une décision explicite du
porteur les change, et la PR qui l'applique met à jour `.claude/invariants.sha256`.
Les plus structurants pour le travail en cours :

- **2.** Aucun compte, traceur ni cookie ; une seule clé locale ; les données sont
  découpées **par département**, aucune adresse réseau ne porte un code de commune.
- **3.** Aucun classement, score ou tri numérique de personnes, partis, territoires.
- **4.** Chaque chiffre porte producteur, licence, date, URL. Un calcul dérivé
  s'annonce comme un calcul.
- **5.** Doctrine du vide : une absence de donnée produit une phrase vraie et un
  lien, jamais une forme vide ni un zéro.
- **7.** Palette d'interface fixe + cinq couleurs d'échelon gelées. La couleur d'un
  groupe parlementaire est **celle que l'Assemblée publie** (`organe.couleurAssociee`),
  jamais choisie par Repère. Aucune couleur ne qualifie jamais une personne ou un
  parti, et **chaque position de vote porte son libellé en toutes lettres à côté de
  sa couleur**.
- **9.** Fraîcheur : une donnée gardée sur l'appareil peut être affichée, jamais
  présentée comme actuelle si elle ne l'est pas. Trois états distinguables à l'écran.

## 4. Où en est le dépôt (mesuré)

- Dépôt `Repere0/repere`. Branche de travail : **`ux/theme-sombre-20-10`**, HEAD
  **`c58b46f`**, poussée, arbre propre, **67 commits d'avance sur `main`**.
- **44 PR ouvertes, dont 29 brouillons.** Pile profonde (imbrications jusqu'à
  5 niveaux). Le porteur a tranché le 20/10 : « aucune PR ne fait foi », tout peut
  être modifié.
- **PR #147 fusionnée** dans la nuit du 20 au 21 sur ordre explicite du porteur
  (squash `90bb5e03`). Elle a débloqué le banc, et avec lui la collecte.
- `node outils/derive_contexte.mjs` : **0 erreur, 0 avertissement**.
- `pnpm test` : **176/177**. Le seul échec rend `apps/web/dist` et tombe sur
  `calendrier-senat.json`, absent faute de réseau dans le conteneur — c'est le web,
  déprioritisé.
- `tests/parcours-web.mjs` : **vert**, aux trois largeurs (360/390/430) en clair et
  en sombre.

## 5. Ce qui a été fait dans la nuit du 20 au 21

1. **Collecte réparée.** Elle échouait tous les jours depuis le 9 octobre, sur deux
   contrôles du banc (un intitulé de scrutin solennel que l'Assemblée a reformulé ;
   une date de visite figée). #147 fusionnée → **« Exécuter la chaîne » est passée
   au vert pour la première fois depuis le 9 octobre**, produisant `e975a3f
   « Collecte du 21/10/2026 »` sur `main`.
2. **Hiérarchie typographique sur « Aujourd'hui »** (`7edeaef`). Les trois cartes
   étaient trois pavés de 19 px du même poids où le montant se noyait. Le morceau de
   phrase qui **est** la réponse passe à 28 px, le reste à 17. La phrase n'est ni
   réécrite ni amputée ; le lecteur d'écran reçoit toujours la phrase entière.
   **La carte déclare quel nombre est sa réponse**, on ne le devine pas : un premier
   jet devinait le premier montant et a grossi « 1,5 million d'euros » (le coût du
   projet) au lieu de « 726 800 € » (ce que l'État paie) — mettre en avant le mauvais
   nombre induit en erreur. Garde écrite et **prouvée en la cassant**.
3. **Une garde en carton supprimée.** Une première version du contrôle interrogeait
   `communes[].projets`, champ inexistant dans le fichier départemental : elle
   affichait « ok » sans jamais s'exécuter. Remplacée par une règle lisible dans la
   phrase affichée, plus un compteur qui échoue si la garde ne mesure rien.
4. **Contexte remis d'aplomb** (`c58b46f`). L'invariant 7 citait un chemin
   inexistant ; corrigé et **scellé sur décision du porteur** (aucune règle changée).

## 6. Les trois blocages, par ordre de coût

### A. La publication Netlify — le seul obstacle aux données fraîches

**C'est le point le plus important, et le diagnostic a changé ce matin.**

La chaîne fonctionne : les données construites portent `genere_le: 2026-10-21`.
Mais la publication échoue, donc **le site en ligne n'est pas mis à jour**, et
l'application mobile lit cette adresse (`PRODUCTION =
"https://repereapp.netlify.app/data"` dans `mono/apps/mobile/src/lib/donnees.ts`).

Ce qu'on croyait la nuit dernière : un jeton expiré. **C'est faux.** La sonde du
run de 10 h 37 (run `39585904143`) répond :

> « Jeton valide et site trouvé. Si la publication échoue malgré tout, la cause
> n'est ni le jeton ni l'identifiant. »

Donc ni `NETLIFY_AUTH_TOKEN`, ni `NETLIFY_SITE_ID`.

**Hypothèse forte, non vérifiée :** le workflow lui-même garde trace d'un
précédent identique. Commentaire dans `.github/workflows/collecte.yml`, daté du
08/10 : le 07/10, la publication a échoué avec une sonde à 200, et la cause était
`« Account credit usage exceeded - new deploys are blocked until credits are
added »`. Si c'est à nouveau cela, **c'est une décision de dépense, donc du
porteur** — et le workflow est déjà écrit pour le dire en annotation.

**Pourquoi ce n'est pas tranché :** le journal du run est inaccessible depuis le
conteneur de l'agent (le proxy refuse `blob.core.windows.net`), et l'annotation
détaillée `« Netlify refuse la publication »` n'apparaît pas dans l'API des
annotations. **Le porteur peut lire la cause en dix secondes sur la page du run.**

Rappel : Cloudflare Pages est la cible décidée depuis longtemps, **non commencée**.
Si Netlify est à court de crédits, c'est l'occasion ou jamais de trancher.

### B. Les couleurs politiques — bloqué par la donnée, pas par le design

Le porteur le redemande **depuis des jours** et l'a répété le 20/10 : il veut que
chaque citoyen sache de quel bord est son député **et** son représentant local, par
famille (gauche rose, droite bleu, extrême droite bleu très foncé, écologiste vert,
centre orange ou jaune), sous forme d'**étiquettes**.

État réel : le composant `EtiquetteGroupe` existe (`src/ui/signatures.tsx`), et
`couleurDeGroupeAdmise` est débloquée côté invariants. **Mais la donnée publiée ne
porte aucun groupe** : `deputes.json` ne contient que `{prenom, nom, acteurRef,
dateDebut}`, et rien pour les maires ni les conseillers départementaux. Les groupes
avec leur couleur n'existent que dans les détails de scrutins.

**Ce qu'il faut donc faire, et c'est du collecteur, pas de l'interface :** faire
remonter le groupe parlementaire (AN) et la nuance RNE jusqu'aux fiches publiées.
Cela passe par le runner GitHub — le conteneur de l'agent ne joint ni
`data.gouv.fr` ni `data.assemblee-nationale.fr`.

**Tension à arbitrer et à ne pas escamoter :** l'invariant 7 interdit à Repère de
*choisir* une couleur politique ; seule la couleur publiée par l'institution est
admise. Les familles demandées par le porteur (« gauche rose ») sont une
**attribution par Repère**. Il faut soit s'en tenir aux couleurs publiées par
l'Assemblée, soit une décision explicite du porteur modifiant l'invariant 7 — avec
la question de neutralité que cela ouvre pour un produit qui promet de ne pas dire
quoi penser.

### C. La ressemblance aux maquettes — partiellement bloqué par ses propres règles

Le porteur a fourni une vidéo et des captures Google Stitch comme direction
artistique, et jugé le 21/10 au matin que « l'UX n'a pas tant évolué ». Captures
réelles à l'appui, il avait raison : les composants signatures avaient été écrits
mais **pas branchés** sur l'écran principal.

Fait depuis : la hiérarchie typographique (le plus gros écart). Reste :

- **Étiquettes de rubrique sur les cartes 1 et 2** : essayées, **mesurées à 45 px**,
  retirées — la troisième réponse passait sous le pli (`886 px pour 844` à
  390 × 844), ce que refuse la garde « les trois réponses tiennent dans le premier
  écran ». **Arbitrage du porteur le 21/10 : option 1**, on garde les trois réponses
  au-dessus du pli, sans étiquettes. Consigné au § 10 de `CONTEXTE_PROJET.md`.
- Les 45 px n'existent nulle part gratuitement : le pied de la carte 2 fait
  honnêtement 96 px (deux rangées de cibles tactiles de 48 px, 338 px de contenu
  pour 326 disponibles) ; le réduire casserait une cible de 44 px ou le nom d'une
  source (invariant 4).
- Seul vrai gisement restant : le bloc `<Marque />` de l'écran commune (~60 px),
  mais c'est une décision de marque déjà prise le 16/10.
- **Images libres de droit : impossibles.** Le proxy du conteneur refuse Unsplash
  (403). Et une photo générique sous un nom de projet réel serait trompeuse.

## 7. Contraintes d'environnement de l'agent (à rappeler dans le prompt)

- Conteneur cloud **sans accès aux sources françaises** (data.gouv.fr,
  data.assemblee-nationale.fr) ni aux journaux de run GitHub ni à Netlify. Seul le
  runner GitHub télécharge.
- `gh` fonctionne en **REST uniquement** ; GraphQL renvoie 403. Donc
  `gh pr merge` / `gh pr ready` échouent : passer par
  `gh api -X PUT repos/.../pulls/N/merge` et les routes `ccr`.
- Jamais `playwright install` (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
- L'agent **peut voir les écrans mobiles** en exportant l'app en web
  (`npx expo export --platform web`), en servant `dist-web` et en pilotant
  Chromium. Ce n'est pas du travail web : c'est son seul appareil photo.
- `mono/data/` est **généré** (ignoré par git). `agenda-an.json` se régénère hors
  réseau avec `node scripts/agenda-an.mjs ./data` depuis `outils/agenda_an.json`.
- Le PC du porteur : PowerShell, `npm.cmd` (pas `npm`), dépôt dans
  `C:\Users\APina\repere`. Son jeton `gh` local est expiré (HTTP 401) —
  `gh auth login -h github.com`.

## 8. Ce qu'un bon prompt de reprise devrait contenir

1. **Exiger une capture avant/après à chaque étape visuelle**, pas une description.
   C'est la cause de la dernière déception.
2. **Imposer de mesurer** avant d'affirmer, et d'écrire « non mesuré » sinon.
3. **Rappeler que le mobile prime** et que le web ne doit pas consommer de temps.
4. Donner **une seule priorité claire**. Proposition, par ordre de valeur rendue au
   citoyen :
   - (1) débloquer la publication (lire la cause, puis décider Netlify vs Cloudflare) ;
   - (2) faire remonter le groupe politique jusqu'aux fiches, avec l'arbitrage de
     neutralité posé **avant** d'écrire du code ;
   - (3) continuer le rapprochement visuel, sans toucher au pli ni à la marque.
5. **Interdire de fusionner ou pousser sur `main`** sans accord, et rappeler qu'une
   PR verte ne se fusionne pas si elle contient une décision produit humaine.
6. Demander qu'**aucun invariant ne soit modifié** sans décision explicite, et que
   tout scellement soit annoncé.
7. Rappeler de **ne pas revenir vers le porteur pour des décisions non critiques**,
   mais de l'avertir sans détour quand un de ses choix casse une règle du produit.
