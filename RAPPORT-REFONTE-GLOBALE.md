# Refonte globale — rapport (07/11/2026)

Branche `feat/da-premium-v1`, commits `c690ddd`, `384f4d2` et suivant. La PR #179 n'est pas fusionnée.
Méthode : on change d'abord les composants partagés (tous les écrans changent d'un coup), puis on
retouche les écrans prioritaires.

## Refusé ou limité, avant exécution

| demande | décision | raison |
|---|---|---|
| Taux de participation sur la fiche élu | **refusé** | Invariant 8 (jamais de présence ou d'absence). Ce n'est pas un invariant de design. |
| Carte « En bref / Ce que ça change » | **pas de texte rédigé** | Ce serait un résumé de Repère présenté comme un fait. La carte de vote affiche l'intitulé officiel, le décompte et les étapes. |
| Liste des élus d'un parti | **faite, ordre alphabétique** | Invariant 3. La liste vient de la table AMO30 (577 députés, nom + groupe). Ouvrir un député d'un autre département donne une fiche sans ses votes, et elle le dit. |
| Couleurs de partis partout | **pour identifier seulement** | Invariant 7 inchangé. Les tuiles de section prennent les couleurs d'échelon, jamais celles d'un parti. |
| Jauge de budget | **non faite** | Il faudrait une référence de comparaison (moyenne IDF). C'est un calcul à annoncer comme tel : à décider. |

## Design system (`src/ui/`, `src/lib/composants.tsx`)

| demandé | ce qui existe maintenant |
|---|---|
| `<Card />` avec `accentColor` | `Carte` : filet de 4 px à gauche (couleur de l'échelon, ou prop `accent`), bordure, ombre, prop `onPress` avec effet de pression. **Tous les écrans** qui utilisent `Carte` l'ont. |
| Effet de pression | `ui/pression.tsx` : la carte s'enfonce à 97 %. Mouvement réduit : transparence seulement. |
| `<Avatar />` en dégradé | `Avatar` : reflet clair et ombre sur la couleur du groupe, sans bibliothèque. Sans groupe connu, il reste gris : c'est la vérité, pas un défaut. |
| `<PartyBadge />` | `BadgeGroupe` : couleur du groupe, touchable, ouvre `/groupe`. |
| `<DataNumber />` | `StatCard` (`ui/donnees.tsx`) : IBM Plex Mono 40 px + libellé. Utilisé sur Vote, Scrutins, Chez vous, Ma voix, Groupe. |
| `<Accordion />` | `Details` (déjà là) : chevron en icône, titre en Manrope. |
| Squelettes | `Squelette` (déjà là), utilisé aussi par `/groupe`. |
| État vide | `Vide` : icône dans un cercle, titre, explication, geste (lien ou bouton). Tous les états vides. |

## Les écrans (27 fichiers dans `src/app`)

| écran | changé | quoi |
|---|---|---|
| `index` (Accueil) | oui | Plus de slogan ; recherche en héros (72 px) ; tuiles colorées par échelon ; compte à rebours qui monte à l'apparition ; dépense en IBM Plex Mono. |
| `(onglets)/chez-vous` (fiche commune) | oui | Dépense par habitant en grand ; « Aller plus loin » en grille de tuiles à icône. |
| `repere-du-jour` | oui | Premier fait en héros, suivants en cartes ; explication en accordéon. |
| `elu` (Fiche élu) | oui | Avatar en dégradé 88 px ; badge de groupe touchable ; derniers votes en cartes (badge, date, titre). |
| `vote` | oui | En-tête compact, nom du député vers sa fiche, grands chiffres, barre, badge ADOPTÉ. |
| `scrutins` (Votes) | oui | Hémicycle en haut, légende touchable vers `/groupe` ; segmented control ; grands chiffres ; état vide illustré. |
| `groupe` | **nouveau** | Députés d'un groupe : nombre en grand, liste alphabétique avec avatars, source. |
| `actus` | oui | Icône, date en chiffres, titre fort, texte long en puces. |
| `(onglets)/a-venir` (Calendrier) | oui | Frise verticale : icône de l'institution sur un fil, heure en chiffres. |
| `voter` (Ma voix) | oui | Prochaine élection en carte (jours en grand, détail en accordéon), frise des élections, questions en accordéons. |
| `(onglets)/qui-decide`, `(onglets)/elus`, `mes-elus`, `argent`, `pour-vous`, `recherche`, `dictionnaire`, `procedure`, `sources`, `faq`, `a-propos`, `confidentialite`, `confort-lecture`, `bienvenue`, `annuaire-fiche`, `partager` | **composants seulement** | Ils héritent du filet, de l'effet de pression, de l'accordéon, de l'état vide, des sources discrètes et des titres agrandis. Ils n'ont pas eu de retouche propre. |

## Maillage

- Badge de groupe (fiche élu) et légende de l'hémicycle : ouvrent `/groupe`.
- Liste d'un groupe : chaque député ouvre sa fiche.
- Nom du député sur l'écran de vote : ouvre sa fiche. Zone de 44 px.
- Le contrôle de parcours (`tests/parcours.test.mjs`) lit désormais aussi les composants importés. Il a été vu rouge avec un lien cassé, puis vert.
- **Pas fait** : rendre touchables les noms dans « Qui décide » et dans les actus, et ouvrir la fiche du texte (le vote) depuis les cartes de votes de la fiche élu. Ces cartes ouvrent aujourd'hui leur feuille de détail.

## Vérifications

- Typage OK. Tests mobiles 97/97. Tests du dépôt 263/264 : `runtime.test.mjs` échoue à cause du navigateur installé dans le conteneur, pas du code ; la CI le rejoue.
- Contrôles navigateur (`parcours-web`, `meme-verite`, `elections-web`) : ils tournent seulement dans la CI mobile, **non lancés ici**.
- Captures sur l'export web. **Rien n'est vérifié sur iPhone.** L'écran `/groupe` est capturé sur une table **simulée** (noms « Député fictif N ») : la vraie table n'existe que sur le serveur de collecte.

## Ce qui reste

- Retouches propres de Qui décide, Argent, Élus, Pour vous et Recherche.
- Jauge de budget (décision sur la référence de comparaison).
- Couleurs de groupes : `PROPOSITION-COULEURS.md` attend ta décision.
- Premier lancement : le grand logo du brief V47 n'est plus affiché.
