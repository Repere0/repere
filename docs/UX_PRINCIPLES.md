# REPÈRE — PRINCIPES DE CONCEPTION

Chaque principe porte le défaut mesuré qui l'a imposé, et le contrôle qui le garde. Un principe
sans contrôle est une intention.

---

### P1 · Chaque écran répond à une question que le citoyen se pose vraiment
« Qu'est-ce qui se passe chez moi ? » · « Qui décide ? » · « Combien, et pour quoi ? » ·
« D'où vient cette information ? »
**Si aucune question naturelle ne s'attache à un écran, l'écran est à revoir ou à supprimer.**

### P2 · La barre d'onglets est la carte du produit
Chaque onglet porte une question ou un service qu'on peut nommer. **Aucun onglet n'est un jeu.**
*Défaut qui l'a imposé : dans le produit en ligne, l'onglet « Qui décide ? » ouvre un quiz et les
élus sont derrière « Qui dirige ? ».*

### P3 · On ne nomme pas une institution, on dit ce qu'elle décide
« Le conseil départemental exerce la compétence de l'action sociale » n'apprend rien ;
« le département décide des collèges, des routes et des aides sociales » s'entend une fois et se
retient.
*Contrôle : chaque échelon affiché porte sa phrase de compétence.*

### P4 · Tout ordre de liste est produit par une règle nommée, et la règle est écrite à l'écran
Sans elle, le premier de la liste devient le plus important dans la tête du lecteur.
« Rangés du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance :
c'est un ordre de distance. »
*Corollaire : jamais de tri numérique d'une liste de personnes, de partis ou de territoires.*

### P5 · Aucun texte porteur de sens sous 13 px, et la source n'est jamais à plus d'un cran du
chiffre qu'elle justifie
*Mesure avant correction : 46 à 63 % du texte sous 14 px selon l'écran, avec des crans à 9,92 px.
Contrôles : un statique sur les règles CSS, un navigateur sur les six écrans.*

### P6 · Toute cible tactile mesure au moins 44 px, sur tous les écrans
*Le contrôle ne mesurait qu'un seul écran : il n'avait jamais vu les dix liens de scrutin ni le
lien de contact. Il parcourt maintenant les six.*

### P7 · Une absence produit une phrase et un lien, jamais une forme
Ni squelette gris, ni animation d'attente, ni ligne escamotée. Et les phrases disent des choses
**différentes** : « pas encore arrivé » n'est pas « la source ne le porte pas ».

### P8 · La preuve se lit en langue citoyenne
« Observatoire des finances et de la gestion publique locales · ODbL 1.0 · mise à jour du
29 juillet 2026 » → **« D'où vient ce chiffre ? Publié par l'État, le 29 juillet 2026. Vérifier ↗ »**
La licence reste dans le fichier, où elle est juridiquement utile ; elle n'a jamais convaincu
personne à l'écran.

### P9 · Un calcul est annoncé comme un calcul
« Calculé par Repère à partir des montants ci-dessus — ce n'est pas un chiffre publié. »
*C'est la meilleure phrase du produit : elle est le modèle de tout ce qui n'est pas brut.*

### P10 · Le geste système ne doit jamais faire sortir du produit
Le retour d'Android replie, puis revient à l'entrée. **Et l'adresse ne change jamais** : une URL
par commune mettrait la commune consultée dans l'historique du navigateur, donc potentiellement
chez un tiers.

### P11 · L'interface ne demande jamais plus que nécessaire
Une question au premier écran : « Où habitez-vous ? »
*Mesure : 106 cibles cliquables à l'ouverture, ramenées à 2.*

### P12 · La typographie hiérarchise à l'intérieur d'un objet, jamais entre deux objets de même
nature
Dans une carte, le titre domine le corps qui domine la méta. **Entre deux cartes de même nature :
aucun écart.** Mettre en avant une décision plutôt qu'une autre serait un jugement.

### P13 · Le mouvement ne porte aucune information, et se coupe
L'ordre d'apparition vient de la position dans la page, jamais du contenu. `prefers-reduced-motion`
est respecté **par le navigateur**, sans JavaScript.
*Gardé par un contrôle qui vérifie que tout sélecteur animé est neutralisé, et par une mesure
navigateur du style réellement appliqué.*

### P14 · Simple en surface, profond en profondeur
Un seul produit satisfait « je veux juste savoir ce qui se passe chez moi » et « je veux vérifier
le scrutin officiel ». **La profondeur est disponible, jamais imposée** : les huit lois en tête,
les soixante-douze votes de détail derrière un dépliant.

### P15 · On ne devine jamais, on présente
On peut retirer d'un intitulé officiel ce qui est redondant ; on ne reformule pas, on n'ajoute pas
un mot, et le lien vers la source donne le texte intégral.
*Exemple : « Évry » prend un accent, « Ermont » non — aucune règle ne le sait, donc on prend le
libellé officiel entier ou on ne touche à rien.*

### P16 · Un chiffre qui appelle « c'est beaucoup ? » doit porter sa référence — et jamais une autre commune

C'est la règle qui ouvre le champ social sans trahir l'interdit de comparaison. Trois références
sont autorisées, dans cet ordre de préférence :
1. **l'obligation légale** — « votre commune compte 14 % de logements sociaux ; la loi lui en
   impose 25 % » ne classe personne, cela confronte un élu à une règle publique ;
2. **le seuil réglementaire** — conformité de l'eau, niveau d'hygiène, zonage sismique ;
3. **la commune comparée à elle-même dans le temps** — « trois boulangeries en 2025, cinq en 2015 ».

**Un chiffre sans aucune de ces trois références ne s'affiche pas.** C'est ce qui écarte l'indice
de position sociale des écoles et l'accessibilité aux médecins : deux indices relatifs par
construction, dont la seule lecture possible est le classement.

---

## LE TEST DU TÉLÉPHONE

Donné à une personne de 18 ans, une de 70 ans, quelqu'un qui ne suit jamais la politique et
quelqu'un qui la suit de près : **tous doivent pouvoir commencer**. Le passionné peut aller plus
loin ; le novice ne doit jamais y être obligé.

## LE TEST DES DIX SECONDES

Pour chaque écran : *si je donne le téléphone à quelqu'un qui ne connaît rien à la politique,
comprend-il en dix secondes ?* 🟢 évident · 🟠 ambigu · 🔴 incompréhensible.
Un écran 🔴 ne se publie pas.
