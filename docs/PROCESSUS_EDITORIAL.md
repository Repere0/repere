# Processus éditorial — du vote à l'écran du lecteur

*Complète `docs/COUCHE_EDITORIALE.md` (le geste humain, trois minutes). Ce
document décrit la chaîne entière, ce qui est automatique, ce qui ne l'est
jamais, et ce qui vérifie chaque étage. Vérifié de bout en bout le 06/10/2026.*

**Principe.** Repère n'est pas un média : un fait ne dit pas « le vote du
jour », il dit **ce que ce texte change, prévoit ou organise**, avec sa source.
Aucun fait n'est affiché sans source officielle **et** validation humaine.

## La chaîne

| # | étage | qui | fichier | contrôle |
|---|---|---|---|---|
| 1 | Source : votes et agenda de l'Assemblée | Assemblée nationale | open data AN, agenda | — |
| 2 | Collecte quotidienne | machine (`collecte.yml`) | `outils/scrutins_an.json`, agenda | banc de la chaîne |
| 3 | Détection des candidats | machine | `data/auto/*.md` (brouillons) + `scripts/candidats-fil.mjs` | seuls les votes **sur l'ensemble d'un texte** sont candidats (`estVoteDeTexte`) |
| 4 | Dossier de préparation | machine + agent | `docs/editorial/DOSSIERS_*.md` | chiffres recontrôlés contre la source |
| 5 | **Résumé factuel « Ce que ça change »** | **humain** | `data/evenements/<id>.md` | grands axes sourcés à part (`axes_source`) |
| 6 | **Validation** | **humain seulement** | `valide: true` | jamais automatisé |
| 7 | Porte de publication | machine (`outils/evenements.py`) | `outils/evenements.json` | refuse : `valide` absent, source non officielle (par nom d'hôte), date floue, axes vides, confiance inconnue |
| 8 | Publication | machine (`extract-html.js`) | `data/evenements.json`, clé **`r`** | écarte tout fait sans titre, date ou source |
| 9 | Contrôle du fichier publié | machine (tests) | — | `controlerFaits` : doublon, 2 faits pour 1 scrutin, numéro ≠ source, date ≠ scrutin, date future, source ou axes non officiels, fait local sans territoire, mauvaise clé |
| 10 | Consommation mobile | application | `socle:EVT` (cache de l'appareil) | chargé sans bloquer le premier écran |
| 11 | Affichage | application | « Comprendre ce vote » → « Ce que prévoit ce texte » | relié au vote **par la page du scrutin**, jamais par un titre ; « Relu et validé » seulement si `confiance: verifie` |
| 12 | Nouveauté | application | « Depuis votre dernière visite » | un `id` absent de la version gardée sur l'appareil, `verifie` seulement |

Ajouter un fait **ne demande aucune modification du code mobile** : déposer le
fichier validé dans `data/evenements/` suffit ; il est publié le lendemain matin,
affiché sur l'écran du vote concerné, et signalé aux lecteurs dont la commune
est retenue.

## Écrire un fait (étages 5 et 6)

En-tête :

```
titre: L'ensemble du projet de loi … (première lecture)
date: AAAA-MM-JJ                      # la date du scrutin, exactement
echelon: france                       # ou ville / agglo / departement / region + insee
source: https://www.assemblee-nationale.fr/dyn/17/scrutins/<numéro>
source_nom: Assemblée nationale — scrutin public n° <numéro>
axes_source: <page officielle du texte adopté ou transmis>
axes_source_nom: <nom de cette page>
confiance: verifie                    # ou a_confirmer
valide: true                          # geste humain, après relecture
```

Le fichier s'appelle `scrutin-<date>-<numéro>.md` : le contrôle vérifie que le
numéro du nom est celui de la source, et que la date est celle du scrutin.

Corps :
- **« Résultat du scrutin : … »** : adopté ou rejeté, date, et **où en est le
  texte** (« n'est pas la loi définitive : transmis au Sénat le … »). C'est ce
  paragraphe que l'application affiche sous « Où en est ce texte ».
- **« Ce que ça change : … »** : ce que le texte prévoit, tel que la page
  `axes_source` l'écrit. La première phrase est celle que le lecteur voit
  d'abord : elle doit tenir seule. Aucun adjectif de jugement (« historique »,
  « controversé »), aucune intention prêtée, aucune réaction politique.

## Ce qui n'est pas candidat

Motions de rejet, prolongations de séance, amendements et articles isolés : ils
ne disent pas ce qu'un texte change. Un texte voté en plusieurs lectures donne
**un fait par vote d'ensemble**, et le dernier dit l'état réel du texte.

## Ce qui ne sera jamais automatisé

Le résumé « Ce que ça change », la validation (`valide: true`), la confiance
`verifie`. Une chaîne entièrement automatique rendrait fausse la promesse
« relu par un humain » à l'endroit précis où l'on demande d'être cru.

## Points ouverts (06/10/2026)

- Sept brouillons de `data/auto/` portent `valide: true` avec un « Ce que ça
  change » vide (8420, 8422, 8423, 8424, 8428, 8429, 8432). Aucun risque de
  publication (la porte ne lit que `data/evenements/` et refuse des axes vides),
  mais l'en-tête ne dit pas l'état réel : à remettre à `valide: false`.
- La porte Python vérifie désormais la source par nom d'hôte ; elle n'a pas pu
  être exécutée sur le poste de travail (pas de Python) : elle est éprouvée par
  la chaîne sur le runner.
