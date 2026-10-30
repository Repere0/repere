# ADR 0004 — Photos des élus, sous licence libre seulement

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026 (décision D27 du CEO). Invariant 7 complété dans `CLAUDE.md` et `AGENTS.md`, puis scellé.
- **Porte la décision :** le porteur.

## Décision

1. **Autorisé :** une photo d'élu issue de **Wikimedia Commons**, sous **CC BY-SA, CC BY, CC0 ou domaine public**. Elle est trouvée par la propriété Wikidata **P18** (image) de l'élu.
2. **Interdit :** les photos de l'Assemblée nationale (licence incompatible avec un usage commercial, voir D1), et toute photo dont la licence n'est pas lue dans les métadonnées de Commons.
3. **Crédit affiché sous chaque photo :** auteur, nom de la licence, mention « Wikimedia Commons ».

## Ce qui a été ajouté à la décision, et pourquoi

- **Les photos sont servies par département, depuis les données de Repère, jamais depuis Wikimedia au moment de l'affichage.** Charger une photo sur `upload.wikimedia.org` quand on ouvre une fiche dirait à Wikimedia quel député le lecteur regarde, donc, à une circonscription près, où il habite. C'est la raison de l'invariant 2 : les positions de vote sont servies par département, jamais par député. La chaîne de publication télécharge des vignettes et les publie dans `data/photos-elus/{département}.json`.
- **Rapprochement sûr, ou pas de photo.**
  - Député : par son identifiant de l'Assemblée sur Wikidata, puis vérification que le nom de famille concorde.
  - Maire : par la commune (code INSEE) et son chef de l'exécutif en cours sur Wikidata, puis la même vérification du nom face au Répertoire national des élus.
  - Sans double concordance, pas de photo : une photo d'un homonyme serait une fausse information.
- **CC BY-SA et recadrage :** l'avatar est un cercle. C'est une modification au sens de la licence : le crédit l'indique (« recadrée »). La photo modifiée reste sous la même licence.

## Risques à connaître (non juridiques : je ne suis pas juriste)

- **Droit à l'image** : une photo libre de droits d'auteur n'efface pas le droit à l'image de la personne photographiée. L'usage pour un élu dans l'exercice de son mandat est en général admis, mais un élu peut le contester. À faire valider.
- **Exactitude** : Wikidata est éditable par tous. La photo peut être ancienne ou fausse. Le crédit renvoie à la page Commons pour que chacun puisse vérifier.

## Motif de la règle sur les photos de l'Assemblée (réintégré, V29)

Le motif était écrit dans le commentaire de `mono/apps/mobile/src/ui/avatar.tsx` en V15 : les photos de l'Assemblée nationale ne sont pas chargées par l'application, pour ne pas révéler l'adresse du lecteur. Une image chargée depuis un serveur de l'Assemblée transmettrait en effet l'adresse du lecteur à ce serveur. Ce motif s'ajoute à celui de la licence ci-dessus. Il a disparu d'un commentaire réécrit en V20 et n'était plus écrit nulle part ; il est réintégré ici (audit anti-perte, D51).
