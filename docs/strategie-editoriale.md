# Stratégie éditoriale

Date : 30/10/2026. Questions posées en V20, tranchées par le CEO en V21 (D29, D30, D31).

## Ce qui existe aujourd'hui (faits vérifiés dans le dépôt)

- **Fil de la rédaction** : `data/evenements.json` contient **8 faits**, tous nationaux. Le plus récent date du **14/08/2026** (décision du Conseil constitutionnel), les 7 autres sont des scrutins de juillet 2026. Aucun fait propre à une commune.
- **Format d'un fait** : `docs/data/evenements-format.md`. Chaque fait a un titre et un résumé écrits par un humain, une source officielle (sans source, il n'est pas publié) et une date. Les fichiers validés vivent dans `data/evenements/*.md`.
- **Ce qui se met à jour seul, chaque jour** (`collecte.yml`) : élus, comptes, scrutins, agendas. Rien d'éditorial.
- **Conséquences visibles dans l'application** :
  - l'écran Actualités montre des faits vieux de plus de deux mois ;
  - la carte « Dernières publications » de l'accueil reste masquée (règle : moins de 7 jours) ;
  - les testeurs ne verront « rien de neuf » en revenant.

## Décisions du CEO (30/10/2026)

### D29 — Qui publie : hybride
- **Automatique**, déjà en place : votes de l'Assemblée, comptes OFGL, calendrier (chaîne quotidienne `collecte.yml`).
- **Manuel** : une actualité locale par commune pilote, rédigée par le CEO **chaque dimanche soir**, dans `data/actus-hebdo.json`.
- **Jamais** d'IA générative pour rédiger, ni d'aspiration d'articles de presse (droits d'auteur). *Précisé par D33 ci-dessous.*

### D33 — Clarification de D29 (30/10/2026) : résumé assisté, oui ; invention, non

L'IA générative peut aider à RÉSUMER une source officielle (le texte source reste de la mairie/AN). Elle ne peut PAS inventer une actu, ni scraper la presse (droits d'auteur). Le CEO reste responsable du contenu publié.

En pratique :
- **Permis** : coller le texte d'une page officielle (site de la mairie, Assemblée nationale, Sénat, préfecture) et demander un titre et deux phrases. Le CEO relit chaque fait contre la page, puis met l'adresse de cette page dans `source`.
- **Interdit** : une actu sans page source, un fait absent de la page, une reprise d'article de presse, une collecte automatique de sites de presse.
- **Ce que le résumé ne doit pas ajouter** : chiffre, date, nom ou jugement (« bonne nouvelle », « enfin ») absents de la source. Les invariants 3 (pas de classement) et 9 (pas de fausse fraîcheur) s'appliquent au résumé comme au reste.
- `date_publication` reste la date où Repère publie, pas celle de la page source.

### D30 — Combien de communes
- **Automatique** : toute l'Île-de-France (1 262 communes).
- **Manuel, chaque semaine** : 3 communes pilotes au démarrage, **Melun (77288), Meaux (77284), Versailles (78646)**. Extension après les retours des testeurs.

### D31 — Rythme
- **Hebdomadaire au minimum** pour le manuel.
- L'application affiche « Cette semaine à [Commune] » avec l'actualité si elle existe. Sinon, un état vide honnête : « Repère publie quand il y a du nouveau. Aucune actu cette semaine pour [Commune]. [Voir les dernières publications] » (formulation D35, 30/10/2026 ; la brief D31 disait « Repère publie chaque lundi »).
- La carte n'apparaît que pour les communes pilotes : pour les autres, elle annoncerait une actualité qui ne viendra pas.

## Format de `data/actus-hebdo.json`

```json
{
  "semaine": "2026-W45",
  "date_publication": "2026-11-03",
  "communes": {
    "77288": {
      "titre": "Phrase courte, écrite par le CEO",
      "resume": "Deux phrases. Ce que dit la source, sans jugement.",
      "source": "https://… (page officielle : mairie, préfecture, Journal officiel…)",
      "source_nom": "Nom de la source officielle"
    },
    "77284": { "titre": "", "resume": "", "source": "", "source_nom": "" },
    "78646": { "titre": "", "resume": "", "source": "", "source_nom": "" }
  }
}
```

Règles appliquées par l'application et par les tests :
- une entrée n'est affichée que si `titre`, `resume` et `source` sont remplis, et si `source` commence par `https://`. Une entrée vide n'affiche rien ;
- `source_nom` est ajouté à la brief : l'invariant 4 demande le producteur, pas seulement l'adresse. Sans lui, l'application écrit « Source » ;
- `date_publication` ne doit pas être dans le futur : sinon l'entrée n'est pas montrée avant ce jour ;
- « Cette semaine » : publication de moins de 7 jours. Au-delà, l'actualité reste accessible derrière « Voir la semaine dernière », avec sa date.

## Procédure du dimanche soir (CEO)

1. Ouvrir `data/actus-hebdo.json`.
2. Mettre à jour `semaine` (semaine ISO, par exemple `2026-W45`) et `date_publication` (le lundi de publication, `AAAA-MM-JJ`).
3. Pour chaque commune pilote : un titre, deux phrases (`resume`), une source officielle (`source` + `source_nom`). Pas d'actualité cette semaine : laisser les champs vides, l'application le dira.
4. Commiter, puis **ouvrir une pull request vers `main`**. `main` est protégée : pas de push direct. L'épreuve (`epreuve.yml`) doit passer.
5. Après fusion, **la publication se fait par la CI** (`collecte.yml`, chaque jour à 05 h 47 UTC, ou en la relançant à la main) : pas de déploiement manuel. La chaîne copie `data/actus-hebdo.json` dans les données publiées.

D35 (30/10/2026) : la promesse « chaque lundi » est retirée de l'application. Le rythme hebdomadaire reste l'objectif interne, mais il n'est plus affiché comme un engagement.

## Ce qu'il faut pour commencer, quelle que soit la décision

1. Un relecteur de neutralité, différent de l'auteur, pour chaque fait.
2. Le format existant (`docs/data/evenements-format.md`).
3. Une date de première publication, pour que la carte « Dernières publications » apparaisse aux testeurs.

## Députés au mandat terminé — D36 (30/10/2026)

Le CEO veut garder les fiches des députés dont le mandat est terminé (bilan civique utile). Le format actuel `deputes.json` ne permet pas de gérer deux députés successifs sur la même circonscription. Post-bêta : ajouter un champ `date_fin_mandat` et un champ `successeur_de` pour conserver l'historique. En attendant : les fiches des députés sortants sont exclues du fichier généré (comportement actuel).

Faits vérifiés dans le dépôt le 30/10/2026 :
- **Le filtre est dans `outils/mono_donnees.py`** (fonction `deputes()` : un mandat avec `dateFin` est ignoré), et c'est ce script que la chaîne lance. `outils/construire_deputes.py` applique le même filtre, mais `pipeline.sh` ne l'appelle pas. BLOCAGES section 23 citait ce dernier par erreur.
- **La clé est `dep-circo`** (« 77-1 ») : une seule personne par circonscription. Le changement post-bêta touchera la clé, ou ajoutera une liste « anciens » par circonscription. Il touchera aussi `extract-html.js` (le site), `client.js` et l'annuaire de l'application.
- **Nommage** : les champs existants sont en camelCase (`dateDebut`, `acteurRef`). `date_fin_mandat` et `successeur_de` sont en snake_case. À aligner au moment du changement (`dateFin`, `successeurDe`), sinon le fichier mêlera deux conventions.
- **AMO30 ne donne pas de motif de fin** dans les champs lus aujourd'hui (décès, démission, entrée au gouvernement). La fiche dira « Mandat terminé le … » sans motif, sauf si une source officielle le publie.

## État au 31/10/2026 (V36, bloc 1, B4)

- `data/actus-hebdo.json` existe, au format décrit plus haut (commit `b454166`), avec les trois communes pilotes **toutes vides** : 77288 (Melun), 77284 et 78646. Aucune actualité n'a été rédigée ni importée : ce sont des faits à établir par le CEO avec une source officielle.
- Conséquence visible : l'application n'affiche aucune actualité locale. C'est le comportement voulu (« doctrine du vide », invariant 5), pas un défaut de chaîne.
- La procédure du dimanche soir ci-dessus est la seule à suivre. Elle n'a pas été exécutée dans la session.
