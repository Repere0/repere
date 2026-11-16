# RESUME v18 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit : tests partagés à 251/251, contrôle des invariants à 0 erreur. Pour les commits de code, aussi : `tsc` à 0 erreur et parcours navigateur à 222/222.

## Commits (V17 et V18)

| Commit | Objet |
|---|---|
| d249503 | V17 — `collecte.yml` : déclenchement manuel depuis une branche d'essai sans rien publier (garde `HORS_MAIN`), bilan de couverture, artefact |
| 6f27ca3 | Bloc 4 — kit testeur, tableau de retours, checklist de distribution, script de lancement |
| 179950e | Bloc 1 — droit à l'image des élus (`docs/juridique/droit-image-elus.md`) |
| 792e54e | Bloc 2 — crédit photo cliquable, mention et procédure de retrait, liste `photos-retirees.json` |
| 192a564 | Bloc 3 — script DILA validé par lecture : champs, filtre, pagination |
| (ce commit) | RESUME-v18 |

## Prêt pour la distribution

- `docs/checklist-distribution.md` : les 6 étapes, dans l'ordre.
- `docs/kit-testeur.md` : liens Expo Go, 5 questions, message type à copier-coller. Le QR code et l'adresse `exp://` sont à coller par vous.
- `docs/tableau-retours.csv` : modèle vierge. Le tableau rempli (`docs/tableau-retours-rempli.csv`) est ignoré par git, parce qu'il contient des noms.
- `scripts/lancer-pour-testeurs.ps1` : prévient si le contact manque, lance avec `--clear`. **Jamais exécuté** (pas de PowerShell ici).
- L'application : tests, parcours navigateur, fraîcheur, comparaison médiane, couleurs de vote conformes AA, crédit et retrait des photos.

**Pas prêt, ou inconnu :**
- compatibilité d'Expo Go avec le SDK 58 sur un vrai téléphone ;
- couverture des photos et des sites de mairies (aucune collecte n'a tourné) ;
- validation juridique des photos.

## 5 actions CEO à minuit

1. **Lancer la collecte en essai** : `gh workflow run collecte.yml --ref test/sdk58-expo-go`. Vérifier dans le job que « Publier sur Netlify » est **sautée**.
2. **Lire la couverture** dans le résumé du job (« Bilan des collectes ») : sites de mairies, photos des 574 députés et des maires. Si « 0 député » : propriété Wikidata à revoir ; si les champs DILA manquent, le journal liste les champs reçus.
3. **Décider pour les photos** : les activer en production (fusion sur `main`) maintenant, ou attendre le juriste. Recommandation : attendre si le doute persiste.
4. **Contacter un juriste** avec les 4 questions de `docs/juridique/droit-image-elus.md` (exception d'information, caractère commercial, base légale RGPD, information des élus).
5. **Envoyer aux 5 premiers testeurs** en suivant `docs/checklist-distribution.md`, après avoir rempli `.env` et testé le QR code sur votre propre téléphone.

## Top 5 à valider sur iPhone

1. **Expo Go ouvre-t-il le projet ?** C'est le SDK 58 : si Expo Go le refuse, rien d'autre ne compte.
2. **Première ouverture** : logo, phrase, champ « Où habitez-vous ? », puis la carte « L'argent de Melun » (exemple). Mesurer le temps d'apparition de « 1,8 fois la commune médiane » en 4G.
3. **Aujourd'hui** : les trois réponses tiennent-elles dans le premier écran d'un iPhone standard (mesuré à 390 × 844 dans le navigateur, pas sur appareil) ?
4. **Couleurs de vote** (fiche élu, « Comprendre ce vote ») au soleil et en mode sombre ; VoiceOver ne doit lire ni les pictogrammes ni les signes ✓ ✕ ○.
5. **Liens externes** : « Source » des lignes de date, « Site officiel de la mairie » (après collecte), crédit photo vers Commons, courriel de retrait. Chacun doit ouvrir Safari ou Mail, pas une page blanche.
