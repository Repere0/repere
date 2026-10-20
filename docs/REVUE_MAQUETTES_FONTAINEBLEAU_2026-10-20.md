# Revue des maquettes Stitch — Fontainebleau (20/10/2026)

Sources : trois fichiers HTML fournis par le porteur (« Où va l'argent de Fontainebleau »,
et deux variantes « Fontainebleau en 15 secondes »). Ce document dit ce qu'on peut reprendre,
ce qu'il faut retirer, et ce qui relève d'une décision du porteur. Rien n'est publié.

## 1. Verdict

La structure est réutilisable : carte d'identité d'un élu, bloc « Sur 100 € », trois tuiles de
variation, carte de projet aidé avec sa jauge, carte de vote avec sa barre, repli
« Données et méthode ». Le contenu, lui, ne doit pas être repris tel quel : il contient des
couleurs hors palette, des certifications non démontrées, des causalités et des jugements.

## 2. Couleurs hors palette gelée (invariant 7)

| Couleur maquette | Usage dans la maquette | Problème |
|---|---|---|
| `#00A896` (sarcelle vif) | « Pour » (barre de vote), « Patrimoine & voirie », part de l'État | Hors des teintes autorisées le 20/10/2026 (primaire `#0e3b4b`, primaire clair `#bde7f4`, vote `#15803d` / `#be123c`). Utilisée pour une catégorie de dépense : interdit. |
| `#64748B`, `#CBD5E1`, `#94A3B8` | Catégories de dépense, part de la ville | Couleurs de catégorie : interdites (aucune couleur hors liste). |
| `#137333`, `#E6F4EA` (vert de scrutin) | « Adopté », pastille de vote | Le vert de vote décidé est `#15803d`. |
| `#0D3B43` | Première catégorie, bouton | Proche du primaire `#0e3b4b` : à remplacer par la teinte décidée. |

**Décision du porteur (critique)** : faut-il ajouter une couleur d'interface (la sarcelle `#00A896`)
à la palette gelée ? La recommandation est non : la palette actuelle suffit, et chaque couleur
ajoutée est une modification d'invariant qui doit être décidée explicitement.

## 3. Affirmations à retirer ou à corriger

| Texte maquette | Problème | Action |
|---|---|---|
| « Comptes validés DGFiP », « Compte administratif certifié », « Données certifiées », « validé en séance du Conseil municipal », « transmis à la préfecture » | Aucune de ces certifications n'est établie par nos sources. Invariant 4 : on n'affiche que la source qu'on a lue. | Retirer. Afficher le producteur réel et la date de publication. |
| « Compris en 4 sec », « 4 sec / info » | Aucune mesure ne le prouve. Le test de lisibilité réel n'existe pas encore. | Retirer. |
| « Garantie républicaine de neutralité civique Repère 2026 » | Formule de promotion, pas une information. | Retirer. |
| « Mandat 2020–2026 » (fixe) | La source publie une date de début, pas de fin. | Utiliser la carte « Mandat » de la fiche élu (date publiée ou phrase d'absence). |
| « Le maire et les 33 élus … arbitrent … chaque mois » | Fonctionnement et périodicité non sourcés. | Retirer. Dire seulement le nombre d'élus publié. |
| « La commune a stabilisé ses charges … profité de recettes touristiques … investissements verts » | Cause et jugement. Interdit par la méthode validée. | Retirer. |
| « Préservation patrimoine & voirie apaisée » ; « Chaque Bellifontain bénéficie de 201 € … par mois » | « Apaisée » est un jugement ; « bénéficie » suggère un retour personnel ; « 201 €/mois » est 2 415 ÷ 12, calcul non annoncé. | Retirer. Libellés = lignes publiées. Calcul annoncé comme tel. |
| « Frais de personnel & accueil citoyen », « Services quotidiens, écoles & forêts » | Libellés réinterprétés, non publiés. | Reprendre les trois lignes publiées : frais de personnel, investissements, autres dépenses. |
| « Calculez la part exacte de votre taxe foncière … qui finance les squares » ; « Simulez votre contribution en 30 sec » | Contraire à la méthode validée : pas de montant personnel, pas de « part exacte », pas de « finance » causal, pas de « contribution ». | Déjà remplacé par « Ce que vous payez à la commune » (faits de droit). |
| Vote : « Adopté », « 312 Pour (78 %) », « ✓ A VOTÉ POUR » | Les chiffres doivent venir du scrutin publié, pas d'une maquette. | Vérifier contre la source Assemblée avant tout affichage. Le libellé « A VOTÉ POUR » est permis si la position est publiée. |

## 4. Erreurs internes à la maquette

- En-tête « Melun » sur une page « Fontainebleau » : l'en-tête doit suivre la commune choisie.
- Une maquette dit « 5 projets aidés », une autre « 4 projets » : la fiche doit compter ce que la source publie.
- Photo de façade : image générée par un outil (adresse `aida-public`), pas une photo officielle.
  Le porteur n'autorise que les photos officielles : à retirer.
- Balises `tailwind`, polices Google, `script` de démonstration : sans objet dans l'application native.

## 5. À reprendre

- Carte d'identité : nom, fonction, « Mandat » (date publiée) ; pas de photo sans source officielle.
- Bloc « Sur 100 € » : trois lignes, parts annoncées « calcul Repère », montants publiés par habitant.
- Trois tuiles de variation, chacune avec son calcul annoncé.
- Carte de projet : année, dispositif, part de l'État, phrase du vide si la part n'est pas publiée.
- Carte de vote : position du député telle que publiée, décompte publié, jamais de couleur de parti.
- Repli « Données et méthode » : déjà présent dans l'application sous « Comment Repère l'utilise ».

## 6. Ce qui n'est pas vérifié ici

Les chiffres des maquettes (38,4 M€, 2 415 €/habitant, 44 / 31 / 25 %, 1 062 / 749 / 604 €,
2,1 M€ HT, 52 %, scrutin 312 / 68 / 20) n'ont pas été comparés aux données : le conteneur ne joint
pas les sources. Ils ne doivent pas être repris avant une comparaison sur le runner.
