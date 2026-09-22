# Repère — prérequis App Store (découverte des blocages, pas préparation d'envoi)

*Écrit le 22 septembre 2026. Objectif du mission : découvrir tôt ce qui
bloque, pas publier. Aucune soumission n'est faite ni préparée par ce
document. Chaque ligne cite ce qui a été trouvé ou son absence constatée —
`NOT STARTED` ne veut pas dire "impossible", seulement "rien n'existe
encore dans ce dépôt".*

| item | état | preuve |
|---|---|---|
| Build iOS (Xcode/Capacitor/autre) | **NOT STARTED** | Recherche de `.xcodeproj`, `capacitor.config.*`, `Info.plist` dans tout le dépôt (hors `node_modules`) : zéro résultat |
| Identifiant de bundle (`com.exemple.repere`) | **NOT STARTED** | Aucun fichier de configuration mobile n'en déclare — conséquence directe de l'absence de build iOS |
| Icône | **PARTIAL** | `mono/apps/web/public/icone.svg`, `icone-192.png`, `icone-512.png`, `icone-512-masquable.png` existent et sont déclarées dans le manifeste PWA — suffisant pour une PWA, **pas vérifié** aux tailles exactes exigées par l'App Store (1024×1024 sans alpha, entre autres) |
| Écran de démarrage (splash) | **NOT STARTED** | Aucun asset de splash screen trouvé ; une PWA n'en a pas besoin, une app native si |
| Métadonnées (nom, description courte/longue, mots-clés) | **PARTIAL** | Le manifeste porte un nom (« Repère ») et une description courte (« Qui décide chez vous, et où va votre argent. ») — utilisables comme point de départ, jamais rédigées pour une fiche App Store (limites de caractères différentes, pas de mots-clés déclarés) |
| Politique de confidentialité | **PARTIAL, et pas au même endroit que le reste** | `site/confidentialite.html` et `site_a_deployer/confidentialite.html` existent sur l'**ancien site** ; **absente de `mono/`** (recherche `confidentialit` dans `mono/apps/web` : zéro résultat) — cohérent avec l'absence de mentions légales déjà constatée dans `MONO_MIGRATION_AUDIT.md` §4 |
| Permissions déclarées | **NON APPLICABLE pour l'instant** | Repère ne demande aucune permission système (pas de localisation, pas de caméra, pas de notifications) — un fichier `Info.plist`/manifeste Android n'aurait rien à y déclarer au-delà du minimum |
| URL de contact / support | **PARTIAL** | Une adresse existe et est affichée dans le produit (`repere0@protonmail.com`, dans `Sources.jsx`) ; aucune page de support dédiée, aucun formulaire |
| Captures d'écran (par taille d'appareil) | **NOT STARTED** | Aucune capture versionnée dans le dépôt à cet usage |
| Compte développeur (Apple/Google) | **NOT STARTED** — hors du périmètre technique de ce dépôt, ne peut être confirmé que par le porteur du projet | — |

## Ce que ce tableau change, concrètement

**Rien aujourd'hui.** Le blocage le plus proche d'être réel n'est pas
technique — c'est que la politique de confidentialité et les mentions
légales, qui existent déjà en substance sur l'ancien site, n'ont pas encore
de foyer dans `mono/`, qui n'a même pas encore de foyer de publication (voir
`MONO_MIGRATION_AUDIT.md`). Tout ce qui touche spécifiquement à l'App Store
(bundle iOS, splash, comptes développeur) est **entièrement en amont** :
aucune décision produit ne dépend de ces cases avant que la bascule
`mono/` elle-même soit décidée.
