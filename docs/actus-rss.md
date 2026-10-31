# Actualités par flux RSS officiel des mairies

Décision D81 (31/10/2026), cadre : `docs/adr/0007-flux-rss-mairies.md`.

## Ce que fait la chaîne

Chaque nuit, `outils/pipeline.sh` lance, après `pnpm install` :

    node scripts/collecte-rss-mairies.mjs ./data

Le script lit `mono/data/mairies-idf.json` (les sites, produits juste avant par `collecte-sites-mairies.mjs`), puis, pour chaque site en https, teste dans cet ordre :

    /feed/   /rss   /flux-rss   /955.htm

Il garde le premier candidat qui répond par un flux RSS ou Atom. Une réponse HTML, une 404, une erreur ou un délai est refusé sans analyse. **Aucune autre page du site n'est demandée.**

Il écrit `mono/data/actuelles-rss.json` : au plus trois entrées par commune, la plus récente d'abord. Chaque entrée porte titre, date, lien vers la page d'origine et deux phrases au plus.

Le bilan (sites testés, avec flux, avec entrée) est dans le champ `bilan` du fichier.

## Gardes

- lien en https, même domaine que le site de la mairie (le `www.` est ignoré) ;
- date présente et non future ;
- titre présent ;
- pas de HTML lu, pas d'article entier repris.

## Ce qui n'est pas vérifié

- **La couverture** : combien de communes ont un flux. Non mesurée dans la session de V40 (réseau refusé vers les sites des mairies). Elle sortira du `bilan` de la chaîne.
- **Les quatre adresses candidates** : elles sont une hypothèse. Seule la réponse réelle d'un site dira si elles existent.
- **La licence de chaque flux** : écrite « non vérifiée » dans le fichier. Une vérification commune par commune est requise avant publication (ADR 0007).
- **Les sites en sous-dossier** (`https://mairie.fr/ville/`) : les candidats sont cherchés à la racine du domaine seulement.

## Lancer à la main

    cd mono
    node --test tests/collecte-rss.test.mjs        # tests, sans réseau
    node scripts/collecte-rss-mairies.mjs ./data   # réseau requis, mairies-idf.json requis

Sans `mairies-idf.json`, le script s'arrête avec un message et n'écrit rien.

## Secrets

Aucun. Ce lot n'utilise pas d'API payante ni de clé.
