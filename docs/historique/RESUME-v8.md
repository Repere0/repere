# RESUME v8 — polish UX/UI, 30/10/2026

Branche : `test/sdk58-expo-go`. Aucun push forcé, `main` non touchée, aucune branche supprimée, invariants non modifiés.

## Commits (du plus ancien au plus récent)

| Commit | Objet |
|---|---|
| e40c447 | polish(visual) écrans [a,b,c,d] : date alignée sur le contenu (20 px, mesurée à 16 px), retours nommés sur les fiches |
| 313e162 | polish(visual) écrans [e,f,g,h,i,j] : grille d'espacements sur multiples de 4 (26 valeurs corrigées) |
| fb4c718 | fix(logo) : mise en page en flux, tailles 24/34/48/96/128 vérifiées |
| e1ded7b | polish(states) : « Voir les sources » en cas d'échec ; `docs/ux/etats-vides.md` |
| b8b3399 | polish(copy) : quatre micro-copies (Actus, Chez vous, Scrutins) ; `docs/ux/micro-copie.md` |
| 0162649 | polish(animations) : cascade de 40 ms sur les élus, appui à 0,7, fondu entre onglets, « Partager » en remontée ; `docs/ux/animations.md` |
| b6b26b8 | docs(accueil) : « Cette semaine » — décision sans seconde carte |
| baddabb | a11y : accueil (carrousel nommé), réglages (fond nommé, modal, titre) ; `docs/accessibilite.md` |
| 8c6afe6 | perf : FlatList élus (virtualisation), console.time en dev ; `docs/performance.md` |
| 04cd8f4 | test : cas limites de dateFr, jourFr, lienScrutin |
| d9857b4 | seo(web) : doc seulement (métadonnées déjà en place) ; `docs/seo.md` |
| 2d6e3b6 | docs(blocages) : blocs non faits et décisions à prendre |

## Écran par écran

- **a — Accueil** : date de publication alignée sur le contenu ; carrousel « Le chiffre du jour / Dernier vote » nommé pour le clavier. Logo en flux.
- **b — Qui décide** : espacements sur la grille de 4 px.
- **c — Calendrier** : appui à 0,7 sur les onglets d'institution ; espacements.
- **d — Élus** : cascade à l'apparition (8 premières fiches, 40 ms de décalage) ; appui à 0,7 ; liste virtualisée.
- **e — Fiche élu** : retour nommé « Élus » ; titre « Élu ». Non vérifiée visuellement (ouverte depuis le vote, pas capturée).
- **f — Budget** : espacements.
- **g — Actus** : retour nommé, titre « Actualités », micro-copie.
- **h — Réglages** : panneau modal, titre en en-tête, fond « Fermer les réglages ».
- **i — À propos** : titre, logo 96 px.
- **j — Partage** : remontée depuis le bas ; retour nommé « Votre député ».
- **Transverse** : dictionnaire (lettres de 44 px, appui à 0,7), procédure (appui à 0,7), vote (« Voir les sources » en cas d'échec).

## Vérifications

- `tsc --noEmit` : 0 erreur (mobile).
- Tests partagés (liste de la CI) : 248/248 après ajout des tests de `core.test.mjs`.
- Parcours navigateur (export web, 360/390/430 px) : 222/222, zéro échec. Lancé sur le build qui précède le dernier commit de code (`elus.tsx`, perf) : cette modification n'a pas été rejouée dans le navigateur.
- Clavier, export web (Chromium, 390 px) : recherche de commune atteinte au clavier, Entrée ouvre la commune, onglets atteints par Tab. Pas de test Échap.
- Non fait : aucun appareil, aucun lecteur d'écran, `expo-doctor` non relancé.

## Top 5 des observations à faire au CEO

1. **Logo en version sombre sur fond clair** : il disparaît, c'est voulu. À vérifier sur appareil que le logo de l'en-tête reste lisible en mode sombre.
2. **Cascade des élus** : 280 ms de décalage maximum, 560 ms avant la huitième fiche. Est-ce agréable ou lent ? À juger sur appareil.
3. **Libellés d'onglets sur Android** : plafond de 1,2 fois la taille (décision D22). Pas vérifié sur Android.
4. **Fiche élu ouverte depuis le vote** : pas capturée, pas vue. À regarder.
5. **Bandeau de fraîcheur** : « Mis à jour hier » demandé par le brief n'a pas été appliqué (invariant 9). La formulation en place dit la date de publication.

## Conflits et décisions à prendre (détail dans BLOCAGES.md, section 13)

- « Cette semaine » : doublon avec la carte existante « Au Parlement cette semaine », et règle produit (agenda national sous les réponses).
- Onglet « onboarding » : exige une seconde clé de stockage (invariant 2) ; le premier accueil existe déjà.
- Libellés « Mis à jour hier » : contraires à l'invariant 9.
- Fichier `mono/data/cette-semaine.json` : daté après aujourd'hui, vide, non suivi par git ; origine inconnue.
- SEO : adresse publique et adresses par commune à trancher (vie privée, invariant 2).
- Stockage web `{d, v}` contre mobile `{d, c}` : écart connu, non corrigé.
- Icône d'application 1024 × 1024 : toujours à exporter par le porteur.
