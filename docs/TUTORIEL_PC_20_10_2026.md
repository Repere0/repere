# Tutoriel PC — soirée du 20 octobre 2026

Tout ce qui demande ton ordinateur, dans l'ordre. Chaque bloc est à copier tel
quel dans **PowerShell** (pas de `&&`, et `npm.cmd` plutôt que `npm`).

Le travail de la session est sur la branche **`ux/theme-sombre-20-10`**, déjà
poussée. Rien n'a été fusionné, rien n'a été poussé sur `main` ni sur ta branche
`feat/ux-densite-16-10`.

---

## 1. Voir la nouvelle version sur ton téléphone (5 minutes)

```powershell
cd C:\Users\APina\repere
git fetch origin ux/theme-sombre-20-10
git checkout ux/theme-sombre-20-10
cd mono\apps\mobile
npm.cmd install
npm.cmd start
```

Puis Expo Go, même réseau Wi-Fi, scan du QR.

### Le parcours de 3 minutes, écran par écran

1. **Bascule ton téléphone en thème sombre** (Réglages → Luminosité → Sombre),
   Repère ouvert. L'application suit, sans réglage à l'intérieur : tu as déjà
   choisi dans ton système, et l'invariant 2 interdit de garder un second
   réglage sur l'appareil.
2. **Accueil** → le fond, les cartes, la barre basse et la barre d'état passent
   en sombre. Le mot « Repère » reste lisible.
3. **Tape « Meaux »**, ouvre la commune → l'écran *Aujourd'hui*. Descends
   jusqu'au bloc **« Qui décide chez vous ? »** : en clair c'est un bloc noir,
   en sombre c'est une surface soulevée avec un bouton crème — pas un bloc crème
   qui éblouit.
4. **« Où va cet argent ? »** → la première carte dit maintenant
   « 121,3 **millions d'euros** au total sur l'année » (elle disait
   « 121,3 M€ », et au singulier). La deuxième carte ne répète plus trois fois
   la même donnée : la phrase, puis la barre, et c'est tout.
5. **Accueil → « Vous avez moins de 18 ans ? »** → la fiche F870 porte sa
   nouvelle date de vérification (19 octobre 2026), et le point-virgule du
   paragraphe JDC ne tombe plus seul en début de ligne.
6. **Repasse en clair** : rien ne doit avoir bougé. C'est le but — le thème
   clair n'a pas été retouché.

Si quelque chose est faux à l'écran, c'est l'écran qui a raison : dis-le-moi
avec la capture.

---

## 2. URGENT — la donnée de ton téléphone a sept jours

**Mesuré ce soir, directement sur la production :**
`https://repereapp.netlify.app/data/index.json` porte `"genere_le": "2026-10-13"`.
L'application mobile lit cette adresse (`mono/apps/mobile/src/lib/donnees.ts`,
`PRODUCTION`). Ton téléphone affiche donc, ce soir, la publication du 13 octobre.

**La cause, mesurée :** la collecte quotidienne de `main` a échoué **tous les
jours depuis le 9 octobre**, sans exception (15 derniers runs relevés par l'API
GitHub : un seul succès, le 09/10 à 12:06 UTC). L'étape qui tombe est
« Exécuter la chaîne ».

**Pourquoi elle tombe**, lu dans les annotations d'une PR qui ne touche que des
documents (`#159`), donc sur du code identique à `main` :

```
not ok 92 - votes — les lois sont distinguées des votes de détail
ECHEC | retention (0 nouveaute) — rien de nouveau depuis la visite
```

Deux contrôles du banc, et aucun des deux ne dit que l'application est fausse :

- le premier refuse le scrutin solennel **8705** parce que son intitulé ne
  commence pas par « l'ensemble de… » — l'Assemblée a changé sa formulation ;
- le second compare à une visite figée au 1er septembre 2026, alors que la
  donnée publiée a bougé depuis.

**C'est la raison pour laquelle presque toutes tes PR sont rouges.** L'épreuve
échoue sur `main`, donc sur tout ce qui en descend. Ce n'est pas 40 PR cassées :
c'est une seule cause, 40 fois.

### Ce qu'il faut faire

**La PR #147 corrige exactement ces deux contrôles.** C'est la seule de la pile
dont l'épreuve est verte, et elle est `mergeable_state: clean`. Elle touche
3 fichiers : `mono/tests/invariants.test.mjs`, `mono/tests/runtime.test.mjs`,
`outils/pipeline.sh`. Elle ne rend rien permissif : un vote solennel doit
toujours porter sur un **texte**, jamais sur un article, un amendement ou une
motion.

```powershell
cd C:\Users\APina\repere
gh pr view 147 --web
```

**Elle contient une décision produit qui t'appartient**, écrite par son auteur
« à valider par le porteur » : accepter que le vote sur **« la première partie
du projet de loi de finances »** compte comme un vote sur un texte entier, et
non comme un vote de détail.

> **Mon avis :** oui. Le vote sur une partie entière du budget est un vote
> politique majeur, pas un vote de détail — et un *article* du budget
> (« l'article liminaire… ») reste refusé par la règle. **Et c'est urgent :**
> le vote solennel sur la première partie du budget 2027 est inscrit au
> **20 octobre**, c'est-à-dire aujourd'hui. Sans cette forme, la collecte
> retombera demain pour cette raison-là, même une fois #147 fusionnée.

Si tu valides : sors #147 du brouillon, fusionne-la, puis relance la collecte à
la main et regarde si elle passe au vert :

```powershell
gh pr ready 147
gh pr merge 147 --squash
gh workflow run collecte.yml
```

Puis, deux minutes plus tard :

```powershell
gh run list --workflow=collecte.yml --limit 3
```

**Ne fusionne rien d'autre tant que celle-là n'est pas verte.** Les autres PR
rouges le sont à cause de `main` ; elles redeviendront vertes en se rebasant,
sans qu'on y touche.

---

## 3. La pile de PR : 45 ouvertes

Relevé ce soir par l'API :

| | nombre |
|---|---|
| PR ouvertes | **45** |
| en brouillon | 30 |
| prêtes | 15 |
| visant `main` | 31 |
| empilées sur une autre branche | 14 |

Les empilements vont jusqu'à **cinq niveaux** : `#162 → #161 → #160 → #148 →
feat/refonte-chez-vous-calendrier`. Ton téléphone suit `#151`, qui dépend
elle aussi de `#148`.

**Ce n'est pas tenable, et ce n'est pas un problème de rangement : c'est un
problème de vérité.** Tant que `#148` n'est pas fusionnée, personne ne sait ce
que `main` contient vraiment, et chaque PR du dessus porte le travail de toutes
celles du dessous.

**Ordre que je recommande, une fois #147 verte :**

1. `#147` — débloque l'épreuve (ci-dessus).
2. Relancer l'épreuve sur `#159` (documents seuls) : si elle passe au vert sans
   aucune modification, la cause est confirmée pour toute la pile.
3. Les trois PR de collecte : `#154` (sénateurs + jeton Netlify), `#133`
   (la raison d'un refus Netlify remonte), `#150` (runner épinglé). Elles
   réparent la publication, pas le produit.
4. Ensuite seulement, la chaîne mobile, du bas vers le haut :
   `#148`, puis `#151`, puis `#160`, `#161`, `#162`.
5. `#165` (taux des impôts locaux) et `#164` (quatrième onglet) sont des
   fonctionnalités : après la bêta, pas avant.

Les quatre plus anciennes n'ont pas bougé depuis le 5–8 octobre : `#77`, `#102`
(mentions légales — **décision juridique**), `#113`, `#114`. Deux portent
explicitement « À VALIDER » : elles attendent toi, pas un agent.

---

## 4. Les décisions qui n'attendent que toi

1. **Budget 2027 dans #147** (§ 2). Urgent, aujourd'hui.
2. **Couleurs d'échelon sur fond sombre.** Mesuré : sur une carte sombre,
   l'échelon `region` est à **2,42:1** et `ville` à **3,21:1**, pour 3:1 exigé
   sur un élément graphique (WCAG). Les éclaircir dépasserait l'amplitude RGB de
   24 de l'invariant 7. Trois options : (a) on accepte, les points gardent leur
   libellé à côté — c'est le cas aujourd'hui ; (b) tu autorises, **en thème
   sombre seulement**, une version éclaircie des cinq teintes ; (c) en sombre,
   l'échelon n'est plus porté par la couleur mais par un trait. *Je recommande
   (a) pour décembre, et (b) à étudier après le banc de test.*
   **Note :** l'échelon `france` (#1d1d1f) est déjà basculé à l'encre en sombre,
   mais ce n'est pas une décision nouvelle : le site l'avait tranché ainsi dans
   `mono/packages/ui/src/tokens.css`, mesure à l'appui (1,10:1 sinon).
3. **Notifications.** Voir § 5 : elles demandent une modification d'invariant, je
   ne l'ai pas faite seul.
4. **Mentions légales** (`#102`) : toujours en attente depuis le 8 octobre, et
   c'est un préalable à montrer Repère à de vrais testeurs.

---

## 5. Ce que je n'ai PAS fait, et pourquoi

### Les notifications

**Mesuré :** il n'y a aucune notification dans Repère. Ni `expo-notifications`
dans les dépendances, ni la moindre ligne de code, ni côté mobile ni côté site.
La seule occurrence du mot dans le dépôt est une garde qui **interdit**
`notificationAsync` (un effet haptique, sans rapport).

**Vérifié dans la documentation Expo (SDK 57) :**

- les **notifications locales programmées fonctionnent** dans Expo Go ;
- les **notifications push distantes** ne sont plus disponibles dans Expo Go
  depuis le SDK 53 : il faut un *development build*.

**Donc, concrètement :**

| | ce que ça demande | compatible Repère ? |
|---|---|---|
| Rappel local (« conseil municipal ce soir ») | rien de plus qu'une permission | **oui** |
| Push par sujet choisi, 2–3 fois par semaine | un serveur, un jeton par appareil | **non en l'état** |

Une vraie notification push suppose un serveur qui garde, pour chaque
téléphone, un jeton et le territoire suivi. C'est exactement ce que
l'invariant 2 interdit (« aucun compte, aucun traceur ; aucune adresse réseau
ne porte un code de commune »), et ce que tu as toi-même tranché le 13/10 :
pas de serveur pour la bêta de décembre.

Le rappel **local**, lui, tient dans les invariants : le téléphone a déjà le
calendrier de son département, il peut programmer lui-même ses rappels, sans
que personne n'apprenne quoi que ce soit. **Mais il demande une seconde clé de
stockage** (se souvenir que tu as accepté les rappels), et l'invariant 2 n'en
autorise qu'une. Tu as accepté le principe le 13/10 pour les centres d'intérêt,
en disant que l'invariant serait modifié dans la PR qui l'apporte.

**Je ne l'ai pas fait seul** : modifier un invariant demande ta décision
explicite et la mise à jour de `.claude/invariants.sha256`. Dis-moi oui et je
l'écris — c'est une demi-journée, pas plus.

### Le reste

- **Je n'ai pas fusionné, pas poussé sur `main`, pas déployé.**
- **Je n'ai pas lu les journaux des runs GitHub** : l'hôte qui les sert est
  bloqué depuis ce conteneur. Tout ce que je dis sur la collecte vient de l'API
  (conclusions des runs, annotations des contrôles), pas des journaux complets.
- **Je n'ai rien vu sur un vrai téléphone.** Toutes mes mesures viennent de
  l'export web rendu à 390 × 844 dans un navigateur. Les polices, les ombres et
  la barre d'état peuvent différer sur iOS.
- **Les fiches F871 et F1961 n'ont pas été relues** : seule F870 l'a été.

---

## 6. Si tu veux tout vérifier toi-même

```powershell
cd C:\Users\APina\repere\mono\apps\mobile
npx tsc --noEmit
node --test tests/theme-sombre.test.mjs tests/refonte-ux.test.mjs tests/liens-definitions.test.mjs tests/partager-lisible.test.mjs tests/territoire.test.mjs tests/texte-agrandi.test.mjs
```

Attendu : TypeScript muet, **51 contrôles verts**.

Pour le banc complet (il a besoin des données, donc d'une extraction) :

```powershell
cd C:\Users\APina\repere\mono
node scripts/extract-html.js ..\app_repere_v18_20.html .\data
node --test tests/core.test.mjs
```

Attendu : **30 contrôles verts**, dont les quatre nouveaux sur l'accord de
« million / millions ».
