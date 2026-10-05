# Repère — readiness bêta

> Document de travail — 5 octobre 2026.

## Situation technique

La chaîne de production est maintenant séparée en trois responsabilités :

- **Collecte quotidienne** : télécharge les sources publiques, construit, éprouve puis publie le site.
- **Épreuve** : rejoue la chaîne de construction/contrôle sur les pull requests vers `main`, sans publier.
- **Mobile** : vérifie l'application et le socle partagé, y compris les exports iOS/Android/web, le parcours navigateur et la « même vérité » entre site et mobile.

Le mobile n'est donc plus un prototype isolé du dispositif de vérification.

## Ce qui est déjà couvert

- données publiques extraites et publiées avec provenance ;
- contrôles d'invariants ;
- construction mobile iOS / Android / web ;
- parcours à 360 / 390 / 430 px ;
- scénarios de panne réseau et données ;
- comparaison site/mobile sur des communes représentatives ;
- votes publics de l'Assemblée nationale ;
- questions au Gouvernement ;
- sources officielles et dates ;
- partage natif depuis les réponses principales de « Chez vous » ;
- absence de compte obligatoire, de tracker et de serveur nécessaire au partage.

## Les vrais blockers avant les premiers testeurs

### P0 — aucun

Aucun blocker technique P0 n'est identifié dans ce dépôt à ce stade.

### P1 — décisions produit

**Les deux décisions précédemment bloquantes sont maintenant implémentées dans la PR #79 :**

1. **Après le choix d'une commune, « Aujourd'hui » est l'écran ouvert par défaut.** Il répond immédiatement à « qu'est-ce qui se passe chez moi ? ».
2. **Le retour navigateur conserve la commune pendant la session**, sans compte, sans synchronisation et sans code commune dans l'URL.

Ces choix restent soumis à validation par les premiers testeurs, mais ils ne constituent plus des blockers techniques.

### Gate manuel restant

Avant les premiers testeurs, il reste à vérifier sur appareils réels : iPhone, Android, VoiceOver/TalkBack, taille de texte agrandie et partage natif.

## P2 — à traiter après les P1

- rendre « Ce qui a été décidé » plus compact ;
- réduire la hauteur du fil « Ce qui se passe » ;
- vérifier la lisibilité des libellés à 360 px ;
- compléter le parcours de test par les états de données absentes, anciennes ou indisponibles ;
- produire une checklist manuelle de bêta : première installation, choix de commune, retour, sources, partage, hors-ligne et reprise réseau.

## Règle de lancement bêta

Ne pas élargir le périmètre fonctionnel tant que les deux P1 ne sont pas tranchés et que le parcours complet n'est pas reproductible sur une build propre.

La priorité est désormais **fiabilité → compréhension → usage réel → itérations UX**, pas l'ajout de nouvelles sources ou fonctionnalités.

La CI technique doit rester verte sur les PR critiques ; les échecs réseau de collecte sont à distinguer des régressions produit et peuvent nécessiter un rerun.

## Hors périmètre de cette phase

- pas d'intégration de la nouvelle maquette Stitch ;
- pas de tracking comportemental ;
- pas de compte utilisateur ;
- pas de gamification politique ;
- pas de notation/classement d'élus ou de territoires ;
- pas de modification des données politiques pour résoudre un problème d'interface.
