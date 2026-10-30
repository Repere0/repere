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
