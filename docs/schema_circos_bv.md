# Description de `circos_bureaux_de_vote.csv`

Engendre par `outils/echantillon_source.py`. **Ne pas modifier a la main.**

- Taille : **5.06 Mo**
## Contenu

- Delimiteur devine : `,` (l'en-tete en contient 7)
- Colonnes : **8**
- Lignes (hors en-tete) : **69682**

| # | colonne | valeurs distinctes (sur 20 000 max) | exemples |
|---|---|---|---|
| 0 | `codeDepartement` | 33 | 13 · 31 · 06 |
| 1 | `nomDepartement` | 33 | Bouches-du-Rhône · Haute-Garonne · Alpes-Maritimes |
| 2 | `codeCirconscription` | 143 | 2104 · 1103 · 3108 |
| 3 | `nomCirconscription` | 16 | 1ère circonscription · 2ème circonscription · 3ème circonscription |
| 4 | `codeCommune` | 12010 | 13055 · 31555 · 06088 |
| 5 | `nomCommune` | 11624 | Marseille · Toulouse · Nice |
| 6 | `numeroBureauVote` | 910 | 0001 · 0002 · 0003 |
| 7 | `codeBureauVote` | 20000 | 01001_0001 · 01002_0001 · 01004_0001 |

### Cinq premieres lignes

```
codeDepartement,nomDepartement,codeCirconscription,nomCirconscription,codeCommune,nomCommune,numeroBureauVote,codeBureauVote
01,Ain,0104,4ème circonscription,01001,L'Abergement-Clémenciat,0001,01001_0001
01,Ain,0105,5ème circonscription,01002,L'Abergement-de-Varey,0001,01002_0001
01,Ain,0105,5ème circonscription,01004,Ambérieu-en-Bugey,0001,01004_0001
01,Ain,0105,5ème circonscription,01004,Ambérieu-en-Bugey,0002,01004_0002
01,Ain,0105,5ème circonscription,01004,Ambérieu-en-Bugey,0003,01004_0003
```
