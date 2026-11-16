# Audit du dépôt GitHub — 16/11/2026

Point de départ : `main` à 3c5e601f. Branche : `chore/repo-professionalisation`. Ce qui est mesuré est marqué comme tel ; ce que je n'ai pas pu vérifier l'est aussi.

## Ce qui donnait l'impression d'un dépôt d'amateur

1. **La racine** : 88 entrées, dont 58 notes de version ou rapports (`RESUME-v3.md` à `RESUME-v64.md`, `VERDICT-*`, `RAPPORT-*`), 8 copies de 16 Mo de l'application (`app_repere_v18_13.html` à `v18_19.html`, plus un `.bak`), une archive `repere_debug.zip` de 12 Mo et un dossier `Claude outputs/`.
2. **Le README se contredisait** : il disait que « le fichier `LICENSE` n'est pas encore dans le dépôt », alors qu'il y est depuis le 02/11, et il avait deux sections « Licence ».
3. **Le CI était rouge sur toutes les PR** : depuis le 15/11, `ubuntu-latest` est Ubuntu 26.04, et Playwright 1.56.0 ne s'y installe pas (collecte, run 144 ; épreuve de #223).
4. **Sur GitHub**, la fiche du dépôt n'a ni description ni topics ; elle n'a ni modèle d'issue, ni politique de sécurité, ni analyse de code.

## Inventaire

| élément | état avant | priorité | action |
|---|---|---|---|
| `README.md` | présent, contradictoire (licence), sans badge | haute | **réécrit** : pitch, badges, démarrage rapide, architecture, liens |
| `LICENSE` | présent (AGPL-3.0, reconnue par GitHub) | — | rien |
| `CONTRIBUTING.md` | présent, licence dite « pas encore fixée » | moyenne | **corrigé** : licence, branches, contrôles à lancer, convention de commit |
| `SECURITY.md` | absent | haute | **créé** : signalement privé GitHub ou courriel, délais, périmètre |
| `CODE_OF_CONDUCT.md` | absent | moyenne | **créé** : Contributor Covenant 2.1 en français (traduction de travail, la version anglaise fait foi) |
| `CHANGELOG.md` | absent | moyenne | **créé** : Keep a Changelog. Seule la 0.1.0 existe (`app.json`) : je n'ai inventé ni 0.2 ni 1.0 |
| `.gitignore` | présent, solide | basse | **complété** : `.DS_Store`, `*.log`, `*.bak`, `dist/`, `Claude outputs/` |
| `.editorconfig` | absent | basse | **créé** : UTF-8, LF, 2 espaces (4 pour Python), le HTML de données laissé intact |
| `.github/CODEOWNERS` | absent | basse | **créé** : @Repere0 sur `.github/`, `.claude/`, invariants, ADR, collecte, fil éditorial |
| `.github/ISSUE_TEMPLATE/` | absent | moyenne | **créé** : bug, proposition, liens sécurité et contact |
| `.github/PULL_REQUEST_TEMPLATE.md` | absent | moyenne | **créé** : ce qui change, comment c'est vérifié, ce qui ne l'est pas, liste de contrôle |
| `.github/dependabot.yml` | absent | moyenne | **créé** : Actions chaque semaine ; npm en correctifs de sécurité seulement (voir plus bas) |
| `.github/workflows/codeql.yml` | absent | haute | **créé** : JS/TS, Python, Actions ; push sur `main`, PR, chaque lundi |
| `.github/workflows/dependency-review.yml` | absent | moyenne | **créé** : une PR qui ajoute une dépendance à faille haute ou critique échoue |
| Permissions des workflows | `contents: read` partout, sauf la collecte (`contents: write`, `issues: write`, `actions: read`, nécessaires) | — | conservées ; les nouveaux workflows sont en `contents: read`, et CodeQL ajoute `security-events: write` au seul job |
| Runner `ubuntu-latest` | 4 workflows | **haute** | **épinglé sur `ubuntu-24.04`** (remplace #150) |
| Copies anciennes de l'application, `.bak`, `repere_debug.zip` | 9 fichiers, environ 125 Mo | haute | **retirés de l'arbre** (remplace #155) |
| 58 notes et rapports à la racine | racine | haute | **déplacés** dans `docs/historique/` (`git mv`, historique conservé), et 8 fichiers qui les citaient mis à jour |
| `site/index.html` (15,5 Mo), `site_donnees/` | site de l'ère mono-fichier | basse | **laissés** : encore cités par `outils/build_pwa_reconstruit.py`. À trancher par le porteur |
| `*.bat` (5 scripts Windows) | racine | basse | **laissés** : ce sont les scripts du poste du porteur. Les ranger dans `scripts/windows/` changerait ses habitudes |
| Image de prévisualisation sociale | absente | basse | **générée** : `docs/social-preview.png` (1200×630, logo et pitch). Elle se téléverse à la main |
| Description, topics | absents (mesuré par l'API de recherche) | haute | **texte prêt** ci-dessous, à coller à la main |
| Site web du dépôt | `https://repere-demo-plum.vercel.app` | — | déjà renseigné |

## Sécurité — ce qui a été vérifié

- **Historique complet** (1 492 commits, dépôt dé-superficialisé) cherché par expressions régulières (`git log -G`) : clés AWS, jetons GitHub (`ghp_`, `github_pat_`), Netlify (`nfp_`), OpenAI et Anthropic (`sk-`, `sk-ant-`), Slack, Google (`AIza`), clés privées PEM, et affectations du type `TOKEN=`, `SECRET=`, `PASSWORD=`, `API_KEY=` suivies de plus de 20 caractères. **Aucune correspondance.**
- **Fichiers sensibles jamais ajoutés** dans l'historique (`.env`, `.pem`, `.key`, `.p12`, `id_rsa`, keystore, `google-services`) : seul `mono/apps/mobile/.env.example` apparaît, et c'est voulu.
- **`repere_debug.zip`** : archive ouverte et parcourue avec les mêmes motifs, aucune correspondance.
- **Non fait** : `gitleaks` et `trufflehog`. Leur téléchargement a été refusé dans cette session, donc l'analyse ne repose que sur mes motifs, sans leur base de règles ni la mesure d'entropie. Le *secret scanning* de GitHub, gratuit sur un dépôt public, couvrira le reste une fois activé (Phase 6).

## Hygiène Git — mesuré

- **Conventional Commits** : 477 des 819 commits non fusionnés de `main` (58 %) suivent le format. La convention est maintenant écrite dans `CONTRIBUTING.md`.
- **Husky et commitlint : non installés, exprès.** Il n'y a pas de `package.json` à la racine, et les commits viennent surtout du porteur et des agents, qui écrivent des corps longs en français. Un hook local n'agit que sur le poste où il est installé. Le modèle de PR et la relecture suffisent à ce stade.
- **Fichiers de plus de 1 Mo encore suivis** : `app_repere_v18_20.html` (16,6 Mo, source des données de la chaîne, indispensable), `site/index.html` (15,5 Mo), `data/circos_ministere.xlsx` (1,6 Mo).
- **Taille de l'historique** : 94 Mo compressés. Retirer les fichiers de l'arbre **ne réduit pas** ce poids, il reste dans l'historique. Le réduire voudrait dire réécrire l'historique (`git filter-repo`) puis forcer la poussée sur `main` : c'est irréversible et ça casse tous les clones et toutes les PR ouvertes. **Je ne le recommande pas avant la bêta.** Git LFS ne servirait à rien non plus : le gros fichier restant est régénéré chaque jour par la chaîne.
- **Fichiers d'OS** : aucun `.DS_Store`, `Thumbs.db` ni `node_modules` suivi.
- **Écart constaté, non corrigé** : `CLAUDE.md` parle de 1 262 communes, la chaîne en indexe 1 264 (journal de l'épreuve du 16/11). Le README garde le chiffre de `CLAUDE.md`. La question est posée au porteur.

## Dependabot : pourquoi seulement les correctifs de sécurité pour npm

L'application suit un SDK Expo : les versions de `react-native`, `expo-*`, etc. doivent aller ensemble, et c'est `npx expo install` qui le sait. Des PR de version hebdomadaires de Dependabot seraient une vingtaine de PR par mois, souvent incompatibles, pour un seul mainteneur. `open-pull-requests-limit: 0` coupe les mises à jour de version et garde les correctifs de sécurité. Pour ces derniers, « Dependabot security updates » doit être activé dans les réglages.

## Ce que je n'ai pas pu faire (droits) — à faire à la main

Les outils de cette session ne peuvent pas modifier les réglages du dépôt. Environ 10 minutes dans **Settings** :

1. **About** (roue dentée à droite de la page d'accueil du dépôt) :
   - Description : `Application civique neutre : qui décide dans ma commune et où va mon argent, chaque chiffre sourcé et daté.`
   - Topics : `civic-tech`, `open-data`, `france`, `react-native`, `expo`, `typescript`, `democratie`, `finances-publiques`
2. **Social preview** : Settings → General → Social preview → téléverser `docs/social-preview.png`.
3. **Branch protection** de `main` : Settings → Branches (ou Rules → Rulesets) :
   - exiger une PR avant de fusionner : oui ;
   - **nombre de relectures exigées : 0, pas 1.** Avec un seul mainteneur, GitHub interdit d'approuver sa propre PR : exiger 1 relecture te bloquerait sur tes propres PR, ou t'obligerait à contourner la règle à chaque fois. À passer à 1 le jour où il y a un deuxième mainteneur ;
   - exiger les contrôles : `epreuve`, `Analyser (javascript-typescript)`, `revue` (ils n'apparaissent dans la liste qu'après une première exécution) ;
   - interdire le *force push* et la suppression : oui.
4. **Code security** (Settings → Code security) :
   - Secret scanning et Push protection : activer ;
   - Dependabot alerts et Dependabot security updates : activer ;
   - Private vulnerability reporting : activer (`SECURITY.md` y renvoie) ;
   - CodeQL : laisser le workflow du dépôt. Ne pas activer aussi la « configuration par défaut », qui ferait doublon.

## Suites possibles, non faites ici

- Fermer les PR #150 et #155, que cette PR remplace.
- Faire le tri des 115 branches non fusionnées et des 47 PR ouvertes de plus de 3 semaines. Cette PR n'en ferme aucune.
- Mettre une première étiquette `v0.1.0` au moment de l'ouverture aux 10 testeurs, pour que `CHANGELOG.md` ait une version réelle à pointer.
