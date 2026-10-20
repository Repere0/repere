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

---

## 8. Décisions du porteur (20/10/2026, 13:40)

1. **Option : mix A + C**, avec la création de compte orientée localité (ci-dessous).
2. **Consentement parental sous 15 ans : non.** Voir 8.2 : le compte est refusé sous 15 ans, sans collecte.
3. **Hébergement de l'authentification : dans l'UE, idéalement en France.** Obligatoire.
4. **Budget bêta : 20 € maximum.** Hypothèse retenue : par mois. À confirmer.

### 8.1 Choix d'hébergement (sourcé, à vérifier avant commande)

| Option | Coût mensuel indicatif | Verdict |
|---|---|---|
| Authentik ou Keycloak auto-hébergé sur VPS français (OVHcloud ou Scaleway) | VPS d'entrée environ 8 à 15 € HT/mois ([Kolonell, 12/09/2026](https://kolonell.com/fr/blog/hebergement-site-france-ovh-scaleway-prix-2026)) | **Retenu.** Données en France, logiciel ouvert, dans le budget. |
| SaaS d'identité managé (Zitadel/Authentik cloud, Keycloak géré) | 80 à 800 € HT/mois ([Kolonell, 05/10/2026](https://kolonell.com/fr/blog/cout-sso-authentification-application-metier-entreprise-2026)) | Rejeté : dépasse 20 €, hébergement non confirmé. |
| Microsoft Entra External ID | Gratuit jusqu'à 50 000 utilisateurs actifs (même source) | Rejeté : société américaine, hébergement non confirmé. |

Limites :
- Les prix sont des ordres de grandeur. Ils doivent être vérifiés sur le site de l'hébergeur avant commande.
- Auto-hébergé, les mises à jour de sécurité, les sauvegardes et la supervision sont à la charge de l'équipe. C'est le vrai coût, il n'est pas chiffré ici.
- Aucune souscription n'a été faite. Le paiement doit être fait par le porteur.

### 8.2 Moins de 15 ans : pas de compte

Le consentement parental étant refusé, les moins de 15 ans ne peuvent pas créer de compte. C'est la seule solution compatible avec la loi : un compte sans autorisation parentale exposerait Repère à une sanction, et la CNIL ne le permet pas pour un mineur de moins de 15 ans.
Ce qui reste ouvert à tous, sans compte, sans collecte : l'application entière (lecture hors ligne, calendrier, votes, dictionnaire, sources).
Ce qui est proposé à partir de 15 ans : le compte. Un changement de cette règle demanderait une analyse juridique et n'est pas recommandé.

### 8.3 Création de compte orientée localité

Le compte doit reconnecter la personne à son territoire. Parcours d'inscription proposé, écran par écran :

1. **Où vivez-vous ?** Recherche de commune, déjà existante dans l'application.
2. **Votre territoire** : la commune, l'agglomération (déduite de la commune, jamais saisie), le département et la région, avec la chaîne de décision.
3. **Votre député et votre maire** : nom, parti et photo si libre de droits (les portraits de l'Assemblée restent interdits sans autorisation, voir ADR de l'app).
4. **Ce qui se décide cette semaine** chez vous : conseil municipal, Assemblée, Sénat, agglomération.
5. **Votre tranche d'âge** (pas la date exacte) et votre pseudonyme. Prénom et nom facultatifs.
6. **Créer mon compte** : identifiant (courriel) et mot de passe, ou connexion sans mot de passe par lien.
7. **Confirmation** : retour sur « Aujourd'hui », avec la commune déjà choisie.

Données conservées : identifiant, pseudonyme, code INSEE de la commune, tranche d'âge, consentements horodatés. Pas de lien avec les votes consultés ni avec les pages lues.

### 8.4 Prochaines étapes (ordre)

1. Vérifier les tarifs VPS sur les sites OVHcloud et Scaleway, puis choisir.
2. Rédiger les mentions d'information et la politique de confidentialité (juridique, porteur).
3. Déployer Authentik sur le VPS choisi, avec sauvegardes et mises à jour automatiques.
4. Implémenter le parcours 8.3 dans l'application, avec tests (refus sous 15 ans, suppression de compte, aucune donnée de compte dans les URL ou les journaux).
5. Bêta : comptes de test uniquement, avant toute collecte réelle.
