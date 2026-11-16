# RESUME v9 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. `main` et les invariants ne sont pas touchés.

## Commits

| Commit | Objet |
|---|---|
| 8963157 | Première ouverture en un écran (D15), logo visible sur l'accueil, « Cette semaine au Parlement » (D16), BLOCAGES section 14 |
| 1803e25 | `scripts/lancer-pour-testeurs.ps1` et marche à suivre dans `docs/testeurs.md` |

## Décisions appliquées

- **D14** : rien changé. « Publication Repère du … » reste en place.
- **D15** : pas de nouvel écran. Quand aucune commune n'est retenue (clé `repere.departement`), l'accueil existant affiche le logo 128 px, la phrase et le champ « Où habitez-vous ? » déjà ouvert. Les résultats s'affichent sous le champ. Après le choix : accueil de la commune. Aucune nouvelle clé.
- **D16** : « Au Parlement cette semaine » devient « Cette semaine au Parlement ». Aucun test ne lisait ce libellé.
- **D17** : `mono/data/cette-semaine.json` supprimé ; BLOCAGES section 14.

## Trouvé en route

- **Logo invisible sur l'accueil en mode clair.** L'accueil est toujours sombre, mais le logo prenait l'encre du thème, foncée en mode clair. Corrigé en variante « sombre ». C'est l'explication la plus probable du logo absent des captures du parcours.
- **« Le chiffre du jour » est figé** dans le code (Melun, 2 495 €). L'étiquette promet une valeur quotidienne. À décider (BLOCAGES, section 14).

## Vérifications

- `tsc` : 0 erreur. Tests partagés : 248/248.
- Parcours navigateur : 222/222 sur le build qui contient D15. Captures de la première ouverture vues (mode clair et sombre) : logo, phrase et champ visibles, résultats sous le champ.
- Non fait : le script PowerShell n'a pas été exécuté (pas de Windows ici). Aucun appareil, aucun Expo Go.

## Non fait

- **Le brief v9 est coupé** au milieu du bloc A. Les chantiers « Pitch », « Fiche élu » et « Recherche » n'ont aucune consigne : rien n'a été inventé. Le guide testeur complet, la checklist et le message d'invitation ne sont pas décrits non plus.
