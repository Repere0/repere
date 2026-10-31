# Checklist distribution — testeurs Repère

Date : 30/10/2026. Pour le porteur, dans l'ordre. Le kit à envoyer est dans `docs/kit-testeur.md`.

## Étape 1 — Vérifier le contact
- Copier `mono/apps/mobile/.env.example` en `mono/apps/mobile/.env`.
- Remplir `EXPO_PUBLIC_CONTACT_EMAIL=` avec l'adresse de contact. Elle s'affichera dans « À propos ». Elle est publique, et aucun secret ne doit aller dans ce fichier.
- `.env` est ignoré par git : il ne sera pas commité.

## Étape 2 — Lancer l'application pour les testeurs
- `git pull` sur `test/sdk58-expo-go`.
- Sous Windows : `scripts/lancer-pour-testeurs.ps1` (clic droit > « Exécuter avec PowerShell »). Le script prévient si le contact manque, puis lance Expo en mode tunnel, cache vidé (`--clear`).
- Au premier lancement, accepter l'installation d'`@expo/ngrok`.
- Garder l'ordinateur allumé et le terminal ouvert pendant toute la session de test.

## Étape 3 — Récupérer le QR code
- Faire une capture du QR code affiché dans le terminal, et recopier l'adresse `exp://…` affichée à côté.
- **Le tester soi-même d'abord** sur son iPhone avec Expo Go. Si Expo Go refuse le projet, vérifier la compatibilité avec le SDK 58 avant d'envoyer quoi que ce soit.

## Étape 4 — Envoyer aux 5 premiers testeurs
- Message type : `docs/kit-testeur.md`, section 4, avec le QR code en pièce jointe.
- Commencer par 5 testeurs : un problème bloquant n'en touchera que 5.

## Étape 5 — Suivre les retours
- Copier `docs/tableau-retours.csv` en `docs/tableau-retours-rempli.csv`, ignoré par git, et noter chaque retour dedans.
- **Ne jamais commiter le tableau rempli** : il contient des noms de personnes, ce qui va contre la politique « aucune donnée personnelle » (`docs/privacy-policy.md`, `docs/testeurs.md`). Un prénom ou un pseudo suffit.
- Un « Bug critique : oui » se corrige avant d'élargir à 20-30 testeurs.

## Étape 6 — Bilan à J+7
- Relire le tableau : bugs critiques, mots non compris (question 3), ce qui a été retenu en 5 secondes (question 4), envie de revenir (question 5).
- Décider : élargir à 20-30 testeurs, ou corriger d'abord.

## Avant envoi — vérification finale (V21, 30/10/2026)

À faire le soir même, avant l'étape 4. Chaque ligne se vérifie, aucune ne se suppose.

1. **Garde de la collecte** : `gh workflow view collecte.yml`, puis ouvrir le fichier et vérifier que `HORS_MAIN` conditionne bien le jeton du robot, le commit, Netlify et l'issue.
2. **Collecte d'essai** : `gh workflow run collecte.yml --ref test/sdk58-expo-go`. Depuis une branche, la chaîne tourne mais **ne publie rien** : elle dépose seulement l'artefact `collectes-essai`.
3. **Couverture** : lire la section « Bilan des collectes » du résumé de l'exécution (sites de mairies, photos, agrégats régionaux). Si une ligne indique « fichier absent » ou 0, la noter dans `BLOCAGES.md` et ne pas annoncer la fonction aux testeurs.
4. **Actu locale** : remplir `data/actus-hebdo.json` (titre, deux phrases, source `https://`, `source_nom`). Le texte est écrit par le porteur (D29).
5. **Publier** : commit, push, **puis demande de fusion vers `main` et fusion**. L'application des testeurs lit les données du site public, qui n'est publié que depuis `main`. Un push sur la branche d'essai ne publie rien.
6. **Tester puis envoyer** : sur son propre iPhone, choisir Melun, vérifier « Cette semaine à Melun », puis faire les étapes 3 et 4 ci-dessus.

**Si la fusion n'a pas lieu ce soir**, les testeurs de Melun, Meaux et Versailles ne voient aucun bloc « Cette semaine à… » : sans fichier publié, le bloc reste caché. Rien de faux ne s'affiche, mais la fonction n'est pas montrée.
