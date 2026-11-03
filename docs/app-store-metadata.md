# Métadonnées App Store : Repère

Préparé le 30/10/2026. Les champs marqués **À DÉCIDER** ou **À FOURNIR** ne sont pas remplis par ce document : leur valeur est une décision ou une information que l'on ne peut pas inventer.

## Identité

| Champ | Valeur | Statut |
|---|---|---|
| Nom | Repère | Prêt |
| Sous-titre (30 caractères max.) | Votre citoyenneté, expliquée (28 caractères) | Prêt, à valider par le porteur |
| Langue principale | Français | Prêt |
| Identifiant de l'app (bundle ID) | `com.repere.app` | **PLACEHOLDER**. Ne pas modifier sans accord du porteur. Il n'est pas écrit dans `app.json`. |
| Version | 0.1.0 (build à définir) | Prêt |
| Catégorie principale | Actualités | **Décidé** le 30/10/2026 (décision D7). Éducation n'est pas retenue pour la bêta. |

## Mots-clés (100 caractères max., séparés par des virgules)

citoyenneté,politique,votes,élus,budget,transparence,France,Assemblée,commune

(77 caractères.)

## Texte promotionnel (170 caractères max., modifiable sans nouvelle version)

Les votes de votre député, les élus de votre commune, et ce que votre commune dépense : chaque chiffre porte sa source officielle.

## Description courte (80 caractères, pour la fiche Google Play)

Votes, élus et budgets publics : chaque chiffre porte sa source officielle.

## Description longue (4000 caractères max.)

Repère vous aide à comprendre la vie publique française sans jargon. Une commune, et vous voyez ce qui s'y décide, qui vous représente et ce qui s'y dépense.

Ce que vous trouvez dans Repère :

- Le chiffre du jour, tiré des comptes publiés, avec sa source et sa date.
- Qui décide : le maire, les adjoints et l'intercommunalité de votre commune, et le député de votre circonscription.
- Le dernier vote de votre député à l'Assemblée nationale, avec sa position et le décompte officiel.
- Où va l'argent : les dépenses et les recettes de votre commune, rapportées aux habitants, avec ce que ces chiffres ne disent pas.
- Le calendrier : les prochains débats publics de l'Assemblée nationale, sous réserve de modification.
- L'annuaire des élus : les députés et les exécutifs régionaux publiés par Repère.
- Ce qui s'est passé au Parlement, résumé par Repère à partir des sources officielles citées.
- Un dictionnaire citoyen pour comprendre les mots de la vie politique.

Ce que Repère respecte :

- Chaque chiffre affiche sa source officielle, sa date de mise à jour et le lien vers la source.
- Un calcul fait par Repère est annoncé comme un calcul.
- Une donnée absente est dite absente. Repère ne remplit jamais un vide par une estimation.
- Aucun score, aucun classement de personnes ou de partis, aucune récompense liée à un vote.
- Aucun compte, aucun traceur, aucune notification. L'application fonctionne hors ligne après le premier chargement.

Ce qui n'est pas encore couvert : pendant la bêta, Repère ne couvre que l'Île-de-France. Les maires et conseillers municipaux ne sont pas encore dans l'annuaire des élus. Les photos des élus ne sont pas publiées dans les données officielles, et Repère ne les affiche pas. Les groupes politiques ne sont pas non plus publiés dans les données de Repère.

Repère est un outil d'information. Il ne dit pas quoi penser d'un élu ou d'un vote.

## Captures d'écran

Tailles exigées par App Store Connect, à vérifier sur la page officielle au moment de la soumission (à produire sur appareil ou simulateur, pas à partir de maquettes) :

- iPhone 6,9 pouces (1320 × 2868 px) ou 6,7 pouces (1290 × 2796 px) : **À FOURNIR**.
- iPhone 6,5 pouces (1284 × 2778 px ou 1242 × 2688 px) : **À FOURNIR**.
- iPhone 5,5 pouces (1242 × 2208 px) : **À FOURNIR** si la boutique le demande encore.
- iPad 13 pouces (2064 × 2752 px) ou 12,9 pouces (2048 × 2732 px) : **requis tant que `supportsTablet` vaut `true`** dans `app.json`. Le porteur doit trancher : produire ces captures, ou passer `supportsTablet` à `false`. Le rendu tablette n'a pas été vérifié.
- Décision D7 (30/10/2026) : iPad hors bêta. `supportsTablet` reste `true` dans `app.json` : tant que le porteur ne le passe pas à `false`, ces captures restent exigées.

Les captures doivent montrer des écrans réels de l'application, avec des données réelles. Aucune capture de données inventées.

## Classification et questionnaire

- Classification d'âge : 4+ est le résultat attendu, à confirmer par le questionnaire Apple. Aucun contenu généré par les utilisateurs, aucune messagerie, aucune publicité, aucun achat.
- Accès au web : les sources s'ouvrent dans le navigateur du téléphone, à la demande. **À vérifier** au moment du questionnaire ; ce n'est pas un navigateur intégré.
- Collecte de données (questionnaire « Confidentialité des données ») : **À DÉCIDER** après vérification de la journalisation de l'hébergeur (voir `docs/privacy-policy.md`). Réponse provisoire : aucune donnée collectée par l'éditeur, en précisant que l'hébergeur peut consigner des adresses IP.

## Politique de confidentialité

- Texte : `docs/privacy-policy.md` (et écran Réglages, « Confidentialité »).
- URL publique : **À FOURNIR**. Aucune URL n'existe à ce jour. Ne pas déclarer d'URL inventée dans App Store Connect.
- URL d'assistance (exigée par Apple) : **À FOURNIR**. Un contact réel est nécessaire.

## Chiffrement

`ios.config.usesNonExemptEncryption` vaut `false` dans `app.json`. L'application n'utilise que HTTPS et les fonctions de chiffrement fournies par le système. **À confirmer** par le porteur au moment de la soumission.

## Notes pour l'évaluateur Apple

Aucun compte n'est nécessaire pour tester l'application. Elle s'ouvre sur l'accueil : taper « Chercher une commune », puis une commune d'Île-de-France (par exemple Meaux). Une connexion est nécessaire pour le premier chargement des données ; ensuite l'application fonctionne hors ligne.

## Droits et crédits

Les données sont publiques et reprises avec leur source. Chaque source est citée dans l'application (écran Sources).
