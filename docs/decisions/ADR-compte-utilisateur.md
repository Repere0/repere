# ADR — Compte utilisateur Repère

Statut : **PROPOSITION**, aucune décision actée. Aucun code de compte n'est écrit, aucune donnée personnelle n'est collectée.
Date : 20/10/2026. Demandeur : porteur du projet.

## 1. Demande

Chaque utilisateur doit pouvoir avoir un compte, à terme. Données de base envisagées : nom, prénom, date de naissance, ville, agglomération. Pour la bêta (quelques dizaines de testeurs), le compte est un test ; l'architecture doit toutefois être pensée pour l'échelle nationale.

## 2. Ce que la demande remet en cause

| Règle actuelle | Effet de la demande |
|---|---|
| Invariant 1 : application hors ligne, **sans serveur applicatif** | Un compte exige un service d'authentification et un stockage serveur. |
| Invariant 2 : **aucun compte, email, identifiant**, seule clé locale `repere.departement` | Un compte crée un identifiant et une donnée personnelle. |
| Décision du 13/10/2026 : « pas de serveur ni de compte pour la bêta de décembre » | À réviser explicitement par le porteur. |

Les autres invariants (neutralité, pas de classement, pas de patrimoine, pas de présence/absence, sources, doctrine du vide, fraîcheur) **ne changent pas** : un compte n'a aucune raison de les affaiblir.

## 3. Risques (à arbitrer avant tout code)

- **Mineurs.** Le public visé inclut les 14-18 ans (brief du 17/10). En France, le consentement seul à un service en ligne n'est valable qu'à partir de 15 ans ; en dessous, une autorisation parentale est requise. La date de naissance rend cette question incontournable.
- **RGPD.** Base légale à définir (consentement ou exécution du service), minimisation (art. 5), droit d'effacement, registre des traitements, mentions d'information, conservation limitée. Hébergement dans l'UE recommandé.
- **Données de localisation.** La commune et l'agglomération révèlent un domicile. Elles ne doivent jamais être liées à un historique de votes ou de consultations sans besoin démontré.
- **Opinions politiques.** Un compte qui enregistre les pages lues ou les votes suivis peut révéler des opinions. C'est une donnée sensible au sens du RGPD. Le design doit l'exclure par construction.
- **Coût et exploitation.** Le budget n'est pas un frein (décision du porteur). Il doit être signalé avant engagement, conformément au projet.

## 4. Options

**A. Compte minimal (recommandé pour la bêta).**
- Identifiant de connexion (email ou téléphone) + pseudonyme. Prénom et nom facultatifs.
- Commune : code INSEE seul. L'agglomération se déduit de la commune, elle n'est pas saisie.
- Âge : tranche d'âge (ex. moins de 15, 15-17, 18 et plus), pas la date de naissance exacte.
- Consentement parental obligatoire sous 15 ans, ou compte refusé.

**B. Compte complet (nom, prénom, date de naissance exacte, ville, agglomération).**
- Correspond littéralement à la demande, mais multiplie les risques ci-dessus, en particulier pour les mineurs. Non recommandé sans analyse juridique préalable.

**C. Compte « local d'abord ».**
- Les données restent sur l'appareil, le serveur ne sert qu'à la synchronisation chiffrée. Plus proche de l'invariant 1, mais plus complexe et sans restauration si le téléphone est perdu.

## 5. Changements d'invariants nécessaires (option A)

- **Invariant 1** : « L'application lit ses données publiques hors ligne, sans serveur. Les comptes utilisent un service dédié, séparé de la lecture des données. »
- **Invariant 2** : « Un compte est optionnel. Il ne contient que les données listées dans l'ADR. La clé locale `repere.departement` reste la seule clé de territoire. Aucune donnée de compte n'est liée à un vote, une position ou une consultation. »

Ces deux textes ne seront modifiés qu'après décision explicite du porteur, avec mise à jour de `.claude/invariants.sha256` dans la même PR.

## 6. Plan par étapes (si option A est retenue)

1. Juridique : analyse RGPD et âge minimum, rédaction des mentions, CGU, politique de confidentialité. (Hors code, à faire par le porteur ou un juriste.)
2. Architecture : choix du service d'authentification hébergé dans l'UE ; schéma de données limité aux champs de l'option A ; plan de suppression de compte.
3. Code : écran de création, consentement parental sous 15 ans, suppression de compte, export des données. Tests : création, refus, suppression, absence de fuite de l'identifiant dans les URL et les journaux.
4. Bêta : compte réservé aux testeurs, données de test uniquement, avant toute collecte réelle.

## 7. Décisions demandées au porteur

1. Option A, B ou C ?
2. Acceptez-vous la tranche d'âge à la place de la date de naissance exacte ?
3. Le consentement parental sous 15 ans est-il obligatoire ?
4. Quel service d'authentification (hébergé dans l'UE) ?
5. Calendrier : compte en bêta (oui/non) ?
