# Protéger `main` et préparer le passage du dépôt en public

Date : 17/11/2026. Pour le porteur : ce qui se règle à la main dans GitHub, dans l'ordre. Les règles elles-mêmes sont
écrites dans `CONTRIBUTING.md` (« Protection de la branche `main` ») ; ce guide dit où cliquer.

## 1. Avant de rendre le dépôt public (10 minutes)

1. **Secrets** : l'historique a été relu le 16/11/2026 (`AUDIT-REPO.md`, aucune correspondance) et gitleaks tourne sur
   chaque demande de fusion et chaque lundi (`.github/workflows/secrets.yml`). Lancer une fois **Actions → Recherche de
   secrets → Run workflow** sur `main` et attendre le vert : c'est le scan de tout l'historique.
2. **Secrets GitHub** (Settings → Secrets and variables → Actions) : ils restent privés quand le dépôt devient public.
   Rien à faire.
3. **Variables du dépôt** (même page, onglet *Variables*) : `APP_MODE`, `CONTACT_EMAIL`, `FEEDBACK_EMAIL` sont
   **publiques** par nature (elles finissent dans l'application servie). N'y mettre qu'une adresse dont tu détiens le domaine.
4. **Settings → General → Danger Zone → Change visibility → Public.**

## 2. Protéger `main` (Settings → Rules → Rulesets → New branch ruleset)

| champ | valeur |
|---|---|
| Nom | `main protégée` |
| Enforcement status | Active |
| Bypass list | l'App `repere-collecte` seulement (la collecte du matin commite ses données) |
| Target branches | Include default branch |
| Restrict deletions | coché |
| Block force pushes | coché |
| Require a pull request before merging | coché ; *Required approvals* : **0** tant que tu es seul mainteneur (GitHub interdit d'approuver sa propre PR), 1 ensuite |
| Require status checks to pass | coché ; ajouter `mobile`, `epreuve`, `Analyser (javascript-typescript)`, `revue`, `gitleaks` |
| Require branches to be up to date before merging | coché |

Un contrôle n'apparaît dans la liste qu'après sa première exécution. `epreuve` passe par une file qui n'en rejoue
qu'une à la fois : une épreuve en attente peut être annulée par une plus récente ; elle se relance depuis **Actions**.

## 3. Sécurité du code (Settings → Code security)

- **Secret scanning** et **Push protection** : activer (gratuits sur un dépôt public). Le push d'un jeton connu est bloqué
  avant même la demande de fusion.
- **Dependabot alerts** et **Dependabot security updates** : activer.
- **Private vulnerability reporting** : activer (`SECURITY.md` y renvoie).
- **CodeQL** : garder le workflow du dépôt ; ne pas activer aussi la « configuration par défaut » (doublon).

## 4. Accueillir les contributeurs

- **About** (roue dentée, page d'accueil du dépôt) : description et sujets proposés dans `AUDIT-REPO.md` ; site web :
  l'adresse de la démo.
- **Social preview** : Settings → General → téléverser `docs/social-preview.png`.
- **Issues** : les modèles « Signaler un bug » et « Proposer une fonctionnalité » sont dans `.github/ISSUE_TEMPLATE/`.

## 5. Vérifier

Ouvrir une demande de fusion de test qui modifie un commentaire : le bouton « Merge » doit rester gris tant que les cinq
contrôles ne sont pas verts, et un `git push --force` sur `main` doit être refusé.
