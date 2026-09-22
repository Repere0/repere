# Repère — rapport de couverture des données

*Généré le 2026-09-22T07:59:30.987Z. Chaque chiffre vient d'un fichier mesuré, jamais d'une estimation.*

## Territoire cible
Île-de-France, 75, 77, 78, 91, 92, 93, 94, 95 — 1262 communes de référence (`mono/data/communes-beta.json`).

## Sources actives (10)

| source | producteur | catégorie | fraîcheur source | dernière collecte Repère |
|---|---|---|---|---|
| rne | Ministere de l'Interieur (DGCL) | elus | 2026-08-11 | 2026-08-11 |
| ofgl_comptes | Observatoire des finances et de la gestion publique locales (OFGL) | finances | 2026-07-29 | 2026-07-29 |
| an_agenda | Assemblee nationale | calendrier | 2026-09-21T22:40:48.000Z | jamais |
| an_amo30 | Assemblee nationale | elus | 2026-09-22T00:34:42.000Z | 2026-08-26 |
| an_scrutins | Assemblee nationale | votes | 2026-09-22T04:25:24.000Z | 2026-08-26 |
| dgcl_projets_investissement | DGCL | decisions | 2026-07-24T14:20:21.000Z | jamais |
| senat_calendrier | Senat | calendrier | 2026-09-22T07:29:03.000Z | 2026-09-22 |
| circos_ministere | Ministere de l'Interieur | referentiel_territorial | 2017-04-11T12:11:28.000Z | jamais |
| circos_bureaux_vote | tiers, derive de resultats officiels | referentiel_territorial | 2024-06-12T13:39:14.000Z | jamais |
| insee_cog_noms_communes | INSEE, republie par Etalab / DINUM | referentiel_territorial | 2026-09-13 | 2026-09-13 |

## Sources en erreur (0)

Aucune, au dernier contrôle (2026-09-22T07:57:57.090Z).

## Sources modifiées depuis le registre (0)

Aucune source n'a changé depuis la dernière vérification enregistrée.

## Sources découvertes, non encore intégrées (5)

| source | stade | vérifiée le |
|---|---|---|
| sru_rpls_logement_social | VERIFIED | 2026-09-13 (DATA_CATALOG.md, non revérifiée par cette session) |
| insee_bpe_equipements | DISCOVERED | 2026-09-13 (DATA_CATALOG.md, non revérifiée par cette session) |
| banatic_epci | DISCOVERED | 2026-09-13 (DATA_CATALOG.md, non revérifiée par cette session) |
| geo_risques_brgm | DISCOVERED | 2026-09-13 (DATA_CATALOG.md, non revérifiée par cette session) |
| decp_marches_publics | DISCOVERED | 2026-09-13 (DATA_CATALOG.md, non revérifiée par cette session) |

## Couverture territoriale

| source | trouvées | attendues | taux |
|---|---:|---:|---:|
| rne | 1262 | 1262 | 100% |
| circos_ministere | 1262 | 1262 | 100% |
| ofgl_comptes | 1262 | 1262 | 100% |

**Homonymes détectés** (deux communes IDF portant le même nom, jamais rapprochées par le nom seul dans le produit) : Blandy, Marolles-en-Brie, Mondreville, Saint-Martin-des-Champs.

## Données disponibles par domaine

- **elus** : rne, an_amo30
- **finances** : ofgl_comptes
- **calendrier** : an_agenda, senat_calendrier
- **votes** : an_scrutins
- **decisions** : dgcl_projets_investissement
- **referentiel_territorial** : circos_ministere, circos_bureaux_vote, insee_cog_noms_communes
