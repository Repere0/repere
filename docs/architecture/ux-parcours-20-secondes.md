# Le parcours mobile au crible : comprend-on Repère en 20 secondes ?

*29/09/2026. Évaluation experte sur l'export web à 360/390/430 px, données réelles (Meaux).
**Aucun utilisateur réel n'a été observé** : c'est ce qu'il faut faire ensuite.*

## Mesures

| | 360×740 | 390×844 | 430×932 |
|---|---:|---:|---:|
| haut de la carte « maire » | 193 px | 193 px | 161 px |
| haut de la carte « projet » | 490 px | 490 px | 413 px |
| haut de la carte « député » | **805 px, sous le pli** | 772 px (titre seul visible) | 695 px |
| longueur de l'écran | 2,1 écrans | 1,7 écran | 1,5 écran |
| mots affichés | 241 | 241 | 241 |

## Verdict

**En partie.** En 20 secondes, on comprend *qui est le maire* et *que l'État a financé un
projet chez moi* — c'est concret et sourcé. On ne voit **pas** le seul fait qui
ressemble à une décision récente (le vote du député) sans faire défiler, et la promesse de
l'accueil — « où va votre argent » — **n'est tenue nulle part** dans le parcours.

## Ce qui marche

- Un seul geste pour arriver : une question, un champ, des résultats nets.
- Chaque bloc porte sa source et sa date ; les absences sont des phrases (panne ≠ absence).
- Le retour est évident (en-tête et bas d'écran) ; le geste natif de retour est prévu par la pile, **non vérifié sur téléphone**.
- Rien ne juge, rien ne classe : la neutralité se lit.

## Ce qui freine, par ordre d'effet

1. **Promesse non tenue.** L'accueil dit « où va votre argent » ; l'écran ne montre aucun
   compte. La donnée et sa phrase existent déjà (`rapportDette` dans `core`, carte
   « Combien ça représente ? » du site). *Ajouter une carte ou changer la promesse — à
   trancher, ce n'est pas une fonction de plus, c'est la cohérence de la première phrase.*
2. **Le fait le plus « actuel » est en bas.** Le titre annonce « ce qui se passe », la
   première carte montre une information stable (le maire). Le vote daté est sous le pli
   sur les petits écrans.
3. **Les sources prennent un quart de chaque carte** (ligne + lien + filet). Une ligne
   unique cliquable (« Ministère de l'Intérieur, 11 août 2026 ↗ ») garderait la preuve
   et rendrait ~70 px par carte.
4. **La fraîcheur est ambiguë.** « Mise à jour du 11 août » parle du fichier, pas du fait ;
   un lecteur ne sait pas si le maire est « à jour ». Les dates utiles (vote du 21 juillet)
   sont en petit.
5. **Préambules longs.** « Vote du député élu dans votre circonscription (6e circonscription
   — Seine-et-Marne), à l'Assemblée nationale : » répète le titre de la carte.
6. **Aucune « porte où frapper ».** La raison d'être de Repère (savoir à qui s'adresser)
   n'a pas encore de geste : ni mairie, ni permanence. Donnée absente aujourd'hui.

## Ce qu'il ne faut pas faire

Ajouter des cartes pour « remplir ». Les points 2 à 5 se règlent en **retirant** et en
**réordonnant**, pas en ajoutant. Le point 1 est une décision de promesse.

## Prochaine mesure

Cinq personnes qui ne connaissent pas Repère, le téléphone en main, une consigne :
« trouvez votre commune et dites ce que vous avez appris ». Chronomètre, et une seule
question à la fin : « à quoi sert cette application ? ». C'est la seule façon de
remplacer ce document par un fait.
