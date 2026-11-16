# RESUME v22 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit : tests partagés à 251/251, invariants à 0 erreur. Pour le code, aussi : `tsc` à 0 erreur, parcours navigateur à 222/222, cartes de partage sans aucun échec.

| Commit | Bloc |
|---|---|
| d82f8b0 | 1 — D35 : « Repère publie quand il y a du nouveau », lien « Voir les dernières publications » vers /actus (vérifié sur Meaux) |
| f4b24e5 | 2 — D32 : mandats terminés. 0 cas détectable dans les données ; Henri Mellier signalé sous la carte Intercommunalité de Melun, source Ville de Melun |
| 28f6cfe | 3 — D33 : résumé assisté autorisé, invention et presse interdites (`docs/strategie-editoriale.md`) |
| 56969f9 | 4a/4b — `docs/fusion-main.md` : essai de fusion sans conflit, procédure en 6 gestes, rollback, 182 fichiers |
| (ce commit) | BLOCAGES section 23 et ce résumé |

## À retenir pour le CEO
- **Fusion** : possible sans conflit au 30/10. Après la fusion, lancer `gh workflow run collecte.yml --ref main` : la fusion seule ne publie rien.
- **Le site public change** à la fusion : 19 fichiers du site et du socle partagé.
- **Henri Mellier** : n'a pas de fiche dans l'application. Il est compté parmi les 21 délégués de Melun, et c'est là que le mandat terminé est signalé. La mention disparaîtra quand le RNE le retirera.
- **Brief tronqué** après le bloc 4b.
