# LA COLLECTE EST EN PANNE DEPUIS LE 26 AOÛT
**Constaté le 14 septembre 2026, en lisant GitHub Actions.**

> **Dix-neuf exécutions quotidiennes consécutives ont échoué. Le site en ligne sert
> des données du 26 août. Rien ne le disait.**

Ce document prime sur l'ordre de la feuille de route : tant que la collecte ne
repart pas, toute nouvelle donnée est une dette, et la bêta de décembre servirait
un instantané de l'été.

---

## CE QUI EST MESURÉ, ET NE SE DISCUTE PAS

| | |
|---|---|
| dernière collecte **verte** | **#25, le 26 août 2026 à 01h32 UTC** |
| exécutions depuis | **#26 → #44 : dix-neuf, toutes rouges** |
| `releve_le` des mandats dans le produit | **2026-08-26** |
| `releve_le` des scrutins dans le produit | **2026-08-26** |

**Les deux dates coïncident au jour près.** Les avertissements de fraîcheur que
l'extraction émet depuis le 13/09 (« le relevé des mandats date du 2026-08-26,
soit 19 jours ») disaient donc la vérité, et ils désignaient cette panne sans que
personne fasse le lien.

**`build-publish.yml` échoue aussi**, à chaque exécution planifiée sur `main`
(run #40, aujourd'hui, 52 s, `exit 1`).

---

## POURQUOI `build-publish.yml` ÉCHOUE — CERTAIN, ET REPRODUIT

Sur `main`, l'ordre des étapes est :

```
pnpm install → extraire les données → CONTRÔLES STATIQUES → pnpm build → …
```

Or **deux contrôles statiques lisent `apps/web/dist`** : celui qui vérifie que le
service worker précharge exactement ce que le build a produit, et celui qui vérifie
qu'aucune ressource d'un autre hôte n'a atterri dans la page publiée. Lancés avant
le build, ils tombent sur un dossier absent.

**Reproduit localement, en rejouant l'ordre de `main` :**

```
51 contrôles passent, 2 échouent :
  invariant 2 — le site publié ne charge AUCUNE ressource d'un autre hôte
  invariant 1 — le service worker précharge exactement ce que le build a produit
```

C'est exactement le défaut diagnostiqué le 13/09. **Le correctif — contrôles
statiques APRÈS le build — est sur la branche de travail, pas sur `main`.**
Fusionner répare donc cette chaîne-là.

---

## POURQUOI LA COLLECTE ÉCHOUE — PARTIELLEMENT ÉTABLI

**Ce qui est sûr :**

- le banc du fichier autonome **passe** sur l'état exact de `main` : 55 contrôles,
  0 échec. **Ce n'est donc pas le produit qui casse la chaîne.**
- l'annotation du run d'aujourd'hui est : *« L'enregistrement dans le dépôt a
  échoué (push refusé ?). La publication, elle, n'en dépend pas. »* Cette phrase
  n'est émise que par l'étape qui rend compte du **commit**. L'étape finale
  `exit 1` se déclenche sur `steps.commit.outcome == 'failure'`.
- l'étape de commit fait `git add -A`, puis **`git pull --rebase --autostash
  origin main`**, puis `git push`. Avec `set -e`, un rebase qui conflit termine
  l'étape. C'est la même famille de panne que celle qui a bloqué le dépôt local
  le 13/09.
- `permissions: contents: write` **est bien présent** dans `collecte.yml` sur
  `main` : ce n'est pas un défaut de déclaration.

**Ce qui n'est PAS établi, et je ne l'arrondis pas :**

- le premier échec (#26, 26 août) sort en **code 9**, aujourd'hui en **code 1** :
  ce sont deux causes différentes, ou la même étape qui échoue de deux façons ;
- **les journaux exigent d'être connecté à GitHub.** Je ne peux pas les lire, et
  je ne me connecterai pas à ta place.

---

## LES TROIS CHOSES À REGARDER, DANS CET ORDRE

**1. Ouvre le journal du dernier run et lis la première croix rouge.**
`Actions → Collecte quotidienne → #44 → collecte`. Trente secondes de lecture
remplacent toutes les hypothèses ci-dessus. La réponse est dans l'étape
« Télécharger les sources » ou « Committer ce qui a changé ».

**2. Vérifie s'il existe une protection ou une règle sur `main`.**
`Settings → Branches` et `Settings → Rules`. Une règle qui exige une *pull
request* ou des commits signés refuse le push du robot d'Actions — et c'est
exactement le piège annoncé dans la revue produit. Si une telle règle existe,
**excepte le robot d'Actions** plutôt que de la retirer.

**3. Vérifie `Settings → Actions → General → Workflow permissions`.**
Si le dépôt est réglé sur *Read repository contents permission*, le bloc
`permissions: contents: write` du workflow reste théoriquement prioritaire, mais
c'est le premier endroit où regarder quand un push de robot est refusé.

---

## LA LEÇON DE PRODUIT, ET ELLE EST PLUS LOURDE QUE LA PANNE

**Une chaîne qui tombe en silence pendant dix-neuf jours n'est pas un incident
d'infrastructure : c'est un défaut de conception.** Le produit avait tout ce qu'il
fallait pour le dire — les relevés portent leur date, l'extraction émet un
avertissement au-delà de sept jours — et cet avertissement partait dans le journal
d'un build que personne ne lit.

Deux corrections à écrire dans la feuille de route, avant toute nouvelle donnée :

1. **L'échec de la collecte doit être visible sans ouvrir GitHub.** Un courriel,
   une notification d'Actions, n'importe quoi qui sorte du journal. GitHub sait le
   faire pour les workflows planifiés qui échouent ; encore faut-il que les
   notifications soient activées sur ce dépôt.

2. **La fraîcheur doit se voir À L'ÉCRAN, pas seulement dans un build.** Le
   produit affiche déjà la date de chaque relevé — c'est bien, et c'est
   insuffisant : personne ne soustrait deux dates de tête. Au-delà d'un seuil, la
   source doit le dire en toutes lettres au lecteur : *« Ce relevé date du 26 août.
   Il devrait être rafraîchi chaque jour ; il ne l'est plus. »*

   **C'est la seule façon honnête de tenir la promesse « données officielles ».**
   Un produit qui affiche une date sans dire qu'elle est anormale laisse son
   lecteur croire que c'est la source qui n'a rien publié depuis trois semaines.
   Ce serait faire porter à l'État un retard qui est le nôtre.
