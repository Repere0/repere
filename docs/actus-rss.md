# Actualités par flux RSS officiel des mairies

Décisions : D81 (lecture des flux, `docs/adr/0007-flux-rss-mairies.md`) et D82 (mode brouillon, publication désactivée par défaut).

## Ce que fait la chaîne

Chaque nuit, `outils/pipeline.sh` lance, après `pnpm install` :

    REPERE_PUBLICATION_ACTUS="${REPERE_PUBLICATION_ACTUS:-false}" \
      node scripts/collecte-rss-mairies.mjs ./data ../data/auto/actus-brouillon.md

Le script lit `mono/data/mairies-idf.json` (les sites, produits juste avant par `collecte-sites-mairies.mjs`), puis, pour chaque site en https, teste dans cet ordre :

    /feed/   /rss   /flux-rss   /955.htm

Il garde le premier candidat qui répond par un flux RSS ou Atom. Une réponse HTML, une 404, une erreur ou un délai est refusé sans analyse. **Aucune autre page du site n'est demandée.**

Il écrit `mono/data/actuelles-rss.json`, au plus trois entrées par commune, la plus récente d'abord. Chaque entrée porte titre, date, lien vers la page d'origine et deux phrases au plus. Le bilan (sites testés, avec flux, avec entrée) est dans le champ `bilan`.

## Mode brouillon (défaut, D82)

Tant que `REPERE_PUBLICATION_ACTUS` n'est pas exactement `true` :

- `actuelles-rss.json` est écrit avec `"publication": false` et **aucune entrée** : l'application n'affiche rien de ce flux (`actusFlux` refuse tout fichier sans `publication: true`) ;
- les entrées trouvées sont écrites dans `data/auto/actus-brouillon.md` (Markdown, lisible sur GitHub), en « Non publié ».

**Procédure du dimanche (CEO)** :

1. Ouvrir `data/auto/actus-brouillon.md`.
2. Pour chaque entrée retenue, relire la page indiquée (D33 : le CEO relit chaque fait contre la page).
3. Copier **au plus une entrée par commune** dans `data/actus-hebdo.json` (titre, resume, source, source_nom). Le format de ce fichier n'a qu'un emplacement par commune.
4. Commiter, puis ouvrir une PR vers `main` (procédure D29).

**Avant d'activer la publication automatique**, il faut un avis juridique écrit (ADR 0007) et une vérification de la licence de chaque flux.

## Activer la publication automatique (après avis)

La chaîne ne lit pas de variable GitHub : `collecte.yml` ne transmet que ce qu'il transmet. Deux façons, toutes deux par PR relue :

- changer le défaut dans `outils/pipeline.sh` (`:-false` devient `:-true`) ; ou
- ajouter `REPERE_PUBLICATION_ACTUS: "true"` dans l'`env` de l'étape « collecte » de `.github/workflows/collecte.yml` (fichier protégé, à modifier par PR).

Rien n'est activé aujourd'hui.

## Gardes

- lien en https, même domaine que le site de la mairie (le `www.` est ignoré) ;
- date présente et non future ;
- titre présent ;
- pas de HTML lu, pas d'article entier repris.

## Ce qui n'est pas vérifié

- **La couverture** : combien de communes ont un flux. Non mesurée (réseau refusé vers les sites des mairies). Elle apparaîtra dans le `bilan` de la chaîne.
- **Les quatre adresses candidates** : une hypothèse. Seule la réponse réelle d'un site dira si elles existent.
- **La licence de chaque flux** : écrite « non vérifiée » dans le fichier.
- **Les sites en sous-dossier** (`https://mairie.fr/ville/`) : les candidats sont cherchés à la racine du domaine seulement.
- **Visibilité** : le dépôt est public. Le brouillon, une fois commité par le bot, est lisible par tous avant toute relecture juridique (voir `docs/fusion-main.md`).

## Lancer à la main

    cd mono
    node --test tests/collecte-rss.test.mjs        # tests, sans réseau
    node scripts/collecte-rss-mairies.mjs ./data ../data/auto/actus-brouillon.md   # réseau et mairies-idf.json requis

Sans `mairies-idf.json`, le script s'arrête avec un message et n'écrit rien.

## Secrets

Aucun. Ce lot n'utilise ni API payante ni clé.
