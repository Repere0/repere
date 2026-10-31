# Kit de survie du CEO — actions récurrentes après la bêta

30/10/2026 (V23). Un seul document pour savoir quoi faire, et quand. Chaque geste renvoie à la procédure détaillée, qui fait foi. Rien ici n'invente de règle : tout est repris des décisions et des fichiers du dépôt.

**À savoir avant tout** :
- `main` est protégée : toute modification passe par une pull request.
- Fusionner ne publie rien. La production change à la collecte suivante, chaque jour à 05 h 47 UTC (06 h 47 à Paris en hiver, 07 h 47 en été), ou plus tôt avec `gh workflow run collecte.yml --ref main`.
- Les testeurs lisent les données de la production. Le code de l'application, lui, vient de ton ordinateur (Expo).

## Chaque jour (2 min)

| Geste | Comment | Si ça ne va pas |
|---|---|---|
| Vérifier la collecte du matin | GitHub → **Issues** : le titre de l'issue de santé, toujours ouverte, dit l'état de la dernière publication (`outils/sante_publique.sh`). Lisible depuis un téléphone. Pour le détail : Actions → « collecte ». | Rouge à « Signaler les echecs de collecte » : une source n'a pas répondu, les données de la veille restent en ligne. Relancer plus tard. Rouge à Netlify : lire le message d'erreur du run (jeton expiré ?). Voir « Secrets » plus bas. |
| Lire les retours testeurs | Messages reçus → une ligne dans `docs/tableau-retours-rempli.csv` (copie locale, **jamais commitée**, voir `docs/checklist-distribution.md`, étape 5). | « Bug critique : oui » : corriger avant d'élargir. |

## Chaque semaine (30 min)

| Geste | Comment |
|---|---|
| **Actu locale des communes pilotes** (D29 à D31, D33, D35) | `docs/strategie-editoriale.md`, « Procédure du dimanche soir ». Résumer une page officielle (mairie, AN, Sénat, préfecture) en un titre et deux phrases. L'IA peut aider à résumer, jamais inventer. Pas de presse. Puis pull request vers `main`, fusion, collecte. **Rien de neuf : laisser vide**, l'application affiche « Repère publie quand il y a du nouveau ». |
| Relire le résumé de la collecte | Section « Bilan des collectes » du run : sites de mairies, photos, agrégats régionaux. Une ligne à 0 ou « fichier absent » se note dans `BLOCAGES.md`. |
| Point testeurs | `docs/template-debrief.md` et `docs/tableau-debrief.csv` (copie remplie locale, jamais commitée). |

## Quand un événement arrive

| Événement | Geste | Procédure |
|---|---|---|
| **Un élu décède ou quitte son mandat** et le Répertoire national des élus ne l'a pas encore retiré | Ajouter une entrée à `mono/apps/mobile/src/lib/mandats-termines.ts` : nom tel que le RNE l'écrit, date, motif seulement s'il est publié officiellement, adresse de la source officielle. Relancer Expo. La mention disparaît d'elle-même quand le RNE le retire. | D32, `BLOCAGES.md` section 23 |
| **Une personne demande le retrait de sa photo** | La retirer, l'ajouter à `mono/scripts/photos-retirees.json` (sinon elle revient à la collecte suivante), commit, PR, collecte, puis répondre à la personne. | `docs/data/photos-elus.md`, `docs/juridique/droit-image-elus.md` |
| **Une actu publiée est fausse** | Vider l'entrée dans `data/actus-hebdo.json`, PR, fusion, puis `gh workflow run collecte.yml --ref main` sans attendre le lendemain. | `docs/strategie-editoriale.md` |
| **La production est cassée après une fusion** | Urgence : Netlify → Deploys → le déploiement d'avant → *Publish deploy*. Attention : la collecte du lendemain republie `main`. Durable : `git revert -m 1 <fusion>`, PR, collecte. | `docs/fusion-main.md` (Rollback), `docs/MONO_PRODUCTION_ROLLBACK.md` |
| **Nouvelle session testeurs** | Lancer `scripts/lancer-pour-testeurs.ps1`, tester soi-même sur son iPhone, puis envoyer le QR code. | `docs/checklist-distribution.md`, `docs/kit-testeur.md` |
| **Fusion de la branche dans `main`** | Refaire l'essai de fusion, puis PR, vérifications au vert, « Create a merge commit », collecte. | `docs/fusion-main.md` |

## Secrets (quand un jeton expire)

GitHub → Settings → Secrets and variables → Actions :
- `NETLIFY_AUTH_TOKEN` et `NETLIFY_SITE_ID` : la publication. Sans eux, la collecte tourne mais ne publie rien.
- `COLLECTE_APP_ID` et `COLLECTE_APP_KEY` : le robot qui enregistre la collecte sur `main` protégée.

Ne jamais coller un secret dans une conversation, Claude compris.

## Ce que le CEO ne délègue pas

- Le texte publié (D33 : le CEO reste responsable du contenu).
- La fusion sur `main` et le choix du moment.
- Les réponses aux personnes (retrait de photo, testeurs).
- Toute modification d'un invariant : seulement par décision formelle, écrite dans `CLAUDE.md`.

## Ce que ce document ne couvre pas (non vérifié)

- **Durée réelle d'une collecte complète** : non mesurée, `gh` n'était pas authentifié le 30/10.
- **Alerte par e-mail d'un échec** : le workflow tient à jour une issue de santé (étape « Mettre a jour l'etat de sante visible »), mais un e-mail n'arrive que si tu suis cette issue ou si tes réglages de notification GitHub le prévoient. À vérifier une fois.
- **Calendrier post-bêta** : D36 (députés sortants avec historique) est prévue après la bêta, sans date.
