# Audit de la tâche planifiée « Repere - pousser »

*Écrit le 22 septembre 2026. Inspection réelle — `Get-ScheduledTask`,
`Export-ScheduledTask` (XML brut de la tâche) et lecture complète de
`pousser.bat` — rien n'est supposé. Aucune modification n'a été faite à la
tâche ni au script : ce document recommande, il ne change rien.*

---

## TASK PUSH AUDIT

| champ | valeur mesurée |
|---|---|
| **Task** | `Repere - pousser`, enregistrée le 20/08/2026 par `PC_MATERIEL_NET\APina` |
| **Trigger** | `TimeTrigger`, démarre 2026-08-20T02:38:00, sans date de fin |
| **Frequency** | Répétition toutes les **PT1H** (1 heure), indéfiniment |
| **Next run** | 22/09/2026 19:38:00 (heure locale de la machine) |
| **Account** | `APina` (jeton interactif, `RunLevel: Limited` — pas un compte système, pas de privilèges élevés) |
| **Program** | `"C:\Users\APina\repere\pousser.bat"` |
| **Arguments** | aucun |
| **Working directory** | non fixée par la tâche ; le script fait lui-même `cd /d "%~dp0"` en première ligne, donc s'exécute toujours depuis `C:\Users\APina\repere\` |
| **Script — comportement d'ensemble** | `@echo off`, nettoie un éventuel reste `MERGE_AUTOSTASH`, lit la branche courante, **refuse tout sur `main`**, sinon met à jour la branche courante sur son propre amont puis committe et pousse |
| **Git add** | `git add -A` — tout ce qui n'est pas dans `.gitignore`, suivi ou non |
| **Git commit** | uniquement si `git diff --cached --quiet` détecte un changement ; message fixe `"Depot automatique du %DATE% %TIME%"` |
| **Git push** | `git push` (ou `git push -u origin HEAD` au tout premier envoi d'une branche) — **jamais `--force`**, jamais un argument de branche différent de la branche courante |
| **Remote** | `origin` (le seul remote configuré, `https://github.com/Repere0/repere.git`) |
| **Branch** | toujours la branche **courante** au moment de l'exécution — jamais `main` explicitement visé par un push |
| **Main potentially affected** | **Non, par construction.** Lignes 63-73 : si `git rev-parse --abbrev-ref HEAD` renvoie `main` (comparaison insensible à la casse), le script s'arrête après un simple `fetch` + `status`, sans `add`, sans `commit`, sans `push`. C'est une règle explicite, écrite après un incident réel du 13/09/2026 (`main` avancée sans la branche de travail, cercle vicieux de divergence) |
| **Untracked files potentially included** | **Oui, par construction de `git add -A`.** Tout fichier créé dans l'arborescence et non couvert par un `.gitignore` serait inclus. Mesuré : `mono/.gitignore` exclut déjà `data/`, `dist/`, `node_modules/`, `.turbo/`, `orchestrator/logs/` — les sorties engendrées par les commandes de cette session (`extract-html.js`, `pnpm build`) n'ont donc jamais été poussées |
| **Secrets risk** | **Réel mais partiel, mesuré précisément.** Le contrôle (lignes 128-165) : (1) exempte purement et simplement de tout contrôle les fichiers d'extension `.css .js .jsx .mjs .ts .tsx .html .md .py .map .bat` — un secret écrit EN DUR dans un de ces fichiers ne serait jamais détecté ; (2) pour le reste, cherche des sous-chaînes (`.env`, `secret`, `token`, `credential`, `.pem`, `id_rsa`) dans le **nom de fichier**, jamais dans le contenu — un fichier `.json` contenant une vraie clé mais nommé de façon anodine (`config.json`) passerait sans être détecté. Le contrôle est donc un filet contre l'accident nommé, pas contre le secret bien caché |
| **Failure behavior** | Fetch échoué → arrêt, rien poussé. Rebase échoué → arrêt, rien poussé, message demandant `git rebase --abort` puis d'en informer Claude. Push échoué → le commit local reste fait, rien n'est perdu, message explicite. Fichier > 50 Mo détecté → refus total, `git reset`, rien poussé. Aucun de ces chemins ne force, ne réessaie en boucle, ni ne supprime quoi que ce soit |
| **Overall risk** | **Faible pour l'intégrité du dépôt** (aucun chemin ne touche `main`, aucun `--force`, échecs toujours non destructifs) ; **réel mais modéré pour la confidentialité** (secrets détectés par nom de fichier seulement, pas par contenu) ; **réel et déjà mesuré aujourd'hui pour la maîtrise du chantier** (pousse automatiquement du travail en cours, sans relecture, toutes les heures) |

## RECOMMENDATION : **À ENCADRER**

Pas *SAFE* sans nuance : le push automatique et horaire de travail non relu
vers une branche distante n'est pas un risque pour le dépôt, mais casse la
distinction WORK → VALIDATION → RELEASE CANDIDATE que la mission demande de
garder — c'est exactement ce qui s'est produit aujourd'hui à 18h38 (un
instantané mi-chemin entre deux blockers a été poussé).

Pas *À METTRE EN PAUSE* non plus : le script est déjà prudent (garde `main`
inatteignable par construction, pas de `--force`, échecs non destructifs), et
la mission demande explicitement de ne pas y toucher. La désactiver serait
une action non autorisée pour ce chantier, pas une amélioration.

**Ce qui justifie « à encadrer » plutôt que « safe » sans réserve** : le
contrôle de secrets est un filet sur le nom, pas sur le contenu. Si un
fichier de configuration portant une vraie clé mais un nom anodin apparaît un
jour dans l'arborescence suivie, il partirait sans que ce script ne le voie.
Ce n'est pas un défaut à corriger dans le cadre de cette mission (la
consigne est de ne rien modifier) — c'est une réserve à connaître.

## Note annexe — un chemin mort dans le script

Le bloc `:maj_main` (lignes 96-104 de `pousser.bat`) n'est jamais atteint :
aucun `goto :maj_main` n'existe dans le script. C'est un reste d'une version
antérieure, sans effet aujourd'hui — signalé pour mémoire, non corrigé (hors
périmètre : ne pas modifier le script).
