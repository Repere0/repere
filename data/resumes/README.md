# Résumés « En clair » : procédure

Un fichier par dossier législatif (`<dossier>.json`), plus le texte officiel qui a servi (`textes/<dossier>.txt`,
jamais publié). Outil : `mono/scripts/resumes-clairs.mjs`, hors ligne, sans IA. Note de conception dans le Project
(`Repere_Conception_Resumes_Votes_12_11_2026.md`).

1. **Le porteur fournit le texte officiel** (exposé des motifs ou résumé du dossier, copié du site de l'Assemblée) et
   son adresse.
2. **Le résumé est rédigé en session**, à partir de ce texte seulement, en 3 à 5 phrases.
3. **Brouillon**, depuis `mono/` :
   `node scripts/resumes-clairs.mjs --brouillon DLR5L17N… --texte officiel.txt --resume resume.txt --url https://… --scrutin 9759`
   Le script refuse le brouillon s'il contient un nombre ou un nom propre absent du texte officiel, ou un mot de
   jugement. Accepté, il écrit `valide: false`.
4. **Le porteur relit** et pose lui-même `"valide": true` et `"valide_le": "AAAA-MM-JJ"` dans le fichier. Un agent ne
   le fait jamais.
5. **Publication** : la collecte (`--publier`) écrit `resumes-clairs.json` avec les seuls résumés validés. Si le texte
   officiel rangé dans `textes/` change, le résumé n'est plus publié tant qu'il n'est pas revalidé.

Limite : le contrôle est littéral. Il ne voit ni un contresens ni une omission. La relecture du porteur reste le
garde-fou qui compte.
