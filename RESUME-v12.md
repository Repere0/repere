# RESUME v12 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Tests partagés : 248/248 ; parcours navigateur : 222/222 après D21 ; `tsc` : 0 erreur.

| Commit | Objet |
|---|---|
| 46dbf31 | V11 bloc 0 : `.env`, `.env.local` et `.env.*` ignorés dans tout le dépôt ; `mono/apps/mobile/.env.example` |
| 05924fa | D20 : lien « Voir les actualités » en bas d'Aujourd'hui ; checklist VoiceOver corrigée |
| 55df0bd | D21 : carte du vote de l'accueil dynamique |
| (ce commit) | D22 dans BLOCAGES.md (section 17), RESUME-v12 |

## D20

« Actualités » n'était pas dans la barre d'onglets. Les quatre onglets sont Aujourd'hui, Qui décide, Calendrier et Élus. Il n'y avait donc rien à retirer. Le lien du bas d'Aujourd'hui s'appelle maintenant « Voir les actualités ». La checklist VoiceOver (`docs/accessibilite.md`) citait Actualités comme onglet par erreur. C'est corrigé.

## D21

L'accueil montre l'une de ces trois cartes :
- **Commune retenue sur le téléphone, une seule circonscription, relevés de l'Assemblée appariés** : « Le dernier vote publié de votre député », avec nom, circonscription, position (Pour, Contre ou Abstention), date, texte et source. Vu sur Meaux : Béatrice Roullaud, pour, 13 octobre 2026. C'est cohérent avec sa fiche.
- **Commune sur plusieurs circonscriptions** : « Il dépend de votre adresse ». Repère ne choisit pas un député. Vu sur Paris (18 circonscriptions).
- **Sinon** : le scrutin 8706, étiqueté « Un exemple ». Cas vus : première ouverture sans commune.

Limite : l'accueil ne connaît une commune que si le lecteur a demandé de la retenir sur son téléphone. C'est la règle de l'invariant 2.

## D22

« Ce qu'il défend » est reporté (BLOCAGES.md, section 17) : aucun thème dans les scrutins publiés.

## Reste à décider (BLOCAGES.md, sections 14 à 17)

- Écran Actualités vide : le garder ou le supprimer. Le supprimer ramène Aujourd'hui sous deux hauteurs d'écran.
- Définition d'EPR corrigée en V10 (groupe formé le 18/07/2024) : à relire.
- Briefs V9 et V11 tronqués : le contenu prévu du `.env.example` et les « 3 décisions CEO » de V11 ne sont jamais arrivés, sauf si D20 à D22 étaient ces trois décisions.

## Checklist de minuit

Elle n'a pas changé : voir `RESUME-v10.md`. Partir de `mono/apps/mobile/.env.example` pour créer `.env`.
