# Adresse de contact en production (D71, V37 bloc 1)

Date : 31/10/2026. Décision du CEO (D71) : `repere0@protonmail.com` est l'adresse publique de contact. Ce n'est pas un secret : toute variable `EXPO_PUBLIC_*` est intégrée au build et lisible par n'importe qui.

## Où elle est définie

| Fichier | Effet |
|---|---|
| `mono/apps/mobile/eas.json`, profils `development`, `preview` et `production` (clé `env`) | Builds natifs EAS (iOS et Android). |
| `.github/workflows/mobile.yml`, étape « Construire l'application », `env:` | Exports de vérification et de construction en CI. |
| `mono/apps/mobile/.env` (non versionné) | Développement local, si on le renseigne. |

Le choix d'une variable d'environnement de l'étape `env:` plutôt qu'un `echo ... >> $GITHUB_ENV` est délibéré : même effet pour les étapes suivantes, sans dépendre de l'ordre des commandes.

## Ce que la variable active, et ce qu'elle n'active pas

Lecture de `mono/apps/mobile/src/ui/contact.tsx` :

- **« Signaler une erreur »** : s'affiche dès que la variable est définie. Il ouvre la messagerie avec le sujet et le texte de la donnée déjà remplis. Présent sur la fiche élu (`src/app/elu.tsx`), l'accueil et « Mes élus ».
- **« Contacter [élu] »** : **ne dépend pas de la variable.** Il ne s'affiche que si la donnée porte un courriel d'élu. Repère ne porte aucun courriel d'élu aujourd'hui (le commentaire du fichier le dit). Sur la fiche élu, on voit donc « Contacter : voir la source officielle (Répertoire national des élus) », qui ouvre la source, ou « Contact non publié ».

Conséquence : D71 rend visible le signalement d'erreur. **Il ne rend pas possible de contacter directement un élu.** Ce second point demande une source de courriels d'élus, qui n'existe pas dans le dépôt.

## Vérification (31/10/2026)

- Export web construit avec `EXPO_PUBLIC_CONTACT_EMAIL=repere0@protonmail.com` : l'adresse figure dans 3 fichiers du bundle `dist-web/_expo`.
- Parcours réel dans Chromium à 390 px : accueil → Qui décide → « Voir la fiche de Kadir MEBAREK » → fiche élu. « ⚠ Signaler une erreur » visible en bas de la fiche ; aucune erreur JavaScript.
- Non vérifié : le lien `mailto:` une fois cliqué, sur un téléphone avec une messagerie configurée. Non vérifié sur iPhone ni Android.
- Non vérifié : le build EAS réel (aucun build natif lancé depuis la session).

## Ce qui n'est pas couvert

- Le site publié sur Netlify (`collecte.yml`, `pipeline.sh`) ne construit pas l'application Expo : la variable n'y a pas d'effet. Le site web a sa propre adresse (`Sources.jsx`).
- Aucun chemin de publication n'a été modifié autre que `eas.json` et `mobile.yml`.
