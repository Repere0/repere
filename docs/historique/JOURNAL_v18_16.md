# v18.16 — mise en veille de tout ce qui n'est pas vrai

Règle appliquée : **la bêta ne montre que ce qui est vrai.** Tout écran ou bloc portant
une étiquette DÉMO, APERÇU ou À RECROISER sort de la bêta.

## Ce que la mesure a corrigé dans le plan

« 7 écrans » était une granularité fausse. Au fichier : **5 écrans entiers** et
**10 blocs** dans des écrans par ailleurs vrais. Éteindre « Qui influence » ou le haut
de « Débats » aurait supprimé du contenu sourcé et exact.

## Mécanisme

- `const BETA_RESTREINTE = true;` + table `EN_VEILLE` (5 identifiants d'écran).
- `data-veille` sur 10 nœuds ; `appliquerVeille()` les **retire du DOM** au démarrage.
- Garde dans `show()` / `showTab()` : un lien profond retombe sur l'onglet courant —
  jamais un bouton sans réponse. `goBack()` dépile les crans devenus morts.
- `activate()` cherche l'écran **avant** d'éteindre les autres : un identifiant inconnu
  laissait la page entièrement blanche.
- `startPayment` / `payGoStep` / `confirmPayment` : sortie immédiate en bêta.

Remettre en service n'est **pas** un simple `false` : les textes réécrits disent la
vérité d'une application gratuite, il faut les reprendre un par un. C'est écrit dans le
code, à l'endroit où on le lira.

## Écrans mis en veille (5)

Offres · Paiement · Activer mon accès · Mon accès · Notifications.

## Blocs retirés ou réécrits (10)

Alertes de ma rue (APERÇU) · Ajouter un lieu / Premium · rangée Notifications de Moi ·
cloche « m'alerter à chaque étape » · interrupteur de notification de l'onboarding ·
phrase iOS de la bannière d'installation · « Digest quotidien activé » ·
exemple de synthèse de débat (DÉMO) · chiffres AGORA (À RECROISER) ·
répartition cible des revenus (OBJECTIF À 3 ANS).

## Ce que la relecture adverse a ajouté, et qui manquait au plan

1. **Mentions légales** : le paragraphe « Abonnement » annonçait un prix, une durée et
   un droit de rétractation de 14 jours. Délier les écrans l'aurait laissé seul à
   vendre — dans le document le plus solennel de l'app. Réécrit.
2. **Page d'accueil** : le bloc d'offre est *extrait* du fichier par `build_pwa` et
   publié dans `accueil.html`. Aucun mécanisme JavaScript ne peut l'éteindre. Réécrit
   en dur, et le banc le contrôle maintenant.
3. **Loi sur la fin de vie** : seul contenu marqué SUIVI RÉEL, il annonçait une décision
   « attendue vers le 15 août ». Elle a été rendue le **14 août 2026** (n° 2026-910 DC,
   conformité avec réserves). Corrigé, journal public daté.
4. **« Sans compte pour commencer »** se lisait « jusqu'à ce qu'on vous facture ».
   Une phrase dit désormais la gratuité, une fois, dans « Moi ».
5. **`showTab('s-suivis')`** effaçait le bouton retour : `s-suivis` n'est pas un onglet.
6. Six définitions (Stripe, lien cadeau, codes partenaires, résiliation, notifications)
   décrivaient des tiers inexistants et n'avaient plus d'appelant. Retirées.

## Banc

40 contrôles, dont 4 nouveaux sur la veille. **Vert sur la source et sur l'index
engendré.** Le contrôle qui compte : après démarrage, aucun écran ne contient
« premium », « 1,99 », « s'abonner » ou « code d'accès » dans son texte visible.

## Reste ouvert

- `34 875` (COG 2026) contre `34 945` : 4 occurrences résiduelles, toutes dans des
  commentaires de code. La seule visible a été corrigée.
- « Repère ne met en œuvre aucun traitement » (mentions légales et
  `confidentialite.html`) : vrai pour l'utilisateur, faux en droit — publier des fiches
  nominatives d'élus **est** un traitement. À reformuler avant toute ouverture.
- « Droit de réponse (loi de 1881) » : le régime applicable est l'art. 6 IV de la LCEN.
- Le service worker : `repere-f4758b5ab82a` (était `repere-e9d1adb6c1ed`). Sans
  redéploiement, une installation existante continue de servir la v18.15 complète.
