# Préparation App Store : état au 30/10/2026

Légende : ✅ fait et vérifié · ⚠️ fait mais à valider (sur appareil ou par le porteur) · ❌ non fait / bloqué.

Repère n'a pas encore été construit en binaire iOS (pas de dossier `ios/`, pas de build `eas`). Tout ce qui suit est donc vérifié sur le code et le fichier de configuration, pas sur l'app compilée.

## Checklist

| Point | Statut | Détail |
|---|---|---|
| Fichier de manifeste de confidentialité (`ios.privacyManifests`) | ⚠️ | Déclaré dans `app.json` : suivi faux, aucun domaine, aucune donnée collectée, aucune API déclarée par le code de l'application. Voir section « Manifeste ». |
| Politique de confidentialité (texte) | ✅ | `docs/privacy-policy.md`, écran « Confidentialité » dans les réglages, même texte. |
| Politique de confidentialité (URL publique) | ❌ | Aucune URL n'existe. Proposition : `https://repereapp.netlify.app/confidentialite`, à vérifier (voir `docs/privacy-policy-hosting.md`). |
| Chiffrement à l'export | ⚠️ | `ios.config.usesNonExemptEncryption: false`. L'app n'utilise que HTTPS et le chiffrement du système. À confirmer par le porteur à la soumission. |
| Icône 1024 × 1024 sans transparence | ✅ | `assets/icon.png` : 1024 × 1024, RGB, sans canal alpha (vérifié avec PIL). |
| Écran de démarrage (splash) | ⚠️ | Configuré dans `app.json` (`splash-icon.png`, fond `#F7F7F9`). Rendu non vérifié sur appareil. |
| Identifiant d'application (bundle ID) | ❌ placeholder | `com.repere.app` n'est **pas** écrit dans `app.json`. À décider par le porteur avant `eas build`. |
| Logo vectoriel / `assets/logo.png` | ❌ | Absent du dépôt. Le partage utilise un « R » vectoriel de repli. |
| Métadonnées App Store | ⚠️ | `docs/app-store-metadata.md`. Catégorie, URL de politique, URL d'assistance et contact sont à décider ou à fournir. |
| Captures d'écran | ❌ | À produire sur appareil ou simulateur. Tailles dans `docs/app-store-metadata.md`. |
| iPad | ❌ | `supportsTablet: true`. Des captures iPad sont alors exigées ; le rendu tablette n'a pas été vérifié. Décision : garder ou passer à `false`. |
| Compte Apple Developer | ❌ | Payant, à ouvrir par le porteur. Nécessaire pour `eas submit` et TestFlight. |
| Test sur iPhone réel | ❌ | Non fait. Pas d'iPhone dans cette session. |
| Accessibilité (VoiceOver, Dynamic Type) | ❌ | Non testé sur appareil. |
| `expo-doctor` | ❌ non vérifié | Voir section « expo-doctor ». |
| `/shipcheck:scan` | ❌ non disponible | Ce skill n'est pas dans la liste des skills de cette session. Contrôle fait à la main (voir ci-dessous). |
| Textes de remplissage (Lorem, TODO, XXX) | ✅ | Contrôlé par `apps/mobile/tests/conformite.test.mjs`, dans `src/` et dans les deux documents. |
| Apostrophe typographique U+2019 dans le code | ✅ | Zéro dans `src/` (test). Voir la remarque sur `conformite.test.mjs` ci-dessous. |
| Couleurs écrites en dur hors de `palette.ts` | ✅ | Zéro hors `src/lib/palette.ts` (test). |
| Mode sombre | ⚠️ | Contrôle automatique en navigateur (voir ci-dessous). Pas d'appareil réel. |
| Navigation (aucun écran isolé) | ✅ | `parcours.test.mjs` : chaque écran est atteignable. |
| Parcours navigateur (360, 390, 430 px) | ✅ | 222/222 sur la dernière version du build web local. |
| Pas de compte, pas de traceur, pas de notification | ✅ | Vérifié dans les imports et les dépendances : aucun paquet de suivi, de notification ou de compte. |

## Manifeste de confidentialité

Apple exige de déclarer les API « à motif requis » (horodatage de fichiers, UserDefaults, etc.). Vérification faite :

- Le code de l'application **n'utilise pas directement** ces API : il passe par `expo-file-system` (cache), `react-native` et les paquets Expo.
- Les paquets qui les utilisent portent leur propre manifeste : React Native (FileTimestamp, UserDefaults), `expo-file-system` (FileTimestamp, DiskSpace), `expo-constants` et `expo-system-ui` (UserDefaults), `boost` (SystemBootTime).
- Aucun manifeste trouvé pour : `expo`, `expo-font`, `expo-linking`, `expo-sharing`, `expo-router`, `react-native-safe-area-context`, `react-native-screens`, `expo-status-bar`. Leur usage réel d'API à motif requis est **non vérifié**.
- `ActiveKeyboard` n'apparaît dans aucun manifeste trouvé et n'est pas utilisé par le code.

Conséquence : le tableau `NSPrivacyAccessedAPITypes` est vide. Ne pas y mettre de catégorie qui n'est pas utilisée. La vraie liste doit venir du rapport de confidentialité de Xcode, après un premier `eas build`. C'est le point le plus susceptible de faire rejeter le build : à vérifier en premier.

## Remarque sur les tests de conformité

- `apps/mobile/tests/conformite.test.mjs` scanne `src/`. Il ne scanne pas le test lui-même.
- Le test lui-même contient désormais une apostrophe typographique littérale (ligne « les documents de soumission ne contiennent pas de remplissage », `/\u2019/`). Modifié hors de cette session ; le test passe, mais la règle « zéro U+2019 dans le code » est écrite de cette façon. À remplacer par `\u2019` pour rester cohérent.

## expo-doctor

**Non exécuté.** La commande `npx --yes expo-doctor@latest` a été refusée par le classifieur, qui bloque le téléchargement et l'exécution d'un paquet non vérifié. Elle n'a pas été relancée ni contournée. Le binaire local n'est pas installé.

À faire par le porteur, sur sa machine : `npx expo-doctor` depuis `mono/apps/mobile`, puis reporter ici la liste des avertissements.

## Mode sombre

Contrôle automatique (Chromium, préférence système « sombre », 390 px) sur les écrans Aujourd'hui, Élus, Réglages, Confidentialité et Actualités :

- Aucun fond blanc de page. Le fond du corps est transparent ; l'app peint son propre fond.
- Un élément clair sur Aujourd'hui (une barre de vote, remplie en couleur du texte `encre`, rendue `rgb(243, 240, 234)`) : c'est une barre voulue, pas un fond oublié. Elle est lisible sur le fond sombre.
- Les cartes de partage (« story ») sont claires par conception (décision documentée : « claire par défaut »). Elles ne sont pas affichées à l'écran, mais elles existent dans le document. Le brief demandait des cartes « premium sombres » : cet écart n'est pas tranché et reste à décider.

## Risques de rejet et correctifs proposés

1. **Manifeste incomplet** : si un paquet sans manifeste utilise une API à motif requis, Apple peut refuser le build. *Correctif* : après `eas build`, lire le rapport de confidentialité, puis compléter `NSPrivacyAccessedAPITypes`.
2. **Politique sans URL** : refus immédiat à la soumission. *Correctif* : publier la page et reporter l'URL.
3. **Questionnaire « collecte de données »** : l'hébergeur peut consigner les adresses IP. Répondre « aucune donnée collectée » est défendable si l'éditeur ne reçoit pas ces journaux, mais cela doit être confirmé par la politique de l'hébergeur. *Correctif* : vérifier la politique Netlify et répondre en conséquence.
4. **Compte de démonstration** : l'app n'a pas de compte, donc aucun identifiant à fournir au relecteur. Les notes pour le relecteur sont dans `docs/app-store-metadata.md`.
5. **Photos et groupes absents** : l'app affiche « Inconnu » et « Ni photo ». Ce n'est pas un motif de rejet, mais un relecteur peut trouver la fiche élu incomplète. Texte explicatif déjà présent.
6. **Contenu d'actualités** : le fichier `data/evenements.json` contient 8 enregistrements nationaux, avec du texte éditorial de Repère. Le texte d'accueil dit « résumé par Repère » : rien à corriger, mais le porteur doit valider ces textes avant publication.
7. **Bundle ID** : sans identifiant, `eas build` demandera d'en créer un. Ne pas le créer sans accord du porteur.

## Ce qui ne peut pas être fait sans le porteur

- Choisir la catégorie (Actualités ou Éducation).
- Fournir une adresse de contact réelle et une URL de politique publiée.
- Décider l'identifiant d'application et le compte Apple Developer.
- Décider des captures iPad (ou passer `supportsTablet` à `false`).
- Valider la réponse au questionnaire de collecte, après la politique Netlify.
- Lancer `expo-doctor` sur sa machine.
