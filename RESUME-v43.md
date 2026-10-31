# Résumé V42 + V43 : Repère

Date : 31/10/2026. Branche `test/sdk58-expo-go`. **Rien n'est fusionné dans `main`.** Le code est arrêté après ce lot (D92) : la suite se joue sur iPhone.

## Commits

- V42 bloc 1, fiches « impact concret » : `2599952` (19 fiches, 12 avec impact, **0 relue par le CEO**).
- V42 bloc 2, guide testeurs : `8741009`.
- V42 blocs 3, 4, 6, 7 et V43 : commités dans ce lot, à lire dans `git log` depuis `8741009`.

## Fait

- **Fiches impact** : 19 scrutins, sources officielles, titres copiés (aucune retape). Les fiches ne sont visibles qu'en développement, pas en production.
- **Guide testeurs** (`docs/guide-testeurs.md`) : lancement par Expo Go, cinq choses à essayer, cinq questions, adresse de contact.
- **Accessibilité** (`docs/audit-accessibilite.md`) : analyse statique des 24 écrans, tous PASS (aucun élément sans nom). Clavier mesuré dans Chromium. Thème sombre mesuré sur un élément.
- **Performance** (`docs/audit-performance.md`) : mesures compressées, médiane de trois essais. Aucune optimisation appliquée.
- **Micro-copy** (`docs/audit-copy.md`) : 43 réécritures proposées, **non appliquées** (D90).
- **README et CONTRIBUTING** réécrits, fondés sur les scripts réels.
- **Brouillon de candidature AIC** (`docs/candidature-aic/brouillon.md`) : sigle développé, processus documenté (D89). Rien n'est envoyé.
- **BLOCAGES** : entrées 49 à 51 ajoutées.

## Non fait, bloqué ou non vérifié

- **Fichier `LICENSE`** (D88) : **non créé**. Le texte AGPL-3.0 n'est pas accessible depuis la session, et il n'a pas été reconstitué de mémoire. Procédure dans `BLOCAGES.md` §49.
- **Contraste du focus en mode sombre** (D91) : le chiffre de 1,04:1 est **retiré**. La mesure sur pixels donne 18,25:1 sur un élément. Les autres types de contrôles ne sont pas mesurés (§50).
- **Performance** : le premier texte dépasse 500 ms sur tous les écrans en 4G simulée (3,7 à 4,1 s). Cause : le paquet principal de 287 Ko compressé. Non optimisée (§51). La cible de 400 ms citée pour Apple n'est pas vérifiée.
- **Partage sur le web** : le bouton de partage natif n'est pas pris en charge dans un navigateur (erreur JavaScript sur `/actus`). Sans effet sur le téléphone.
- **VoiceOver et TalkBack** : non exécutés, pas d'appareil dans la session.
- **Compression Netlify** : supposée, non vérifiée (en-têtes non lus).
- **AIC** : sessions, montant, renouvellement, forme juridique et détail de l'appel en cours ne sont pas vérifiés. Ils ne sont pas écrits dans le brouillon.
- **Flux RSS des mairies** : avis juridique (ADR 0007) requis avant toute publication automatique. Couverture non mesurée (réseau refusé vers les sites des mairies).
- **Groupes politiques des députés** : script AMO30, seuil de 90 %, blocage documenté (B2).
- **Fusion dans `main`** : non faite, décision du CEO.

## Checklist du CEO (ce soir)

1. **Jeton Netlify** : procédure dans le dépôt (commit `065b240`). Le jeton n'a pas été régénéré.
2. **Test iPhone** avec les personas Marie, Karim et Thomas (D70, dans le dépôt).
3. **Capture d'écran** sur iPhone, pour le dossier.
4. **Décisions** : confirmer l'AGPL-3.0 et ajouter `LICENSE` (§49) ; valider le lien « site officiel » (D84) ; valider l'adresse de contact dans le guide ; trancher la fusion dans `main`.

## Cinq tests prioritaires sur iPhone

1. **Partage** : depuis l'écran budget ou vote, partager la carte. Elle doit s'afficher lisible, avec la bonne source.
2. **Mode sombre** : passer le téléphone en sombre. Vérifier le budget et le vote (couleurs lisibles, texte lisible, bouton visible). C'est le point du focus non mesuré (§50).
3. **Hors ligne** : après un premier chargement, passer en mode avion. L'application doit rester utilisable (invariant 1).
4. **Une commune** : chercher sa commune, comparer le budget et les élus à la source officielle affichée. La date doit être visible.
5. **Fiche élu** : ouvrir une fiche. Chaque donnée doit indiquer sa source et sa date.
