# Passation — à lire avant d'agir sur Repère

Pour l'agent qui reprend. `CLAUDE.md` dit **les règles** ; ce fichier dit **comment
on se trompe ici**. Il a été écrit dans la nuit du 21 au 22 octobre 2026, après
une session où je me suis trompé huit fois. Chaque piège ci-dessous est un cas
réel, pas une précaution théorique.

---

## 1. La seule chose à comprendre avant tout le reste

Le porteur est seul, son budget est quasi nul, et il te lit sur un téléphone. Il
t'a demandé ceci, mot pour mot :

> « Dis-moi ce qui ne va pas plutôt que ce qui m'arrange. Si un de mes choix casse
> une règle du produit ou m'expose juridiquement, dis-le avant d'exécuter. Vérifie
> plutôt que de supposer, et quand tu ne peux pas vérifier, écris-le au lieu de
> l'arrondir. »

Ce n'est pas une formule de politesse, c'est le contrat. **Un « je ne sais pas »
honnête vaut mieux qu'une affirmation plausible.** Une affirmation plausible lui
coûte des heures : il agit dessus.

Corollaire que j'ai appris à mes dépens : **son accord n'est pas une garantie que
tu as raison.** Il m'a écrit « je te donne mon accord pour tout » à 1 h 44 ; vingt
minutes plus tard je découvrais que le chantier qu'il venait d'autoriser reposait
sur un défaut que j'avais inventé. J'ai tout annulé. L'accord autorise à agir, il
ne dispense pas de vérifier.

Et il veut **voir** le résultat de chaque travail en image, avant/après. Quand un
travail ne change rien à l'écran — de l'accessibilité, un test — dis-le
explicitement au lieu de livrer deux fois la même capture.

---

## 2. Ce qu'on ne prétend jamais

- **Aucune validation iOS native.** Ni VoiceOver, ni TalkBack, ni Dynamic Type
  natif. Le conteneur n'a ni simulateur ni appareil. Le banc rend React Native
  par react-native-web dans Chromium : il trouve de vrais défauts, il ne dit
  **rien** du rendu natif. Le protocole que le porteur exécute lui-même est
  `docs/TEST_NATIF_IPHONE.md`.
- **WCAG 2.2 AA est un objectif de conception, pas une conformité à revendiquer.**
- **Aucune donnée inventée**, jamais, même pour remplir une maquette. Une absence
  produit une phrase vraie et un lien (invariant 5).
- Les **quatre refus produit** du porteur sont tranchés et ne se rouvrent pas :
  pas de « données certifiées », pas de micro-consultation ou sondage politique,
  pas de simulateur de contribution individuelle, pas de rouge automatique sur une
  hausse de budget.

## 3. Git, argent, CI

`main` est protégée : **jamais de fusion ni de poussée sur `main` sans son accord
explicite.** Jamais de force-push, de reset destructif, de suppression de branche,
de réécriture d'historique. Les commits ciblés sur la branche de travail courante
sont la norme. **Aucune dépense sans la signaler et la justifier d'abord.**

**Un autre agent peut travailler dans le dépôt en même temps que toi.** C'est
arrivé le 21/10 entre 21 h 45 et 21 h 57 : cinq fichiers modifiés et une fixture
non suivie m'attendaient après mon commit. Donc : **relève l'état réel du dépôt
en début de session**, et si tu trouves du travail qui n'est pas le tien, lis-le,
vérifie-le, conserve-le et **attribue-le**. N'écrase rien.

---

## 4. Les pièges de mesure — c'est la section qui compte

### Une garde ne dit rien de ce qu'elle ne regarde pas

Le relevé des cibles tactiles listait `[role="button"]`, `[role="link"]`,
`button`, `a`, `input` — **pas `[role="tab"]`**. Résultat : aucun onglet de
l'application n'avait jamais été mesuré depuis la création de cette garde. Dès
qu'on l'a inclus, trois cibles sous le minimum sont apparues (40, 40, 42 px). Les
défauts n'étaient pas tolérés, **ils n'étaient pas regardés**, et le vert se
lisait comme leur absence.

Demande-toi toujours : *quel est l'ensemble sur lequel cette garde porte, et
qu'est-ce qui en est exclu sans raison ?*

### Une vue derrière un geste n'existe pas pour le banc

Le parcours mesurait la frise de la semaine et ne basculait **jamais** en vue
mois. Ses cases étaient à 42 px. Même chose pour quatre écrans entiers
(`procedure`, `dictionnaire`, `avant-18`, `evenement`) : jamais rendus, donc
jamais mesurés, et `avant-18` échappait parce qu'il s'ouvre depuis l'accueil
**avant** le choix de commune, alors que le parcours commence par choisir Meaux.

### Une garde conditionnelle passe à vide

`!/Heure de fin/.test(t) || /ne la devine pas/.test(t)` est verte quand
l'antécédent est absent — sans avoir rien mesuré. Son vert se lit alors comme une
preuve. **Fais porter au message le cas rencontré** (`cas rencontré : oui/non`)
pour qu'un vert à vide reste lisible. Et plus généralement : ajoute un **compteur
témoin** qui échoue si rien n'a été mesuré.

### Compter ce qu'on veut dire, pas la forme qu'on suppose

J'ai cherché les sources officielles en `role="button"`. Ce sont des
`role="link"` — ce qui est plus juste pour une page extérieure. Ma garde trouvait
zéro et accusait l'écran de n'avoir aucune source alors qu'il en porte quatre.

### Prouver une garde en cassant le produit, pas le test

C'est la skill `prouver-une-garde` et ce n'est pas négociable. Une garde qui n'a
jamais été vue rouge ne garde rien. La preuve se fait en introduisant le défaut
annoncé — dans le produit — et en vérifiant que la garde le nomme. Puis on
restaure, on reconstruit, on revérifie. **Ne relâche jamais une assertion pour
obtenir du vert, et ne masque aucun échec préexistant.**

Nuance : une assertion peut être **périmée** sans être trop stricte. Deux
exigeaient des chaînes qui n'existent **nulle part** dans les sources — elles
échouaient sur leur propre texte. Les réécrire sur ce que le produit rend
réellement n'est pas un relâchement, **à condition de l'avoir vérifié soi-même**
et de conserver la force du contrôle (même structure, même comptage strict).

---

## 5. Les pièges d'outillage, tous rencontrés

| piège | ce qui se passe |
|---|---|
| `gh api --paginate` | Il suit l'en-tête `Link`, que GitHub écrit en `repositories/{id}/…`, refusé par le proxy : **page 1 puis sortie en 1**. Avec `2>/dev/null`, une liste tronquée ressemble à une liste complète. Je m'en suis servi pour conclure deux fois qu'une issue n'existait pas — elle était en page 2. **Pagine à la main (`&page=N`) et relève le code de sortie.** |
| `continue-on-error: true` | Force `conclusion: success` en gardant la vérité dans `outcome`, que l'API des jobs n'expose pas. Une étape « réussie » peut avoir échoué. |
| Journaux de run | Servis depuis `blob.core.windows.net`, que le proxy refuse. Les annotations n'arrivent pas toujours. **Le résumé de job (`$GITHUB_STEP_SUMMARY`) se lit, lui, depuis l'API et depuis un téléphone.** |
| `expo export … \| tail -5` | Le tube renvoie 0 : une erreur de build passe pour un succès. **Relève le code de sortie de la commande elle-même.** |
| expo-router | Garde les écrans précédents montés en `aria-hidden`. `.first()` tombe sur l'élément masqué ; `locator("input")` compte le champ d'un autre écran. **Ne compte que le visible et non `aria-hidden`.** |
| Bouton de retour | Son libellé **nomme** l'écran d'origine (« Revenir à l'écran Le calendrier ») ; il ne dit « précédent » que depuis un écran sans nom. Ne le cherche pas en dur. |
| « Revenir à l'accueil » | N'existe **que** sur l'onglet « Aujourd'hui ». |
| `accessibilityState` | react-native-web 0.21.3 ne le traduit pas. Il faut l'attribut `aria-*` accolé (`aria-selected` sur un `tab`, `aria-current` sur un bouton). Sur iOS, React Native l'honore sans — donc un défaut vu en web n'est pas forcément un défaut sur l'appareil : **dis-le**. |
| Captures | Les barres sont animées (`useApparition`) : une capture trop tôt les montre vides. 2 500 ms d'attente, et ce n'est pas décoratif. |
| `pkill -f '<motif>'` | Le motif correspond à la ligne de commande du shell qui le lance : tu te tues toi-même. |
| Un commentaire JSX | `return ( {/* … */} <X/>` crée deux racines : le build échoue. |
| Réseau | Le conteneur ne joint **pas** les sources françaises (`data.gouv.fr`, `data.assemblee-nationale.fr` → `CONNECT tunnel failed, 403`). Seul le runner GitHub télécharge. Ce n'est pas une panne, c'est l'architecture depuis le 13/09. |
| Durées | Le banc dure ~120 s **ici** pour un garde-temps de 720 s. N'extrapole pas au runner : le 07/10 il a tourné 24 minutes sans un seul échec. |

Et une règle de méthode : **ne crois pas un commentaire, même excellent.** Un
commentaire peut affirmer qu'une chaîne n'existe plus dans les sources. Vérifie-le
par `grep` avant d'accepter la modification qu'il justifie — et cherche au bon
endroit : les phrases du produit vivent souvent dans `packages/`, pas dans
`apps/mobile/src/`.

---

## 6. L'ordre de travail

1. **Relever l'état réel** : branche, HEAD, remote, worktree. Pas le supposer.
2. **Lire ce qui existe avant d'ajouter** : captures, tests, skills. Les skills de
   `.claude/skills/` ne sont pas décoratives — `modifier-repere` avant la première
   ligne, `prouver-une-garde` pour tout contrôle, `ingerer-une-source` pour toute
   donnée, `rapport-de-session` à la fin.
3. **Mesurer, puis conclure.** Jamais l'inverse.
4. **Prouver chaque garde en la cassant.**
5. **Rejouer le banc complet** : `pnpm test`, puis le parcours mobile sur un export
   servi, puis `node outils/derive_contexte.mjs` si `CLAUDE.md`, `AGENTS.md`, une
   skill ou `CONTEXTE_PROJET.md` a bougé.
6. **Commit ciblé** sur la branche de travail, message qui dit le défaut mesuré,
   la correction, et la preuve. Pousser la branche, jamais `main`.
7. **Bilan vérifiable** : commits, tests avant/après, défauts corrigés, blocages
   avec leur cause exacte, état git, prochaines priorités.

---

## 7. Comment juger ton propre travail

Avant de livrer, trois questions :

- **Ai-je mesuré, ou supposé ?** Si supposé : écris-le comme tel, ou va mesurer.
- **Cette garde a-t-elle été vue rouge ?** Sinon elle ne garde rien.
- **Est-ce que je lui annonce une amélioration, ou une preuve ?** Il a besoin de
  la seconde.

Et une quatrième, la plus utile : **qu'est-ce que je viens de recommander sans
l'avoir éprouvé ?** J'ai proposé une « priorité » qui contredisait une décision
argumentée déjà présente dans le code, et une autre qui reposait sur un défaut
inexistant. Les deux ont été retirées après mesure. Tester sa propre
recommandation est la dernière étape, pas une option.

---

## 8. À lire à la demande, pas d'office

| besoin | fichier |
|---|---|
| les règles, les invariants | `CLAUDE.md` (plafond 120 lignes) |
| pièges déjà rencontrés | `CONTEXTE_PROJET.md` § 9 |
| ce qui a été refusé, et pourquoi | `CONTEXTE_PROJET.md` § 10 |
| architecture du monorepo | `CONTEXTE_PROJET.md` § 14 |
| test sur un vrai iPhone | `docs/TEST_NATIF_IPHONE.md` |
| pourquoi Netlify refuse | `docs/NETLIFY_DIAGNOSTIC_21_10_2026.md` |
| brancher BANATIC | `docs/BANATIC_PREPARATION_21_10_2026.md` |
