# Repère — runbook de validation de production

*Écrit le 22 septembre 2026, avant le premier run de collecte.yml suivant le
push du correctif "mentions légales + v9" (origin/main = `7c7ceac`). Objectif :
formaliser une vérification réelle, pas une supposition — "GitHub affiche une
coche verte" n'est jamais une preuve suffisante ici.*

---

## 0. La chaîne réelle, tracée depuis le dépôt et GitHub — pas seulement lue

```
SOURCES OFFICIELLES (AN, Sénat, RNE, OFGL, INSEE...)
        ↓  outils/collecte.py (AN uniquement : agenda, organes, scrutins, circos)
data/*.zip, data/journal_collecte.json
        ↓  outils/pipeline.sh, etape par etape (voir §1)
outils/agenda_an.json, outils/circos.json, outils/scrutins_an.json, site_donnees/
        ↓  outils/build_pwa_reconstruit.py "$APP" site site_engendre
site_engendre/  (le HTML AUTONOME reconstruit — PAS le monorepo mono/)
        ↓  node test_repere.mjs "$APP"  ET  node test_repere.mjs site_engendre/index.html
        ↓  netlify-cli deploy --dir=site_engendre --prod --no-build
repereapp.netlify.app
```

**Constat qui doit être répété jusqu'à ce qu'il ne soit plus vrai** :
`outils/pipeline.sh`, sur `origin/main` aujourd'hui (vérifié par lecture directe
du blob, pas de la copie locale), appelle encore
`outils/build_pwa_reconstruit.py` — **pas** `mono/`. Le correctif poussé
aujourd'hui répare ce script pour qu'il ne plante plus ; il ne change pas
CE QUI est publié. Le run de demain, s'il réussit, republiera le HTML
autonome (~16 Mo), pas le monorepo léger. La bascule vers `mono/` reste une
décision séparée, non prise.

**Précision ajoutée le 22/09/2026, phase 3.2 — ne pas confondre les deux
branches.** Ce qui précède décrit `origin/main`. Sur la branche de travail
`audit-finalisation-repere`, `outils/pipeline.sh` a **déjà** été modifié le
18/09/2026 (commit `b4737ff`, jamais fusionné) pour construire
`site_engendre` depuis `mono/` — préparé, testé de bout en bout aujourd'hui,
toujours pas activé sur `main`. Détail complet, matrice ancien→mono et
procédure de retour en arrière : `docs/MONO_PIPELINE_BRIDGE_2026-09.md`.

## 1. Ce que `outils/pipeline.sh` exécute réellement, dans l'ordre

| # | étape | script | peut échouer silencieusement ? |
|---|---|---|---|
| 1 | dépiler les zips | `unzip` en boucle bash | non — `set -e` global |
| 2 | normaliser l'agenda AN | `outils/agenda_an.py` | non |
| 3 | décrire les schémas (doc) | `echantillon_scrutins.py`/`echantillon_source.py` | **oui, volontairement** (`\|\| echo warning`) |
| 3ter | commune → circonscription | `circos.py` + `circos_injecter.py` | **oui, volontairement** |
| 3quater | scrutins par député | `scrutins_an.py` | **oui, volontairement** |
| 3quinquies | décrire les acteurs (doc) | `echantillon_scrutins.py` | oui, volontairement |
| 3sexies | découpage par département | `decouper.py` | oui, volontairement (« non bloquant tant que l'application ne consomme pas encore ces fichiers ») |
| 3septies | couche éditoriale | `candidats.py` + `evenements.py` | oui, volontairement |
| 4 | vérification indépendante de l'agenda | script Python inline dans `pipeline.sh` | **non** — assertions bloquantes |
| 5 | **reconstruction du site** | `build_pwa_reconstruit.py` | **non — c'est le point qui a cassé 26 jours** |
| 5bis | pose du découpage dans le site | `cp -r site_donnees/*` | oui (`\|\| true`) |
| 6 | **le banc** | `test_repere.mjs` × 2 (fichier autonome + `site_engendre`) | **non — bloquant, c'est le verrou** |
| 7 | commit + push (depuis le runner) | `git commit && git push` | continue-on-error, mais tracé |
| 8 | publication Netlify | `netlify-cli deploy --prod --no-build` | continue-on-error, mais tracé et annoncé |

**Risque identifié, pas corrigé aujourd'hui (hors périmètre de ce push)** :
les étapes 3 à 3septies avertissent au lieu d'échouer. Si l'une d'elles échoue
silencieusement, la chaîne continue avec des données de la veille sans que
`collecte.yml` ne le signale en rouge — seul le texte du warning, dans les
logs, le dit. Le run de demain doit être lu en entier, pas juste regardé pour
sa couleur.

**Aucune référence à `main` en dur trouvée** dans `pipeline.sh` ni
`collecte.yml` — le déclenchement `schedule`/`workflow_dispatch` s'exécute
toujours sur la branche par défaut du dépôt (GitHub le fait implicitement),
qui est `main`. Aucun chemin mort ni ancien script historique appelé n'a été
trouvé dans le tracé ci-dessus (vérifié le 22/09/2026 en listant les scripts
réellement invoqués, pas seulement ceux présents dans `outils/`).

## 2. Le mécanisme COMMIT → BUILD → SITE PUBLIC (objectif 4)

**Ce qui existe déjà et suffit, sans rien construire de nouveau** :
`build_pwa_reconstruit.py` pose déjà un identifiant vérifiable — le contenu
du HTML lui-même porte la date de collecte (`agenda_an.json` a un champ
`maj`, vérifié à l'étape 4 comme égal à la date du jour). Le déploiement
Netlify, lui, porte un identifiant de déploiement dans son historique
(`netlify-cli deploy --message "Collecte du <date>"`).

**Le lien manquant, réel, à vérifier demain (pas à construire aujourd'hui)** :
rien dans le HTML public ne dit *"je viens du commit X"*. La preuve de
fraîcheur existante (`maj` == date du jour) prouve que la collecte a tourné
aujourd'hui, mais ne prouve pas que c'est CE commit précis qui a produit le
fichier vu en ligne. Proposition simple, pas encore implémentée : le message
de déploiement Netlify (`--message "Collecte du $(date)"`) pourrait porter
le SHA court (`git rev-parse --short HEAD`) en plus de la date — un ajout de
quelques caractères à une ligne existante de `pipeline.sh`, testable
localement, pas fait aujourd'hui car aucun run réel n'a encore eu lieu pour
le valider. **Décision proposée pour après le run de demain, pas avant.**

## 3. Checklist de validation du run de demain (~05h47 UTC)

### A. GIT
- [ ] `gh run view <id> --json headSha` = `7c7ceac...` (ou plus récent si un
      autre commit est arrivé entre-temps)
- [ ] `git log -1 --format=%H origin/main` correspond au SHA exécuté
- [ ] Aucun fichier `.github/workflows/` modifié par le run lui-même

### B. COLLECTE
- [ ] `data/journal_collecte.json` (commité par le run) : 5 sources, `ok:true`
      pour chacune, `octets` et `empreinte` non vides
- [ ] Aucun `::warning::` aux étapes 3 à 3septies dans les logs du job —
      sinon noter PRÉCISÉMENT lequel

### C. VALIDATION
- [ ] Étape "Executer la chaine" verte (c'est elle qui a cassé 26 jours)
- [ ] `test_repere.mjs` sur le fichier autonome : 55 contrôles, dont
      l'apostrophe typographique déjà connue comme non bloquante
      (pré-existante, voir §5)
- [ ] `test_repere.mjs` sur `site_engendre/index.html` : contrôles verts

### D. BUILD
- [ ] `outils/build_pwa_reconstruit.py` ne lève plus l'`AssertionError` sur
      `s-sources` / mentions légales
- [ ] Taille de `site_engendre/index.html` mesurée (comparer à
      `docs/PERFORMANCE_AUDIT_2026-09.md`)

### E. PUBLICATION
- [ ] Étape "Publier sur Netlify" : `steps.deploy.outcome == success`
- [ ] `https://repereapp.netlify.app/?verif=<date-du-jour>` répond 200

### F. POST-PUBLICATION — mesuré dans un vrai navigateur, pas supposé
- [ ] `window.REPERE_COMPLET === true`
- [ ] Bandeau "Maquette — contenus fictifs" visible
- [ ] Aucune occurrence de "DECISIONS ET VOTES REELS" / "SUIVI REEL"
      (`document.body.innerHTML.includes(...)`)
- [ ] Aucune phrase "Résumé assisté par IA — vérifié par un humain" affichée
      de façon statique (le glossaire contextuel "ia:" reste acceptable, voir
      note du 22/09/2026 dans le rapport de fusion)
- [ ] `performance.getEntriesByType("navigation")[0].decodedBodySize` mesuré
      et comparé au chiffre d'aujourd'hui (16 286 093 o) — toute baisse
      significative sans bascule `mono/` explicite serait suspecte, pas
      seulement une bonne nouvelle
- [ ] Une commune réelle recherchée (ex. Bagnolet) affiche un maire nommé

**Ne pas conclure "pipeline OK" sur la seule coche verte GitHub — cocher
chaque ligne ci-dessus avec une preuve, pas une impression.**
