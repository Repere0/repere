# Audit anti-perte de donnée (V15 → V20)

Date : 30/10/2026. Branche : `test/sdk58-expo-go`. Brief V28, bloc 6.
Garde absolue du CEO : « Aucune donnée supprimée en V15/V20 ne doit avoir disparu. »

## Méthode

1. Plage comparée : `0c233e2` (V15) → `8652883` (V20), dans `mono/apps/mobile/src`, `mono/apps/web/src` et `mono/packages/core/src`.
2. Relevé des lignes **supprimées** (`git diff`, préfixe `-`) : 25 lignes, avec le fichier d'origine.
3. Pour chaque ligne qui porte un texte visible ou une explication, recherche littérale du fragment dans l'état **actuel** (`HEAD`, commit `9610319`), dans `mono/` et `docs/`.
4. Pour chaque cas qui n'est pas retrouvé tel quel, lecture de la version V15 et de la version HEAD du passage, puis historique du fragment (`git log -S`).

Relevé brut : `scratchpad/supprimees.txt` (25 lignes). Candidats retenus au départ : `scratchpad/absents.txt`.

## Limites de la méthode (à lire avant de se fier au résultat)

- **Seules les lignes supprimées sont relevées.** Un texte déplacé puis conservé ailleurs apparaît comme « supprimé » ; un texte qui a seulement été réécrit aussi. C'est pourquoi chaque cas a été relu à la main.
- **Les chaînes multi-lignes et les textes construits par gabarit** (`${...}`) ne sont vus que partiellement. Le relevé ne voit que les chaînes entre guillemets ou le texte JSX sur une ligne.
- **Le texte des données n'est pas audité.** `mono/data/` n'est pas versionné (voir `docs/architecture/tests.md`) : aucune donnée publiée (budgets, votes, actus) ne peut être comparée entre V15 et V20 par `git`. Ce point reste ouvert.
- **Le diff ne couvre pas** `docs/`, `mono/packages/data-utils`, `mono/tests`, `mono/scripts` ni les fichiers JSON.
- **La recherche dans HEAD est littérale.** Un texte réécrit avec d'autres mots n'est retrouvé que par lecture.
- **Limite constatée** : la ligne « Dont … € par habitant » est marquée supprimée par `git diff` alors qu'elle est présente à l'identique dans V15, V20 et HEAD. La cause du marquage n'a pas été élucidée. Le relevé peut donc aussi signaler de faux positifs.

## Résultat

25 lignes supprimées relevées. Elles se répartissent ainsi :

- 4 lignes de texte visible (calendrier, « Dont … par habitant », « Pas de compte », « Repère ne sait pas qui vous êtes ») ;
- 1 étiquette d'affichage (niveau sous le nom d'élu) ;
- 3 commentaires de code, dont 2 portent une explication (motif de la règle photos, seuil de cible tactile) ;
- 17 lignes de code (imports, composants, hook, styles, structure) : déplacements ou réécritures, sans texte visible perdu.

Trois cas demandent une action (1, 2, 3 du tableau ci-dessous) ; le cas 4 est conservé.

### Tableau des cas qui demandent une lecture

| # | Texte V15 | État HEAD | Verdict | Niveau actuel | Action proposée |
|---|---|---|---|---|---|
| 1 | Calendrier, sous-titre : « Les séances annoncées à l'Assemblée nationale et au Sénat. Elles concernent tout le pays, **pas seulement votre commune**. » (`a-venir.tsx`) | « Les séances annoncées à l'Assemblée nationale et au Sénat : elles concernent tout le pays. » (`a-venir.tsx:172`) | **Partiellement perdu** : la précision « pas seulement votre commune » a disparu. Le sens général est conservé. | Niveau 1 | Réintégrer la phrase complète dans le sous-titre. Le test `parcours-web.mjs` ne vérifie que deux fragments : il n'a pas vu la perte. |
| 2 | Accueil, bloc de confiance : « Repère ne sait pas qui vous êtes. Pour afficher votre commune, il télécharge le fichier public de tout votre département, et ne garde votre commune sur ce téléphone que si vous le lui demandez. » (`index.tsx`) | Accueil : seulement « Pas de compte, pas d'e-mail. Pourquoi ? ». La phrase a été **déplacée dans la FAQ** (« Pourquoi pas de compte ? », `faq.tsx`, commit `2036a32`) et réécrite : « Parce que Repère n'a pas besoin de savoir qui vous êtes… » ; « le serveur ne sait pas quelle commune vous regardez » est une phrase **nouvelle** ; « que si vous le demandez » remplace « que si vous le lui demandez ». | **Déplacé et réduit de niveau** : la phrase n'est plus à l'écran d'accueil. Aucune donnée n'est perdue, mais l'explication de confiance est passée du niveau 1 au niveau 3 (FAQ). | Niveau 1 (lien) → FAQ | Décision du CEO. Proposition : niveau 2 sur l'accueil (`Details` sous « Pas de compte, pas d'e-mail. Pourquoi ? »), avec la phrase d'origine. Valider aussi la phrase nouvelle de la FAQ, qui affirme une conséquence technique (le serveur ne sait pas quelle commune est consultée). |
| 3 | Avatar, commentaire de code : « Les photos de l'Assemblée ne sont pas chargées, **pour ne pas révéler l'adresse du lecteur**. » | Commentaire réduit à « Jamais une photo de l'Assemblée (D1). ». Le motif « ne pas révéler l'adresse du lecteur » a disparu. `docs/adr/0004-photos-elus.md` ne donne que le motif de licence. | **Motif perdu** (documentation, pas d'affichage). | Non affiché | Réintégrer le motif vie privée dans `docs/adr/0004-photos-elus.md` (charger une image depuis un serveur de l'Assemblée transmettrait l'adresse IP du lecteur à un tiers). Pas de changement d'invariant. À valider par le CEO. |
| 4 | Ligne « Dont … € par habitant pour vos agents (salaires) et … € pour vos équipements (investissement). » (`argent.tsx`) | Présente à l'identique dans `argent.tsx:108`, dans `Depli` « Ce que finance cet argent ». | **Conservée.** Vérifiée dans V15, V20 et HEAD. | Niveau 2 (accordéon) | Aucune. |

### Cas résolus sans perte

| Élément | Constat |
|---|---|
| Candidat « Sans groupe connu (c… » (`avatar.tsx`) | Fragment tronqué par le relevé. Le commentaire complet est présent dans HEAD : « Sans groupe connu (c'est le cas de tous les élus aujourd'hui), la couleur est le gris « Inconnu » (ADR 0001). » |
| Composant `Initiales` (`avatar.tsx` → `elu.tsx:59`) | Déplacé dans `elu.tsx`. Conservé. |
| Étiquette de niveau sous le nom d'élu (`elu.tsx`) | Règle d'affichage modifiée : l'étiquette n'est plus répétée quand elle figure déjà dans le libellé du rôle. L'information est conservée. |
| Hook `useMoyenneDepenses` (`lib/moyenne.ts`) | Fonction conservée. Un paramètre `recalcul` a été ajouté en V20 (« faux sur l'accueil, vrai sur le budget »). La branche de repli `.catch` n'a pas été comparée ligne à ligne : **à vérifier**. |
| Carte de partage (`partage/carte-story.tsx`) | Déplacée depuis `ui/partage` avec un identifiant de test. Conservée. |
| Bouton de fraîcheur (`fraicheur.tsx`) | Le commentaire de V15 (« 44 px, le minimum… ») a été réécrit. HEAD utilise `CIBLE` (48) pour le bouton alors que le commentaire dit 44 px hors `CIBLE`. Ce n'est pas une perte de donnée, mais le commentaire et la valeur ne concordent pas. Hors périmètre de ce bloc. |

## Ce que cet audit ne prouve pas

- Il ne prouve pas l'absence de perte dans les **données publiées** (budgets, votes, actus, mandats) : elles ne sont pas versionnées dans ce dépôt.
- Il ne prouve pas l'absence de perte de texte **déplacé et réécrit** hors des cas listés ci-dessus : le relevé ne voit que les lignes supprimées.
- Il ne couvre pas V20 → HEAD. Les cas 1 à 3 ont été vérifiés dans HEAD ; les autres changements de cette plage n'ont pas été audités.

## Décisions demandées au CEO

1. Cas 1 : réintégrer la phrase complète du calendrier. Proposition : oui, sans débat (ajout de quatre mots, sens inchangé).
2. Cas 2 : remonter la phrase « Repère ne sait pas qui vous êtes… » au niveau 2 sur l'accueil. Valider aussi la phrase nouvelle de la FAQ.
3. Cas 3 : réintégrer le motif vie privée dans l'ADR 0004. Valider le motif.
4. Données publiées : décider si un instantané des données (hors dépôt, ou dans un dossier daté) est nécessaire pour auditer les données de V15/V20.

## Tests à ajouter (proposition)

- Un test qui vérifie la phrase complète du sous-titre calendrier (cas 1).
- Un test qui vérifie que la phrase « ne sait pas qui vous êtes » est présente à l'écran, au niveau retenu (cas 2), une fois la décision prise.
