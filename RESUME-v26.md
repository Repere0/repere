# RESUME v26 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Tests partagés 257/257 et invariants à 0 erreur à chaque commit ; `tsc` à 0 erreur ; parcours navigateur 222/222 ; cartes de partage sans échec ; zoom et confort (`zoom-web.mjs`) sans échec.

| Commit | Bloc |
|---|---|
| 1ad1d3a | 0 — invariant 2 amendé : deux clés, `repere.profil` ajoutée ; ADR 0006 ; sceau régénéré. **Poussé avec un test rouge** (corrigé juste après) |
| 4f63856 | 0 (correctif) — la garde des clés ignore le paramètre d'un script d'audit ; le contrôle de `gate.sh` s'arrête désormais sur un échec |
| e3f3bca | 1 — onboarding : trois questions après la commune ; `repere.profil` gardé par « Terminer » ; « Passer » ne garde rien ; « Oublier » efface le profil |
| 126931b | 2 — zoom : rue / région / France / tout, filtre d'affichage sur Qui décide, Calendrier, Actualités, accueil ; badge « Vue : … · Changer » |
| b17b134 | 3 — confort de lecture : taille, espacement, contraste, animations, images |
| (ce commit) | 7 — ce rapport, BLOCAGES 25 |

## Non faits
- **Bloc 4** (titres-conclusions, encodage non coloriel) : texte à valider par le CEO.
- **Bloc 5** (« Pourquoi je vois ça ») : méthodes et sources à rédiger et relire.
- **Bloc 6** (fil « Pour vous ») : contenu et états vides à trancher.
- **Brief V25** : absent, donc non fait.

## Décisions à prendre (détail dans BLOCAGES 25)
1. « Passer » : la question revient à chaque ouverture. Accepter, ou garder les défauts après un passage explicite (amende la règle mémoire).
2. « France » et « Tout » sont identiques. Lequel doit différer ?
3. En vue « Ma rue », le calendrier et les actualités sont vides. Acceptable ?
4. Contraste « très élevé » : n'atteint pas 10:1 sans palette nouvelle.
5. Police de dyslexie, mode daltonien (D24), guide de lecture, mode focus : pas faits.

## Top 5 à tester sur iPhone (3 personas : une personne âgée peu à l'aise avec le tactile, une personne malvoyante qui utilise la taille du texte, une personne qui veut seulement savoir qui la représente)
1. **Taille 26** : aucun écran ne déborde ni ne coupe un texte (la plus grande police passe à environ 58 points). Non vérifié.
2. **Premier lancement** : trois questions, « Terminer » garde les réponses, « Passer » laisse revenir la question.
3. **Vue « Ma rue »** sur Aujourd'hui, Qui décide, Calendrier, Actualités : ce qui disparaît est attendu, et le message dit où aller.
4. **Animations réduites** activées dans l'application : les barres et les apparitions s'arrêtent net.
5. **Contraste élevé** : le gris secondaire devient lisible, sans que les couleurs de vote changent.
