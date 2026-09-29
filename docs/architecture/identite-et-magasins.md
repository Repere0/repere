# Identité de l'application et chemin vers les magasins

*29/09/2026. Rien n'est publié, rien n'est dépensé. Les décisions sont au porteur.*

## L'identifiant (D-M7)

| question | réponse vérifiée le 29/09/2026 |
|---|---|
| où `fr.repere.app` est-il écrit ? | **uniquement** dans `docs/PLAY_STORE.md` (dossier du 25/08) et `decisions.md`. `app.json` n'en porte aucun, volontairement. |
| est-il pris sur le Play Store ? | la fiche publique `play.google.com/store/apps/details?id=fr.repere.app` répond **404** : aucune application publique ne le porte. Une réservation privée par un tiers ne se voit pas de l'extérieur. |
| App Store ? | les identifiants iOS ne sont pas consultables publiquement ; on ne le saura qu'en le déclarant dans un compte Apple. |
| faut-il posséder `repere.fr` ? | non, les magasins n'exigent qu'un identifiant unique ; c'est une convention. `www.repere.fr` ne résolvait pas depuis l'outil de vérification ; **le propriétaire du nom de domaine n'a pas été vérifié** (registre AFNIC). |
| le nom « Repère » est-il libre ? | **non vérifié** (INPI, magasins). Un homonyme sur un magasin forcerait à renommer la fiche, pas l'identifiant. |

**Ce qui change s'il change :** avant la première publication, rien (une ligne dans
`app.json`). **Après, il ne peut plus changer** : un nouvel identifiant est une nouvelle
application, sans ses installations ni ses avis.

**Où il devra être écrit, le jour venu :** `mono/apps/mobile/app.json` —
`expo.android.package` et `expo.ios.bundleIdentifier` (la même valeur, conventionnellement),
et `docs/PLAY_STORE.md`. Rien d'autre dans le dépôt ne le lit.

## Le chemin, en cinq marches

| marche | ce que c'est | coût | prérequis humain |
|---|---|---|---|
| 1. test local | Expo Go + QR code (`mono/apps/mobile/README.md`) | 0 € (compte Expo gratuit, iPhone seulement) | aucun |
| 2. test interne | un binaire installé sur quelques téléphones connus | 0 € sur Android (fichier installable) ; iOS exige un compte Apple | identifiant (D-M7) |
| 3. bêta distribuée | Play Console « test interne / fermé » ; TestFlight sur iOS | 25 € une fois (Google) ; 99 €/an (Apple) | éditeur identifié (D-M9), politique de confidentialité de l'app |
| 4. Play Store | fiche publique, formulaire « sécurité des données » | déjà payé à la marche 3 | revue Google |
| 5. App Store, éventuel | fiche publique | 99 €/an | **D-M8 : contredit l'arbitrage du 25/08**, ~40 % du budget chaque année |

Le service de construction d'Expo (EAS) a une offre gratuite limitée ; ses quotas du jour
**n'ont pas été vérifiés**. Construire l'Android en local sur le PC reste possible sans lui.
