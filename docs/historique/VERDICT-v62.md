# VERDICT V62 (03/11/2026)

Branche : test/sdk58-expo-go. Rien n'est fusionné dans main. Détail : BLOCAGES.md §63.

- **collecte-groupes visible : OUI.** Ligne « Groupes : X … » ou « ECHEC collecte-groupes … » dans le résumé du job (`7dfd023`). Testée sur trois cas fabriqués.
- **deputes-groupes.json publié : OUI (logique), uniquement sur main.** Il part avec `mono/data` au build ; pas d'étape ajoutée. Il est aussi dans l'artefact d'essai (`fb0b032`). Format réel de l'archive AMO30 : **non vérifié**.
- **groupes.ts branché : OUI** (`81ce97b`). `groupeDe(acteurRef, table)` ; « Inconnu » sans entrée. Testé sur six cas.
- **Couleurs badges : OUI, partiellement.** Fiche élu, avatar et carte de vote. Un libellé absent de la palette (par exemple `LFI-NFP`) reste gris. Point ouvert : l'ADR 0001 liste `LFI-NFP`, la palette a `LFI` (BLOCAGES §63.2).
- **NosParlementaires optionnel : PARTIEL.** Étape d'essai manuelle en artefact (`5d5db07`). Loaders sénateurs et scrutins **non écrits** : format inconnu, URLs non testées.
- **Doc CEO prête : OUI** (`docs/COMMENT-VERIFIER-GROUPES.md`, `fb0b032`).
- **Prêt à déclencher collecte test ce soir ? OUI, pour la vérification des groupes.** Un run depuis `test/sdk58-expo-go` ne publie rien (garde HORS_MAIN). Il donnera la ligne « Groupes : … » et l'artefact. Il n'affichera rien sur le site.
