# Repère

Contexte complet du projet, à lire avant toute action :

@CONTEXTE_PROJET.md

Rappels courts, au cas où l'import ne serait pas suivi :

- Mesurer plutôt que supposer. Un chiffre non mesuré s'écrit comme non mesuré.
- Toute ancre de patch se compte avant d'écrire : `assert src.count(ancre) == 1`.
- Un garde-fou se prouve en le cassant.
- Apostrophe typographique interdite dans le code ; accents obligatoires dans le
  texte affiché.
- Le banc est le verrou :
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node test_repere.mjs <cible>`
- Dire ce qui ne va pas plutôt que ce qui arrange.
