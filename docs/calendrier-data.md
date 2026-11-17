# Le calendrier avec de vraies données

Date : 13/11/2026. L'écran « Le calendrier » (`mono/apps/mobile/src/app/(onglets)/a-venir.tsx`) lit deux fichiers
publiés chaque matin par la collecte. Ils ne sont pas dans les données extraites hors réseau : sans eux, l'écran dit
« Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution ».

| fichier publié | produit par | source | réseau |
|---|---|---|---|
| `data/agenda-an.json` | `node scripts/agenda-an.mjs ./data` (depuis `mono/`) | `outils/agenda_an.json`, **versionné dans le dépôt**, renormalisé chaque jour par `outils/agenda_an.py` | aucun |
| `data/calendrier-senat.json` | `node scripts/calendrier-senat.mjs ./data` | flux iCalendar du Sénat (`senat.fr/aglae/Global/ical.ics`) | oui : runner GitHub ou ton poste |

## Voir le calendrier rempli sur ton poste

Depuis `mono/` :

1. `node scripts/agenda-an.mjs ./data` : écrit `data/agenda-an.json` à partir du fichier versionné. Aucun réseau.
2. `node scripts/calendrier-senat.mjs ./data` : écrit `data/calendrier-senat.json`. Demande le réseau ; sans lui,
   l'écran affiche l'Assemblée seule et le dit (« Le calendrier du Sénat n'est pas arrivé jusqu'ici »).
3. `cd apps/mobile && npm run build:web`, puis copier `mono/data/agenda-an.json` (et le fichier du Sénat) dans
   `apps/mobile/dist/data/`.
4. `node ../../scripts/serveur-statique.mjs dist 8822`, puis ouvrir `http://localhost:8822/a-venir#melun`.

En production, rien à faire : la collecte publie les deux fichiers, et l'application les lit.

## Ce qui a été vérifié le 13/11/2026, et comment

Avec le vrai agenda de l'Assemblée (relevé du 12/11/2026 : 35 séances, du 12 novembre au 3 décembre), dans Chromium à
390 px :

- la carte « Prochain rendez-vous » affiche « Aujourd'hui », le titre du texte et l'heure ;
- 17 rendez-vous sur deux semaines : l'écran mesurait 6 269 px de haut. La liste s'ouvre donc sur trois jours, et un
  bouton « Voir les N jours suivants » montre le reste ;
- sans le fichier du Sénat, la phrase d'absence du Sénat s'affiche, et le filtre « Sénat » ne montre rien.

## Quand le Sénat ne répond pas (17/11/2026)

`mono/data` n'est pas versionné : jusqu'ici, un runner neuf n'avait aucun relevé précédent, et une panne du flux du
Sénat (comme le 15/11/2026) retirait le Sénat de la publication. Désormais `outils/pipeline.sh` récupère d'abord
`https://repereapp.netlify.app/data/calendrier-senat.json` (la publication de la veille) et ne le garde que s'il a la
forme attendue (`source.releve_le` daté, `evenements` en liste). Si le Sénat répond, le fichier est remplacé ; sinon,
le relevé d'hier reste publié **avec sa date**, et l'écran dit son âge (`ageReleve`, « relevé le …, il y a N jours »).
Rien n'est inventé : si la publication précédente est elle aussi absente ou illisible, le Sénat est absent et l'écran
le dit, comme avant. Un agenda vide (aucune séance) reste un fichier valide, affiché comme tel.

## Ce qui reste à vérifier

- **Le Sénat avec de vraies données** : jamais vu ici (réseau). À regarder en production ou après l'étape 2.
- **Un jour sans séance** et **un relevé de plus d'un jour** (« relevé le …, il y a N jours ») : couverts par
  `tests/parcours-web.mjs` en CI, pas relus à l'œil.
- **La carte « Prochain rendez-vous » en fin de journée** : elle affiche le premier rendez-vous du jour même s'il est
  passé (elle dit « Aujourd'hui », pas « à venir »). À trancher si cela gêne.

## Contrôles automatiques

`tests/parcours-web.mjs` recompte les lignes (`cal-ligne`) avec la fonction du socle (`regrouperParJour`) sur les
fichiers servis : une ligne par texte et par jour, sur deux semaines, après « Voir les N jours suivants ».
