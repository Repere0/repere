# Repère — checklist de préparation bêta IDF

*Mise à jour le 22 septembre 2026 — remplace l'organisation du 13 septembre
2026 (conservée intégralement en annexe, rien n'est perdu) par la structure
TECHNIQUE/DONNÉES/PRODUIT/UX/PUBLICATION demandée pour cette phase. Chaque
ligne porte l'état réellement mesuré aujourd'hui, jamais une intuition.
`DONE` signifie vérifié dans cette session ou une session antérieure
documentée — pas "ça devrait marcher".*

---

## TECHNIQUE

| item | état | preuve |
|---|---|---|
| pipeline de collecte fiable | **BLOCKED** | 26 échecs consécutifs confirmés (`gh run list`), cause corrigée et poussée aujourd'hui (`7c7ceac`), mais **aucun run réel ne l'a encore confirmé** — le run de demain (~05h47 UTC) est le premier test réel |
| build reproductible | **PARTIAL** | `mono/` : reproductible, testé (98+56 contrôles). Le pipeline `main` (`build_pwa_reconstruit.py`) reproduit aussi, mais publie le mauvais artefact (voir performance) |
| publication vérifiable (commit ↔ site public) | **PARTIAL** | La fraîcheur (`maj` = date du jour) est vérifiable ; le lien direct "ce SHA a produit ce site" n'existe pas encore — proposé dans `PRODUCTION_RUNBOOK.md`, pas construit |
| performance acceptable | **BLOCKED** | 16,29 Mo décodés / 6,02 Mo transférés pour une seule commune, mesuré aujourd'hui. Cause identifiée (`PERFORMANCE_AUDIT_2026-09.md`), correctif prêt (`mono/`), **non déployé** |
| tests automatisés | **DONE** | 112 statiques/inline + 56 navigateur (`mono/`, mis à jour dans l'après-midi — étaient 100+56 le matin, +12 pour les 3 régressions fermées) ; 55 (`test_repere.mjs`, fichier autonome) ; 14 (`outils/registre/`) — tous exécutés aujourd'hui, verts sauf 2 échecs pré-existants documentés (apostrophes typographiques, `deputes.json` absent sur l'ancien `main`) |

## DONNÉES

| item | état | preuve |
|---|---|---|
| couverture IDF | **PARTIAL** | Dénominateur corrigé (1266, pas 1262, vérifié contre `geo.api.gouv.fr`). RNE/circonscriptions/OFGL : 1262/1266 (99,7 %), 4 communes documentées comme manquantes (RNE incomplet), pas un bug de jointure. **Comptes départementaux et régionaux (101 + 17) extraits dans `mono/` cet après-midi** — manquaient ce matin |
| provenance systématique | **DONE** | Composant `Source` obligatoire (invariant 4, testé), registre `outils/registre/sources.json` pour 10 sources actives |
| fraîcheur | **BLOCKED** | `an_amo30`/`an_scrutins` : 28 jours de retard (STALE, détecté automatiquement par `outils/registre/rapport.mjs`), cause = le même P0 que la publication — devrait se résoudre avec le run de demain |
| doctrine du vide | **DONE** | Implémentée et testée sur RNE (Ville-d'Avray et 3 autres communes), OFGL (zéro vs absence), votes (appariement), calendrier (licence non précisée dite explicitement) |

## PRODUIT

| écran | état | preuve |
|---|---|---|
| Qui décide | **DONE** | Maire, adjoints, circonscription, député, votes réels et personnalisés — testé en navigateur réel |
| Ce qui a été décidé | **DONE** | Projets DGCL + votes solennels réels **+ fil éditorial validé à la main (`evenements.json`), ajouté cet après-midi dans `mono/`** — régression fermée, testée (mention "relu et validé par la rédaction" explicite, jamais présentée comme automatique) |
| Où va mon argent | **DONE** | Traductions avant les chiffres bruts (réordonné le 19/09), doctrine zéro/absence, **et depuis cet après-midi les 3 échelons (commune/département/région) dans `mono/`** — était commune seule le matin même |
| Aujourd'hui (fil territorial) | **PARTIAL** | 3 directions prototypées et comparées en navigateur réel, une retenue ("la question") — **non activée par défaut**, atteignable seulement par un lien secondaire |
| Calendrier citoyen | **PARTIAL** | Sénat seul, licence non confirmée affichée honnêtement — Assemblée nationale non fusionnée dans le même écran |

## UX

| item | état | preuve |
|---|---|---|
| Mobile (375–412 px) | **PARTIAL** | Reflow 200 % corrigé, barre d'onglets stabilisée à 2 lignes, mais la refonte "Aujourd'hui" n'est pas le parcours par défaut |
| Accessibilité | **PARTIAL** | aria-expanded, focus trap, contour de focus (blocker 11) corrigés et testés. **Contraste des couleurs d'échelon utilisées comme texte** : trouvé, jamais corrigé — décision produit en attente (invariant 7) |
| Navigation / retour arrière | **PARTIAL** | Chaîne testée réellement (commune → Aujourd'hui → vote → retour ×3), mais seulement sur le prototype non activé par défaut |
| Compréhension réelle par un citoyen non averti | **NOT STARTED** | Aucun test utilisateur réel encore mené — protocole préparé (`BETA_USER_TEST.md`), pas lancé |

## PUBLICATION

| item | état | preuve |
|---|---|---|
| Politique de confidentialité (site actuel) | **DONE** | Page `confidentialite.html`, lien réparé aujourd'hui (l'objet même du correctif poussé) |
| Mentions légales (`mono/`, candidat de bascule) | **DONE, cet après-midi** | Étaient **ABSENTES** de `mono/` ce matin (bloquant, régression identifiée en phase 2) — portées et adaptées (pas recopiées : 3 affirmations fausses pour `mono/` corrigées, voir `MONO_MIGRATION_AUDIT.md`), testées par un clic réel sur le `<details>` |
| Métadonnées (titre, description, favicon) | **NOT VERIFIED** | Non auditées dans cette session |
| Assets (icônes, manifest) | **PARTIAL** | Présents dans `mono/` (`icone.svg`, `manifest.webmanifest`), non vérifiés pour un store |
| Build iOS | **NOT STARTED** | Aucune trace de configuration iOS trouvée dans le dépôt |
| App Store / soumission | **NOT STARTED** | Hors périmètre de toute session à ce jour |

---

## Résumé — ce qui bloque réellement une bêta aujourd'hui

1. **La fraîcheur de production** (BLOCKED) — dépend du run de demain, pas de moi.
2. **Le poids de production** (BLOCKED) — cause connue, correctif prêt, décision de bascule en attente.
3. **Aucun test utilisateur réel** (NOT STARTED) — protocole prêt, jamais exécuté.

Rien ici n'est mis à `DONE` sur une intuition — chaque `PARTIAL`/`BLOCKED` porte sa preuve.

---

# Annexe — mesure du 13 septembre 2026 (historique, conservée intégralement)

*Cette section est l'intégralité du document tel qu'il existait avant la mise
à jour du 22/09/2026 ci-dessus. Conservée pour comparaison — certains chiffres
ont changé depuis (ex. le total de 1 262 communes est maintenant connu comme
incomplet, voir "couverture IDF" plus haut), d'autres restent la meilleure
mesure disponible (ex. accessibilité, installation) et n'ont pas été
remesurés dans cette session.*

## 1. COUVERTURE ÎLE-DE-FRANCE — mesurée sur les fichiers publiés (13/09)

| département | communes | maire | circo | député | votes | comptes |
|---|---|---|---|---|---|---|
| 75 Paris | 1 | 1 | 1 | 1 | 1 | 1 |
| 77 Seine-et-Marne | 505 | 505 | 505 | 505 | 505 | 505 |
| 78 Yvelines | 259 | 259 | 259 | 259 | 254 | 259 |
| 91 Essonne | 194 | 194 | 194 | 194 | 194 | 194 |
| 92 Hauts-de-Seine | 35 | 35 | 35 | 35 | 35 | 35 |
| 93 Seine-Saint-Denis | 39 | 39 | 39 | 39 | 39 | 39 |
| 94 Val-de-Marne | 46 | 46 | 46 | 46 | 46 | 46 |
| 95 Val-d'Oise | 183 | 183 | 183 | 183 | 183 | 183 |
| **total** | **1 262** | **1 262** | **1 262** | **1 262** | **1 257** | **1 262** |

*(Ce total de 1 262 est celui qui a été corrigé le 22/09/2026 : le vrai
dénominateur IDF est 1 266, voir la section DONNÉES plus haut.)*

| critère | taux |
|---|---|
| commune reconnue | 100,0 % *(sur l'ancien dénominateur 1262 — voir correction ci-dessus)* |
| département | 100,0 % |
| intercommunalité | 0,0 % — la donnée n'est pas dans le produit |
| région | 100,0 % *(déduite du département, non affichée)* |
| circonscription | 100,0 % |
| député nommable | 100,0 % |
| position de vote | 99,6 % — 5 communes du 78 sans position |
| comptes communaux | 100,0 % (exercice 2025 : 99,7 %) |
| sources affichées | 100,0 % — aucun chiffre sans provenance |
| événements / décisions datés | 0,0 % — aucune donnée datée dans le produit *(résolu depuis : "Ce qui a été décidé" existe)* |
| état hors ligne | mesuré serveur éteint à chaque exécution du banc |

## 2. PERFORMANCE — mesurée dans un navigateur, compression comprise (13/09)

| étape | téléchargé | cumul |
|---|---|---|
| ouverture de l'application | 87,1 Ko | 87,1 Ko |
| choix de la commune | 16,3 Ko | 103,5 Ko |
| les votes du député | 3,5 Ko | 107,0 Ko |
| argent et sources | 0 Ko | **107,0 Ko** |

*(Ceci mesurait déjà le monorepo `mono/`, jamais déployé en production — voir
`PERFORMANCE_AUDIT_2026-09.md` pour la mesure du site réellement en ligne,
16,29 Mo.)*

## 3. ACCESSIBILITÉ ET LISIBILITÉ — mesurées sur les six écrans (13/09)

| | avant | après |
|---|---|---|
| cibles tactiles sous 44 px | 11 | 0 |
| texte porteur de sens sous 13 px | 46 à 63 % selon l'écran | 0 |
| contraste en thème sombre | mesuré, seuil 3:1 | idem |
| `prefers-reduced-motion` | partiel | appliqué par le navigateur, sans JavaScript |
| motifs ARIA incomplets | aucun dans le monorepo | idem |
| un H1 par écran | non — un seul H1, celui du produit | non corrigé |
| réglage de taille du texte | absent | absent |

## 4. INSTALLATION (13/09, non remesuré depuis)

| | état |
|---|---|
| manifeste complet (`id`, `scope`, `display`, icônes 192/512/maskable) | ✅ |
| service worker répondant aux requêtes | ✅ |
| métas iOS (`apple-mobile-web-app-capable`, `apple-touch-icon`) | ✅ |
| installation testée sur un vrai téléphone Android | ❌ non mesuré |
| installation testée sur un vrai iPhone | ❌ non mesuré |

## 5. CHAÎNE DE LIVRAISON (13/09 — largement dépassé, voir PRODUCTION_RUNBOOK.md)

| | état |
|---|---|
| le dépôt pousse | ✅ |
| la tâche horaire ne peut plus bloquer le dépôt | ✅ v7 |
| `main` protégée des commits automatiques | ✅ v7 |
| banc statique | ✅ 44/44 *(98 aujourd'hui)* |
| banc navigateur | ✅ 64/64 *(56 aujourd'hui, périmètre différent)* |
| chaîne d'intégration capable de finir | ✅ ordre corrigé |
| branche fusionnée dans `main` | ⛔ non *(fait le 22/09/2026)* |
| URL en ligne | ⛔ non *(inchangé : la fusion n'a pas encore été suivie d'une republication)* |

## 6. VERDICT (13/09)

**Prêt** : les données, la performance, l'accessibilité tactile et typographique, le hors-ligne,
la provenance, le banc.

**Pas prêt** : la publication, et la raison de revenir.

**Deux zéros dans le tableau de couverture, et ils disent la même chose** : Repère sait dire *qui
décide* et *combien*, il ne sait pas encore dire *ce qui s'est passé*. *(Résolu depuis pour les
décisions ; les événements du calendrier restent partiels — voir PRODUIT plus haut.)*

**Non mesuré, et à ne pas présenter comme acquis** : le comportement sur un vrai téléphone, le
temps réel qu'un humain met à trouver sa commune, et l'effet de la correction des noms sur la
confiance. *(Toujours non mesuré au 22/09/2026 — voir BETA_USER_TEST.md.)*
