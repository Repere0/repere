# Audit UI de l'application mobile, 10 novembre 2026

Branche `feat/audit-ui-pro`. 29 écrans, deux thèmes, 390 × 844, dans Chromium sur l'export web
(seul appareil photo du conteneur). **Rien n'est vérifié sur iPhone.**

## Ce que l'audit dit, sans l'arrondir

- **Les critères mesurables étaient déjà presque tous tenus avant cette passe.** Sur 29 écrans et deux
  thèmes : zéro lien souligné, zéro cible tactile sous 44 px, zéro emoji, zéro bouton sans nom, zéro
  débordement. Écarts mesurés : 1 texte à 11 px (étiquette « Repère du jour »), 6 textes entre 11 et
  12 px dans les aperçus de cartes de partage, 1 contraste (point du logotype, sombre).
- **L'écart avec un niveau professionnel était ailleurs : la cohérence.** Deux marges de page (16 et
  20 px), trois styles de bouton principal dont un bleu pétrole dans une interface décidée neutre,
  des filets ivoire d'emphase, une liste « Mes élus » sans rapport visuel avec les autres listes d'élus,
  la chasse fixe employée pour des phrases, un renvoi interne (« Voir BLOCAGES 25 ») affiché au lecteur.
- **Cette passe corrige la cohérence, pas le dessin.** 24 écrans changent, la plupart par quatre
  corrections dans des composants partagés. Ce n'est pas une refonte : aucun écran n'a été redessiné.

## Méthode, et ce qui s'écarte de la demande

- Mesure : `mono/apps/mobile/tests/audit-ui-web.mjs`. Il capture chaque écran et compte les textes sous
  12 px, les liens soulignés, les cibles sous 44 px, les contrastes de texte sous AA, les emoji, les
  boutons sans nom, les débordements, les erreurs JavaScript. **Il tourne désormais dans la CI mobile
  et échoue au premier écart hors exceptions.** Vu rouge (12 écarts) en retirant une exception, puis vert.
- Lecture à l'œil des 58 captures « avant », puis des « après ».
- **Écart 1 : des commits par cause, pas par écran.** Les défauts venaient de composants partagés
  (gabarit de page, bouton) ; un commit par écran aurait recopié la même correction 20 fois.
- **Écart 2 : « données manquantes : — » non appliqué.** L'invariant 5 exige une phrase vraie et un
  lien ; la demande interdit de toucher aux invariants. Les états vides existants (composant `Vide` :
  icône, phrase, action) sont gardés.
- **Écart 3 : `DESIGN.md` n'est pas dans le dépôt.** Les règles précisées par l'audit sont écrites
  ci-dessous, à recopier dans `DESIGN.md` le jour où il est versionné.
- Squelettes : le motif existe (`ui/squelette.tsx`), il n'a pas été étendu.

## Écran par écran

Colonne « écarts mesurés » : somme des deux thèmes, avant → après.

| écran | état | problèmes | corrections | écarts mesurés | captures |
|---|---|---|---|---|---|
| accueil | conforme | Point final du logotype à 3,47:1 en sombre (décoratif). | Aucune ; exception documentée dans la garde. | 1 → 1 | [avant sombre](docs/audit-ui/avant/accueil-sombre.jpg) · [après sombre](docs/audit-ui/apres/accueil-sombre.jpg) · [avant clair](docs/audit-ui/avant/accueil-clair.jpg) · [après clair](docs/audit-ui/apres/accueil-clair.jpg) |
| qui-decide | corrigé | Marges de 20 px, l'accueil est à 16. | Gabarit de page à 16 px. | 0 → 0 | [avant sombre](docs/audit-ui/avant/qui-decide-sombre.jpg) · [après sombre](docs/audit-ui/apres/qui-decide-sombre.jpg) · [avant clair](docs/audit-ui/avant/qui-decide-clair.jpg) · [après clair](docs/audit-ui/apres/qui-decide-clair.jpg) |
| elus | corrigé | Pastille « Groupe politique : non publié » répétée sur chaque député. | Pastille masquée dans la liste quand le groupe n'est pas publié ; la fiche le dit toujours. | 0 → 0 | [avant sombre](docs/audit-ui/avant/elus-sombre.jpg) · [après sombre](docs/audit-ui/apres/elus-sombre.jpg) · [avant clair](docs/audit-ui/avant/elus-clair.jpg) · [après clair](docs/audit-ui/apres/elus-clair.jpg) |
| mes-elus | corrigé | Liste de texte nu, sans avatar ni carte, « › » tapé en texte ; aucun point commun avec « Élus » et « Qui décide ». | Lignes en carte avec l'avatar commun, nom, rôle, chevron en icône. | 0 → 0 | [avant sombre](docs/audit-ui/avant/mes-elus-sombre.jpg) · [après sombre](docs/audit-ui/apres/mes-elus-sombre.jpg) · [avant clair](docs/audit-ui/avant/mes-elus-clair.jpg) · [après clair](docs/audit-ui/apres/mes-elus-clair.jpg) |
| elu | corrigé | Marges de 20 px. | Gabarit de page à 16 px. | 0 → 0 | [avant sombre](docs/audit-ui/avant/elu-sombre.jpg) · [après sombre](docs/audit-ui/apres/elu-sombre.jpg) · [avant clair](docs/audit-ui/avant/elu-clair.jpg) · [après clair](docs/audit-ui/apres/elu-clair.jpg) |
| groupe | corrigé | Marges de 20 px. Données de groupes absentes du conteneur : état vide seul vérifié. | Gabarit de page à 16 px. | 0 → 0 | [avant sombre](docs/audit-ui/avant/groupe-sombre.jpg) · [après sombre](docs/audit-ui/apres/groupe-sombre.jpg) · [avant clair](docs/audit-ui/avant/groupe-clair.jpg) · [après clair](docs/audit-ui/apres/groupe-clair.jpg) |
| scrutins | corrigé | Date de publication collée au titre. Scrutins absents du conteneur : état vide seul vérifié. | 8 px sous la date de publication. | 0 → 0 | [avant sombre](docs/audit-ui/avant/scrutins-sombre.jpg) · [après sombre](docs/audit-ui/apres/scrutins-sombre.jpg) · [avant clair](docs/audit-ui/avant/scrutins-clair.jpg) · [après clair](docs/audit-ui/apres/scrutins-clair.jpg) |
| scrutin-detail | bloqué | Non atteint : aucun scrutin détaillé dans les données locales du conteneur. | Aucune. À relire sur la CI ou sur iPhone. | n. a. → n. a. | [avant sombre](docs/audit-ui/avant/scrutin-detail-sombre.jpg) · [après sombre](docs/audit-ui/apres/scrutin-detail-sombre.jpg) · [avant clair](docs/audit-ui/avant/scrutin-detail-clair.jpg) · [après clair](docs/audit-ui/apres/scrutin-detail-clair.jpg) |
| vote | corrigé | Phrase « Texte rejeté le… · Première lecture » en chasse fixe ; date de publication collée à l'étiquette. | Phrase en texte courant ; 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/vote-sombre.jpg) · [après sombre](docs/audit-ui/apres/vote-sombre.jpg) · [avant clair](docs/audit-ui/avant/vote-clair.jpg) · [après clair](docs/audit-ui/apres/vote-clair.jpg) |
| presidentielle-2027 | corrigé | Bandeau cerné d'un filet ivoire de 1,5 px ; la date de publication touchait la carte. | Filet standard de 1 px ; 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/presidentielle-2027-sombre.jpg) · [après sombre](docs/audit-ui/apres/presidentielle-2027-sombre.jpg) · [avant clair](docs/audit-ui/avant/presidentielle-2027-clair.jpg) · [après clair](docs/audit-ui/apres/presidentielle-2027-clair.jpg) |
| reglement-2027 | corrigé | Date de publication collée à l'étiquette. | 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/reglement-2027-sombre.jpg) · [après sombre](docs/audit-ui/apres/reglement-2027-sombre.jpg) · [avant clair](docs/audit-ui/avant/reglement-2027-clair.jpg) · [après clair](docs/audit-ui/apres/reglement-2027-clair.jpg) |
| calendrier | corrigé | Bouton « Réessayer » en bleu pétrole (couleur d'échelon « commune ») dans une interface décidée neutre. Calendrier absent du conteneur : état vide seul vérifié. | Bouton plein neutre (ivoire en sombre, encre en clair). | 0 → 0 | [avant sombre](docs/audit-ui/avant/calendrier-sombre.jpg) · [après sombre](docs/audit-ui/apres/calendrier-sombre.jpg) · [avant clair](docs/audit-ui/avant/calendrier-clair.jpg) · [après clair](docs/audit-ui/apres/calendrier-clair.jpg) |
| finances | corrigé | La date « ancienne » des comptes (plus de 30 jours) était en rose gris et en gras, proche du corail des votes à l'œil ; filet coloré à gauche des cartes. | Date en gris neutre, filet retiré (décisions du porteur). | 0 → 0 | [avant sombre](docs/audit-ui/avant/finances-sombre.jpg) · [après sombre](docs/audit-ui/apres/finances-sombre.jpg) · [avant clair](docs/audit-ui/avant/finances-clair.jpg) · [après clair](docs/audit-ui/apres/finances-clair.jpg) |
| voter | corrigé | Tuile « Présidentielle 2027 » cernée d'un filet ivoire de 1,5 px. | Filet standard, rayon de carte. | 0 → 0 | [avant sombre](docs/audit-ui/avant/voter-sombre.jpg) · [après sombre](docs/audit-ui/apres/voter-sombre.jpg) · [avant clair](docs/audit-ui/avant/voter-clair.jpg) · [après clair](docs/audit-ui/apres/voter-clair.jpg) |
| pour-vous | corrigé | Ligne « Vote à l'Assemblée · date · il y a N jours » en chasse fixe, alors que l'accueil l'écrit en texte courant. | Texte courant. | 0 → 0 | [avant sombre](docs/audit-ui/avant/pour-vous-sombre.jpg) · [après sombre](docs/audit-ui/apres/pour-vous-sombre.jpg) · [avant clair](docs/audit-ui/avant/pour-vous-clair.jpg) · [après clair](docs/audit-ui/apres/pour-vous-clair.jpg) |
| sources | corrigé | Marges de 20 px ; date collée à l'étiquette. | Gabarit de page. | 0 → 0 | [avant sombre](docs/audit-ui/avant/sources-sombre.jpg) · [après sombre](docs/audit-ui/apres/sources-sombre.jpg) · [avant clair](docs/audit-ui/avant/sources-clair.jpg) · [après clair](docs/audit-ui/apres/sources-clair.jpg) |
| confort-lecture | corrigé | Renvoi interne affiché au lecteur : « Voir BLOCAGES 25. » | Renvoi retiré. | 0 → 0 | [avant sombre](docs/audit-ui/avant/confort-lecture-sombre.jpg) · [après sombre](docs/audit-ui/apres/confort-lecture-sombre.jpg) · [avant clair](docs/audit-ui/avant/confort-lecture-clair.jpg) · [après clair](docs/audit-ui/apres/confort-lecture-clair.jpg) |
| chez-vous | corrigé | Étiquette « Repère du jour » à 11 px. | 12 px. | 2 → 0 | [avant sombre](docs/audit-ui/avant/chez-vous-sombre.jpg) · [après sombre](docs/audit-ui/apres/chez-vous-sombre.jpg) · [avant clair](docs/audit-ui/avant/chez-vous-clair.jpg) · [après clair](docs/audit-ui/apres/chez-vous-clair.jpg) |
| actus | corrigé | Marges de 20 px. | Gabarit de page. | 0 → 0 | [avant sombre](docs/audit-ui/avant/actus-sombre.jpg) · [après sombre](docs/audit-ui/apres/actus-sombre.jpg) · [avant clair](docs/audit-ui/avant/actus-clair.jpg) · [après clair](docs/audit-ui/apres/actus-clair.jpg) |
| repere-du-jour | corrigé | Date collée à l'étiquette. | 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/repere-du-jour-sombre.jpg) · [après sombre](docs/audit-ui/apres/repere-du-jour-sombre.jpg) · [avant clair](docs/audit-ui/avant/repere-du-jour-clair.jpg) · [après clair](docs/audit-ui/apres/repere-du-jour-clair.jpg) |
| dictionnaire | corrigé | Date collée à l'étiquette. | 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/dictionnaire-sombre.jpg) · [après sombre](docs/audit-ui/apres/dictionnaire-sombre.jpg) · [avant clair](docs/audit-ui/avant/dictionnaire-clair.jpg) · [après clair](docs/audit-ui/apres/dictionnaire-clair.jpg) |
| recherche | corrigé | Contour de focus du navigateur dessiné en rectangle dans la pastille de recherche. | Le focus se lit sur la pastille entière (filet en encre). | 0 → 0 | [avant sombre](docs/audit-ui/avant/recherche-sombre.jpg) · [après sombre](docs/audit-ui/apres/recherche-sombre.jpg) · [avant clair](docs/audit-ui/avant/recherche-clair.jpg) · [après clair](docs/audit-ui/apres/recherche-clair.jpg) |
| procedure | corrigé | Date collée à l'étiquette. | 8 px sous la date. | 0 → 0 | [avant sombre](docs/audit-ui/avant/procedure-sombre.jpg) · [après sombre](docs/audit-ui/apres/procedure-sombre.jpg) · [avant clair](docs/audit-ui/avant/procedure-clair.jpg) · [après clair](docs/audit-ui/apres/procedure-clair.jpg) |
| questions-gouvernement | corrigé | Marges de 20 px. Questions absentes du conteneur : état de chargement seul vérifié. | Gabarit de page. | 0 → 0 | [avant sombre](docs/audit-ui/avant/questions-gouvernement-sombre.jpg) · [après sombre](docs/audit-ui/apres/questions-gouvernement-sombre.jpg) · [avant clair](docs/audit-ui/avant/questions-gouvernement-clair.jpg) · [après clair](docs/audit-ui/apres/questions-gouvernement-clair.jpg) |
| partager | conforme | Six textes entre 11 et 12 px : aperçus réduits des cartes de partage (images de 1 080 px). | Aucune ; exception documentée dans la garde. | 12 → 12 | [avant sombre](docs/audit-ui/avant/partager-sombre.jpg) · [après sombre](docs/audit-ui/apres/partager-sombre.jpg) · [avant clair](docs/audit-ui/avant/partager-clair.jpg) · [après clair](docs/audit-ui/apres/partager-clair.jpg) |
| faq | corrigé | Bouton « Voir les sources » : même composant que les boutons pleins. | Hérite du bouton neutre. | 0 → 0 | [avant sombre](docs/audit-ui/avant/faq-sombre.jpg) · [après sombre](docs/audit-ui/apres/faq-sombre.jpg) · [avant clair](docs/audit-ui/avant/faq-clair.jpg) · [après clair](docs/audit-ui/apres/faq-clair.jpg) |
| a-propos | corrigé | Trois boutons pleins bleu pétrole de même poids. | Trois boutons discrets. | 0 → 0 | [avant sombre](docs/audit-ui/avant/a-propos-sombre.jpg) · [après sombre](docs/audit-ui/apres/a-propos-sombre.jpg) · [avant clair](docs/audit-ui/avant/a-propos-clair.jpg) · [après clair](docs/audit-ui/apres/a-propos-clair.jpg) |
| confidentialite | conforme | Rien de mesuré ni de vu. | Aucune. | 0 → 0 | [avant sombre](docs/audit-ui/avant/confidentialite-sombre.jpg) · [après sombre](docs/audit-ui/apres/confidentialite-sombre.jpg) · [avant clair](docs/audit-ui/avant/confidentialite-clair.jpg) · [après clair](docs/audit-ui/apres/confidentialite-clair.jpg) |
| bienvenue | corrigé | Bouton « Terminer » bleu pétrole. | Bouton plein neutre. | 0 → 0 | [avant sombre](docs/audit-ui/avant/bienvenue-sombre.jpg) · [après sombre](docs/audit-ui/apres/bienvenue-sombre.jpg) · [avant clair](docs/audit-ui/avant/bienvenue-clair.jpg) · [après clair](docs/audit-ui/apres/bienvenue-clair.jpg) |

## Les corrections de fond

| cause | où | écrans touchés |
|---|---|---|
| Marges de page à 20 px, l'accueil à 16 | `ui/page.tsx`, `ui/fraicheur.tsx` | tous les écrans à gabarit |
| Date de publication collée au contenu (0 px) | `ui/page.tsx` : 8 px | tous les écrans qui portent la date |
| Bouton plein en couleur d'échelon « commune » | `lib/composants.tsx` : encre / ivoire | calendrier, bienvenue, à propos, FAQ, états d'échec |
| Filets ivoire d'emphase de 1,5 px | `presidentielle-2027.tsx`, `voter.tsx` | 2 |
| Chasse fixe sur des phrases | `vote.tsx`, `pour-vous.tsx` | 2 |

## Règles précisées (à verser dans DESIGN.md)

- Marge extérieure : 16 px sur tous les écrans.
- Bouton plein : encre sur clair, ivoire sur sombre. Jamais une couleur d'échelon, de vote ou de parti.
  Un seul bouton plein par écran ; les autres sont discrets.
- Filet de carte : 1 px, couleur `trait`. Le filet en encre est réservé à l'état « choisi ».
- IBM Plex Mono : une date ou un nombre seuls. Une phrase qui contient une date reste en DM Sans.
- Aucun renvoi à un document interne dans un texte affiché.

## Ce qui n'a pas été fait ou pas vérifié

- **iPhone** : gestes de retour, zones sûres (encoche, barre d'accueil), VoiceOver, rendu natif des
  polices. Aucun de ces points n'est mesurable depuis le conteneur.
- **Ordre de focus** et **contraste des graphiques (3:1)** : non mesurés par l'outil. La jauge du
  budget en pastels est connue sous 3:1 (1,5 à 2,6:1), par décision du porteur du 09/11 ; sa légende
  écrit chaque part.
- **Écrans vus seulement dans leur état vide** (données absentes du conteneur) : scrutins, détail d'un
  scrutin (non atteint), questions au Gouvernement, calendrier, groupe. La CI, qui a les données, les
  mesurera au premier passage : un écart y fera échouer la garde.
- **Écrans non capturés** : `annuaire-fiche` (fiche ouverte depuis la liste des élus), `dev-impact`
  (outil interne).

## Décisions du porteur du 10/11/2026, appliquées

1. **Filet coloré à gauche des cartes d'échelon : supprimé** (`lib/composants.tsx`). Le point et le nom
   de l'échelon restent. Le cartouche « En clair » et le bandeau de fraîcheur gardent leur filet gris :
   ce ne sont pas des cartes d'échelon.
2. **Date « ancienne » : gris neutre, graisse normale**, quel que soit l'âge (`ui/fraicheur.tsx`). Le
   nombre de jours écrit (« il y a 104 jours ») est le seul signal. La couleur `ancien` est retirée de
   la palette.
3. **Section « Pas encore disponible » : supprimée** du confort de lecture.
