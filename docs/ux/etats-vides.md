# États vides, chargements et erreurs

Date : 30/10/2026 (bloc 2 du sprint V8). Fichiers : `mono/apps/mobile/src/lib/composants.tsx` (`Vide`), `src/ui/squelette.tsx` (`SquelettesListe`), `src/ui/page.tsx` (`AvecDonnees`).

## Ce qui existe, et pourquoi on ne crée pas de second composant

`Vide` est déjà l'état vide réutilisable de l'application : un titre, un texte, une action ou un lien. Il est utilisé une trentaine de fois. Un second composant `<EtatVide>` aurait fait doublon. Le brief demandait « icône légère » : aucun icône n'a été ajouté (voir plus bas).

Les textes des états « chargement », « hors ligne », « introuvable » et « échec » viennent de `PHRASES`, dans le paquet partagé `@repere/data-utils`. Le site importe le même paquet ; `tests/donnees.test.mjs` vérifie les titres (distincts, sans « joindre le serveur » quand le serveur a répondu). **Ces phrases ne sont donc pas réécrites dans l'application seule** : toute reformulation se fait dans le paquet partagé, puis le test doit passer.

## Règles

- Aucun écran blanc : un écran qui n'a rien à montrer affiche un titre, un texte et une sortie.
- Pas de spinner : le chargement affiche des blocs gris qui épousent la forme du contenu (`SquelettesListe`). Aucun `ActivityIndicator` n'est utilisé.
- Un échec affiche « Réessayer » et, depuis ce sprint, « Voir les sources » (`AvecDonnees`, pour tous les écrans de commune). « Voir les sources » ouvre l'écran Sources de l'application, pas un site externe.
- Une phrase d'état vide dit ce qui manque et pourquoi, sans « aucun résultat disponible ».

## Ce qui reste à faire (non fait)

- **Icône légère** sur les états vides : non ajoutée. Un icône décoratif sans sens serait du remplissage. À décider avec le CEO.
- **« Voir les sources » sur les autres échecs** : l'actualité nationale, le calendrier et la liste des élus gardent « Réessayer » seul.
- **Textes d'actualité vide** : « Aucune actualité nationale publiée pour le moment. » reste tel quel (voir bloc 3).
